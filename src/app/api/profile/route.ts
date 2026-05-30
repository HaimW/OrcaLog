import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, isErrorResponse } from "@/lib/auth-guard";

export async function GET() {
  const result = await requireAuth();
  if (isErrorResponse(result)) return result;

  const user = await prisma.user.findUnique({
    where: { id: result.id },
    select: {
      id: true,
      email: true,
      fullName: true,
      username: true,
      role: true,
      language: true,
      units: true,
      theme: true,
      defaultLocation: true,
      showInLeaderboard: true,
      emailNotifications: true,
    },
  });

  return NextResponse.json(user);
}

export async function PUT(request: NextRequest) {
  const result = await requireAuth();
  if (isErrorResponse(result)) return result;

  const data = await request.json();
  const allowed = ["fullName", "username", "language", "units", "theme", "defaultLocation"];
  const update: any = {};
  for (const key of allowed) {
    if (data[key] !== undefined) update[key] = data[key];
  }
  if (typeof data.showInLeaderboard === 'boolean') update.showInLeaderboard = data.showInLeaderboard;
  if (typeof data.emailNotifications === 'boolean') update.emailNotifications = data.emailNotifications;

  const user = await prisma.user.update({
    where: { id: result.id },
    data: update,
  });

  return NextResponse.json({ id: user.id, email: user.email, language: user.language });
}
