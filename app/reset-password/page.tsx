"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Lock, Loader2, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth/AuthProvider"

export default function ResetPasswordPage() {
  const router = useRouter()
  const { supabase } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) { setError("Auth service unavailable."); return }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return }
    if (password !== confirmPassword) { setError("Passwords do not match"); return }

    setIsLoading(true); setError(null)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) { setError(updateError.message); return }
      setSuccess(true)
      setTimeout(() => router.push("/login"), 3000)
    } catch (err: any) {
      setError(err?.message || "Failed to reset password")
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
          <h1 className="text-2xl font-extrabold text-slate-900 mb-3">Password Updated</h1>
          <p className="text-sm text-slate-600 mb-6">Your password has been reset successfully. Redirecting to login...</p>
          <Link href="/login"><Button className="bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] text-white font-bold rounded-xl">Go to Login</Button></Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen items-center justify-center bg-[#f8fafc] p-6">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Set New Password</h1>
        <p className="text-sm text-slate-500 mb-6">Choose a strong password for your MetalHub account.</p>

        <div className="bg-white rounded-[15px] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-[#e5e7eb]">
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input type={showPassword ? "text" : "password"} placeholder="New Password" required value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9 pr-9 h-[42px] rounded-xl border-[#e5e7eb] text-sm" disabled={isLoading} />
              <button type="button" tabIndex={-1} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input type="password" placeholder="Confirm Password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-9 h-[42px] rounded-xl border-[#e5e7eb] text-sm" disabled={isLoading} />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full h-[44px] text-sm font-bold text-white rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] shadow-md">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Reset Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
