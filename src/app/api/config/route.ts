import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin, isErrorResponse } from "@/lib/auth-guard";

const ROOT_EMAIL = "yafim.sh@gmail.com";

export async function GET() {
  const result = await requireAuth();
  if (isErrorResponse(result)) return result;

  const config = await prisma.appConfig.findUnique({ where: { id: "singleton" } });
  if (!config) return NextResponse.json({ adminEmails: [], whatsappGroupLink: "", leaderboardEnabled: false });

  return NextResponse.json({
    adminEmails: JSON.parse(config.adminEmails),
    whatsappGroupLink: config.whatsappGroupLink || "",
    leaderboardEnabled: config.leaderboardEnabled ?? false,
  });
}

export async function PUT(request: NextRequest) {
  const result = await requireAdmin();
  if (isErrorResponse(result)) return result;

  const data = await request.json();
  const update: any = {};

  // Only root can change the admin emails list
  if (Array.isArray(data.adminEmails)) {
    if (result.email !== ROOT_EMAIL) {
      return NextResponse.json({ error: "Only the root admin can change admin emails" }, { status: 403 });
    }
    // Root email is always protected
    const emails = data.adminEmails.filter((e: string) => typeof e === "string");
    if (!emails.includes(ROOT_EMAIL)) emails.unshift(ROOT_EMAIL);
    update.adminEmails = JSON.stringify(emails);
  }

  if (typeof data.whatsappGroupLink === "string") {
    update.whatsappGroupLink = data.whatsappGroupLink;
  }

  if (typeof data.leaderboardEnabled === "boolean") {
    update.leaderboardEnabled = data.leaderboardEnabled;
  }

  const config = await prisma.appConfig.upsert({
    where: { id: "singleton" },
    update,
    create: {
      id: "singleton",
      adminEmails: update.adminEmails || JSON.stringify([ROOT_EMAIL]),
      whatsappGroupLink: update.whatsappGroupLink || null,
      leaderboardEnabled: update.leaderboardEnabled ?? false,
    },
  });

  return NextResponse.json({
    adminEmails: JSON.parse(config.adminEmails),
    whatsappGroupLink: config.whatsappGroupLink || "",
    leaderboardEnabled: config.leaderboardEnabled ?? false,
  });
}
