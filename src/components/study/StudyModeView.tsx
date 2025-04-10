
import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";
import { 
  BookOpen, 
  HelpCircle, 
  Award, 
  CheckCircle,
  XCircle 
} from "lucide-react";
import { NotePage } from "@/services/StorageService";
import StudyService from "@/services/StudyService";
import { Flashcard as FlashcardType, Quiz, StudySession } from "@/models/StudyModels";
import Flashcard from "./Flashcard";
import QuizCard from "./QuizCard";

interface StudyModeViewProps {
  page: NotePage;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const StudyModeView = ({ page, open, onOpenChange }: StudyModeViewProps) => {
  const [activeTab, setActiveTab] = useState("flashcards");
  const [flashcards, setFlashcards] = useState<FlashcardType[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [studySession, setStudySession] = useState<StudySession | null>(null);
  const [showResults, setShowResults] = useState(false);
  
  useEffect(() => {
    if (open) {
      initializeStudySession();
    } else {
      resetStudySession();
    }
  }, [open, page]);
  
  const initializeStudySession = () => {
    try {
      const generatedFlashcards = StudyService.generateFlashcards(page);
      setFlashcards(generatedFlashcards);
      
      let noteText = "";
      if (page.isScanned && page.ocrText) {
        noteText = page.ocrText;
      } else if (page.strokes && page.strokes.length > 0) {
        noteText = "This is a handwritten note.";
      }
      
      const generatedQuizzes = StudyService.generateQuizzes(generatedFlashcards, noteText);
      setQuizzes(generatedQuizzes);
      
      const newSession = StudyService.createStudySession(
        page.id, 
        generatedFlashcards,
        generatedQuizzes
      );
      setStudySession(newSession);
      
      setCurrentFlashcardIndex(0);
      setCurrentQuizIndex(0);
      setShowResults(false);
      
      if (generatedFlashcards.length === 0) {
        toast({
          title: "Not enough content",
          description: "Unable to generate flashcards from this note. Try adding more content.",
          variant: "destructive",
        });
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error initializing study session:", error);
      toast({
        title: "Error",
        description: "Failed to initialize study mode",
        variant: "destructive",
      });
      onOpenChange(false);
    }
  };
  
  const resetStudySession = () => {
    setFlashcards([]);
    setQuizzes([]);
    setStudySession(null);
    setCurrentFlashcardIndex(0);
    setCurrentQuizIndex(0);
    setShowResults(false);
  };
  
  const handleNext = () => {
    if (activeTab === "flashcards") {
      if (currentFlashcardIndex < flashcards.length - 1) {
        setCurrentFlashcardIndex(currentFlashcardIndex + 1);
      } else {
        setActiveTab("quiz");
      }
    } else {
      if (currentQuizIndex < quizzes.length - 1) {
        setCurrentQuizIndex(currentQuizIndex + 1);
      } else {
        setShowResults(true);
      }
    }
  };
  
  const handlePrevious = () => {
    if (activeTab === "flashcards") {
      if (currentFlashcardIndex > 0) {
        setCurrentFlashcardIndex(currentFlashcardIndex - 1);
      }
    } else {
      if (currentQuizIndex > 0) {
        setCurrentQuizIndex(currentQuizIndex - 1);
      }
    }
  };
  
  const handleAnswerQuiz = (isCorrect: boolean) => {
    if (!studySession) return;
    
    const updatedSession = { 
      ...studySession,
      totalAnswered: studySession.totalAnswered + 1,
      correctAnswers: isCorrect ? studySession.correctAnswers + 1 : studySession.correctAnswers
    };
    
    setStudySession(updatedSession);
  };
  
  const getProgress = () => {
    if (!studySession) return 0;
    
    if (activeTab === "flashcards") {
      return Math.round((currentFlashcardIndex / flashcards.length) * 100);
    } else {
      return Math.round((currentQuizIndex / quizzes.length) * 100);
    }
  };
  
  const handleClose = () => {
    if (studySession && studySession.totalAnswered > 0) {
      const updatedSession = {
        ...studySession,
        completedAt: Date.now()
      };
      setStudySession(updatedSession);
    }
    
    onOpenChange(false);
  };
  
  const handleStartOver = () => {
    setShowResults(false);
    setCurrentFlashcardIndex(0);
    setCurrentQuizIndex(0);
    setActiveTab("flashcards");
    
    if (studySession) {
      const resetSession = {
        ...studySession,
        correctAnswers: 0,
        totalAnswered: 0,
        startedAt: Date.now()
      };
      setStudySession(resetSession);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Study Mode: {page.title}
          </DialogTitle>
          <DialogDescription>
            Enhance your learning with flashcards and quizzes generated from this note.
          </DialogDescription>
        </DialogHeader>
        
        {!showResults ? (
          <>
            <Progress value={getProgress()} className="h-2" />
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="flashcards" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Flashcards</span>
                </TabsTrigger>
                <TabsTrigger value="quiz" className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  <span>Quiz</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="flashcards">
                {flashcards.length > 0 && (
                  <Flashcard
                    flashcard={flashcards[currentFlashcardIndex]}
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                    hasNext={currentFlashcardIndex < flashcards.length - 1}
                    hasPrevious={currentFlashcardIndex > 0}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="quiz">
                {quizzes.length > 0 && (
                  <QuizCard
                    quiz={quizzes[currentQuizIndex]}
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                    onAnswer={handleAnswerQuiz}
                    hasNext={currentQuizIndex < quizzes.length - 1}
                    hasPrevious={currentQuizIndex > 0}
                  />
                )}
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="py-6 text-center">
            <div className="mb-6 inline-flex justify-center items-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900">
              <Award className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            
            <h3 className="text-lg font-medium mb-2">Study Session Complete!</h3>
            
            {studySession && (
              <div className="mb-6">
                <div className="text-3xl font-bold mb-2">
                  {Math.round((studySession.correctAnswers / studySession.totalAnswered) * 100)}%
                </div>
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center text-green-600 dark:text-green-400">
                    <CheckCircle className="h-5 w-5 mr-1" />
                    <span>{studySession.correctAnswers} correct</span>
                  </div>
                  <div className="flex items-center text-red-600 dark:text-red-400">
                    <XCircle className="h-5 w-5 mr-1" />
                    <span>{studySession.totalAnswered - studySession.correctAnswers} incorrect</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button onClick={handleStartOver}>
                Start Over
              </Button>
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        )}
        
        {!showResults && (
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Exit Study Mode
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StudyModeView;
