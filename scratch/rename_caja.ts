import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  });

  try {
    console.log("Renaming Caja to Wallet...");
    
    // Rename the main table
    await prisma.$executeRawUnsafe(`ALTER TABLE "Caja" RENAME TO "Wallet";`);
    
    // Rename columns in related tables
    console.log("Updating Balance table...");
    await prisma.$executeRawUnsafe(`ALTER TABLE "Balance" RENAME COLUMN "cajaId" TO "walletId";`);
    
    console.log("Updating Transaction table...");
    await prisma.$executeRawUnsafe(`ALTER TABLE "Transaction" RENAME COLUMN "cajaId" TO "walletId";`);
    
    console.log("SUCCESS: Database tables renamed.");
  } catch (e) {
    console.error("Error renaming tables (they might already be renamed):", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
