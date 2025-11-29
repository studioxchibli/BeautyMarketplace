import { prisma } from "@/src/lib/prisma";
import { Card, Button, Badge, Input } from "@/src/components/card";
import { env } from "@/src/lib/env";

async function getStylists(query?: string) {
  return prisma.stylistProfile.findMany({
    where: query
      ? {
          OR: [
            { bio: { contains: query, mode: "insensitive" } },
            { services: { some: { name: { contains: query, mode: "insensitive" } } } },
          ],
        }
      : {},
    include: { services: true, user: true, review: false },
  });
}

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const stylists = await getStylists(searchParams.q);
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <form className="flex gap-2" action="/search" method="get">
        <Input name="q" placeholder="Servicio o colonia" defaultValue={searchParams.q} />
        <Button type="submit">Buscar</Button>
      </form>
      <div className="grid gap-4 md:grid-cols-2">
        {stylists.map((stylist) => (
          <Card key={stylist.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">{stylist.user.name}</p>
                <p className="text-sm text-gray-600">{stylist.neighborhoods.join(", ")}</p>
              </div>
              {stylist.hygieneBadge && <Badge>Higiene</Badge>}
            </div>
            <p className="text-sm text-gray-700">{stylist.bio}</p>
            <div className="flex flex-wrap gap-2 text-xs text-gray-700">
              {stylist.services.map((service) => (
                <span key={service.id} className="rounded-full bg-gray-100 px-3 py-1">
                  {service.name} ${service.priceMin}-{service.priceMax}
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Button href={`/stylists/${stylist.id}`}>Ver perfil</Button>
              {!env.enablePayments && <Button href={`/stylists/${stylist.id}#request`} className="bg-white text-amber-700">Solicitar</Button>}
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
