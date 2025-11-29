"use client";
import { useState } from "react";
import { Input, Button } from "@/src/components/card";
import { registerAction } from "@/src/actions/auth";

export default function RegisterPage() {
  const [status, setStatus] = useState<string | null>(null);
  return (
    <div className="mx-auto mt-10 max-w-md space-y-4 rounded-xl border bg-white p-6 shadow">
      <h1 className="text-xl font-semibold">Crear cuenta</h1>
      <form
        className="space-y-3"
        action={async (formData) => {
          try {
            await registerAction(formData);
            setStatus("Cuenta creada, ahora inicia sesión.");
          } catch (e: any) {
            setStatus(e.message);
          }
        }}
      >
        <Input name="name" placeholder="Nombre" required />
        <Input name="email" type="email" placeholder="Email" required />
        <Input name="password" type="password" placeholder="Contraseña" required />
        <label className="text-sm">Rol
          <select name="role" className="mt-1 w-full rounded border px-3 py-2">
            <option value="CLIENT">Cliente</option>
            <option value="STYLIST">Estilista</option>
          </select>
        </label>
        {status && <p className="text-sm text-gray-700">{status}</p>}
        <Button type="submit">Crear cuenta</Button>
      </form>
    </div>
  );
}
