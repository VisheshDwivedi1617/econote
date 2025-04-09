
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNotebook } from "@/contexts/NotebookContext";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import DigitalCanvas from "@/components/canvas/DigitalCanvas";
import NoteHeader from "@/components/notes/NoteHeader";
import PenStatus from "@/components/pen/PenStatus";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PenTool, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import StorageService, { NotePage as NotePageType } from "@/services/StorageService";

const NotePage = () => {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentPage, switchPage, updatePage } = useNotebook();
  const [pageTitle, setPageTitle] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Load the note when the component mounts or noteId changes
  useEffect(() => {
    const loadNoteData = async () => {
      if (!noteId) {
        navigate("/notes");
        return;
      }
      
      try {
        setLoading(true);
        await switchPage(noteId);
      } catch (error) {
        console.error("Error loading note:", error);
        toast({
          title: "Error",
          description: "Failed to load the note",
          variant: "destructive",
        });
        navigate("/notes");
      } finally {
        setLoading(false);
      }
    };
    
    loadNoteData();
  }, [noteId, navigate, toast]);
  
  // Update local title state when currentPage changes
  useEffect(() => {
    if (currentPage) {
      setPageTitle(currentPage.title);
    }
  }, [currentPage]);
  
  const handleTitleChange = (newTitle: string) => {
    setPageTitle(newTitle);
  };
  
  const handleSave = async () => {
    if (!currentPage) return;
    
    try {
      // Update the title if it has changed
      if (currentPage.title !== pageTitle) {
        const updatedPage = {
          ...currentPage,
          title: pageTitle,
          updatedAt: Date.now()
        };
        
        await updatePage(updatedPage);
        
        toast({
          title: "Saved",
          description: "Note has been saved successfully",
        });
      }
    } catch (error) {
      console.error("Error saving note:", error);
      toast({
        title: "Error",
        description: "Failed to save the note",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/notes")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              
              <input
                type="text"
                value={pageTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="text-xl font-semibold bg-transparent border-none focus:outline-none focus:ring-0"
                placeholder="Untitled Note"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <PenStatus />
              
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={handleSave}
              >
                <Save className="h-4 w-4" />
                Save
              </Button>
            </div>
          </div>
          
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <p>Loading...</p>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden">
              <DigitalCanvas />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotePage;
