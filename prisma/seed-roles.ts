import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding roles and permissions...");

  const modules = ["orders", "clients", "wallets", "users", "currencies", "roles"];
  const actions = ["view", "create", "edit", "delete"];

  // 1. Create Roles
  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: {
      name: "admin",
      description: "Full system access",
    },
  });

  const agentRole = await prisma.role.upsert({
    where: { name: "agent" },
    update: {},
    create: {
      name: "agent",
      description: "Can manage orders and clients",
    },
  });

  const cashRole = await prisma.role.upsert({
    where: { name: "cash" },
    update: {},
    create: {
      name: "cash",
      description: "Basic cashier operations",
    },
  });

  // 2. Assign Permissions to Admin (Everything)
  for (const module of modules) {
    for (const action of ["all"]) {
      await prisma.permission.upsert({
        where: {
          roleId_module_action: {
            roleId: adminRole.id,
            module,
            action,
          },
        },
        update: {},
        create: {
          roleId: adminRole.id,
          module,
          action,
        },
      });
    }
  }

  // 3. Assign Permissions to Agent
  const agentPermissions = [
    { module: "orders", action: "all" },
    { module: "clients", action: "all" },
    { module: "wallets", action: "view" },
    { module: "currencies", action: "view" },
  ];
  for (const p of agentPermissions) {
    await prisma.permission.upsert({
      where: {
        roleId_module_action: {
          roleId: agentRole.id,
          module: p.module,
          action: p.action,
        },
      },
      update: {},
      create: {
        roleId: agentRole.id,
        module: p.module,
        action: p.action,
      },
    });
  }

  // 4. Assign Permissions to Cash
  const cashPermissions = [
    { module: "orders", action: "view" },
    { module: "orders", action: "create" },
    { module: "clients", action: "view" },
    { module: "wallets", action: "view" },
  ];
  for (const p of cashPermissions) {
    await prisma.permission.upsert({
      where: {
        roleId_module_action: {
          roleId: cashRole.id,
          module: p.module,
          action: p.action,
        },
      },
      update: {},
      create: {
        roleId: cashRole.id,
        module: p.module,
        action: p.action,
      },
    });
  }

  // 5. Link Admin user if exists
  const adminUser = await prisma.user.findUnique({
    where: { email: "admin@kambio.com" },
  });
  if (adminUser) {
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { roleId: adminRole.id },
    });
    console.log("Linked admin@kambio.com to admin role.");
  }

  console.log("Seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
