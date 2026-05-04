"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { forgotPasswordAction } from "@/app/loadAction"
import Image from 'next/image'

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await forgotPasswordAction(email)

      if (result.success) {
        setIsSubmitted(true)
      } else {

        setError(result.message)
      }
    } catch (err) {
      setError("There is a techinical issue please try again")
    } finally {
      setIsLoading(false)
    }
  }

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
              <Image
                src="/image.png"
                alt="Logo"
                width={140}
                height={140}
                className="object-cover"
              />
            </div>
          </div>

          {!isSubmitted ? (
            <>
              <div className="space-y-2 mb-8">
                <h1 className="text-3xl text-center font-bold text-slate-900 dark:text-white tracking-tight">
                  You forgot the password?
                </h1>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                    Email Address
                  </label>
                  <div className="relative group mt-2">
                    <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${error ? 'text-rose-500' : 'text-slate-400 group-focus-within:text-amber-500'}`}>
                      <Mail size={20} />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (error) setError(null)
                      }}
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-transparent outline-none transition-all text-slate-900 dark:text-white ${error
                        ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                        : 'border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500'
                        }`}
                    />
                  </div>


                  {error && (
                    <div className="flex items-center gap-2 text-rose-500 text-xs mt-2 ml-1 animate-in fade-in slide-in-from-top-1">
                      <AlertCircle size={14} />
                      <span>{error}</span>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white h-12 rounded-xl font-bold text-lg shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98]"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin mr-2" size={20} />
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-4 space-y-6 animate-in fade-in zoom-in duration-300">
              
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                <CheckCircle2 size={40} />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Check Your Inbox
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  A password reset link has been sent to <br />
                  <span className="font-semibold text-slate-900 dark:text-slate-200">{email}</span>
                </p>
              </div>

              
              <div className="pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsSubmitted(false)}
                  className="w-full border-slate-200 dark:border-slate-800 h-11 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Didn&apos;t receive the email? Try again
                </Button>
              </div>

              <p className="text-xs text-slate-400">
                Please check your spam folder if you don&apos;t see it in your inbox.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}