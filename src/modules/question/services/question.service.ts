import { questionRepository, QuestionRepository } from "../repositories/question.repository";
import { Question, CreateQuestionInput, UpdateQuestionInput, QuestionFilter, QuestionMetrics } from "../types";

export class QuestionService {
  constructor(private repo: QuestionRepository = questionRepository) {}

  async listQuestions(filter: QuestionFilter = {}) {
    return await this.repo.findMany(filter);
  }

  async getQuestionById(id: string) {
    const q = await this.repo.findById(id);
    if (!q) throw new Error(`Soal dengan ID "${id}" tidak ditemukan.`);
    return q;
  }

  async createQuestion(input: CreateQuestionInput) {
    if (!input.text || input.text.trim().length === 0) {
      throw new Error("Wacana/teks soal wajib diisi.");
    }
    if (!input.category || input.category.trim().length === 0) {
      throw new Error("Kategori soal wajib dipilih.");
    }

    return await this.repo.create(input);
  }

  async updateQuestion(id: string, input: UpdateQuestionInput) {
    await this.getQuestionById(id);
    return await this.repo.update(id, input);
  }

  async deleteQuestion(id: string) {
    await this.getQuestionById(id);
    return await this.repo.delete(id);
  }

  async getMetrics(): Promise<QuestionMetrics> {
    return await this.repo.getMetrics();
  }
}

export const questionService = new QuestionService();
