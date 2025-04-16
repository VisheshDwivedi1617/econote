
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import ScannedNoteView from "@/components/scanner/ScannedNoteView";
import DigitalCanvas from "@/components/canvas/DigitalCanvas";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Shield, CalendarDays, Loader2, Lock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

// This is a placeholder for the actual share API integration
const mockGetSharedNote = async (id: string) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock data
  return {
    id,
    title: "Shared Note Example",
    content: {
      strokes: [],
      text: "This is a sample shared note content.",
      imageData: "https://via.placeholder.com/800x600?text=Shared+Note+Example"
    },
    owner: {
      name: "John Doe",
      email: "john@example.com"
    },
    type: "digital",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    permissions: {
      can_edit: false,
      can_comment: true
    }
  };
};

const SharedNotePage = () => {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [note, setNote] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchSharedNote = async () => {
      if (!noteId) return;
      
      try {
        setIsLoading(true);
        const sharedNote = await mockGetSharedNote(noteId);
        setNote(sharedNote);
        setError(null);
      } catch (err) {
        console.error("Error fetching shared note:", err);
        setError("This note either doesn't exist or you don't have permission to view it.");
        toast({
          title: "Error",
          description: "Failed to load the shared note",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSharedNote();
  }, [noteId, toast]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-pen-primary" />
            <p className="mt-4 text-muted-foreground">Loading shared note...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !note) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center max-w-md text-center p-6">
            <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-full mb-4">
              <Lock className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              {error || "This note either doesn't exist or you don't have permission to view it."}
            </p>
            <Button onClick={() => navigate('/')}>
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <header className="border-b bg-background p-4 space-y-2">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className={cn(
              "px-2 py-1 rounded-full text-xs flex items-center",
              note.permissions.can_edit 
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            )}>
              <Shield className="h-3 w-3 mr-1" />
              {note.permissions.can_edit ? "Can Edit" : "View Only"}
            </div>
          </div>
        </div>
        
        <div>
          <h1 className="text-xl font-semibold">{note.title}</h1>
          
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
            <div className="flex items-center text-xs text-muted-foreground">
              <User className="h-3 w-3 mr-1" />
              <span>Shared by {note.owner.name}</span>
            </div>
            
            <div className="flex items-center text-xs text-muted-foreground">
              <CalendarDays className="h-3 w-3 mr-1" />
              <span>Last updated {new Date(note.updated_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {note.type === 'digital' ? (
          <DigitalCanvas 
            className="flex-1" 
            readOnly={!note.permissions.can_edit}
            initialStrokes={note.content?.strokes || []}
          />
        ) : (
          <ScannedNoteView
            className="flex-1"
            imageData={note.content?.imageData}
            pageId={note.id}
            readOnly={!note.permissions.can_edit}
          />
        )}
      </main>
    </div>
  );
};

export default SharedNotePage;
