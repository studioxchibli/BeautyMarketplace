import { getServerSession } from "next-auth";
import { authOptions } from "@/src/auth/options";
import { prisma } from "@/src/lib/prisma";
import { Card, Button } from "@/src/components/card";
import { env } from "@/src/lib/env";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return <div className="p-6">Inicia sesión</div>;
  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  const requests = await prisma.request.findMany({
    where: role === "STYLIST" ? { stylist: { userId } } : { clientId: userId },
    include: { client: true, stylist: { include: { user: true } }, service: true },
  });

  const bookings = env.enablePayments
    ? await prisma.booking.findMany({
        where: role === "STYLIST" ? { stylist: { userId } } : { clientId: userId },
        include: { service: true, stylist: { include: { user: true } } },
      })
    : [];

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <h1 className="text-2xl font-semibold">Panel</h1>
      <Card className="space-y-3">
        <h3 className="text-lg font-semibold">Solicitudes concierge</h3>
        <div className="space-y-2">
          {requests.map((req) => (
            <div key={req.id} className="rounded border px-3 py-2 text-sm">
              <p className="font-semibold">{req.client.name} → {req.stylist.user.name}</p>
              <p>{req.desiredDate.toLocaleDateString("es-MX")}, {req.desiredTimeRange}</p>
              <p className="text-xs text-gray-600">Estado: {req.status}</p>
            </div>
          ))}
          {requests.length === 0 && <p className="text-sm text-gray-600">Sin solicitudes.</p>}
        </div>
      </Card>

      {env.enablePayments && (
        <Card className="space-y-3">
          <h3 className="text-lg font-semibold">Reservas</h3>
          <div className="space-y-2">
            {bookings.map((b) => (
              <div key={b.id} className="rounded border px-3 py-2 text-sm">
                <p className="font-semibold">{b.service.name} con {b.stylist.user.name}</p>
                <p>{b.startAt.toLocaleString("es-MX")}</p>
                <p className="text-xs text-gray-600">Estado: {b.status}</p>
              </div>
            ))}
            {bookings.length === 0 && <p className="text-sm text-gray-600">Sin reservas aún.</p>}
          </div>
        </Card>
      )}
    </main>
  );
}
