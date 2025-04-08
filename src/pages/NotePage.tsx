
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import DigitalCanvas from "@/components/canvas/DigitalCanvas";
import AIToolbar from "@/components/ai/AIToolbar";
import PenStatus from "@/components/pen/PenStatus";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Pencil, Save, ArrowLeft, Download, TextSelect } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useNotebook } from "@/contexts/NotebookContext";
import TextConversionPanel from "@/components/ocr/TextConversionPanel";
import ExportPanel from "@/components/export/ExportPanel";
import StorageService from "@/services/StorageService";

const NotePage = () => {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("Untitled Note");
  const [penData, setPenData] = useState<any>(null);
  const [showUtilityPanels, setShowUtilityPanels] = useState(true);
  const { currentPage, setCurrentPage, strokes, setStrokes, loadPage } = useNotebook();
  
  useEffect(() => {
    if (noteId) {
      // Load the note data
      const loadNoteData = async () => {
        try {
          const page = await StorageService.getPage(noteId);
          if (page) {
            setCurrentPage(page);
            setTitle(page.title);
            setStrokes(page.strokes || []);
            
            toast({
              title: "Note loaded",
              description: `Loaded note "${page.title}"`,
            });
          } else {
            toast({
              title: "Note not found",
              description: "The requested note could not be found",
              variant: "destructive",
            });
            navigate("/");
          }
        } catch (error) {
          console.error("Error loading note:", error);
          toast({
            title: "Error",
            description: "Failed to load note",
            variant: "destructive",
          });
        }
      };
      
      loadNoteData();
    }
  }, [noteId, navigate, setCurrentPage, setStrokes]);
  
  const handleSave = async () => {
    if (currentPage) {
      try {
        const updatedPage = {
          ...currentPage,
          title,
          strokes,
          lastModified: new Date().toISOString(),
        };
        
        await StorageService.savePage(updatedPage);
        setCurrentPage(updatedPage);
        
        toast({
          title: "Note saved",
          description: "Your note has been saved successfully",
        });
        setIsEditing(false);
      } catch (error) {
        console.error("Error saving note:", error);
        toast({
          title: "Error",
          description: "Failed to save note",
          variant: "destructive",
        });
      }
    }
  };
  
  // Handle pen data from the PenStatus component
  const handlePenData = (data: any) => {
    setPenData(data);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 flex flex-col">
          <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              {isEditing ? (
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-xl font-semibold bg-transparent border-b border-gray-300 focus:outline-none focus:border-primary px-1"
                  onBlur={() => setIsEditing(false)}
                  autoFocus
                />
              ) : (
                <h1 
                  className="text-xl font-semibold cursor-pointer" 
                  onClick={() => setIsEditing(true)}
                >
                  {title} <Pencil className="h-4 w-4 inline ml-1 text-gray-400" />
                </h1>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUtilityPanels(!showUtilityPanels)}
              >
                {showUtilityPanels ? (
                  <>
                    <TextSelect className="h-4 w-4 mr-1" />
                    Hide Tools
                  </>
                ) : (
                  <>
                    <TextSelect className="h-4 w-4 mr-1" />
                    Show Tools
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col">
            <Card className="m-4 flex-1 flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Note Canvas</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                <DigitalCanvas className="h-full" />
              </CardContent>
            </Card>
            
            {showUtilityPanels && (
              <div className="p-4 space-y-2">
                <TextConversionPanel />
                <ExportPanel />
              </div>
            )}
          </div>
        </div>
      </div>
      
      <PenStatus onPenData={handlePenData} />
      <AIToolbar />
    </div>
  );
};

export default NotePage;
