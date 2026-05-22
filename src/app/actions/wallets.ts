"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const WalletSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  branchId: z.string().optional().nullable(),
});

export type WalletState = {
  errors?: {
    name?: string[];
    branchId?: string[];
  };
  message?: string | null;
};

export async function createWallet(prevState: WalletState, formData: FormData): Promise<WalletState> {
  const validatedFields = WalletSchema.safeParse({
    name: formData.get("name"),
    branchId: formData.get("branchId"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please fix the errors below.",
    };
  }

  try {
    const currencies = await prisma.currency.findMany();

    await prisma.wallet.create({
      data: {
        name: validatedFields.data.name,
        branchId: validatedFields.data.branchId || null,
        balances: {
          create: currencies.map(c => ({
            currencyId: c.id,
            amount: 0
          }))
        }
      },
    });
  } catch (error) {
    console.error("Create wallet error:", error);
    return { message: "Failed to create wallet." };
  }

  revalidatePath("/dashboard/wallets");
  redirect("/dashboard/wallets");
}

export async function updateWallet(
  id: string,
  prevState: WalletState,
  formData: FormData
): Promise<WalletState> {
  const validatedFields = WalletSchema.safeParse({
    name: formData.get("name"),
    branchId: formData.get("branchId"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please fix the errors below.",
    };
  }

  try {
    await prisma.wallet.update({
      where: { id },
      data: {
        name: validatedFields.data.name,
        branchId: validatedFields.data.branchId || null,
      },
    });
  } catch (error) {
    console.error("Update wallet error:", error);
    return { message: "Failed to update wallet." };
  }

  revalidatePath("/dashboard/wallets");
  redirect("/dashboard/wallets");
}

export async function addWalletBalance(walletId: string, currencyId: string, amount: number = 0) {
  try {
    await prisma.balance.create({
      data: {
        walletId,
        currencyId,
        amount,
      },
    });
    revalidatePath(`/dashboard/wallets/${walletId}/edit`);
    return { success: true };
  } catch (error) {
    return { success: false, message: "Failed to add currency to wallet." };
  }
}

export async function updateWalletBalance(walletId: string, balanceId: string, amount: number) {
  try {
    await prisma.balance.update({
      where: { id: balanceId },
      data: { amount },
    });
    revalidatePath(`/dashboard/wallets/${walletId}/edit`);
    return { success: true };
  } catch (error) {
    return { success: false, message: "Failed to update balance." };
  }
}

export async function deleteWalletBalance(walletId: string, balanceId: string) {
  try {
    // Optional: check if balance is 0 before deleting?
    // For now, allow deletion but maybe warn in UI.
    await prisma.balance.delete({
      where: { id: balanceId },
    });
    revalidatePath(`/dashboard/wallets/${walletId}/edit`);
    return { success: true };
  } catch (error) {
    return { success: false, message: "Failed to remove currency from wallet." };
  }
}

// ─── Getter Functions (use in pages to avoid Prisma hot-reload issues) ───────

export async function getWalletsPageData() {
  const wallets = await prisma.wallet.findMany({
    include: { balances: { include: { currency: true } }, branch: true },
    orderBy: { name: "asc" },
  });
  return JSON.parse(JSON.stringify(wallets));
}

export async function getWalletForEdit(id: string) {
  const [wallet, currencies, branches] = await Promise.all([
    prisma.wallet.findUnique({
      where: { id },
      include: { balances: { include: { currency: true } } },
    }),
    prisma.currency.findMany({ orderBy: { code: "asc" } }),
    prisma.branch.findMany({ orderBy: { name: "asc" } }),
  ]);
  return JSON.parse(JSON.stringify({ wallet, currencies, branches }));
}

export async function getWalletNewFormData() {
  const [currencies, branches] = await Promise.all([
    prisma.currency.findMany({ orderBy: { code: "asc" } }),
    prisma.branch.findMany({ orderBy: { name: "asc" } }),
  ]);
  return JSON.parse(JSON.stringify({ currencies, branches }));
}

/**
 * Returns only the wallets that hold the given currency (have a Balance row for it).
 * Used to populate the wallet picker when marking an order as PAID.
 */
export async function getWalletsForCurrency(currencyId: string) {
  const balances = await prisma.balance.findMany({
    where: { currencyId },
    include: {
      wallet: { include: { branch: true } },
      currency: true,
    },
    orderBy: { wallet: { name: "asc" } },
  });
  return JSON.parse(JSON.stringify(balances));
}
