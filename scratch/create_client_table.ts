import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  });

  try {
    console.log("Creating Client table...");
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Client" (
        "id" TEXT NOT NULL,
        "firstName" TEXT NOT NULL,
        "lastName" TEXT NOT NULL,
        "documentId" TEXT,
        "phone" TEXT,
        "email" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log("SUCCESS: Client table created (or already existed).");
  } catch (e) {
    console.error("Error creating table:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
