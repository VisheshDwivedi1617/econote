
export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  noteId: string;
  createdAt: number;
}

export interface Quiz {
  id: string;
  question: string;
  correctAnswer: string;
  options: string[];
  noteId: string;
  createdAt: number;
}

export interface StudySession {
  id: string;
  noteId: string;
  flashcards: Flashcard[];
  quizzes: Quiz[];
  startedAt: number;
  completedAt?: number;
  correctAnswers: number;
  totalAnswered: number;
}
