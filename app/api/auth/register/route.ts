import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { registerSchema } from "@/lib/validations/auth";
import { sendVerificationEmail } from "@/lib/email/service";
import { rateLimit } from "@/lib/rate-limit";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(`register:${ip}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json(
      { success: false, error: { message: "請求過於頻繁，請稍後再試" } },
      { status: 429 },
    );
  }

  const body = await req.json();
  const result = registerSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { success: false, error: { message: result.error.issues[0].message } },
      { status: 400 },
    );
  }

  const { email, password } = result.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // 防止 email 列舉攻擊，回傳相同訊息
    return NextResponse.json({
      success: true,
      message: "若此 Email 尚未註冊，驗證信已發送",
    });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({ data: { email, passwordHash } });

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  await sendVerificationEmail(email, token);

  return NextResponse.json({
    success: true,
    message: "若此 Email 尚未註冊，驗證信已發送",
  });
}
