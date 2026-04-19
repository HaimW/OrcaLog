import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "./auth";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  language: string;
}

export async function requireAuth(): Promise<SessionUser | NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session.user as unknown as SessionUser;
}

export async function requireAdmin(): Promise<SessionUser | NextResponse> {
  const result = await requireAuth();
  if (result instanceof NextResponse) return result;
  if (result.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return result;
}

export function isErrorResponse(result: SessionUser | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}
