"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const CurrencySchema = z.object({
  code: z.string().min(2, "Code must be at least 2 characters").max(5),
  name: z.string().min(2, "Name must be at least 2 characters"),
  symbol: z.string().min(1, "Symbol is required"),
  isPrimary: z.boolean().default(false),
  rateUnder500: z.coerce.number().min(0),
  rate500To1000: z.coerce.number().min(0),
  rateOver1000: z.coerce.number().min(0),
  buyRate: z.coerce.number().min(0),
  sellRate: z.coerce.number().min(0),
});

export type CurrencyState = {
  errors?: {
    code?: string[];
    name?: string[];
    symbol?: string[];
    isPrimary?: string[];
    rateUnder500?: string[];
    rate500To1000?: string[];
    rateOver1000?: string[];
    buyRate?: string[];
    sellRate?: string[];
  };
  message?: string | null;
};

export async function createCurrency(prevState: CurrencyState, formData: FormData): Promise<CurrencyState> {
  const validatedFields = CurrencySchema.safeParse({
    code: formData.get("code"),
    name: formData.get("name"),
    symbol: formData.get("symbol"),
    isPrimary: formData.get("isPrimary") === "on",
    rateUnder500: formData.get("rateUnder500"),
    rate500To1000: formData.get("rate500To1000"),
    rateOver1000: formData.get("rateOver1000"),
    buyRate: formData.get("buyRate"),
    sellRate: formData.get("sellRate"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please fix the errors below.",
    };
  }

  try {
    // If setting as primary, unset others
    if (validatedFields.data.isPrimary) {
      await prisma.currency.updateMany({
        where: { isPrimary: true },
        data: { isPrimary: false },
      });
    }

    await prisma.currency.create({
      data: validatedFields.data,
    });
  } catch (error) {
    return { message: "Failed to create currency. Code might already exist." };
  }

  revalidatePath("/dashboard/currencies");
  redirect("/dashboard/currencies");
}

export async function updateCurrency(
  id: string,
  prevState: CurrencyState,
  formData: FormData
): Promise<CurrencyState> {
  const validatedFields = CurrencySchema.safeParse({
    code: formData.get("code"),
    name: formData.get("name"),
    symbol: formData.get("symbol"),
    isPrimary: formData.get("isPrimary") === "on",
    rateUnder500: formData.get("rateUnder500"),
    rate500To1000: formData.get("rate500To1000"),
    rateOver1000: formData.get("rateOver1000"),
    buyRate: formData.get("buyRate"),
    sellRate: formData.get("sellRate"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please fix the errors below.",
    };
  }

  try {
    if (validatedFields.data.isPrimary) {
      await prisma.currency.updateMany({
        where: { isPrimary: true, NOT: { id } },
        data: { isPrimary: false },
      });
    }

    await prisma.currency.update({
      where: { id },
      data: validatedFields.data,
    });
  } catch (error) {
    return { message: "Failed to update currency." };
  }

  revalidatePath("/dashboard/currencies");
  redirect("/dashboard/currencies");
}

export async function deleteCurrency(id: string) {
  try {
    await prisma.currency.delete({
      where: { id },
    });
    revalidatePath("/dashboard/currencies");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Failed to delete currency." };
  }
}

// ─── Getter Functions ─────────────────────────────────────────────────────────

export async function getCurrenciesPageData() {
  const currencies = await prisma.currency.findMany({
    orderBy: [{ isPrimary: "desc" }, { code: "asc" }],
  });
  return JSON.parse(JSON.stringify(currencies));
}

export async function getCurrencyForEdit(id: string) {
  const currency = await prisma.currency.findUnique({ where: { id } });
  return JSON.parse(JSON.stringify(currency));
}
