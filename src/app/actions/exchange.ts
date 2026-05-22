"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function performExchange(formData: {
  walletId: string;
  fromCurrencyId: string;
  toCurrencyId: string;
  amountFrom: number;
  amountTo: number;
  rate: number;
  date?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;
  const { walletId, fromCurrencyId, toCurrencyId, amountFrom, amountTo, rate, date } = formData;

  return await prisma.$transaction(async (tx) => {
    // 1. Validate source balance
    const sourceBalance = await tx.balance.findFirst({
      where: { walletId, currencyId: fromCurrencyId },
    });

    if (!sourceBalance || Number(sourceBalance.amount) < amountFrom) {
      throw new Error("Insufficient funds in the source currency.");
    }

    // 2. Adjust balances
    await tx.balance.update({
      where: { id: sourceBalance.id },
      data: { amount: { decrement: amountFrom } },
    });

    await tx.balance.upsert({
      where: {
        walletId_currencyId: { walletId, currencyId: toCurrencyId },
      },
      create: { walletId, currencyId: toCurrencyId, amount: amountTo },
      update: { amount: { increment: amountTo } },
    });

    // 3. Create Exchange Record
    const exchange = await tx.exchange.create({
      data: {
        walletId,
        currencyFromId: fromCurrencyId,
        amountFrom,
        currencyToId: toCurrencyId,
        amountTo,
        rate,
        userId: userId,
        date: date ? new Date(date) : new Date(),
      },
    });

    // 4. Record Transactions
    await tx.transaction.create({
      data: {
        amount: amountFrom,
        currencyId: fromCurrencyId,
        type: "EXCHANGE",
        walletId,
        userId: userId,
        exchangeId: exchange.id,
        createdAt: exchange.date,
      },
    });

    await tx.transaction.create({
      data: {
        amount: amountTo,
        currencyId: toCurrencyId,
        type: "EXCHANGE",
        walletId,
        userId: userId,
        exchangeId: exchange.id,
        createdAt: exchange.date,
      },
    });

    revalidatePath("/dashboard/wallets");
    revalidatePath("/dashboard/exchanges");
    return { success: true };
  });
}

export async function getExchange(id: string) {
  const exchange = await prisma.exchange.findUnique({
    where: { id },
  });

  if (!exchange) return null;

  // Fetch relations separately to bypass Prisma client caching/SSR issues
  const [wallet, currencyFrom, currencyTo, user] = await Promise.all([
    prisma.wallet.findUnique({ where: { id: exchange.walletId } }),
    prisma.currency.findUnique({ where: { id: exchange.currencyFromId } }),
    prisma.currency.findUnique({ where: { id: exchange.currencyToId } }),
    exchange.userId ? prisma.user.findUnique({ where: { id: exchange.userId } }) : Promise.resolve(null),
  ]);

  return JSON.parse(JSON.stringify({
    ...exchange,
    wallet,
    currencyFrom,
    currencyTo,
    user,
  }));
}

/**
 * Fetches all data needed for the exchange edit page.
 * Isolated to avoid Prisma hot-reload "Invalid invocation" errors.
 */
export async function getExchangeForEdit(id: string) {
  const [exchange, wallets, currencies] = await Promise.all([
    prisma.exchange.findUnique({ where: { id } }),
    prisma.wallet.findMany({ include: { balances: true } }),
    prisma.currency.findMany({ orderBy: { code: "asc" } }),
  ]);

  return {
    exchange: exchange ? JSON.parse(JSON.stringify(exchange)) : null,
    wallets: JSON.parse(JSON.stringify(wallets)),
    currencies: JSON.parse(JSON.stringify(currencies)),
  };
}

