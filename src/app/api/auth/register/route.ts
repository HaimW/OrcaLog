import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);

    // Check if this email should be admin
    const config = await prisma.appConfig.findUnique({ where: { id: "singleton" } });
    const adminEmails: string[] = config ? JSON.parse(config.adminEmails) : [];
    const role = adminEmails.includes(email) ? "admin" : "user";

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        fullName: fullName || null,
        role,
      },
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
