import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { loginSchema } from "@/lib/validations/auth";
import { rateLimit } from "@/lib/rate-limit";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(`login:${ip}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json(
      { success: false, error: { message: "請求過於頻繁，請稍後再試" } },
      { status: 429 },
    );
  }

  const body = await req.json();
  const result = loginSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { success: false, error: { message: result.error.issues[0].message } },
      { status: 400 },
    );
  }

  const { email, password } = result.data;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json(
      { success: false, error: { message: "Email 或密碼錯誤" } },
      { status: 401 },
    );
  }

  if (!user.emailVerified) {
    return NextResponse.json(
      { success: false, error: { message: "請先驗證你的 Email" } },
      { status: 403 },
    );
  }

  const payload = { userId: user.id, email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  const rawToken = crypto.randomBytes(32).toString("hex");

  await prisma.refreshToken.create({
    data: {
      token: rawToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const res = NextResponse.json({
    success: true,
    user: { id: user.id, email: user.email },
  });
  res.cookies.set("access_token", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 15 * 60,
  });
  res.cookies.set("refresh_token", rawToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/api/auth/refresh",
    maxAge: 7 * 24 * 60 * 60,
  });
  return res;
}
