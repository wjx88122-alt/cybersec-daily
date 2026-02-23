'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirmPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.message ?? '重設失敗')
      router.push('/login')
    } catch (err) {
      setError(err instanceof Error ? err.message : '重設失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 p-8 border rounded-lg">
      <h1 className="text-2xl font-bold">重設密碼</h1>
      {error && <p role="alert" className="text-red-500 text-sm">{error}</p>}
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">新密碼</label>
        <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded px-3 py-2" autoComplete="new-password" />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">確認新密碼</label>
        <input id="confirmPassword" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full border rounded px-3 py-2" autoComplete="new-password" />
      </div>
      <button type="submit" disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50">
        {loading ? '重設中...' : '重設密碼'}
      </button>
      <Link href="/login" className="text-sm text-blue-600 hover:underline block text-center">返回登入</Link>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}
