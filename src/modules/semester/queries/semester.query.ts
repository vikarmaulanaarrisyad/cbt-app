import { Semester, SemesterQueryFilter } from "../types";

/**
 * Builds Prisma SQL `where` conditions for querying semester table
 */
export function buildPrismaSemesterWhere(filter: SemesterQueryFilter) {
  const where: any = {};

  if (filter.search) {
    where.OR = [
      { name: { contains: filter.search, mode: "insensitive" } },
      { code: { contains: filter.search, mode: "insensitive" } },
      { academicYear: { contains: filter.search, mode: "insensitive" } },
      { description: { contains: filter.search, mode: "insensitive" } },
    ];
  }

  if (filter.academicYear && filter.academicYear !== "ALL") {
    where.academicYear = filter.academicYear;
  }

  if (filter.type && filter.type !== "ALL") {
    where.type = filter.type;
  }

  if (filter.status && filter.status !== "ALL") {
    where.isActive = filter.status === "ACTIVE";
  }

  return where;
}

/**
 * Builds Prisma SQL `orderBy` sorting parameters
 */
export function buildPrismaSemesterOrderBy(filter: SemesterQueryFilter) {
  const sortBy = filter.sortBy || "startDate";
  const sortOrder = filter.sortOrder || "desc";
  return { [sortBy]: sortOrder };
}

/**
 * Filters array of semesters in-memory (pure query logic)
 */
export function filterSemestersInMemory(semesters: Semester[], filter: SemesterQueryFilter): Semester[] {
  let result = [...semesters];

  if (filter.search) {
    const q = filter.search.toLowerCase();
    result = result.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.academicYear.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q))
    );
  }

  if (filter.academicYear && filter.academicYear !== "ALL") {
    result = result.filter((s) => s.academicYear === filter.academicYear);
  }

  if (filter.type && filter.type !== "ALL") {
    result = result.filter((s) => s.type === filter.type);
  }

  if (filter.status && filter.status !== "ALL") {
    const isActive = filter.status === "ACTIVE";
    result = result.filter((s) => s.isActive === isActive);
  }

  // Sorting
  const sortBy = filter.sortBy || "startDate";
  const sortOrder = filter.sortOrder || "desc";

  result.sort((a, b) => {
    let valA: any = a[sortBy as keyof Semester] ?? "";
    let valB: any = b[sortBy as keyof Semester] ?? "";

    if (valA instanceof Date) valA = valA.getTime();
    if (valB instanceof Date) valB = valB.getTime();

    if (typeof valA === "string" && (valA.includes("-") || valA.includes("T"))) {
      const dateA = Date.parse(valA);
      if (!isNaN(dateA)) valA = dateA;
    }
    if (typeof valB === "string" && (valB.includes("-") || valB.includes("T"))) {
      const dateB = Date.parse(valB);
      if (!isNaN(dateB)) valB = dateB;
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
