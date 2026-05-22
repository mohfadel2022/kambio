import { prisma } from "./src/lib/prisma";

async function main() {
  await prisma.currency.updateMany({
    where: { code: "EUR" },
    data: { isPrimary: true }
  });
  console.log("EUR set as primary currency.");
}

main();
