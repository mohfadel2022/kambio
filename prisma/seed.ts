import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning up database...");
  // Order of deletion matters due to foreign keys
  await prisma.transaction.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.balance.deleteMany({});
  await prisma.wallet.deleteMany({});
  await prisma.currency.deleteMany({});
  // We keep users for now unless asked to wipe them too
  
  console.log("Creating new currencies...");
  // 1. Create Currencies
  const eur = await prisma.currency.create({
    data: {
      code: "EUR",
      symbol: "€",
      name: "Euro",
      isPrimary: true,
    },
  });

  const dzd = await prisma.currency.create({
    data: {
      code: "DZD",
      symbol: "د.ج",
      name: "Algerian Dinar",
      rateUnder500: 240.0,
      rate500To1000: 242.0,
      rateOver1000: 244.0,
    },
  });

  const mru = await prisma.currency.create({
    data: {
      code: "MRU",
      symbol: "UM",
      name: "Mauritanian Ouguiya",
      rateUnder500: 42.0,
      rate500To1000: 42.5,
      rateOver1000: 43.0,
    },
  });

  console.log("Currencies created");

  // 2. Create Main Caja
  const mainCaja = await prisma.wallet.create({
    data: {
      name: "Principal (Main Cash)",
      branch: {
        create: {
          name: "Main Office"
        }
      },
    },
  });

  console.log("Main Caja created");

  // 3. Initialize Balances for Main Caja
  await prisma.balance.createMany({
    data: [
      { walletId: mainCaja.id, currencyId: eur.id, amount: 0 },
      { walletId: mainCaja.id, currencyId: dzd.id, amount: 0 },
      { walletId: mainCaja.id, currencyId: mru.id, amount: 0 },
    ],
  });

  console.log("Initial balances created for Main Caja");

  // 4. Create Admin Role
  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: {
      name: "admin",
      description: "System Administrator",
    },
  });

  // 5. Create Admin User
  await prisma.user.upsert({
    where: { email: "admin@kambio.com" },
    update: {
      roleId: adminRole.id,
    },
    create: {
      email: "admin@kambio.com",
      name: "Kambio Admin",
      roleId: adminRole.id,
    },
  });

  console.log("Admin user created: admin@kambio.com / kambio123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seeding complete successfully.");
  })
  .catch(async (e) => {
    console.error("Error during seeding:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
