import Link from "next/link";
import { prisma } from "@/src/lib/prisma";
import { Card, Button, Badge } from "@/src/components/card";
import { env } from "@/src/lib/env";
import { t } from "@/src/lib/i18n";

export default async function Home() {
  const stylists = await prisma.stylistProfile.findMany({
    include: { user: true, services: true, portfolio: true },
    take: 6,
  });

  return (
    <main className="mx-auto max-w-6xl space-y-10 px-4 py-10">
      <section className="grid gap-6 rounded-3xl bg-gradient-to-r from-amber-100 to-orange-200 p-8 shadow">
        <div className="space-y-4">
          <p className="text-sm font-semibold text-amber-800">Monterrey Beauty Marketplace</p>
          <h1 className="text-3xl font-bold text-amber-900">{t("heroTitle")}</h1>
          <p className="text-lg text-amber-800">{t("heroSubtitle")}</p>
          <div className="flex flex-wrap gap-3">
            <Button href="/search">Explorar estilistas</Button>
            <Button href="#como" className="bg-white text-amber-800 hover:bg-amber-50">
              {t("howItWorks")}
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Destacadas en tu zona</h2>
          <Link href="/search" className="text-sm text-amber-700 underline">
            Ver todas
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stylists.map((stylist) => (
            <Card key={stylist.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{stylist.user.name}</h3>
                  <p className="text-sm text-gray-600">{stylist.neighborhoods.join(", ")}</p>
                </div>
                {stylist.verified && <Badge>Verificada</Badge>}
              </div>
              <p className="text-sm text-gray-700">{stylist.bio}</p>
              <div className="flex flex-wrap gap-2 text-sm text-gray-700">
                {stylist.services.slice(0, 2).map((service) => (
                  <span key={service.id} className="rounded-full bg-gray-100 px-3 py-1">
                    {service.name} • ${service.priceMin}-{service.priceMax}
                  </span>
                ))}
              </div>
              <Button href={`/stylists/${stylist.id}`}>{env.enablePayments ? t("bookNow") : t("requestCta")}</Button>
            </Card>
          ))}
        </div>
      </section>

      <section id="como" className="space-y-2">
        <h2 className="text-xl font-semibold">{t("howItWorks")}</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {["Cuéntanos qué buscas", "Te conectamos con la pro ideal", "Agenda y paga seguro"].map((step, idx) => (
            <Card key={idx}>
              <p className="text-sm text-gray-500">Paso {idx + 1}</p>
              <p className="text-base font-semibold text-gray-800">{step}</p>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
