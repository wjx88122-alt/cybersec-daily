'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('無效的驗證連結')
      return
    }
    fetch(`/api/auth/verify-email?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus('success')
          setMessage('Email 驗證成功，請登入')
        } else {
          setStatus('error')
          setMessage(data.error?.message ?? '驗證失敗')
        }
      })
      .catch(() => {
        setStatus('error')
        setMessage('驗證失敗，請稍後再試')
      })
  }, [token])

  return (
    <div className="w-full max-w-sm p-8 border rounded-lg text-center space-y-4">
      {status === 'loading' && <p>驗證中...</p>}
      {status === 'success' && (
        <>
          <h1 className="text-2xl font-bold text-green-600">驗證成功</h1>
          <p className="text-gray-600">{message}</p>
          <Link href="/login" className="text-blue-600 hover:underline">前往登入</Link>
        </>
      )}
      {status === 'error' && (
        <>
          <h1 className="text-2xl font-bold text-red-600">驗證失敗</h1>
          <p className="text-gray-600">{message}</p>
          <Link href="/login" className="text-blue-600 hover:underline">返回登入</Link>
        </>
      )}
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Suspense>
        <VerifyEmailContent />
      </Suspense>
    </div>
  )
}
