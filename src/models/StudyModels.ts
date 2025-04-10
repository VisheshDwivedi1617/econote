
// Study mode related models

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
  options: string[];
  correctAnswer: string;
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
