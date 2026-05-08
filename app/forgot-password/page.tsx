"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, Loader2, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth/AuthProvider"

export default function ForgotPasswordPage() {
  const { supabase } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) { setError("Auth service unavailable."); return }
    setIsLoading(true); setError(null)

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (resetError) { setError(resetError.message); return }
      setSuccess(true)
    } catch (err: any) {
      setError(err?.message || "Failed to send reset email")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8fafc] p-6">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="h-10 w-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-3">Check Your Email</h1>
          <p className="text-sm text-slate-600 mb-8">
            We&apos;ve sent a password reset link to <strong className="text-slate-900">{email}</strong>. Click the link in the email to reset your password.
          </p>
          <Link href="/login"><Button variant="outline" className="font-semibold">Back to Login</Button></Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen items-center justify-center bg-[#f8fafc] p-6">
      <div className="w-full max-w-md">
        <Link href="/login" className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Back to login
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Reset Password</h1>
        <p className="text-sm text-slate-500 mb-6">Enter your email address and we&apos;ll send you a link to reset your password.</p>

        <div className="bg-white rounded-[15px] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-[#e5e7eb]">
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input id="reset-email" type="email" placeholder="Email Address" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9 h-[42px] rounded-xl border-[#e5e7eb] text-sm focus:border-[#3b82f6] shadow-none" disabled={isLoading} />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full h-[44px] text-sm font-bold text-white rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] shadow-md">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Send Reset Link
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
