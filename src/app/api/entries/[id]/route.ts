import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, isErrorResponse } from "@/lib/auth-guard";
import { parseEntry, serializeEntry } from "@/lib/entries";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const result = await requireAuth();
  if (isErrorResponse(result)) return result;
  const user = result;

  const entry = await prisma.diveEntry.findUnique({ where: { id: params.id } });
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (entry.userId !== user.id && user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(parseEntry(entry));
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const result = await requireAuth();
  if (isErrorResponse(result)) return result;
  const user = result;

  const existing = await prisma.diveEntry.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.userId !== user.id && user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const data = await request.json();
    const serialized = serializeEntry({
      ...data,
      date: data.date ? new Date(data.date) : existing.date,
    });
    delete serialized.id;
    delete serialized.userId;
    delete serialized.createdAt;
    delete serialized.updatedAt;
    delete serialized.user;

    const updated = await prisma.diveEntry.update({
      where: { id: params.id },
      data: serialized,
    });
    return NextResponse.json(parseEntry(updated));
  } catch (error: any) {
    console.error("Update entry error:", error);
    return NextResponse.json({ error: error.message || "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const result = await requireAuth();
  if (isErrorResponse(result)) return result;
  const user = result;

  const existing = await prisma.diveEntry.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.userId !== user.id && user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.diveEntry.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
