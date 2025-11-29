"use server";

import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";
import { env } from "@/src/lib/env";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: env.emailHost,
  port: env.emailPort ? Number(env.emailPort) : 587,
  auth: env.emailUser && env.emailPassword ? { user: env.emailUser, pass: env.emailPassword } : undefined,
});

const requestSchema = z.object({
  stylistId: z.string(),
  serviceId: z.string().optional(),
  desiredDate: z.string(),
  desiredTimeRange: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().min(7),
  note: z.string().optional(),
});

export async function submitRequest(form: FormData) {
  const data = requestSchema.parse({
    stylistId: form.get("stylistId"),
    serviceId: form.get("serviceId") || undefined,
    desiredDate: form.get("desiredDate"),
    desiredTimeRange: form.get("desiredTimeRange"),
    name: form.get("name"),
    email: form.get("email"),
    phone: form.get("phone"),
    note: form.get("note") || undefined,
  });

  const client = await prisma.user.upsert({
    where: { email: data.email },
    update: { name: data.name, phone: data.phone, role: "CLIENT" },
    create: { name: data.name, email: data.email, phone: data.phone, role: "CLIENT" },
  });

  const request = await prisma.request.create({
    data: {
      stylistId: data.stylistId,
      clientId: client.id,
      serviceId: data.serviceId,
      desiredDate: new Date(data.desiredDate),
      desiredTimeRange: data.desiredTimeRange,
      note: data.note,
      messages: { create: { fromUserId: client.id, body: data.note ?? "Solicitud creada" } },
    },
  });

  if (env.emailHost && env.emailUser) {
    await transporter.sendMail({
      to: data.email,
      from: env.emailUser,
      subject: "Solicitud recibida",
      text: `Tu solicitud para el ${data.desiredDate} fue recibida.`,
    });
  }

  revalidatePath(`/stylists/${data.stylistId}`);
  return { success: true, requestId: request.id };
}
