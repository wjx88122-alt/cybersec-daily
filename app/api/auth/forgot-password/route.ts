import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { sendPasswordResetEmail } from "@/lib/email/service";
import { rateLimit } from "@/lib/rate-limit";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(`forgot:${ip}`, 3, 60 * 60 * 1000)) {
    return NextResponse.json(
      { success: false, error: { message: "請求過於頻繁，請稍後再試" } },
      { status: 429 },
    );
  }

  const body = await req.json();
  const result = forgotPasswordSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { success: false, error: { message: result.error.issues[0].message } },
      { status: 400 },
    );
  }

  const { email } = result.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // 防止 email 列舉攻擊，無論是否存在都回傳相同訊息
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
    await sendPasswordResetEmail(email, token);
  }

  return NextResponse.json({
    success: true,
    message: "若此 Email 已註冊，重設密碼信已發送",
  });
}
