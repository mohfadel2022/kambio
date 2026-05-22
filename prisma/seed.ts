import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("Loading seed data from seed-data.json...");
  const dataPath = path.join(__dirname, "seed-data.json");
  
  if (!fs.existsSync(dataPath)) {
    throw new Error(`Seed data file not found at ${dataPath}. Run 'npx tsx prisma/dump.ts' first.`);
  }

  const rawData = fs.readFileSync(dataPath, "utf-8");
  const data = JSON.parse(rawData);

  console.log("Cleaning up target database...");
  const safeDelete = async (name: string, deleteFn: () => Promise<any>) => {
    try {
      await deleteFn();
    } catch (e: any) {
      // Ignore errors if the table does not exist yet
      console.log(`- Note: Table for "${name}" was not cleaned up (might not exist yet): ${e.message || e}`);
    }
  };

  // Order of deletion to avoid foreign key violations
  await safeDelete("transaction", () => prisma.transaction.deleteMany({}));
  await safeDelete("exchange", () => prisma.exchange.deleteMany({}));
  await safeDelete("order", () => prisma.order.deleteMany({}));
  await safeDelete("balance", () => prisma.balance.deleteMany({}));
  await safeDelete("wallet", () => prisma.wallet.deleteMany({}));
  await safeDelete("currency", () => prisma.currency.deleteMany({}));
  await safeDelete("user", () => prisma.user.deleteMany({}));
  await safeDelete("permission", () => prisma.permission.deleteMany({}));
  await safeDelete("role", () => prisma.role.deleteMany({}));
  await safeDelete("branch", () => prisma.branch.deleteMany({}));
  await safeDelete("company", () => prisma.company.deleteMany({}));
  await safeDelete("client", () => prisma.client.deleteMany({}));

  console.log("Seeding data...");

  // 1. Seed Companies
  if (data.companies && data.companies.length > 0) {
    console.log(`- Seeding ${data.companies.length} companies...`);
    for (const company of data.companies) {
      await prisma.company.create({ data: company });
    }
  }

  // 2. Seed Branches
  if (data.branches && data.branches.length > 0) {
    console.log(`- Seeding ${data.branches.length} branches...`);
    for (const branch of data.branches) {
      await prisma.branch.create({ data: branch });
    }
  }

  // 3. Seed Roles & Permissions
  if (data.roles && data.roles.length > 0) {
    console.log(`- Seeding ${data.roles.length} roles and their permissions...`);
    for (const role of data.roles) {
      const { permissions, ...roleData } = role;
      await prisma.role.create({ data: roleData });
      
      if (permissions && permissions.length > 0) {
        for (const permission of permissions) {
          await prisma.permission.create({ data: permission });
        }
      }
    }
  }

  // 4. Seed Users
  if (data.users && data.users.length > 0) {
    console.log(`- Seeding ${data.users.length} users...`);
    for (const user of data.users) {
      await prisma.user.create({ data: user });
    }
  }

  // 5. Seed Currencies
  if (data.currencies && data.currencies.length > 0) {
    console.log(`- Seeding ${data.currencies.length} currencies...`);
    for (const currency of data.currencies) {
      await prisma.currency.create({ data: currency });
    }
  }

  // 6. Seed Wallets
  if (data.wallets && data.wallets.length > 0) {
    console.log(`- Seeding ${data.wallets.length} wallets...`);
    for (const wallet of data.wallets) {
      await prisma.wallet.create({ data: wallet });
    }
  }

  // 7. Seed Balances
  if (data.balances && data.balances.length > 0) {
    console.log(`- Seeding ${data.balances.length} balances...`);
    for (const balance of data.balances) {
      await prisma.balance.create({ data: balance });
    }
  }

  // 8. Seed Clients
  if (data.clients && data.clients.length > 0) {
    console.log(`- Seeding ${data.clients.length} clients...`);
    for (const client of data.clients) {
      await prisma.client.create({ data: client });
    }
  }

  // 9. Seed Orders
  if (data.orders && data.orders.length > 0) {
    console.log(`- Seeding ${data.orders.length} orders...`);
    for (const order of data.orders) {
      await prisma.order.create({ data: order });
    }
  }

  // 10. Seed Exchanges
  if (data.exchanges && data.exchanges.length > 0) {
    console.log(`- Seeding ${data.exchanges.length} exchanges...`);
    for (const exchange of data.exchanges) {
      await prisma.exchange.create({ data: exchange });
    }
  }

  // 11. Seed Transactions
  if (data.transactions && data.transactions.length > 0) {
    console.log(`- Seeding ${data.transactions.length} transactions...`);
    for (const transaction of data.transactions) {
      await prisma.transaction.create({ data: transaction });
    }
  }

  console.log("Seeding process completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Database seeded successfully.");
  })
  .catch(async (e) => {
    console.error("Error during database seeding:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
