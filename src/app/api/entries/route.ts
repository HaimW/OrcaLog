import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, isErrorResponse } from "@/lib/auth-guard";
import { parseEntry, serializeEntry } from "@/lib/entries";

export async function GET(request: NextRequest) {
  const result = await requireAuth();
  if (isErrorResponse(result)) return result;
  const user = result;

  const { searchParams } = new URL(request.url);
  const isAdmin = user.role === "admin";
  const userIdFilter = searchParams.get("userId");
  const search = searchParams.get("search");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const location = searchParams.get("location");
  const fishingType = searchParams.get("fishingType");
  const minDepth = searchParams.get("minDepth");
  const maxDepth = searchParams.get("maxDepth");
  const minRating = searchParams.get("minRating");
  const skip = parseInt(searchParams.get("skip") || "0");
  const take = parseInt(searchParams.get("take") || "20");

  const where: any = {};

  // Auth: admins can see all or specific user, members only see their own
  if (isAdmin) {
    if (userIdFilter) where.userId = userIdFilter;
  } else {
    where.userId = user.id;
  }

  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) where.date.gte = new Date(dateFrom);
    if (dateTo) where.date.lte = new Date(dateTo);
  }
  if (location) where.location = location;
  if (minDepth) where.depth = { ...(where.depth || {}), gte: parseFloat(minDepth) };
  if (maxDepth) where.depth = { ...(where.depth || {}), lte: parseFloat(maxDepth) };
  if (minRating) where.rating = { gte: parseInt(minRating) };

  // Search across location, notes, detailedLocation
  if (search) {
    where.OR = [
      { location: { contains: search } },
      { notes: { contains: search } },
      { detailedLocation: { contains: search } },
      { catches: { contains: search } }, // JSON substring match
    ];
  }

  const [entries, totalCount] = await Promise.all([
    prisma.diveEntry.findMany({
      where,
      orderBy: { date: "desc" },
      skip,
      take,
    }),
    prisma.diveEntry.count({ where }),
  ]);

  let parsed = entries.map(parseEntry);

  // Post-filter by fishingType (since it's JSON)
  if (fishingType) {
    parsed = parsed.filter((e) => Array.isArray(e.fishingTypes) && e.fishingTypes.includes(fishingType));
  }

  return NextResponse.json({
    items: parsed,
    totalCount,
    hasNext: skip + take < totalCount,
  });
}

export async function POST(request: NextRequest) {
  const result = await requireAuth();
  if (isErrorResponse(result)) return result;
  const user = result;

  try {
    const data = await request.json();

    if (!data.date || !data.rating) {
      return NextResponse.json({ error: "Date and rating are required" }, { status: 400 });
    }

    const serialized = serializeEntry({
      ...data,
      userId: user.id,
      date: new Date(data.date),
    });

    // Remove id fields that shouldn't be inserted
    delete serialized.id;
    delete serialized.createdAt;
    delete serialized.updatedAt;
    delete serialized.user;

    const entry = await prisma.diveEntry.create({ data: serialized });
    return NextResponse.json(parseEntry(entry), { status: 201 });
  } catch (error: any) {
    console.error("Create entry error:", error);
    return NextResponse.json({ error: error.message || "Failed to create entry" }, { status: 500 });
  }
}
