
import { Flashcard, Quiz, StudySession } from "@/models/StudyModels";
import StorageService from "./StorageService";

class StudyService {
  /**
   * Generate flashcards from note content
   */
  generateFlashcards = async (noteId: string, notePage: any): Promise<Flashcard[]> => {
    try {
      // Get note content, handling cases where content might not exist
      let content = '';
      
      if (notePage && typeof notePage === 'object') {
        // Try different properties that might hold content
        content = notePage.content || notePage.text || notePage.data?.content || '';
      }
      
      if (!content || typeof content !== 'string' || content.trim() === '') {
        // Create a placeholder if no content found
        return [{
          id: this.generateId(),
          question: "What is the purpose of this note?",
          answer: "To capture your thoughts and ideas",
          noteId,
          createdAt: Date.now()
        }];
      }

      // Split content into paragraphs for real content
      const paragraphs = content.split('\n').filter(p => p.trim().length > 0);
      
      // Basic processing - create a flashcard from each paragraph
      return paragraphs.map((paragraph) => {
        // Look for bracketed text as answers
        const bracketMatch = paragraph.match(/\[\[(.*?)\]\]/);
        
        if (bracketMatch) {
          const answer = bracketMatch[1];
          const question = paragraph.replace(/\[\[.*?\]\]/, '_____');
          
          return {
            id: this.generateId(),
            question,
            answer,
            noteId,
            createdAt: Date.now()
          };
        }
        
        // If no bracketed text, make a simple flashcard
        const words = paragraph.split(' ');
        if (words.length < 3) {
          return {
            id: this.generateId(),
            question: `What does "${paragraph}" refer to?`,
            answer: "Your notes contain this important point",
            noteId,
            createdAt: Date.now()
          };
        }
        
        // Pick a random word to remove for the question
        const randomIndex = Math.floor(Math.random() * (words.length - 1)) + 1;
        const answer = words[randomIndex];
        words[randomIndex] = '_____';
        
        return {
          id: this.generateId(),
          question: words.join(' '),
          answer,
          noteId,
          createdAt: Date.now()
        };
      });
    } catch (error) {
      console.error("Error generating flashcards:", error);
      
      // Return a default flashcard in case of error
      return [{
        id: this.generateId(),
        question: "What is EcoNote useful for?",
        answer: "Taking and studying notes effectively",
        noteId,
        createdAt: Date.now()
      }];
    }
  };

  /**
   * Generate quizzes from note content
   */
  generateQuizzes = async (noteId: string, notePage: any): Promise<Quiz[]> => {
    try {
      // Get note content safely
      let content = '';
      
      if (notePage && typeof notePage === 'object') {
        // Try different properties that might hold content
        content = notePage.content || notePage.text || notePage.data?.content || '';
      }
      
      if (!content || typeof content !== 'string' || content.trim() === '') {
        // Create a placeholder if no content found
        return [{
          id: this.generateId(),
          question: "Which of these is a feature of EcoNote?",
          options: [
            "Digital Canvas for writing",
            "Video editing",
            "3D modeling",
            "Sound recording"
          ],
          correctAnswer: "Digital Canvas for writing",
          noteId,
          createdAt: Date.now()
        }];
      }

      // Split content into paragraphs
      const paragraphs = content.split('\n').filter(p => p.trim().length > 0);
      
      // Extract all words to use for distractors
      const allWords = content
        .split(/\s+/)
        .filter(word => word.length > 4)
        .map(word => word.replace(/[.,;:!?()\[\]{}""]/g, ''));
      
      // Create quizzes from paragraphs
      const quizzes = paragraphs.slice(0, 5).map(paragraph => {
        // Look for bracketed text as correct answers
        const bracketMatch = paragraph.match(/\[\[(.*?)\]\]/);
        let question, correctAnswer;
        
        if (bracketMatch) {
          correctAnswer = bracketMatch[1];
          question = paragraph.replace(/\[\[.*?\]\]/, '_____');
          question = `What goes in the blank? "${question}"`;
        } else {
          // If no bracketed text, create a question about the paragraph
          const words = paragraph.split(' ');
          if (words.length < 5) {
            question = `Which statement best relates to "${paragraph}"?`;
            correctAnswer = "This is mentioned in your notes";
          } else {
            // Remove a key word to create a fill-in-the-blank question
            const randomIndex = Math.floor(Math.random() * (words.length - 1)) + 1;
            correctAnswer = words[randomIndex].replace(/[.,;:!?]/g, '');
            words[randomIndex] = '_____';
            question = `What word belongs in the blank? "${words.join(' ')}"`;
          }
        }
        
        // Generate 3 random distractors
        const distractors = this.getRandomDistractors(allWords, correctAnswer, 3);
        
        // Combine correct answer with distractors and shuffle
        const options = this.shuffleArray([correctAnswer, ...distractors]);
        
        return {
          id: this.generateId(),
          question,
          options,
          correctAnswer,
          noteId,
          createdAt: Date.now()
        };
      });
      
      return quizzes;
    } catch (error) {
      console.error("Error generating quizzes:", error);
      
      // Return a default quiz in case of error
      return [{
        id: this.generateId(),
        question: "Which of these is a feature of EcoNote?",
        options: [
          "Study Mode for learning",
          "Video editing",
          "3D modeling",
          "Sound recording"
        ],
        correctAnswer: "Study Mode for learning",
        noteId,
        createdAt: Date.now()
      }];
    }
  };

  /**
   * Save a study session
   */
  saveStudySession = async (session: StudySession): Promise<StudySession> => {
    try {
      // Implementation would depend on the storage mechanism
      return session;
    } catch (error) {
      throw new Error(`Failed to save study session: ${error}`);
    }
  };

  /**
   * Generate random ID for new items
   */
  private generateId = (): string => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };

  /**
   * Get random distractor options for quizzes
   */
  private getRandomDistractors = (wordPool: string[], correctAnswer: string, count: number): string[] => {
    // Filter out the correct answer or very similar answers
    const filteredPool = wordPool.filter(word => 
      word.toLowerCase() !== correctAnswer.toLowerCase() && 
      word.length > 3
    );
    
    // If we don't have enough words, create some
    if (filteredPool.length < count) {
      return [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ].slice(0, count);
    }
    
    // Shuffle and pick the first 'count' items
    return this.shuffleArray(filteredPool).slice(0, count);
  };

  /**
   * Shuffle an array randomly
   */
  private shuffleArray = <T>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };
}

export default new StudyService();
