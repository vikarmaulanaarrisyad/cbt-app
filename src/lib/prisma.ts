import 'dotenv/config';

declare global {
  var prismaGlobal: any;
}

let prismaInstance: any;

try {
  const { db } = require("@/prisma/db");
  prismaInstance = db;
} catch {
  try {
    const { PrismaClient } = require("@prisma/client");
    prismaInstance = new PrismaClient();
  } catch {
    prismaInstance = new Proxy({}, {
      get: () => () => Promise.reject(new Error("Database client is initializing.")),
    });
  }
}

export const prisma = (globalThis as any).prismaGlobal ?? prismaInstance;

if (process.env.NODE_ENV !== "production") {
  (globalThis as any).prismaGlobal = prisma;
}
