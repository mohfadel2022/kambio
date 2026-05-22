"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const ClientSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  documentId: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
});

export type ClientState = {
  errors?: {
    firstName?: string[];
    lastName?: string[];
    documentId?: string[];
    phone?: string[];
    email?: string[];
  };
  message?: string | null;
};

export async function createClient(prevState: ClientState, formData: FormData): Promise<ClientState> {
  const validatedFields = ClientSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    documentId: formData.get("documentId"),
    phone: formData.get("phone"),
    email: formData.get("email"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please fix the errors below.",
    };
  }

  try {
    await prisma.client.create({
      data: {
        firstName: validatedFields.data.firstName,
        lastName: validatedFields.data.lastName,
        documentId: validatedFields.data.documentId || null,
        phone: validatedFields.data.phone || null,
        email: validatedFields.data.email || null,
      },
    });
  } catch (error) {
    return { message: "Failed to create client." };
  }

  revalidatePath("/dashboard/clients");
  redirect("/dashboard/clients");
}

export async function updateClient(
  id: string,
  prevState: ClientState,
  formData: FormData
): Promise<ClientState> {
  const validatedFields = ClientSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    documentId: formData.get("documentId"),
    phone: formData.get("phone"),
    email: formData.get("email"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please fix the errors below.",
    };
  }

  try {
    await prisma.client.update({
      where: { id },
      data: {
        firstName: validatedFields.data.firstName,
        lastName: validatedFields.data.lastName,
        documentId: validatedFields.data.documentId || null,
        phone: validatedFields.data.phone || null,
        email: validatedFields.data.email || null,
      },
    });
  } catch (error) {
    return { message: "Failed to update client." };
  }

  revalidatePath("/dashboard/clients");
  redirect("/dashboard/clients");
}

export async function deleteClient(id: string) {
  try {
    await prisma.client.delete({
      where: { id },
    });
    revalidatePath("/dashboard/clients");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Failed to delete client" };
  }
}

// ─── Getter Functions ─────────────────────────────────────────────────────────

export async function getClientsPageData() {
  const clients = await prisma.client.findMany({ orderBy: { createdAt: "desc" } });
  return JSON.parse(JSON.stringify(clients));
}

export async function getClientForEdit(id: string) {
  const client = await prisma.client.findUnique({ where: { id } });
  return JSON.parse(JSON.stringify(client));
}

export async function getClientDetailsPageData(id: string) {
  const client = await prisma.client.findUnique({
    where: { id },
  });
  return JSON.parse(JSON.stringify(client));
}
