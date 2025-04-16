
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
import NoteSharing from "@/components/notes/NoteSharing";

// Define interface for ScannedNoteView props to satisfy TypeScript
interface ScannedNoteViewProps {
  className?: string;
  note: any;
  readOnly?: boolean;
}

// Define interface for StudyModeView props
interface StudyModeViewProps {
  note: any;
}

const NotePage = () => {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Get notebook context
  const notebook = useNotebook();
  const {
    getCurrentNote,
    fetchNote,
    saveNote,
    isNoteSaving,
    isNoteLoading,
    isNoteError,
  } = notebook;
  
  const currentNote = notebook.currentNote;
  
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  
  useEffect(() => {
    if (noteId) {
      fetchNote(noteId);
    }
  }, [noteId, fetchNote]);
  
  const handleSave = async () => {
    if (!currentNote) return;
    
    try {
      await saveNote(currentNote);
      toast({
        title: "Note saved",
        description: "Your note has been saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error saving note",
        description: "Failed to save your note. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const toggleStudyMode = () => {
    setIsStudyMode(!isStudyMode);
    
    toast({
      title: isStudyMode ? "Exiting Study Mode" : "Entering Study Mode",
      description: isStudyMode 
        ? "Returning to regular note editing" 
        : "Converting your notes to study materials",
    });
  };
  
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };
  
  if (isNoteLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-pen-primary" />
            <p className="mt-4 text-muted-foreground">Loading note...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (isNoteError || !currentNote) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center max-w-md text-center p-6">
            <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-full mb-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6 text-red-600 dark:text-red-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-2">Note Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The note you're looking for could not be found or might have been deleted.
            </p>
            <Button onClick={() => navigate('/notes')}>
              Go to My Notes
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <header className="border-b bg-background p-2 sm:px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar}
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
          )}
          
          <div>
            <h1 className="text-lg font-semibold line-clamp-1">
              {currentNote.title}
            </h1>
            <p className="text-xs text-muted-foreground">
              Last updated: {new Date(currentNote.updated_at).toLocaleString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <NoteSharing noteId={currentNote.id} noteTitle={currentNote.title} />
          
          <Button
            variant="outline"
            size="sm"
            onClick={toggleStudyMode}
            className="gap-1.5"
          >
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">{isStudyMode ? "Exit Study Mode" : "Study Mode"}</span>
          </Button>
          
          <Button 
            onClick={handleSave}
            disabled={isNoteSaving}
            size="sm"
            className="gap-1.5"
          >
            {isNoteSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="hidden sm:inline">Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span className="hidden sm:inline">Save</span>
              </>
            )}
          </Button>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {!isMobile && <Sidebar />}
        
        <main className="flex-1 flex flex-col overflow-hidden">
          <ErrorBoundary>
            {isStudyMode ? (
              <StudyModeView note={currentNote} />
            ) : (
              currentNote.type === 'digital' ? (
                <DigitalCanvas 
                  className="flex-1" 
                  readOnly={false}
                  initialStrokes={currentNote.content?.strokes || []}
                  onStrokesChange={(strokes) => {
                    if (currentNote) {
                      currentNote.content = {
                        ...(currentNote.content || {}),
                        strokes
                      };
                    }
                  }}
                />
              ) : (
                <ScannedNoteView
                  className="flex-1"
                  note={currentNote}
                  readOnly={false}
                />
              )
            )}
          </ErrorBoundary>
        </main>
      </div>
      
      {/* Mobile sidebar */}
      {isMobile && showSidebar && (
        <Sidebar className="block fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg animate-in slide-in-from-left-80" />
      )}
    </div>
  );
};

export default NotePage;
