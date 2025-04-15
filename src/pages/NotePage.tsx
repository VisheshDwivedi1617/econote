
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNotebook } from "@/contexts/NotebookContext";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import DigitalCanvas from "@/components/canvas/DigitalCanvas";
import ScannedNoteView from "@/components/scanner/ScannedNoteView";
import StudyModeView from "@/components/study/StudyModeView";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, BookOpen, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

const NotePage = () => {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentPage, switchPage, updatePage } = useNotebook();
  const [pageTitle, setPageTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [showStudyMode, setShowStudyMode] = useState(false);
  const isMobile = useIsMobile();
  
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
  }, [noteId, navigate, switchPage, toast]);
  
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
  
  const openStudyMode = () => {
    if (!currentPage) return;
    
    // Only allow study mode for notes with content
    if (currentPage.isScanned && !currentPage.ocrText) {
      toast({
        title: "OCR Required",
        description: "Please wait for OCR processing to complete before using Study Mode",
        variant: "destructive",
      });
      return;
    }
    
    if (!currentPage.isScanned && (!currentPage.strokes || currentPage.strokes.length === 0)) {
      toast({
        title: "No Content",
        description: "Add content to this note before using Study Mode",
        variant: "destructive",
      });
      return;
    }
    
    setShowStudyMode(true);
  };
  
  // Determine if this is a scanned note (has imageData)
  const isScannedNote = currentPage?.isScanned && currentPage?.imageData;
  
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {!isMobile && <Sidebar />}
        <div className="flex-1 flex flex-col">
          <div className="flex flex-wrap items-center justify-between p-2 sm:p-4 border-b">
            <div className="flex items-center gap-2 w-full sm:w-auto mb-2 sm:mb-0">
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
                className="text-lg sm:text-xl font-semibold bg-transparent border-none focus:outline-none focus:ring-0 w-full sm:w-auto"
                placeholder="Untitled Note"
              />
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={handleSave}
              >
                <Save className="h-4 w-4" />
                <span className={isMobile ? "hidden" : "inline"}>Save</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-800"
                onClick={openStudyMode}
              >
                <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className={isMobile ? "hidden" : "inline"}>Study Mode</span>
              </Button>
            </div>
          </div>
          
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                <p>Loading note...</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
              {isScannedNote ? (
                // Display scanned note image with OCR capabilities
                <div className="p-2 sm:p-4 overflow-auto bg-gray-50 dark:bg-gray-900">
                  <ScannedNoteView 
                    imageData={currentPage.imageData!} 
                    pageId={currentPage.id}
                    className="max-w-3xl mx-auto" 
                  />
                </div>
              ) : (
                // Display digital canvas for regular notes
                <DigitalCanvas />
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Study Mode Dialog */}
      {currentPage && noteId && (
        <StudyModeView
          noteId={noteId}
          open={showStudyMode}
          onOpenChange={setShowStudyMode}
        />
      )}
      
      {/* Mobile sidebar */}
      {isMobile && (
        <Sidebar className="hidden" />
      )}
    </div>
  );
};

export default NotePage;
