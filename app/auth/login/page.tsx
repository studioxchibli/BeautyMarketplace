"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Input, Button } from "@/src/components/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="mx-auto mt-10 max-w-md space-y-4 rounded-xl border bg-white p-6 shadow">
      <h1 className="text-xl font-semibold">Entrar</h1>
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          const res = await signIn("credentials", { redirect: false, email, password });
          if (res?.error) setError(res.error);
        }}
      >
        <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" required />
        <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" type="password" required />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit">Continuar</Button>
      </form>
      <Button onClick={() => signIn("google")}>Entrar con Google</Button>
    </div>
  );
}
