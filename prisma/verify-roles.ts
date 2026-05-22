import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Checking for Role table...");
  try {
    const roles = await prisma.role.findMany({
      include: {
        _count: {
          select: { users: true }
        }
      }
    });
    console.log("Success! Role table exists.");
    console.log("Current roles in DB:", JSON.stringify(roles, null, 2));
  } catch (error) {
    console.error("Error accessing Role table:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
