import { prisma } from "@/src/lib/prisma";
import { Card, Button, Badge, Input, TextArea } from "@/src/components/card";
import { submitRequest } from "@/src/actions/requests";
import { createBooking } from "@/src/actions/bookings";
import { env } from "@/src/lib/env";
import { submitReview } from "@/src/actions/reviews";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/auth/options";

export default async function StylistPage({ params }: { params: { id: string } }) {
  const stylist = await prisma.stylistProfile.findUnique({
    where: { id: params.id },
    include: { user: true, services: true, availability: true, portfolio: true, bookings: true },
  });
  if (!stylist) return <div className="p-6">No encontrada</div>;
  const session = await getServerSession(authOptions);
  const reviews = env.enableReviews
    ? await prisma.review.findMany({
        where: { booking: { stylistId: stylist.id, status: "COMPLETED" } },
        include: { booking: { include: { client: true } } },
      })
    : [];

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{stylist.user.name}</h1>
            <p className="text-sm text-gray-600">{stylist.neighborhoods.join(", ")}</p>
          </div>
          <div className="flex gap-2">
            {stylist.verified && <Badge>Verificada</Badge>}
            {stylist.hygieneBadge && <Badge>Higiene</Badge>}
          </div>
        </div>
        <p className="text-gray-700">{stylist.bio}</p>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold">Servicios</h3>
            <div className="space-y-2">
              {stylist.services.map((service) => (
                <div key={service.id} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
                  <div>
                    <p className="font-semibold">{service.name}</p>
                    <p className="text-xs text-gray-600">{service.durationMin} min • {service.category}</p>
                  </div>
                  <p>${service.priceMin}-{service.priceMax}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Portafolio</h3>
            <div className="grid grid-cols-3 gap-2">
              {stylist.portfolio.map((img) => (
                <img key={img.id} src={img.url} alt={img.caption ?? ""} className="h-24 w-full rounded object-cover" />
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card id="request" className="space-y-3">
        <h3 className="text-lg font-semibold">{env.enablePayments ? "Reserva instantánea" : "Solicitud concierge"}</h3>
        {!env.enablePayments && (
          <form action={submitRequest} className="grid gap-3 md:grid-cols-2">
            <input type="hidden" name="stylistId" value={stylist.id} />
            <Input name="name" placeholder="Tu nombre" required />
            <Input name="email" type="email" placeholder="Email" required />
            <Input name="phone" placeholder="Teléfono" required />
            <Input name="desiredDate" type="date" required />
            <Input name="desiredTimeRange" placeholder="Horario preferido" required />
            <Input name="serviceId" placeholder="Servicio opcional" />
            <TextArea name="note" className="md:col-span-2" placeholder="Notas" />
            <Button type="submit">Enviar solicitud</Button>
          </form>
        )}
        {env.enablePayments && session?.user && (
          <form action={createBooking} className="grid gap-3 md:grid-cols-2">
            <input type="hidden" name="clientId" value={(session.user as any).id} />
            <input type="hidden" name="stylistId" value={stylist.id} />
            <label className="text-sm">Servicio
              <select name="serviceId" className="mt-1 w-full rounded border px-3 py-2">
                {stylist.services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (${s.priceMax})
                  </option>
                ))}
              </select>
            </label>
            <Input name="startAt" type="datetime-local" required />
            <Button type="submit">Pagar y reservar</Button>
          </form>
        )}
        {env.enablePayments && !session?.user && <p className="text-sm text-gray-600">Inicia sesión para reservar.</p>}
      </Card>

      {env.enableReviews && (
        <Card className="space-y-3">
          <h3 className="text-lg font-semibold">Reseñas verificadas</h3>
          <div className="space-y-2">
            {reviews.map((review) => (
              <div key={review.id} className="rounded border px-3 py-2 text-sm">
                <p className="font-semibold">{review.booking.client.name} • {"★".repeat(review.rating)}</p>
                <p>{review.text}</p>
                {review.reply && <p className="text-xs text-gray-600">Respuesta: {review.reply}</p>}
              </div>
            ))}
            {reviews.length === 0 && <p className="text-sm text-gray-600">Aún sin reseñas.</p>}
          </div>
          {session?.user && (
            <form action={submitReview} className="grid gap-2 md:grid-cols-2">
              <Input name="bookingId" placeholder="ID de booking completado" required />
              <Input name="rating" type="number" min={1} max={5} required />
              <TextArea name="text" className="md:col-span-2" placeholder="Comparte tu experiencia" required />
              <Button type="submit">Publicar reseña</Button>
            </form>
          )}
        </Card>
      )}
    </main>
  );
}
