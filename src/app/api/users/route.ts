import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isErrorResponse } from "@/lib/auth-guard";

export async function GET() {
  const result = await requireAdmin();
  if (isErrorResponse(result)) return result;

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      fullName: true,
      username: true,
      role: true,
      createdAt: true,
      _count: { select: { entries: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    users.map((u) => ({ ...u, entryCount: u._count.entries, _count: undefined }))
  );
}
