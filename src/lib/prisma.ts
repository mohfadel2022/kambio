import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prismaInstance_v5: PrismaClient };

export const prisma =
  globalForPrisma.prismaInstance_v5 ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prismaInstance_v5 = prisma;
