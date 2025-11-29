"use server";

import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { env } from "@/src/lib/env";
import Stripe from "stripe";
import { revalidatePath } from "next/cache";

const stripe = env.stripeSecret ? new Stripe(env.stripeSecret, { apiVersion: "2024-04-10" }) : null;

const bookingSchema = z.object({
  clientId: z.string(),
  stylistId: z.string(),
  serviceId: z.string(),
  startAt: z.string(),
});

export async function createBooking(form: FormData) {
  if (!env.enablePayments) {
    throw new Error("Pagos deshabilitados");
  }
  const data = bookingSchema.parse({
    clientId: form.get("clientId"),
    stylistId: form.get("stylistId"),
    serviceId: form.get("serviceId"),
    startAt: form.get("startAt"),
  });

  const service = await prisma.service.findUnique({ where: { id: data.serviceId } });
  if (!service) throw new Error("Servicio no encontrado");

  const booking = await prisma.booking.create({
    data: {
      clientId: data.clientId,
      stylistId: data.stylistId,
      serviceId: data.serviceId,
      startAt: new Date(data.startAt),
      endAt: new Date(new Date(data.startAt).getTime() + service.durationMin * 60000),
      price: service.priceMax,
    },
  });

  let paymentUrl: string | undefined;
  if (stripe) {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "oxxo"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "mxn",
            unit_amount: service.priceMax * 100,
            product_data: { name: service.name },
          },
        },
      ],
      success_url: `${env.nextAuthUrl}/dashboard/bookings?success=1`,
      cancel_url: `${env.nextAuthUrl}/dashboard/bookings?canceled=1`,
      metadata: { bookingId: booking.id },
    });
    paymentUrl = session.url ?? undefined;
  }

  revalidatePath("/dashboard/bookings");
  return { bookingId: booking.id, paymentUrl };
}

export async function markPaymentSuccess(bookingId: string, intentId: string, fee: number) {
  await prisma.booking.update({ where: { id: bookingId }, data: { status: "CONFIRMED" } });
  await prisma.payment.create({
    data: {
      bookingId,
      provider: "STRIPE",
      intentId,
      amount: fee,
      currency: "MXN",
      feeToPlatform: fee,
      status: "succeeded",
    },
  });
  revalidatePath("/dashboard/bookings");
}
