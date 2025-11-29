import { ReactNode } from "react";
import { cn } from "@/src/lib/utils";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-xl border bg-white p-4 shadow-sm", className)}>{children}</div>;
}

export function Button({ children, type = "button", href, className, disabled }: { children: ReactNode; type?: "button" | "submit"; href?: string; className?: string; disabled?: boolean }) {
  const base = cn(
    "inline-flex items-center justify-center rounded-md bg-primary text-white px-4 py-2 text-sm font-medium hover:bg-amber-500 transition",
    disabled && "opacity-50 cursor-not-allowed",
    className
  );
  if (href) return <a className={base} href={href}>{children}</a>;
  return <button type={type} className={base} disabled={disabled}>{children}</button>;
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn("w-full rounded-md border px-3 py-2 text-sm", props.className)} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn("w-full rounded-md border px-3 py-2 text-sm", props.className)} />;
}

export function Badge({ children }: { children: ReactNode }) {
  return <span className="rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-800">{children}</span>;
}
