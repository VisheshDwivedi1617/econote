
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNotebook } from "@/contexts/NotebookContext";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import DigitalCanvas from "@/components/canvas/DigitalCanvas";
import ScannedNoteView from "@/components/scanner/ScannedNoteView";
import StudyModeView from "@/components/study/StudyModeView";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Loader2, Brain, PanelLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import analyticsService, { EventCategory, FeatureAction } from "@/services/AnalyticsService";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const NotePage = () => {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentPage, switchPage, updatePage } = useNotebook();
  const [pageTitle, setPageTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [showStudyMode, setShowStudyMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const isMobile = useIsMobile();
  
  // Load the note when the component mounts or noteId changes
  useEffect(() => {
    // Track page view
    if (noteId) {
      analyticsService.trackPageView(`/note/${noteId}`, 'Note View');
    }
    
    const loadNoteData = async () => {
      if (!noteId) {
        navigate("/notes");
        return;
      }
      
      try {
        const startTime = performance.now();
        setLoading(true);
        await switchPage(noteId);
        
        // Track loading performance
        const loadTime = performance.now() - startTime;
        analyticsService.trackPerformance('note_load_time', loadTime, {
          note_id: noteId
        });
      } catch (error) {
        console.error("Error loading note:", error);
        
        // Track error
        analyticsService.trackError(
          error instanceof Error ? error.message : 'Unknown error loading note',
          'note_loading'
        );
        
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
    
    if (isSaving) return;
    setIsSaving(true);
    
    try {
      // Update the title if it has changed
      if (currentPage.title !== pageTitle) {
        const startTime = performance.now();
        
        const updatedPage = {
          ...currentPage,
          title: pageTitle,
          updatedAt: Date.now()
        };
        
        await updatePage(updatedPage);
        
        // Track save performance and event
        const saveTime = performance.now() - startTime;
        analyticsService.trackPerformance('note_save_time', saveTime);
        analyticsService.trackFeatureUsage('note', FeatureAction.EDIT, {
          changed_title: true
        });
        
        toast({
          title: "Saved",
          description: "Note has been saved successfully",
        });
      }
    } catch (error) {
      console.error("Error saving note:", error);
      
      // Track error
      analyticsService.trackError(
        error instanceof Error ? error.message : 'Unknown error saving note',
        'note_saving'
      );
      
      toast({
        title: "Error",
        description: "Failed to save the note",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
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
    
    // Track study mode usage
    analyticsService.trackFeatureUsage('study_mode', FeatureAction.VIEW, {
      note_id: currentPage.id,
      is_scanned: currentPage.isScanned || false
    });
    
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
          <div className="flex flex-wrap items-center justify-between p-2 sm:p-4 border-b bg-white dark:bg-gray-800 shadow-sm">
            <div className="flex items-center gap-2 w-full sm:w-auto mb-2 sm:mb-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate("/notes")}
                      className="rounded-full"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Back to Notes</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <input
                type="text"
                value={pageTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="text-lg sm:text-xl font-semibold bg-transparent border-none focus:outline-none focus:ring-0 w-full sm:w-auto"
                placeholder="Untitled Note"
              />
              
              {isMobile && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowSidebar(!showSidebar)}
                        className="ml-auto rounded-full"
                      >
                        <PanelLeft className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Toggle Sidebar</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="default"
                      size="sm"
                      className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-sm"
                      onClick={openStudyMode}
                    >
                      <Brain className="h-4 w-4" />
                      <span className={isMobile ? "sr-only" : "inline"}>Study Mode</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Study this Note</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 rounded-full"
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      <span className={isMobile ? "sr-only" : "inline"}>
                        {isSaving ? "Saving..." : "Save"}
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Save Note</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
            <ErrorBoundary>
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
            </ErrorBoundary>
          )}
        </div>
      </div>
      
      {/* Study Mode Dialog */}
      {currentPage && noteId && (
        <StudyModeView
          noteId={noteId}
          open={showStudyMode}
          onOpenChange={(open) => {
            setShowStudyMode(open);
            if (!open && currentPage) {
              // Track study mode exit
              analyticsService.trackFeatureUsage('study_mode', FeatureAction.VIEW, {
                note_id: currentPage.id,
                session_ended: true
              });
            }
          }}
        />
      )}
      
      {/* Mobile sidebar */}
      {isMobile && showSidebar && (
        <Sidebar className="block fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg animate-in slide-in-from-left-80" />
      )}
    </div>
  );
};

export default NotePage;
