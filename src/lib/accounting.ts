import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

/**
 * Atomically updates a wallet's balance. Use inside a prisma.$transaction.
 */
export async function adjustBalance(
  tx: Omit<typeof prisma, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
  walletId: string,
  currencyId: string,
  delta: number // positive = add, negative = subtract
) {
  const balance = await tx.balance.findUnique({
    where: { walletId_currencyId: { walletId, currencyId } },
  });

  if (!balance) {
    // Create the balance if it doesn't exist
    await tx.balance.create({
      data: { walletId, currencyId, amount: delta },
    });
  } else {
    const newAmount = Number(balance.amount) + delta;
    await tx.balance.update({
      where: { walletId_currencyId: { walletId, currencyId } },
      data: { amount: newAmount },
    });
  }
}

/**
 * Records a transaction entry and adjusts the wallet balance.
 */
export async function recordTransaction(
  tx: Omit<typeof prisma, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
  {
    walletId,
    currencyId,
    amount,
    type,
    orderId,
  }: {
    walletId: string;
    currencyId: string;
    amount: number;
    type: "INCOME" | "OUTCOME" | "TRANSFER";
    orderId?: string;
  }
) {
  await tx.transaction.create({
    data: { walletId, currencyId, amount, type, orderId },
  });

  const delta = type === "OUTCOME" ? -amount : amount;
  await adjustBalance(tx, walletId, currencyId, delta);
}
