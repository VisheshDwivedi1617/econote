import { Flashcard, Quiz, StudySession } from "@/models/StudyModels";
import { NotePage } from "@/services/StorageService";

class StudyService {
  // Generate flashcards from note text
  generateFlashcards(page: NotePage): Flashcard[] {
    if (!page) return [];
    
    let text = "";
    
    // For scanned notes, use OCR text
    if (page.isScanned && page.ocrText) {
      text = page.ocrText;
    } else if (page.strokes && page.strokes.length > 0) {
      // For digital notes with strokes, use a placeholder text
      // In a real implementation, this would be generated from strokes
      text = "This note contains handwritten content that hasn't been processed with OCR yet.";
    } else {
      // Fallback to an empty string if no content
      return [];
    }
    
    const flashcards: Flashcard[] = [];
    
    // Look for text in double brackets [[answer]] as dedicated flashcard answers
    const bracketRegex = /\[\[(.*?)\]\]/g;
    let match;
    let paragraphs = text.split(/\n\s*\n/); // Split by paragraphs (double line breaks)
    
    // First pass: extract explicit [[answers]]
    while ((match = bracketRegex.exec(text)) !== null) {
      const answer = match[1];
      const sentence = this.extractSentenceWithBrackets(text, match.index);
      
      if (sentence) {
        const question = sentence.replace(/\[\[(.*?)\]\]/g, '_______');
        
        flashcards.push({
          id: Date.now().toString() + flashcards.length,
          question,
          answer,
          noteId: page.id,
          createdAt: Date.now()
        });
      }
    }
    
    // Second pass: if no bracketed answers, create basic flashcards from paragraphs
    if (flashcards.length === 0 && paragraphs.length > 0) {
      paragraphs.forEach((paragraph, index) => {
        if (paragraph.trim().length > 10) { // Only use paragraphs with some content
          // Split by sentences
          const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [];
          
          for (let i = 0; i < Math.min(sentences.length, 2); i++) {
            const sentence = sentences[i].trim();
            if (sentence.length > 15) { // Only use substantial sentences
              const words = sentence.split(/\s+/);
              
              if (words.length > 4) {
                // Find a word to remove (try to pick a noun or important word)
                const wordIndex = Math.floor(words.length / 2);
                const answer = words[wordIndex].replace(/[,.!?;:"']/g, '');
                
                if (answer.length > 3) { // Only use meaningful words
                  words[wordIndex] = '_______';
                  const question = words.join(' ');
                  
                  flashcards.push({
                    id: Date.now().toString() + flashcards.length,
                    question,
                    answer,
                    noteId: page.id,
                    createdAt: Date.now()
                  });
                }
              }
            }
          }
        }
      });
    }
    
    return flashcards;
  }
  
  // Extract a full sentence containing the bracketed text
  private extractSentenceWithBrackets(text: string, bracketIndex: number): string | null {
    // Find the start of the sentence (previous period or beginning of text)
    let startIndex = text.lastIndexOf('.', bracketIndex);
    startIndex = startIndex === -1 ? 0 : startIndex + 1;
    
    // Find the end of the sentence (next period or end of text)
    let endIndex = text.indexOf('.', bracketIndex);
    endIndex = endIndex === -1 ? text.length : endIndex + 1;
    
    return text.substring(startIndex, endIndex).trim();
  }
  
  // Generate multiple choice quizzes from flashcards
  generateQuizzes(flashcards: Flashcard[], noteText: string): Quiz[] {
    const quizzes: Quiz[] = [];
    const words = this.extractPotentialAnswers(noteText);
    
    flashcards.forEach(flashcard => {
      // Create a copy of all words for each flashcard
      const availableWords = [...words];
      const options: string[] = [flashcard.answer];
      
      // Remove the correct answer from the list of available words
      const correctAnswerIndex = availableWords.indexOf(flashcard.answer);
      if (correctAnswerIndex !== -1) {
        availableWords.splice(correctAnswerIndex, 1);
      }
      
      // Add 3 random wrong answers
      while (options.length < 4 && availableWords.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableWords.length);
        const word = availableWords[randomIndex];
        
        if (!options.includes(word) && word.length > 2) {
          options.push(word);
          availableWords.splice(randomIndex, 1);
        }
      }
      
      // Shuffle the options
      this.shuffleArray(options);
      
      quizzes.push({
        id: Date.now().toString() + quizzes.length,
        question: flashcard.question,
        correctAnswer: flashcard.answer,
        options,
        noteId: flashcard.noteId,
        createdAt: Date.now()
      });
    });
    
    return quizzes;
  }
  
  // Extract potential answer words from the note text
  private extractPotentialAnswers(text: string): string[] {
    // Split text into words and filter out common words and punctuation
    const words = text.split(/\s+/)
      .map(word => word.replace(/[,.!?;:"']/g, '').toLowerCase())
      .filter(word => word.length > 3)
      .filter(word => !this.isCommonWord(word));
    
    // Remove duplicates
    return Array.from(new Set(words));
  }
  
  // Check if a word is a common word (that wouldn't make a good answer)
  private isCommonWord(word: string): boolean {
    const commonWords = ['the', 'and', 'that', 'have', 'for', 'not', 'with', 'you', 'this', 'but'];
    return commonWords.includes(word.toLowerCase());
  }
  
  // Fisher-Yates shuffle algorithm
  private shuffleArray(array: any[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
  
  // Create a new study session
  createStudySession(noteId: string, flashcards: Flashcard[], quizzes: Quiz[]): StudySession {
    return {
      id: Date.now().toString(),
      noteId,
      flashcards,
      quizzes,
      startedAt: Date.now(),
      correctAnswers: 0,
      totalAnswered: 0
    };
  }
}

export default new StudyService();
