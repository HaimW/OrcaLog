import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, isErrorResponse } from "@/lib/auth-guard";
import { parseEntry } from "@/lib/entries";

export async function GET(request: NextRequest) {
  const result = await requireAuth();
  if (isErrorResponse(result)) return result;
  const user = result;

  const { searchParams } = new URL(request.url);
  const targetUserId = user.role === "admin" ? searchParams.get("userId") || user.id : user.id;

  const entries = await prisma.diveEntry.findMany({
    where: { userId: targetUserId },
    orderBy: { date: "desc" },
  });

  const parsed = entries.map(parseEntry);

  return new NextResponse(JSON.stringify(parsed, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="orcalog-export-${Date.now()}.json"`,
    },
  });
}