export async function updateExchange(id: string, formData: {
  walletId: string;
  fromCurrencyId: string;
  toCurrencyId: string;
  amountFrom: number;
  amountTo: number;
  rate: number;
  date?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;
  const { walletId, fromCurrencyId, toCurrencyId, amountFrom, amountTo, rate, date } = formData;

  return await prisma.$transaction(async (tx) => {
    // 1. Get the OLD exchange record
    const oldExchange = await tx.exchange.findUnique({
      where: { id },
    });

    if (!oldExchange) {
      throw new Error("Exchange not found");
    }

    // 2. REVERT old balances
    await tx.balance.update({
      where: {
        walletId_currencyId: { 
          walletId: oldExchange.walletId, 
          currencyId: oldExchange.currencyFromId 
        }
      },
      data: { amount: { increment: oldExchange.amountFrom } },
    });

    await tx.balance.update({
      where: {
        walletId_currencyId: { 
          walletId: oldExchange.walletId, 
          currencyId: oldExchange.currencyToId 
        }
      },
      data: { amount: { decrement: oldExchange.amountTo } },
    });

    // 3. APPLY new balances
    const sourceBalance = await tx.balance.findFirst({
      where: { walletId, currencyId: fromCurrencyId },
    });

    if (!sourceBalance || Number(sourceBalance.amount) < amountFrom) {
      throw new Error("Insufficient funds for the updated exchange.");
    }

    await tx.balance.update({
      where: { id: sourceBalance.id },
      data: { amount: { decrement: amountFrom } },
    });

    await tx.balance.upsert({
      where: {
        walletId_currencyId: { walletId, currencyId: toCurrencyId },
      },
      create: { walletId, currencyId: toCurrencyId, amount: amountTo },
      update: { amount: { increment: amountTo } },
    });

    // 4. Update Exchange Record
    const exchange = await tx.exchange.update({
      where: { id },
      data: {
        walletId,
        currencyFromId: fromCurrencyId,
        amountFrom,
        currencyToId: toCurrencyId,
        amountTo,
        rate,
        date: date ? new Date(date) : new Date(),
      },
    });

    // 5. Update Transactions
    await tx.transaction.deleteMany({
      where: { exchangeId: id },
    });

    await tx.transaction.create({
      data: {
        amount: amountFrom,
        currencyId: fromCurrencyId,
        type: "EXCHANGE",
        walletId,
        userId: userId,
        exchangeId: exchange.id,
        createdAt: exchange.date,
      },
    });

    await tx.transaction.create({
      data: {
        amount: amountTo,
        currencyId: toCurrencyId,
        type: "EXCHANGE",
        walletId,
        userId: userId,
        exchangeId: exchange.id,
        createdAt: exchange.date,
      },
    });

    revalidatePath("/dashboard/exchanges");
    return { success: true };
  });
}

export async function deleteExchange(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Get the exchange record
    const exchange = await tx.exchange.findUnique({
      where: { id },
    });

    if (!exchange) {
      throw new Error("Exchange not found");
    }

    // 2. Revert balances
    await tx.balance.update({
      where: {
        walletId_currencyId: { 
          walletId: exchange.walletId, 
          currencyId: exchange.currencyFromId 
        }
      },
      data: { amount: { increment: exchange.amountFrom } },
    });

    await tx.balance.update({
      where: {
        walletId_currencyId: { 
          walletId: exchange.walletId, 
          currencyId: exchange.currencyToId 
        }
      },
      data: { amount: { decrement: exchange.amountTo } },
    });

    // 3. Delete associated transactions and the exchange record
    await tx.transaction.deleteMany({
      where: { exchangeId: id },
    });

    await tx.exchange.delete({
      where: { id },
    });

    revalidatePath("/dashboard/exchanges");
    return { success: true };
  });
}

// ─── Getter Functions ─────────────────────────────────────────────────────────

export async function getExchangesPageData() {
  const exchanges = await prisma.exchange.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      wallet: true,
      currencyFrom: true,
      currencyTo: true,
    },
  });
  return JSON.parse(JSON.stringify(exchanges));
}

export async function getExchangeNewFormData() {
  const [wallets, currencies] = await Promise.all([
    prisma.wallet.findMany({
      include: { balances: true }
    }),
    prisma.currency.findMany({
      orderBy: { code: "asc" }
    })
  ]);
  return JSON.parse(JSON.stringify({ wallets, currencies }));
}
