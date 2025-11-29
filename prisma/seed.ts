import { PrismaClient, UserRole, RequestStatus, BookingStatus, BookingOrigin } from "@prisma/client";
import { addDays } from "date-fns";

const prisma = new PrismaClient();

const neighborhoods = ["San Pedro", "Valle", "Del Valle", "Miravalle", "Cumbres", "Centro"];
const serviceCategories = ["Blowout", "Corte mujer", "Color", "Peinado"];
const languages = ["Español", "Inglés"];

function pickNeighborhoods() {
  return neighborhoods.sort(() => Math.random() - 0.5).slice(0, 3);
}

async function main() {
  const enablePayments = process.env.ENABLE_PAYMENTS === "true";
  const enableReviews = process.env.ENABLE_REVIEWS === "true";

  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.message.deleteMany();
  await prisma.request.deleteMany();
  await prisma.portfolioImage.deleteMany();
  await prisma.service.deleteMany();
  await prisma.availabilityWindow.deleteMany();
  await prisma.identityVerification.deleteMany();
  await prisma.payoutAccount.deleteMany();
  await prisma.stylistProfile.deleteMany();
  await prisma.user.deleteMany();

  const clients = await prisma.$transaction(
    Array.from({ length: 20 }).map((_, idx) =>
      prisma.user.create({
        data: {
          role: UserRole.CLIENT,
          name: `Cliente ${idx + 1}`,
          email: `cliente${idx + 1}@demo.com`,
          phone: `81100000${idx + 1}`,
          passwordHash: null,
        },
      })
    )
  );

  const stylists: { userId: string; profileId: string }[] = [];

  for (let i = 0; i < 10; i++) {
    const user = await prisma.user.create({
      data: {
        role: UserRole.STYLIST,
        name: `Estilista ${i + 1}`,
        email: `estilista${i + 1}@demo.com`,
        phone: `81800000${i + 1}`,
      },
    });

    const profile = await prisma.stylistProfile.create({
      data: {
        userId: user.id,
        bio: "Apasionada por el cabello saludable y looks modernos en Monterrey.",
        instagram: "https://instagram.com/demo",
        neighborhoods: pickNeighborhoods(),
        languages,
        verified: i % 2 === 0,
        hygieneBadge: i % 3 === 0,
        cancellationHr: 24,
        services: {
          create: serviceCategories.map((cat, idx) => ({
            name: `${cat} destacado`,
            priceMin: 600 + idx * 50,
            priceMax: 900 + idx * 50,
            durationMin: 60 + idx * 15,
            category: cat,
          })),
        },
        availability: {
          create: [
            { dayOfWeek: 1, startTime: "10:00", endTime: "14:00" },
            { dayOfWeek: 3, startTime: "12:00", endTime: "18:00" },
            { dayOfWeek: 5, startTime: "09:00", endTime: "13:00" },
          ],
        },
        portfolio: {
          create: [1, 2, 3].map((p) => ({
            url: `https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?auto=format&fit=crop&w=800&q=80&sig=${i}${p}`,
            caption: `Look ${p}`,
          })),
        },
      },
    });

    stylists.push({ userId: user.id, profileId: profile.id });

    if (enablePayments) {
      await prisma.payoutAccount.create({
        data: {
          stylistId: profile.id,
          provider: "STRIPE",
          externalId: `acct_demo_${i + 1}`,
          capabilities: ["card_payments", "transfers"],
        },
      });
    }
  }

  const services = await prisma.service.findMany();

  // Create concierge requests
  for (let i = 0; i < 15; i++) {
    const client = clients[i % clients.length];
    const stylist = stylists[i % stylists.length];
    const service = services[i % services.length];
    await prisma.request.create({
      data: {
        clientId: client.id,
        stylistId: stylist.profileId,
        serviceId: service.id,
        desiredDate: addDays(new Date(), i + 1),
        desiredTimeRange: "17:00-19:00",
        note: "Busco un estilo elegante para evento.",
        status: [RequestStatus.PENDING, RequestStatus.ACCEPTED, RequestStatus.DECLINED][i % 3],
        messages: {
          create: [{
            fromUserId: client.id,
            body: "Hola, ¿tienes disponibilidad?",
          }],
        },
      },
    });
  }

  if (enablePayments) {
    for (let i = 0; i < 10; i++) {
      const client = clients[(i + 3) % clients.length];
      const stylist = stylists[(i + 2) % stylists.length];
      const service = services[(i + 4) % services.length];
      const startAt = addDays(new Date(), i + 2);
      const booking = await prisma.booking.create({
        data: {
          clientId: client.id,
          stylistId: stylist.profileId,
          serviceId: service.id,
          startAt,
          endAt: addDays(startAt, 0),
          price: service.priceMax,
          status: [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.COMPLETED][i % 3],
          origin: i % 2 === 0 ? BookingOrigin.MARKETPLACE : BookingOrigin.DIRECT,
        },
      });

      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          provider: "STRIPE",
          intentId: `pi_demo_${i}`,
          amount: booking.price,
          currency: "MXN",
          feeToPlatform: booking.origin === BookingOrigin.MARKETPLACE ? Math.round(booking.price * 0.2) : 0,
          status: "succeeded",
        },
      });

      if (enableReviews && booking.status === BookingStatus.COMPLETED) {
        await prisma.review.create({
          data: {
            bookingId: booking.id,
            rating: 4 + (i % 2),
            text: "Servicio excelente y muy profesional.",
            reply: "¡Gracias por confiar!",
          },
        });
      }
    }
  }

  // Admin
  await prisma.user.create({
    data: {
      role: UserRole.ADMIN,
      name: "Admin",
      email: "admin@demo.com",
    },
  });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
