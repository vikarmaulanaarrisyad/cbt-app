import { PrismaClient } from "@prisma/client";

// Konfigurasi Prisma Client untuk High Concurrency (1.000.000 users)
// Pastikan DATABASE_URL menggunakan connection pooling (contoh: Supavisor/PgBouncer di Supabase)
// format: postgres://user:pass@host:6543/db?pgbouncer=true&connection_limit=1

const prismaClientSingleton = () => {
  return new PrismaClient({
    // Opsional: log queries saat development untuk debugging
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
};

declare global {
  // Prevent multiple instances of Prisma Client in development
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
