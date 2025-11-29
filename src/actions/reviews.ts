"use server";
import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { profanityFree } from "@/src/lib/utils";
import { env } from "@/src/lib/env";
import { revalidatePath } from "next/cache";

const reviewSchema = z.object({
  bookingId: z.string(),
  rating: z.coerce.number().min(1).max(5),
  text: z.string().min(3),
});

export async function submitReview(form: FormData) {
  if (!env.enableReviews) throw new Error("Reseñas deshabilitadas");
  const data = reviewSchema.parse({
    bookingId: form.get("bookingId"),
    rating: form.get("rating"),
    text: form.get("text"),
  });
  if (!profanityFree(data.text)) throw new Error("Lenguaje inapropiado");
  const booking = await prisma.booking.findUnique({ where: { id: data.bookingId }, include: { review: true } });
  if (!booking || booking.status !== "COMPLETED") throw new Error("Solo después de completar");
  if (booking.review) throw new Error("Ya existe reseña");
  await prisma.review.create({ data });
  revalidatePath(`/stylists/${booking.stylistId}`);
  return { success: true };
}
