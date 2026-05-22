"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const OrderSchema = z.object({
  senderName: z.string().min(2),
  recipientName: z.string().min(2),
  amountFrom: z.coerce.number().positive(),
  currencyFromId: z.string().min(1),
  amountTo: z.coerce.number().positive(),
  currencyToId: z.string().min(1),
  rate: z.coerce.number().positive(),
  notes: z.string().optional(),
});

const UpdateOrderSchema = OrderSchema.extend({
  status: z.enum(["PENDING", "VERIFIED", "PAID", "CANCELLED"]),
});

async function generateOrderNumber(): Promise<string> {
  const count = await prisma.order.count();
  const num = String(count + 1).padStart(6, "0");
  return `KB-${num}`;
}

export type CreateOrderState = {
  errors?: Record<string, string[]>;
  message?: string;
};

export async function createOrder(
  prevState: CreateOrderState,
  formData: FormData
): Promise<CreateOrderState> {
  const raw = {
    senderName: formData.get("senderName"),
    recipientName: formData.get("recipientName"),
    amountFrom: formData.get("amountFrom"),
    currencyFromId: formData.get("currencyFromId"),
    amountTo: formData.get("amountTo"),
    currencyToId: formData.get("currencyToId"),
    rate: formData.get("rate"),
    notes: formData.get("notes"),
  };

  const parsed = OrderSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const data = parsed.data;

  if (data.currencyFromId === data.currencyToId) {
    return { message: "Source and destination currencies must be different." };
  }

  let newOrderId: string;
  try {
    const number = await generateOrderNumber();
    const order = await prisma.order.create({
      data: {
        number,
        senderName: data.senderName,
        recipientName: data.recipientName,
        amountFrom: data.amountFrom,
        currencyFromId: data.currencyFromId,
        amountTo: data.amountTo,
        currencyToId: data.currencyToId,
        rate: data.rate,
        notes: data.notes ?? null,
        status: "PENDING",
      },
    });
    newOrderId = order.id;
  } catch (e) {
    console.error(e);
    return { message: "Failed to create order. Please try again." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/orders");
  redirect(`/dashboard/orders/${newOrderId}`);
}

export type UpdateOrderState = {
  errors?: Record<string, string[]>;
  message?: string;
};

export async function updateOrder(
  id: string,
  prevState: UpdateOrderState,
  formData: FormData
): Promise<UpdateOrderState> {
  const raw = {
    senderName: formData.get("senderName"),
    recipientName: formData.get("recipientName"),
    amountFrom: formData.get("amountFrom"),
    currencyFromId: formData.get("currencyFromId"),
    amountTo: formData.get("amountTo"),
    currencyToId: formData.get("currencyToId"),
    rate: formData.get("rate"),
    status: formData.get("status"),
    notes: formData.get("notes"),
  };

  const parsed = UpdateOrderSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const data = parsed.data;

  if (data.currencyFromId === data.currencyToId) {
    return { message: "Source and destination currencies must be different." };
  }

  try {
    await prisma.order.update({
      where: { id },
      data: {
        senderName: data.senderName,
        recipientName: data.recipientName,
        amountFrom: data.amountFrom,
        currencyFromId: data.currencyFromId,
        amountTo: data.amountTo,
        currencyToId: data.currencyToId,
        rate: data.rate,
        status: data.status,
        notes: data.notes ?? null,
      },
    });
  } catch (e) {
    console.error(e);
    return { message: "Failed to update order. Please try again." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/orders");
  revalidatePath(`/dashboard/orders/${id}`);
  redirect(`/dashboard/orders/${id}`);
}

export async function deleteOrder(id: string): Promise<{ success: boolean; message?: string }> {
  try {
    await prisma.order.delete({
      where: { id },
    });
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/orders");
    return { success: true };
  } catch (e) {
    console.error("Failed to delete order:", e);
    return { success: false, message: "Failed to delete order." };
  }
}

/** Non-financial status transitions: PENDING ↔ VERIFIED, reactivate from CANCELLED */
export async function updateOrderStatus(id: string, status: "PENDING" | "VERIFIED") {
  await prisma.order.update({
    where: { id },
    data: { status },
  });
  revalidatePath("/dashboard/orders");
  revalidatePath(`/dashboard/orders/${id}`);
}

/**
 * Marks an order as PAID and deducts amountTo from the selected wallet balance.
 * Wrapped in a Prisma transaction for full atomicity.
 */
export async function markOrderAsPaid(
  orderId: string,
  walletId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    await prisma.$transaction(async (tx) => {
      // 1. Fetch the order
      const order = await tx.order.findUnique({
        where: { id: orderId },
      });

      if (!order) throw new Error("Order not found");
      if (order.status === "PAID") throw new Error("Order is already paid");
      if (order.status === "CANCELLED") throw new Error("Cannot pay a cancelled order");

      // 2. Find the balance for currencyTo in the selected wallet
      const balance = await tx.balance.findUnique({
        where: {
          walletId_currencyId: {
            walletId,
            currencyId: order.currencyToId,
          },
        },
      });

      if (!balance) {
        throw new Error("INSUFFICIENT_FUNDS: Wallet does not hold this currency");
      }

      if (Number(balance.amount) < Number(order.amountTo)) {
        throw new Error(
          `INSUFFICIENT_FUNDS: Available ${Number(balance.amount).toFixed(2)}, required ${Number(order.amountTo).toFixed(2)}`
        );
      }

      // 3. Deduct from wallet balance
      await tx.balance.update({
        where: {
          walletId_currencyId: { walletId, currencyId: order.currencyToId },
        },
        data: { amount: { decrement: order.amountTo } },
      });

      // 4. Mark order as PAID and record wallet + timestamp
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: "PAID",
          walletId,
          paidAt: new Date(),
        },
      });
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/orders");
    revalidatePath(`/dashboard/orders/${orderId}`);
    revalidatePath("/dashboard/wallets");
    return { success: true };
  } catch (e: any) {
    console.error("markOrderAsPaid error:", e);
    const msg = e?.message?.startsWith("INSUFFICIENT_FUNDS")
      ? e.message.replace("INSUFFICIENT_FUNDS: ", "")
      : "Failed to process payment.";
    return { success: false, message: msg };
  }
}

/**
 * Cancels an order. If the order was PAID, reverts the balance to the wallet.
 */
export async function cancelOrder(
  orderId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order) throw new Error("Order not found");

      // If it was PAID, revert the balance
      if (order.status === "PAID" && order.walletId) {
        await tx.balance.update({
          where: {
            walletId_currencyId: {
              walletId: order.walletId,
              currencyId: order.currencyToId,
            },
          },
          data: { amount: { increment: order.amountTo } },
        });
      }

      await tx.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED", walletId: null, paidAt: null },
      });
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/orders");
    revalidatePath(`/dashboard/orders/${orderId}`);
    revalidatePath("/dashboard/wallets");
    return { success: true };
  } catch (e: any) {
    console.error("cancelOrder error:", e);
    return { success: false, message: "Failed to cancel order." };
  }
}


