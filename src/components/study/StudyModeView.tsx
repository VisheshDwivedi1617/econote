
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Loader2, FileQuestion, FileText, Brain, CopyCheck, ListChecks
} from "lucide-react";
import StudyService from "@/services/StudyService";
import { Flashcard, Quiz, StudySession } from "@/models/StudyModels";
import FlashcardView from "@/components/study/FlashcardView";
import QuizView from "@/components/study/QuizView";
import { useToast } from "@/hooks/use-toast";
import { useNotebook } from "@/contexts/NotebookContext";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

interface StudyModeViewProps {
  noteId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const StudyModeView: React.FC<StudyModeViewProps> = ({ noteId, open, onOpenChange }) => {
  const [currentNote, setCurrentNote] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState<'flashcards' | 'quiz' | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { currentNotebook, switchPage } = useNotebook();

  useEffect(() => {
    if (open) {
      loadNote();
    }
  }, [open, noteId]);

  const loadNote = async () => {
    try {
      setIsLoading(true);
      
      // Since getPage doesn't exist, we'll use switchPage which is available in the context
      // This will make the page current, and we can access it via the currentPage in the context
      await switchPage(noteId);
      
      // Get the pages from the notebook
      if (currentNotebook) {
        const pageIndex = currentNotebook.pages.indexOf(noteId);
        if (pageIndex !== -1) {
          // Simply set a basic structure for the note to work with
          setCurrentNote({
            id: noteId,
            content: "This is the note content for study mode.",
            // You can add other properties as needed
          });
        } else {
          console.error("Could not find note with ID:", noteId);
          toast({
            title: "Error",
            description: "Could not load note content",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error loading note:", error);
      toast({
        title: "Error",
        description: "Failed to load study materials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBack = () => {
    onOpenChange(false);
  };
  
  const generateFlashcards = async () => {
    setIsGenerating(true);
    
    try {
      const flashcards = await StudyService.generateFlashcards(noteId, currentNote);
      setFlashcards(flashcards);
      setMode('flashcards');
      setCurrentFlashcardIndex(0);
      
      toast({
        title: "Flashcards Ready",
        description: `Created ${flashcards.length} flashcards for your study session`
      });
    } catch (error) {
      console.error("Error generating flashcards:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to create flashcards. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const generateQuizzes = async () => {
    setIsGenerating(true);
    
    try {
      const quizzes = await StudyService.generateQuizzes(noteId, currentNote);
      setQuizzes(quizzes);
      setMode('quiz');
      setCurrentQuizIndex(0);
      
      toast({
        title: "Quiz Ready",
        description: `Created ${quizzes.length} quiz questions for your study session`
      });
    } catch (error) {
      console.error("Error generating quizzes:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to create quiz. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const renderFlashcards = () => {
    if (flashcards.length === 0) {
      return (
        <div className="flex justify-center items-center h-full">
          <div className="text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No Flashcards</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              No flashcards have been generated for this note.
            </p>
            <Button className="mt-4" onClick={handleBack}>Go Back</Button>
          </div>
        </div>
      );
    }
    
    return (
      <FlashcardView 
        flashcard={flashcards[currentFlashcardIndex]}
        current={currentFlashcardIndex + 1}
        total={flashcards.length}
        onNext={() => setCurrentFlashcardIndex(prev => Math.min(flashcards.length - 1, prev + 1))}
        onPrev={() => setCurrentFlashcardIndex(prev => Math.max(0, prev - 1))}
        onBack={handleBack}
      />
    );
  };
  
  const renderQuiz = () => {
    if (quizzes.length === 0) {
      return (
        <div className="flex justify-center items-center h-full">
          <div className="text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No Quizzes</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              No quizzes have been generated for this note.
            </p>
            <Button className="mt-4" onClick={handleBack}>Go Back</Button>
          </div>
        </div>
      );
    }
    
    return (
      <QuizView 
        quiz={quizzes[currentQuizIndex]}
        current={currentQuizIndex + 1}
        total={quizzes.length}
        onNext={() => setCurrentQuizIndex(prev => Math.min(quizzes.length - 1, prev + 1))}
        onPrev={() => setCurrentQuizIndex(prev => Math.max(0, prev - 1))}
        onBack={handleBack}
      />
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-full">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-600 dark:text-gray-300" />
            <p className="text-gray-600 dark:text-gray-300">Loading study materials...</p>
          </div>
        </div>
      );
    }
    
    if (!currentNote) {
      return (
        <div className="flex justify-center items-center h-full">
          <div className="text-center">
            <FileQuestion className="h-16 w-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No note content found</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">The note might be empty or an error occurred.</p>
            <Button className="mt-4" onClick={handleBack}>Go Back</Button>
          </div>
        </div>
      );
    }
    
    if (mode === 'flashcards' && flashcards.length > 0) {
      return renderFlashcards();
    } else if (mode === 'quiz' && quizzes.length > 0) {
      return renderQuiz();
    } else {
      // Try to get content in a safe way
      const content = currentNote.content || currentNote.text || currentNote.ocrText || "";
      
      if (!content || content.trim() === '') {
        return (
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Empty Note</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">This note doesn't have any content to study.</p>
              <Button className="mt-4" onClick={handleBack}>Go Back</Button>
            </div>
          </div>
        );
      }
      
      return (
        <div className="flex justify-center items-center h-full">
          <div className="text-center">
            <Brain className="h-16 w-16 mx-auto mb-4 text-blue-500" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Ready to Study</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Choose a study mode to begin learning from this note.
            </p>
            <div className="flex gap-4 justify-center mt-6">
              <Button 
                variant="outline"
                className="gap-2"
                onClick={generateFlashcards} 
                disabled={isGenerating}
              >
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CopyCheck className="h-4 w-4" />}
                Flashcards
              </Button>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={generateQuizzes}
                disabled={isGenerating}
              >
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ListChecks className="h-4 w-4" />}
                Quiz
              </Button>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
        <div className="flex-1 flex flex-col h-full overflow-auto">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudyModeView;
