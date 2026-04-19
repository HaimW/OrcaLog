import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin, isErrorResponse } from "@/lib/auth-guard";

export async function GET() {
  const result = await requireAuth();
  if (isErrorResponse(result)) return result;

  const config = await prisma.appConfig.findUnique({ where: { id: "singleton" } });
  if (!config) return NextResponse.json({ adminEmails: [], whatsappGroupLink: "" });

  return NextResponse.json({
    adminEmails: JSON.parse(config.adminEmails),
    whatsappGroupLink: config.whatsappGroupLink || "",
  });
}

export async function PUT(request: NextRequest) {
  const result = await requireAdmin();
  if (isErrorResponse(result)) return result;

  const data = await request.json();
  const update: any = {};

  if (Array.isArray(data.adminEmails)) {
    update.adminEmails = JSON.stringify(data.adminEmails);
  }
  if (typeof data.whatsappGroupLink === "string") {
    update.whatsappGroupLink = data.whatsappGroupLink;
  }

  const config = await prisma.appConfig.upsert({
    where: { id: "singleton" },
    update,
    create: {
      id: "singleton",
      adminEmails: update.adminEmails || "[]",
      whatsappGroupLink: update.whatsappGroupLink || null,
    },
  });

  return NextResponse.json({
    adminEmails: JSON.parse(config.adminEmails),
    whatsappGroupLink: config.whatsappGroupLink || "",
  });
}
