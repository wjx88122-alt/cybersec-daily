import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('請輸入有效的 Email'),
  password: z
    .string()
    .min(8, '密碼至少 8 個字元')
    .regex(/[A-Z]/, '密碼需包含大寫字母')
    .regex(/[a-z]/, '密碼需包含小寫字母')
    .regex(/[0-9]/, '密碼需包含數字'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: '密碼不一致',
  path: ['confirmPassword'],
})

export const loginSchema = z.object({
  email: z.string().email('請輸入有效的 Email'),
  password: z.string().min(1, '請輸入密碼'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('請輸入有效的 Email'),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, '密碼至少 8 個字元')
    .regex(/[A-Z]/, '密碼需包含大寫字母')
    .regex(/[a-z]/, '密碼需包含小寫字母')
    .regex(/[0-9]/, '密碼需包含數字'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: '密碼不一致',
  path: ['confirmPassword'],
})
