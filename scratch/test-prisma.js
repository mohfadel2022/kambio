const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Models in prisma:", Object.keys(prisma).filter(k => !k.startsWith("_") && !k.startsWith("$")));
  try {
    const count = await prisma.exchange.count();
    console.log("Exchange count:", count);
  } catch (e) {
    console.error("Error accessing exchange:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
