'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.message ?? '發送失敗')
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : '發送失敗')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-sm p-8 border rounded-lg text-center space-y-4">
          <h1 className="text-2xl font-bold">信件已發送</h1>
          <p className="text-gray-600">若此 Email 已註冊，重設密碼信已發送，請檢查信箱。</p>
          <Link href="/login" className="text-blue-600 hover:underline">返回登入</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 p-8 border rounded-lg">
        <h1 className="text-2xl font-bold">忘記密碼</h1>
        <p className="text-gray-600 text-sm">輸入你的 Email，我們將發送重設密碼連結。</p>
        {error && <p role="alert" className="text-red-500 text-sm">{error}</p>}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2" autoComplete="email" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50">
          {loading ? '發送中...' : '發送重設連結'}
        </button>
        <Link href="/login" className="text-sm text-blue-600 hover:underline block text-center">返回登入</Link>
      </form>
    </div>
  )
}
