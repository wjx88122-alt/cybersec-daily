import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { resetPasswordSchema } from "@/lib/validations/auth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = resetPasswordSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { success: false, error: { message: result.error.issues[0].message } },
      { status: 400 },
    );
  }

  const { token, password } = result.data;
  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
  });
  if (!record || record.expiresAt < new Date()) {
    return NextResponse.json(
      { success: false, error: { message: "重設連結已過期或無效" } },
      { status: 400 },
    );
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.update({
    where: { id: record.userId },
    data: { passwordHash },
  });

  // 撤銷所有 Refresh Token，強制登出所有裝置
  await prisma.refreshToken.deleteMany({ where: { userId: record.userId } });
  await prisma.passwordResetToken.delete({ where: { token } });

  return NextResponse.json({
    success: true,
    message: "密碼已重設，請重新登入",
  });
}
