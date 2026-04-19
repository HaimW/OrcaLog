import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, isErrorResponse } from "@/lib/auth-guard";
import { serializeEntry } from "@/lib/entries";

export async function POST(request: NextRequest) {
  const result = await requireAuth();
  if (isErrorResponse(result)) return result;
  const user = result;

  try {
    const body = await request.json();
    const entries = Array.isArray(body) ? body : body.entries;

    if (!Array.isArray(entries)) {
      return NextResponse.json({ error: "Invalid format: expected array" }, { status: 400 });
    }

    let imported = 0;
    for (const entry of entries) {
      if (!entry.date || !entry.rating) continue;
      const serialized = serializeEntry({
        ...entry,
        userId: user.id,
        date: new Date(entry.date),
      });
      delete serialized.id;
      delete serialized.createdAt;
      delete serialized.updatedAt;
      delete serialized.user;

      await prisma.diveEntry.create({ data: serialized });
      imported++;
    }

    return NextResponse.json({ imported });
  } catch (error: any) {
    console.error("Import error:", error);
    return NextResponse.json({ error: error.message || "Import failed" }, { status: 500 });
  }
}
