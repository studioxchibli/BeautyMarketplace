import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET() {
  const requests = await prisma.request.findMany({ include: { client: true, stylist: { include: { user: true } }, service: true } });
  const header = "id,cliente,stylist,servicio,fecha,estado\n";
  const rows = requests
    .map((r) => `${r.id},${r.client.email},${r.stylist.user.name},${r.service?.name ?? ""},${r.desiredDate.toISOString()},${r.status}`)
    .join("\n");
  const csv = header + rows;
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=requests.csv",
    },
  });
}
