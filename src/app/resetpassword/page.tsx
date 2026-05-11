"use client"

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Image from 'next/image'
import { resetPasswordAction } from "@/app/loadAction"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const oobCode = searchParams.get('oobCode') || searchParams.get('code') || ''

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    if (!oobCode) {
      setError("Invalid or missing reset code. Please request a new reset link.")
      return
    }

    setIsLoading(true)
    try {
      const result = await resetPasswordAction(oobCode, newPassword)
      if (result.success) {
        setIsSuccess(true)
      } else {
        setError(result.message || "Failed to reset password.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!oobCode) {
    return (
      <div className="text-center py-4 space-y-4">
        <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto text-rose-500">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Invalid Reset Link</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          This password reset link is invalid or has expired.
        </p>
        <Link href="/forgotpassword">
          <Button className="bg-amber-500 hover:bg-amber-600 text-white mt-2">
            Request a new link
          </Button>
        </Link>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="text-center py-4 space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500">
          <CheckCircle2 size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Password Reset!
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            Your password has been reset successfully.
          </p>
        </div>
        <Button
          onClick={() => router.push('/')}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white h-12 rounded-xl font-bold"
        >
          Back to Login
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl text-center font-bold text-slate-900 dark:text-white tracking-tight">
          Set New Password
        </h1>
        <p className="text-center text-sm text-slate-400">
          Enter your new password below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
            New Password
          </label>
          <div className="relative group mt-2">
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setError(null) }}
              className="w-full pr-11 pl-4 py-3 rounded-xl border bg-transparent outline-none transition-all text-slate-900 dark:text-white border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
            Confirm Password
          </label>
          <div className="mt-2">
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(null) }}
              className="w-full px-4 py-3 rounded-xl border bg-transparent outline-none transition-all text-slate-900 dark:text-white border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-rose-500 text-xs ml-1 animate-in fade-in slide-in-from-top-1">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white h-12 rounded-xl font-bold text-lg shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98]"
        >
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Reset Password"}
        </Button>
      </form>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-300 dark:bg-[#0a0c10] p-4">
      <div className="w-full max-w-md space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-amber-500 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Login
        </Link>

        <div className="bg-white dark:bg-[#111318] rounded-2xl p-8 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-black/5">
          <div className="flex items-center justify-center gap-1 mb-8">
            <div className="relative overflow-hidden rounded-full p-1">
              <Image src="/image.png" alt="Logo" width={140} height={140} className="object-cover" />
            </div>
          </div>

          <Suspense fallback={<div className="text-center text-slate-400">Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}