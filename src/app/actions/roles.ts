"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const RoleSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
});

export type RoleState = {
  errors?: {
    name?: string[];
    description?: string[];
  };
  message?: string | null;
};

export async function getRolesPageData() {
  const roles = await prisma.role.findMany({
    include: {
      _count: {
        select: { users: true },
      },
    },
    orderBy: { name: "asc" },
  });
  return JSON.parse(JSON.stringify(roles));
}

export async function getRoleForEdit(id: string) {
  const role = await prisma.role.findUnique({
    where: { id },
    include: {
      permissions: true,
      users: true,
    },
  });
  return JSON.parse(JSON.stringify(role));
}

export async function getRoleDetailsPageData(id: string) {
  const [role, allRoles] = await Promise.all([
    prisma.role.findUnique({
      where: { id },
      include: {
        permissions: true,
      },
    }),
    prisma.role.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);
  return JSON.parse(JSON.stringify({ role, allRoles }));
}

export async function deleteRole(id: string) {
  await prisma.role.delete({
    where: { id },
  });
  revalidatePath("/dashboard/roles");
}

export async function createRole(prevState: RoleState, formData: FormData): Promise<RoleState> {
  const validatedFields = RoleSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please fix the errors below.",
    };
  }

  let newRole;
  try {
    newRole = await prisma.role.create({
      data: {
        name: validatedFields.data.name,
        description: validatedFields.data.description || null,
      },
    });
  } catch (error) {
    return { message: "Failed to create role." };
  }

  revalidatePath("/dashboard/roles");
  redirect(`/dashboard/roles/${newRole.id}`);
}

export async function updatePermissions(roleId: string, permissions: { module: string; action: string }[]) {
  // 1. Delete old permissions
  await prisma.permission.deleteMany({
    where: { roleId },
  });

  // 2. Create new permissions
  await prisma.permission.createMany({
    data: permissions.map((p) => ({
      roleId,
      module: p.module,
      action: p.action,
    })),
  });

  revalidatePath(`/dashboard/roles/${roleId}`);
}
