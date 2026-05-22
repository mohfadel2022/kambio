"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const UserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  roleId: z.string().min(1, "Role is required"),
  phone: z.string().optional(),
});

export type UserState = {
  errors?: {
    name?: string[];
    email?: string[];
    roleId?: string[];
    phone?: string[];
  };
  message?: string | null;
};

export async function createUser(
  prevState: UserState,
  formData: FormData
): Promise<UserState> {
  const validatedFields = UserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    roleId: formData.get("roleId"),
    phone: formData.get("phone"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please fix the errors below.",
    };
  }

  try {
    await prisma.user.create({
      data: {
        name: validatedFields.data.name,
        email: validatedFields.data.email,
        roleId: validatedFields.data.roleId,
        phone: validatedFields.data.phone || null,
      },
    });
  } catch (error) {
    return { message: "Failed to create user. Email might be in use." };
  }

  revalidatePath("/dashboard/users");
  redirect("/dashboard/users");
}

export async function updateUser(
  id: string,
  prevState: UserState,
  formData: FormData
): Promise<UserState> {
  const validatedFields = UserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    roleId: formData.get("roleId"),
    phone: formData.get("phone"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please fix the errors below.",
    };
  }

  try {
    await prisma.user.update({
      where: { id },
      data: {
        name: validatedFields.data.name,
        email: validatedFields.data.email,
        roleId: validatedFields.data.roleId,
        phone: validatedFields.data.phone || null,
      },
    });
  } catch (error) {
    return { message: "Failed to update user." };
  }

  revalidatePath("/dashboard/users");
  redirect("/dashboard/users");
}

// ─── Getter Functions ─────────────────────────────────────────────────────────

export async function getUsersPageData() {
  const [users, roles] = await Promise.all([
    prisma.user.findMany({ include: { role: true }, orderBy: { name: "asc" } }),
    prisma.role.findMany({ orderBy: { name: "asc" } }),
  ]);
  return JSON.parse(JSON.stringify({ users, roles }));
}

export async function getUserForEdit(id: string) {
  const [user, roles] = await Promise.all([
    prisma.user.findUnique({ where: { id }, include: { role: true } }),
    prisma.role.findMany({ orderBy: { name: "asc" } }),
  ]);
  return JSON.parse(JSON.stringify({ user, roles }));
}

export async function getUserFormData() {
  const roles = await prisma.role.findMany({ orderBy: { name: "asc" } });
  return JSON.parse(JSON.stringify({ roles }));
}
