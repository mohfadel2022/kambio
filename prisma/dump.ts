import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("Reading data from local database with schema-drift protection...");

  const dumpData: any = {};

  const queryTable = async (name: string, queryFn: () => Promise<any>) => {
    try {
      const data = await queryFn();
      dumpData[name] = data;
      console.log(`✓ Read ${name}: ${data.length} records`);
    } catch (error: any) {
      console.warn(`⚠ Could not read table "${name}":`, error.message || error);
      dumpData[name] = [];
    }
  };

  await queryTable("companies", () => prisma.company.findMany());
  await queryTable("branches", () => prisma.branch.findMany());
  await queryTable("roles", () => prisma.role.findMany({ include: { permissions: true } }));
  await queryTable("users", () => prisma.user.findMany());
  await queryTable("currencies", () => prisma.currency.findMany());
  await queryTable("wallets", () => prisma.wallet.findMany());
  await queryTable("balances", () => prisma.balance.findMany());
  await queryTable("clients", () => prisma.client.findMany());
  await queryTable("orders", () => prisma.order.findMany());
  await queryTable("exchanges", () => prisma.exchange.findMany());
  await queryTable("transactions", () => prisma.transaction.findMany());

  const outputPath = path.join(__dirname, "seed-data.json");
  fs.writeFileSync(outputPath, JSON.stringify(dumpData, null, 2), "utf-8");

  console.log(`\nSuccess! Local database data successfully dumped to: ${outputPath}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Error dumping database:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
