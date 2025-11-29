import { prisma } from "@/src/lib/prisma";
import { Card, Button } from "@/src/components/card";

export default async function AdminPage() {
  const stylists = await prisma.stylistProfile.findMany({ include: { user: true } });
  const requests = await prisma.request.findMany();
  const bookings = await prisma.booking.findMany();
  const gmv = bookings.reduce((sum, b) => sum + b.price, 0);
  const platformFees = (await prisma.payment.findMany()).reduce((s, p) => s + p.feeToPlatform, 0);

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <p className="text-xs text-gray-500">Estilistas</p>
          <p className="text-2xl font-semibold">{stylists.length}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500">Solicitudes</p>
          <p className="text-2xl font-semibold">{requests.length}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500">Reservas</p>
          <p className="text-2xl font-semibold">{bookings.length}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500">GMV MXN</p>
          <p className="text-2xl font-semibold">${gmv}</p>
        </Card>
      </div>

      <Card className="space-y-3">
        <h3 className="text-lg font-semibold">Aprobar estilistas</h3>
        <div className="space-y-2">
          {stylists.map((stylist) => (
            <div key={stylist.id} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
              <div>
                <p className="font-semibold">{stylist.user.name}</p>
                <p className="text-xs text-gray-600">{stylist.neighborhoods.join(", ")}</p>
              </div>
              <span className="text-xs">{stylist.verified ? "Verificada" : "Pendiente"}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-3">
        <h3 className="text-lg font-semibold">Exportar CSV solicitudes</h3>
        <form action="/api/admin/requests-csv" method="get">
          <Button type="submit">Descargar</Button>
        </form>
      </Card>

      <Card className="space-y-2">
        <p className="text-sm text-gray-600">Ingresos plataforma (fees): ${platformFees}</p>
      </Card>
    </main>
  );
}
