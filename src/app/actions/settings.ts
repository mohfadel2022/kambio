"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateCompanySettings(data: any) {
  try {
    if (!(prisma as any).company) throw new Error("Prisma client not updated yet");

    const company = await (prisma as any).company.upsert({
      where: { id: "1" },
      update: {
        name: data.name,
        address: data.address,
        phone: data.phone,
        email: data.email,
        website: data.website,
        logo: data.logo,
      },
      create: {
        id: "1",
        name: data.name,
        address: data.address,
        phone: data.phone,
        email: data.email,
        website: data.website,
        logo: data.logo,
      },
    });

    revalidatePath("/[locale]/dashboard/settings", "page");
    return { success: true, company };
  } catch (error) {
    console.error("Error updating company:", error);
    return { success: false, error: "Failed to update settings" };
  }
}

export async function createBranch(data: { name: string; address?: string; phone?: string; manager?: string }) {
  try {
    if (!(prisma as any).branch) throw new Error("Prisma client not updated yet");

    const branch = await (prisma as any).branch.create({
      data: {
        name: data.name,
        address: data.address,
        phone: data.phone,
        manager: data.manager,
      },
    });

    revalidatePath("/[locale]/dashboard/settings", "page");
    return { success: true, branch };
  } catch (error) {
    console.error("Error creating branch:", error);
    return { success: false, error: "Failed to create branch" };
  }
}

export async function deleteBranch(id: string) {
  try {
    if (!(prisma as any).branch) throw new Error("Prisma client not updated yet");

    await (prisma as any).branch.delete({
      where: { id },
    });

    revalidatePath("/[locale]/dashboard/settings", "page");
    return { success: true };
  } catch (error) {
    console.error("Error deleting branch:", error);
    return { success: false, error: "Failed to delete branch" };
  }
}

export async function getSettingsPageData() {
  const company = (prisma as any).company
    ? await (prisma as any).company.findUnique({ where: { id: "1" } })
    : null;

  const branches = (prisma as any).branch
    ? await (prisma as any).branch.findMany({ orderBy: { createdAt: "desc" } })
    : [];

  return JSON.parse(JSON.stringify({ company, branches }));
}
