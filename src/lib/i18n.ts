const es = {
  heroTitle: "Belleza a domicilio en Monterrey",
  heroSubtitle: "Reserva con estilistas verificados o solicita ayuda de concierge.",
  requestCta: "Solicitar cita",
  bookNow: "Reservar ahora",
  howItWorks: "Cómo funciona",
  searchPlaceholder: "Busca por servicio o colonia",
};

export type I18nKey = keyof typeof es;

export function t(key: I18nKey): string {
  return es[key];
}
