'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'

export default function RegisterPage() {
  const { register } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(email, password, confirmPassword)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : '註冊失敗')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-sm p-8 border rounded-lg text-center space-y-4">
          <h1 className="text-2xl font-bold">請檢查你的信箱</h1>
          <p className="text-gray-600">驗證信已發送，請點擊信中連結完成註冊。</p>
          <Link href="/login" className="text-blue-600 hover:underline">返回登入</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 p-8 border rounded-lg">
        <h1 className="text-2xl font-bold">註冊</h1>
        {error && <p role="alert" className="text-red-500 text-sm">{error}</p>}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2" autoComplete="email" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">密碼</label>
          <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2" autoComplete="new-password" />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">確認密碼</label>
          <input id="confirmPassword" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border rounded px-3 py-2" autoComplete="new-password" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50">
          {loading ? '註冊中...' : '註冊'}
        </button>
        <Link href="/login" className="text-sm text-blue-600 hover:underline block text-center">已有帳號？立即登入</Link>
      </form>
    </div>
  )
}
