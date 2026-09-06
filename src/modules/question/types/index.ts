export type Difficulty = "MUDAH" | "SEDANG" | "SULIT";
export type QuestionStatus = "AKTIF" | "DRAFT";
export type EducationLevel = "MI" | "MTS" | "MA" | "SEMUA";

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface Question {
  id: string;
  text: string;
  category: string;
  educationLevel?: string;
  difficulty: Difficulty;
  status: QuestionStatus;
  options?: QuestionOption[] | string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateQuestionInput {
  text: string;
  category: string;
  educationLevel?: string;
  difficulty?: Difficulty;
  status?: QuestionStatus;
  options?: QuestionOption[];
}

export interface UpdateQuestionInput {
  text?: string;
  category?: string;
  educationLevel?: string;
  difficulty?: Difficulty;
  status?: QuestionStatus;
  options?: QuestionOption[];
}

export interface QuestionFilter {
  category?: string;
  educationLevel?: string;
  difficulty?: Difficulty;
  status?: QuestionStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface QuestionMetrics {
  totalQuestions: number;
  activeQuestions: number;
  draftQuestions: number;
  popularCategory: string;
  popularCategoryCount: number;
  totalMI: number;
  totalMTS: number;
  totalMA: number;
  totalSemua: number;
}
