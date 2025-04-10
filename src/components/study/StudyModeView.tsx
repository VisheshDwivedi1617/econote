import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Loader2, FileQuestion, FileText, Brain, CopyCheck, ListChecks
} from "lucide-react";
import StudyService from "@/services/StudyService";
import { Flashcard } from "@/models/StudyModels";
import FlashcardView from "@/components/study/FlashcardView";
import QuizView from "@/components/study/QuizView";
import { useToast } from "@/components/ui/use-toast";

interface StudyModeViewProps {
  noteId: string;
  onBack: () => void;
}

interface StudyModeViewState {
  currentNote: any | null;
  isLoading: boolean;
  mode: 'flashcards' | 'quiz' | null;
  flashcards: Flashcard[];
  quizzes: any[];
  currentFlashcardIndex: number;
  currentQuizIndex: number;
  isGenerating: boolean;
}

class StudyModeView extends React.Component<StudyModeViewProps, StudyModeViewState> {
  constructor(props: StudyModeViewProps) {
    super(props);
    this.state = {
      currentNote: null,
      isLoading: true,
      mode: null,
      flashcards: [],
      quizzes: [],
      currentFlashcardIndex: 0,
      currentQuizIndex: 0,
      isGenerating: false,
    };
  }

  componentDidMount() {
    this.loadNote();
  }

  loadNote = async () => {
    try {
      // Load the note content from storage
      const notePage = localStorage.getItem(`note-${this.props.noteId}`);
      
      if (notePage) {
        this.setState({ 
          currentNote: JSON.parse(notePage),
          isLoading: false
        });
      } else {
        this.setState({ 
          currentNote: null,
          isLoading: false
        });
      }
    } catch (error) {
      console.error("Error loading note:", error);
      this.setState({ 
        currentNote: null,
        isLoading: false
      });
    }
  };
  
  handleBack = () => {
    this.props.onBack();
  };
  
  generateFlashcards = async () => {
    this.setState({ isGenerating: true });
    
    try {
      const flashcards = await StudyService.generateFlashcards(this.props.noteId, this.state.currentNote);
      this.setState({ 
        flashcards,
        mode: 'flashcards',
        currentFlashcardIndex: 0,
        isGenerating: false
      });
    } catch (error) {
      console.error("Error generating flashcards:", error);
      this.setState({ isGenerating: false });
    }
  };
  
  generateQuizzes = async () => {
    this.setState({ isGenerating: true });
    
    try {
      const quizzes = await StudyService.generateQuizzes(this.props.noteId, this.state.currentNote);
      this.setState({ 
        quizzes,
        mode: 'quiz',
        currentQuizIndex: 0,
        isGenerating: false
      });
    } catch (error) {
      console.error("Error generating quizzes:", error);
      this.setState({ isGenerating: false });
    }
  };
  
  renderFlashcards = () => {
    const { flashcards, currentFlashcardIndex } = this.state;
    
    if (flashcards.length === 0) {
      return (
        <div className="flex justify-center items-center h-full">
          <div className="text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No Flashcards</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              No flashcards have been generated for this note.
            </p>
            <Button className="mt-4" onClick={this.handleBack}>Go Back</Button>
          </div>
        </div>
      );
    }
    
    return (
      <FlashcardView 
        flashcard={flashcards[currentFlashcardIndex]}
        current={currentFlashcardIndex + 1}
        total={flashcards.length}
        onNext={() => this.setState(prevState => ({
          currentFlashcardIndex: Math.min(prevState.flashcards.length - 1, prevState.currentFlashcardIndex + 1)
        }))}
        onPrev={() => this.setState(prevState => ({
          currentFlashcardIndex: Math.max(0, prevState.currentFlashcardIndex - 1)
        }))}
        onBack={this.handleBack}
      />
    );
  };
  
  renderQuiz = () => {
    const { quizzes, currentQuizIndex } = this.state;
    
    if (quizzes.length === 0) {
      return (
        <div className="flex justify-center items-center h-full">
          <div className="text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No Quizzes</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              No quizzes have been generated for this note.
            </p>
            <Button className="mt-4" onClick={this.handleBack}>Go Back</Button>
          </div>
        </div>
      );
    }
    
    return (
      <QuizView 
        quiz={quizzes[currentQuizIndex]}
        current={currentQuizIndex + 1}
        total={quizzes.length}
        onNext={() => this.setState(prevState => ({
          currentQuizIndex: Math.min(prevState.quizzes.length - 1, prevState.currentQuizIndex + 1)
        }))}
        onPrev={() => this.setState(prevState => ({
          currentQuizIndex: Math.max(0, prevState.currentQuizIndex - 1)
        }))}
        onBack={this.handleBack}
      />
    );
  };

renderContent() {
  const { currentNote, isLoading, mode } = this.state;
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-600 dark:text-gray-300" />
          <p className="text-gray-600 dark:text-gray-300">Generating study materials...</p>
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
          <Button className="mt-4" onClick={this.handleBack}>Go Back</Button>
        </div>
      </div>
    );
  }
  
  if (mode === 'flashcards' && this.state.flashcards.length > 0) {
    return this.renderFlashcards();
  } else if (mode === 'quiz' && this.state.quizzes.length > 0) {
    return this.renderQuiz();
  } else {
    // Try to get content in a safe way
    const content = currentNote.content || "";
    
    if (!content || content.trim() === '') {
      return (
        <div className="flex justify-center items-center h-full">
          <div className="text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Empty Note</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">This note doesn't have any content to study.</p>
            <Button className="mt-4" onClick={this.handleBack}>Go Back</Button>
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
              onClick={() => this.generateFlashcards()} 
              disabled={this.state.isGenerating}
            >
              <CopyCheck className="h-4 w-4" />
              Flashcards
            </Button>
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => this.generateQuizzes()}
              disabled={this.state.isGenerating}
            >
              <ListChecks className="h-4 w-4" />
              Quiz
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

  render() {
    return (
      <div className="flex flex-col h-full">
        {this.renderContent()}
      </div>
    );
  }
}

export default StudyModeView;
