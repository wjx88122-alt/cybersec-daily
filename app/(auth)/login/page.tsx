'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : '登入失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 p-8 border rounded-lg">
        <h1 className="text-2xl font-bold">登入</h1>
        {error && <p role="alert" className="text-red-500 text-sm">{error}</p>}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2" autoComplete="email" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">密碼</label>
          <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2" autoComplete="current-password" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50">
          {loading ? '登入中...' : '登入'}
        </button>
        <div className="text-sm text-center space-y-1">
          <Link href="/forgot-password" className="text-blue-600 hover:underline block">忘記密碼？</Link>
          <Link href="/register" className="text-blue-600 hover:underline block">還沒有帳號？立即註冊</Link>
        </div>
      </form>
    </div>
  )
}