/**
 * Fetches all data needed for the order edit page.
 * Isolated in a server action to avoid Prisma hot-reload "Invalid invocation" errors.
 */
export async function getOrderForEdit(id: string) {
  const [order, currencies, clients] = await Promise.all([
    prisma.order.findUnique({ where: { id } }),
    prisma.currency.findMany({ orderBy: { code: "asc" } }),
    prisma.client.findMany({ orderBy: { firstName: "asc" } }),
  ]);
  return { order, currencies, clients };
}

// ─── Getter Functions ─────────────────────────────────────────────────────────

export async function getOrdersPageData() {
  const [orders, clients] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { currencyFrom: true, currencyTo: true },
    }),
    prisma.client.findMany(),
  ]);
  const ordersWithPhones = orders.map((order) => {
    const client = clients.find(
      (c) => `${c.firstName} ${c.lastName}`.trim().toLowerCase() === order.senderName.trim().toLowerCase()
    );
    return { ...order, senderPhone: client?.phone || null };
  });
  return JSON.parse(JSON.stringify(ordersWithPhones));
}

export async function getOrderDetailsPageData(id: string) {
  const cleanId = String(id).trim();
  const rawOrder = await prisma.order.findUnique({
    where: { id: cleanId },
    include: {
      currencyFrom: true,
      currencyTo: true,
      sender: true,
      wallet: true, // The wallet that processed the payment
    },
  });

  if (!rawOrder) return null;

  let clientEmail: string | null = rawOrder.sender?.email || null;
  let clientPhone: string | null = null;

  if (rawOrder.senderName) {
    const candidates = await prisma.client.findMany({
      select: { firstName: true, lastName: true, email: true, phone: true }
    });

    const searchName = rawOrder.senderName.toLowerCase().trim();
    const found = candidates.find(c => {
      const fullName = `${c.firstName} ${c.lastName}`.toLowerCase().trim();
      const fName = c.firstName.toLowerCase().trim();
      return fullName.includes(searchName) || searchName.includes(fullName) || searchName.includes(fName);
    });

    if (found) {
      if (!clientEmail) clientEmail = found.email ?? null;
      clientPhone = found.phone ?? null;
    }
  }

  const order = {
    ...rawOrder,
    sender: rawOrder.sender ? {
      ...rawOrder.sender,
      email: clientEmail,
      phone: clientPhone,
    } : {
      email: clientEmail,
      phone: clientPhone,
    }
  };

  return JSON.parse(JSON.stringify(order));
}

export async function getOrderNewFormData() {
  const [currencies, clients, wallets] = await Promise.all([
    prisma.currency.findMany({ orderBy: { code: "asc" } }),
    prisma.client.findMany({ orderBy: { firstName: "asc" } }),
    prisma.wallet.findMany({ include: { balances: { include: { currency: true } } } }),
  ]);
  return JSON.parse(JSON.stringify({ currencies, clients, wallets }));
}

export async function getDashboardPageData() {
  const [totalOrders, pendingOrders, paidOrders, cancelledOrders, wallets, recentOrders] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.order.count({ where: { status: "CANCELLED" } }),
    prisma.wallet.findMany({
      include: {
        branch: true,
        balances: { include: { currency: true } },
      },
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { currencyFrom: true, currencyTo: true },
    }),
  ]);

  return JSON.parse(JSON.stringify({
    totalOrders,
    pendingOrders,
    paidOrders,
    cancelledOrders,
    wallets,
    recentOrders,
  }));
}
