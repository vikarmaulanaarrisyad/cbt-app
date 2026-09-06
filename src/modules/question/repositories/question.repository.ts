import { db } from "@/prisma/db";
import { Question, CreateQuestionInput, UpdateQuestionInput, QuestionFilter, QuestionMetrics } from "../types";

const defaultQuestions: Question[] = [
  // MI
  {
    id: "Q-MI-101",
    text: "Rukun Iman yang ketiga adalah beriman kepada...",
    category: "Akidah Akhlak",
    educationLevel: "MI",
    difficulty: "MUDAH",
    status: "AKTIF",
    options: [
      { id: "A", text: "Allah SWT" },
      { id: "B", text: "Malaikat-malaikat Allah" },
      { id: "C", text: "Kitab-kitab Allah", isCorrect: true },
      { id: "D", text: "Rasul-rasul Allah" },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "Q-MI-102",
    text: "Berapakah hasil dari penjumlahan 135 + 248?",
    category: "Tematik Matematika",
    educationLevel: "MI",
    difficulty: "MUDAH",
    status: "AKTIF",
    options: [
      { id: "A", text: "383", isCorrect: true },
      { id: "B", text: "373" },
      { id: "C", text: "393" },
      { id: "D", text: "403" },
    ],
    createdAt: new Date().toISOString(),
  },

  // MTS
  {
    id: "Q-MTS-201",
    text: "Hasil penyederhanaan dari bentuk aljabar 3(2x - 4) + 5x adalah...",
    category: "Matematika",
    educationLevel: "MTS",
    difficulty: "SEDANG",
    status: "AKTIF",
    options: [
      { id: "A", text: "11x - 12", isCorrect: true },
      { id: "B", text: "11x - 4" },
      { id: "C", text: "6x - 12" },
      { id: "D", text: "11x + 12" },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "Q-MTS-202",
    text: "Nabi yang mendapat gelar Ulul Azmi karena ketabahan dan keteguhan hatinya dalam berdakwah adalah...",
    category: "Sejarah Kebudayaan Islam",
    educationLevel: "MTS",
    difficulty: "SEDANG",
    status: "AKTIF",
    options: [
      { id: "A", text: "Nabi Nuh, Ibrahim, Musa, Isa, dan Muhammad SAW", isCorrect: true },
      { id: "B", text: "Nabi Adam, Idris, Nuh, Hud, dan Sholeh" },
      { id: "C", text: "Nabi Yusuf, Ayub, Syu'aib, Harun, dan Zulkifli" },
      { id: "D", text: "Nabi Daud, Sulaiman, Ilyas, Ilyasa, dan Yunus" },
    ],
    createdAt: new Date().toISOString(),
  },

  // MA
  {
    id: "Q-MA-301",
    text: "Sebuah mobil bergerak dengan kecepatan awal 10 m/s kemudian mengalami percepatan konstan 2 m/s² selama 5 detik. Jarak yang ditempuh mobil tersebut adalah...",
    category: "Fisika",
    educationLevel: "MA",
    difficulty: "SULIT",
    status: "AKTIF",
    options: [
      { id: "A", text: "50 meter" },
      { id: "B", text: "75 meter", isCorrect: true },
      { id: "C", text: "100 meter" },
      { id: "D", text: "125 meter" },
      { id: "E", text: "150 meter" },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "Q-MA-302",
    text: "Dalam ilmu Fiqih Mawaris, bagian harta waris seorang anak perempuan tunggal apabila tidak memiliki saudara kandung adalah...",
    category: "Fikih - Ushul Fikih",
    educationLevel: "MA",
    difficulty: "SEDANG",
    status: "AKTIF",
    options: [
      { id: "A", text: "1/2 (Setengah)", isCorrect: true },
      { id: "B", text: "2/3 (Dua pertiga)" },
      { id: "C", text: "1/4 (Seperempat)" },
      { id: "D", text: "1/8 (Seperdelapan)" },
      { id: "E", text: "Ashabah" },
    ],
    createdAt: new Date().toISOString(),
  },

  // SEMUA
  {
    id: "Q-ALL-001",
    text: "Jika semua burung bertelur dan sebagian hewan yang bertelur bisa berenang, maka kesimpulan yang paling tepat adalah...",
    category: "Penalaran Umum",
    educationLevel: "SEMUA",
    difficulty: "SEDANG",
    status: "AKTIF",
    options: [
      { id: "A", text: "Semua burung bisa berenang" },
      { id: "B", text: "Sebagian burung bisa berenang", isCorrect: true },
      { id: "C", text: "Hewan yang tidak bisa berenang bukan burung" },
      { id: "D", text: "Tidak ada burung yang bisa berenang" },
    ],
    createdAt: new Date().toISOString(),
  },
];

export class QuestionRepository {
  /**
   * Retrieves all questions from PostgreSQL database with optional filtering & pagination
   */
  async findMany(filter: QuestionFilter = {}): Promise<{ data: Question[]; total: number }> {
    try {
      let all: any[] = [];
      try {
        if ((db as any).question) {
          all = (await (db as any).question.findMany({
            orderBy: { createdAt: "desc" },
          })) || [];
        }
      } catch (err) {
        console.warn("[QuestionRepository] DB query failed, falling back to in-memory:", err);
      }

      if (all.length === 0) {
        all = defaultQuestions;
      }
      
      let filtered = all.map((q: any) => ({
        ...q,
        educationLevel: q.educationLevel || "SEMUA",
        options: typeof q.options === "string" ? JSON.parse(q.options) : q.options,
      }));

      // Education Level Filter
      if (filter.educationLevel && filter.educationLevel !== "ALL") {
        const target = filter.educationLevel.toUpperCase();
        filtered = filtered.filter((q: Question) => {
          const lvl = (q.educationLevel || "SEMUA").toUpperCase();
          return lvl === target || lvl === "SEMUA";
        });
      }

      if (filter.category && filter.category !== "ALL") {
        filtered = filtered.filter(
          (q: Question) => q.category.toLowerCase() === filter.category?.toLowerCase()
        );
      }

      if (filter.difficulty && (filter.difficulty as any) !== "ALL") {
        filtered = filtered.filter(
          (q: Question) => q.difficulty === filter.difficulty
        );
      }

      if (filter.status && (filter.status as any) !== "ALL") {
        filtered = filtered.filter(
          (q: Question) => q.status === filter.status
        );
      }

      if (filter.search) {
        const query = filter.search.toLowerCase();
        filtered = filtered.filter(
          (q: Question) =>
            q.text.toLowerCase().includes(query) ||
            q.id.toLowerCase().includes(query) ||
            q.category.toLowerCase().includes(query) ||
            (q.educationLevel && q.educationLevel.toLowerCase().includes(query))
        );
      }

      const total = filtered.length;
      const page = filter.page || 1;
      const limit = filter.limit || 10;
      const skip = (page - 1) * limit;

      return {
        data: filtered.slice(skip, skip + limit),
        total,
      };
    } catch (error) {
      console.error("[QuestionRepository] Error fetching questions:", error);
      return { data: [], total: 0 };
    }
  }

  /**
   * Finds a question by ID
   */
  async findById(id: string): Promise<Question | null> {
    try {
      let q = null;
      try {
        if ((db as any).question) {
          q = await (db as any).question.findUnique({ where: { id } });
        }
      } catch {}

      if (!q) {
        q = defaultQuestions.find((item) => item.id === id);
      }

      if (!q) return null;

      return {
        ...q,
        educationLevel: q.educationLevel || "SEMUA",
        options: typeof q.options === "string" ? JSON.parse(q.options) : q.options,
      };
    } catch (error) {
      console.error(`[QuestionRepository] Error finding question ${id}:`, error);
      return null;
    }
  }

  /**
   * Creates a new question in database
   */
  async create(data: CreateQuestionInput): Promise<Question> {
    const id = `Q-${data.educationLevel || "GEN"}-${Math.floor(1000 + Math.random() * 9000)}`;
    const optionsJson = data.options ? JSON.stringify(data.options) : null;
    const educationLevel = (data.educationLevel || "SEMUA").toUpperCase();

    try {
      if ((db as any).question) {
        const created = await (db as any).question.create({
          data: {
            id,
            text: data.text,
            category: data.category,
            educationLevel,
            difficulty: data.difficulty || "SEDANG",
            status: data.status || "AKTIF",
            options: optionsJson,
          },
        });

        return {
          ...created,
          educationLevel,
          options: data.options || null,
        };
      }
    } catch (err) {
      console.warn("[QuestionRepository] DB create fallback to memory:", err);
    }

    const newQ: Question = {
      id,
      text: data.text,
      category: data.category,
      educationLevel,
      difficulty: data.difficulty || "SEDANG",
      status: data.status || "AKTIF",
      options: data.options || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    defaultQuestions.unshift(newQ);
    return newQ;
  }

  /**
   * Updates an existing question
   */
  async update(id: string, data: UpdateQuestionInput): Promise<Question> {
    const optionsJson = data.options ? JSON.stringify(data.options) : undefined;
    const educationLevel = data.educationLevel ? data.educationLevel.toUpperCase() : undefined;

    try {
      if ((db as any).question) {
        const updated = await (db as any).question.update({
          where: { id },
          data: {
            text: data.text,
            category: data.category,
            educationLevel,
            difficulty: data.difficulty,
            status: data.status,
            options: optionsJson,
          },
        });

        return {
          ...updated,
          options: data.options ?? (typeof updated.options === "string" ? JSON.parse(updated.options) : updated.options),
        };
      }
    } catch (err) {
      console.warn("[QuestionRepository] DB update fallback to memory:", err);
    }

    const idx = defaultQuestions.findIndex((item) => item.id === id);
    if (idx !== -1) {
      defaultQuestions[idx] = {
        ...defaultQuestions[idx],
        ...data,
        educationLevel: educationLevel || defaultQuestions[idx].educationLevel,
        options: data.options || defaultQuestions[idx].options,
      };
      return defaultQuestions[idx];
    }

    throw new Error(`Soal dengan ID "${id}" tidak ditemukan.`);
  }

  /**
   * Deletes a question by ID
   */
  async delete(id: string): Promise<boolean> {
    try {
      if ((db as any).question) {
        await (db as any).question.delete({ where: { id } });
      }
      const idx = defaultQuestions.findIndex((item) => item.id === id);
      if (idx !== -1) {
        defaultQuestions.splice(idx, 1);
      }
      return true;
    } catch (error) {
      console.error(`[QuestionRepository] Error deleting question ${id}:`, error);
      const idx = defaultQuestions.findIndex((item) => item.id === id);
      if (idx !== -1) {
        defaultQuestions.splice(idx, 1);
        return true;
      }
      return false;
    }
  }

  /**
   * Calculates question bank summary metrics from database
   */
  async getMetrics(): Promise<QuestionMetrics> {
    try {
      let all: any[] = [];
      try {
        if ((db as any).question) {
          all = (await (db as any).question.findMany()) || [];
        }
      } catch {}

      if (all.length === 0) {
        all = defaultQuestions;
      }

      const totalQuestions = all.length;
      const activeQuestions = all.filter((q: any) => q.status === "AKTIF" || q.status === "Aktif").length;
      const draftQuestions = all.filter((q: any) => q.status === "DRAFT" || q.status === "Draft").length;

      const totalMI = all.filter((q: any) => (q.educationLevel || "SEMUA").toUpperCase() === "MI").length;
      const totalMTS = all.filter((q: any) => (q.educationLevel || "SEMUA").toUpperCase() === "MTS").length;
      const totalMA = all.filter((q: any) => (q.educationLevel || "SEMUA").toUpperCase() === "MA").length;
      const totalSemua = all.filter((q: any) => (q.educationLevel || "SEMUA").toUpperCase() === "SEMUA").length;

      const categoryCounts: Record<string, number> = {};
      for (const q of all) {
        const cat = q.category || "Umum";
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      }

      let popularCategory = "Penalaran Umum";
      let popularCategoryCount = 0;
      for (const [cat, count] of Object.entries(categoryCounts)) {
        if (count > popularCategoryCount) {
          popularCategory = cat;
          popularCategoryCount = count;
        }
      }

      return {
        totalQuestions,
        activeQuestions,
        draftQuestions,
        popularCategory,
        popularCategoryCount,
        totalMI,
        totalMTS,
        totalMA,
        totalSemua,
      };
    } catch (error) {
      console.error("[QuestionRepository] Error calculating metrics:", error);
      return {
        totalQuestions: 0,
        activeQuestions: 0,
        draftQuestions: 0,
        popularCategory: "Penalaran Umum",
        popularCategoryCount: 0,
        totalMI: 0,
        totalMTS: 0,
        totalMA: 0,
        totalSemua: 0,
      };
    }
  }
}

export const questionRepository = new QuestionRepository();
