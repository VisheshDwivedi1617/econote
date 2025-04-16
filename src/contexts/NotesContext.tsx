
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface Note {
  id: string;
  title: string;
  content: any;
  type: 'digital' | 'scanned';
  updated_at: string;
  created_at: string;
}

interface NotesContextType {
  notes: Note[];
  currentNote: Note | null;
  isNoteLoading: boolean;
  isNoteSaving: boolean;
  isNoteError: boolean;
  
  fetchNotes: () => Promise<Note[]>;
  fetchNote: (id: string) => Promise<Note | null>;
  saveNote: (note: Note) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  createNote: (title: string, type: 'digital' | 'scanned') => Promise<Note>;
  getCurrentNote: () => Note | null;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const NotesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [isNoteLoading, setIsNoteLoading] = useState(false);
  const [isNoteSaving, setIsNoteSaving] = useState(false);
  const [isNoteError, setIsNoteError] = useState(false);
  const { toast } = useToast();
  
  // For demo purposes, this will create some example notes
  useEffect(() => {
    const createInitialNotes = async () => {
      try {
        // Only create demo notes if none exist
        const existingNotes = await fetchNotes();
        if (existingNotes.length === 0) {
          // Create a demo digital note
          await createNote("My First Digital Note", "digital");
        }
      } catch (error) {
        console.error("Error creating initial notes:", error);
      }
    };
    
    createInitialNotes();
  }, []);
  
  const fetchNotes = async (): Promise<Note[]> => {
    try {
      // In a real app, this would call an API or database
      // For now, we'll use localStorage
      const storedNotes = localStorage.getItem('notes');
      const parsedNotes = storedNotes ? JSON.parse(storedNotes) : [];
      setNotes(parsedNotes);
      return parsedNotes;
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast({
        title: "Error",
        description: "Failed to fetch notes",
        variant: "destructive",
      });
      return [];
    }
  };
  
  const fetchNote = async (id: string): Promise<Note | null> => {
    setIsNoteLoading(true);
    setIsNoteError(false);
    
    try {
      // In a real app, this would call an API or database
      const storedNotes = localStorage.getItem('notes');
      const parsedNotes: Note[] = storedNotes ? JSON.parse(storedNotes) : [];
      const foundNote = parsedNotes.find(note => note.id === id) || null;
      
      if (!foundNote) {
        setIsNoteError(true);
        return null;
      }
      
      setCurrentNote(foundNote);
      return foundNote;
    } catch (error) {
      console.error("Error fetching note:", error);
      setIsNoteError(true);
      toast({
        title: "Error",
        description: "Failed to fetch note",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsNoteLoading(false);
    }
  };
  
  const saveNote = async (note: Note): Promise<void> => {
    setIsNoteSaving(true);
    
    try {
      // Update the updated_at timestamp
      const updatedNote = {
        ...note,
        updated_at: new Date().toISOString()
      };
      
      // In a real app, this would call an API or database
      const storedNotes = localStorage.getItem('notes');
      const parsedNotes: Note[] = storedNotes ? JSON.parse(storedNotes) : [];
      
      const noteIndex = parsedNotes.findIndex(n => n.id === note.id);
      
      if (noteIndex >= 0) {
        // Update existing note
        parsedNotes[noteIndex] = updatedNote;
      } else {
        // Add new note
        parsedNotes.push(updatedNote);
      }
      
      localStorage.setItem('notes', JSON.stringify(parsedNotes));
      setNotes(parsedNotes);
      setCurrentNote(updatedNote);
    } catch (error) {
      console.error("Error saving note:", error);
      toast({
        title: "Error",
        description: "Failed to save note",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsNoteSaving(false);
    }
  };
  
  const deleteNote = async (id: string): Promise<void> => {
    try {
      // In a real app, this would call an API or database
      const storedNotes = localStorage.getItem('notes');
      const parsedNotes: Note[] = storedNotes ? JSON.parse(storedNotes) : [];
      const updatedNotes = parsedNotes.filter(note => note.id !== id);
      
      localStorage.setItem('notes', JSON.stringify(updatedNotes));
      setNotes(updatedNotes);
      
      if (currentNote?.id === id) {
        setCurrentNote(null);
      }
      
      toast({
        title: "Note deleted",
        description: "Your note has been deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting note:", error);
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const createNote = async (title: string, type: 'digital' | 'scanned'): Promise<Note> => {
    try {
      const newNote: Note = {
        id: Date.now().toString(),
        title,
        content: type === 'digital' ? { strokes: [] } : { imageData: '' },
        type,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // In a real app, this would call an API or database
      const storedNotes = localStorage.getItem('notes');
      const parsedNotes: Note[] = storedNotes ? JSON.parse(storedNotes) : [];
      
      parsedNotes.push(newNote);
      localStorage.setItem('notes', JSON.stringify(parsedNotes));
      
      setNotes(parsedNotes);
      setCurrentNote(newNote);
      
      return newNote;
    } catch (error) {
      console.error("Error creating note:", error);
      toast({
        title: "Error",
        description: "Failed to create note",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const getCurrentNote = (): Note | null => {
    return currentNote;
  };
  
  const contextValue: NotesContextType = {
    notes,
    currentNote,
    isNoteLoading,
    isNoteSaving,
    isNoteError,
    fetchNotes,
    fetchNote,
    saveNote,
    deleteNote,
    createNote,
    getCurrentNote
  };
  
  return (
    <NotesContext.Provider value={contextValue}>
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = (): NotesContextType => {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};
