import { Subject, SubjectQueryFilter } from "../types";

/**
 * Builds Prisma SQL `where` conditions for querying subject table
 */
export function buildPrismaSubjectWhere(filter: SubjectQueryFilter) {
  const where: any = {};

  if (filter.search) {
    where.OR = [
      { name: { contains: filter.search, mode: "insensitive" } },
      { code: { contains: filter.search, mode: "insensitive" } },
      { category: { contains: filter.search, mode: "insensitive" } },
      { description: { contains: filter.search, mode: "insensitive" } },
    ];
  }

  if (filter.category && filter.category !== "ALL") {
    where.category = filter.category;
  }

  if (filter.educationLevel && filter.educationLevel !== "ALL") {
    where.educationLevel = { in: [filter.educationLevel, "SEMUA"] };
  }

  if (filter.gradeLevel && filter.gradeLevel !== "ALL") {
    where.gradeLevel = filter.gradeLevel;
  }

  if (filter.status && filter.status !== "ALL") {
    where.isActive = filter.status === "ACTIVE";
  }

  return where;
}

/**
 * Filters an array of subjects in-memory (pure query helper)
 */
export function filterSubjectsInMemory(subjects: Subject[], filter: SubjectQueryFilter): Subject[] {
  let result = [...subjects];

  if (filter.search) {
    const q = filter.search.toLowerCase();
    result = result.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        (s.educationLevel && s.educationLevel.toLowerCase().includes(q)) ||
        (s.description && s.description.toLowerCase().includes(q))
    );
  }

  if (filter.educationLevel && filter.educationLevel !== "ALL") {
    const target = filter.educationLevel.toUpperCase();
    result = result.filter(
      (s) =>
        (s.educationLevel || "SEMUA").toUpperCase() === target ||
        (s.educationLevel || "SEMUA").toUpperCase() === "SEMUA"
    );
  }

  if (filter.category && filter.category !== "ALL") {
    result = result.filter((s) => s.category.toLowerCase() === filter.category!.toLowerCase());
  }

  if (filter.gradeLevel && filter.gradeLevel !== "ALL") {
    result = result.filter(
      (s) =>
        s.gradeLevel.toLowerCase() === filter.gradeLevel!.toLowerCase() ||
        s.gradeLevel.toLowerCase() === "semua"
    );
  }

  if (filter.status && filter.status !== "ALL") {
    const isActive = filter.status === "ACTIVE";
    result = result.filter((s) => s.isActive === isActive);
  }

  // Sorting
  const sortBy = filter.sortBy || "name";
  const sortOrder = filter.sortOrder || "asc";

  result.sort((a, b) => {
    let valA: any = a[sortBy as keyof Subject] ?? "";
    let valB: any = b[sortBy as keyof Subject] ?? "";

    if (typeof valA === "number" && typeof valB === "number") {
      return sortOrder === "asc" ? valA - valB : valB - valA;
    }

    if (typeof valA === "string" && typeof valB === "string") {
      return sortOrder === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  return result;
}

/**
 * Calculates pagination metadata
 */
export function calculatePaginationMeta(total: number, page: number, limit: number) {
  const totalPages = Math.ceil(total / limit) || 1;
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}
