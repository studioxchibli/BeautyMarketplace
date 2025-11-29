"use server";

import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["CLIENT", "STYLIST"]),
});

export async function registerAction(input: FormData) {
  const data = registerSchema.parse({
    name: input.get("name"),
    email: input.get("email"),
    password: input.get("password"),
    role: input.get("role"),
  });

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new Error("Email ya registrado");
  }

  const passwordHash = await hash(data.password, 10);

  const user = await prisma.user.create({
    data: { ...data, passwordHash },
  });

  if (data.role === "STYLIST") {
    await prisma.stylistProfile.create({
      data: {
        userId: user.id,
        bio: "Cuéntanos sobre tu estilo",
        neighborhoods: ["San Pedro"],
        languages: ["Español"],
      },
    });
  }

  revalidatePath("/");
  return { success: true };
}
