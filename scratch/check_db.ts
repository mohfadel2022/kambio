import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  });

  try {
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log("Existing tables:", tables);
    
    const clientTable = (tables as any[]).find(t => t.table_name === 'Client');
    if (clientTable) {
      console.log("SUCCESS: Client table exists.");
    } else {
      console.log("FAILURE: Client table does NOT exist.");
    }
  } catch (e) {
    console.error("Error connecting to database:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
