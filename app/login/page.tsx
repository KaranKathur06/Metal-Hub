"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, Lock, Loader2, CheckCircle, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [method, setMethod] = useState<"email" | "otp">("email")
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    phone: "",
    otp: "",
  })
  const [otpSent, setOtpSent] = useState(false)

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      router.push("/dashboard/seller")
    }, 1000)
  }

  const handleOtpRequest = async () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setOtpSent(true)
    }, 1000)
  }

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      router.push("/dashboard/seller")
    }, 1000)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
      {/* LEFT SIDE: Brand & Trust */}
      <div
        className="hidden lg:flex flex-col justify-center w-[58%] text-white p-12 relative"
        style={{ background: "linear-gradient(135deg, #1e3a8a, #0f172a)" }}
      >
        <div className="absolute inset-0 z-0 bg-cover bg-center mix-blend-overlay opacity-5 pointer-events-none" style={{ backgroundImage: "url('/placeholder-metal.jpg')" }} />

        <div className="relative z-10 flex flex-col items-start -mt-20">
          <Link href="/" className="inline-block text-3xl font-extrabold tracking-tight mb-8 hover:opacity-90 transition-opacity">
            MetalHub
          </Link>
          <h1 className="text-4xl font-bold mb-6 leading-tight tracking-tight">
            India&apos;s Trusted<br />Metal Marketplace
          </h1>

          <ul className="space-y-4 text-slate-200">
            <li className="flex items-center text-lg gap-3 font-medium">
              <CheckCircle className="h-5 w-5 text-blue-400 shrink-0" />
              10K+ Verified Businesses
            </li>
            <li className="flex items-center text-lg gap-3 font-medium">
              <CheckCircle className="h-5 w-5 text-blue-400 shrink-0" />
              Instant Quotes
            </li>
            <li className="flex items-center text-lg gap-3 font-medium">
              <CheckCircle className="h-5 w-5 text-blue-400 shrink-0" />
              Secure Deals
            </li>
          </ul>
        </div>
      </div>

      {/* RIGHT SIDE: Auth Form */}
      <div className="flex-1 flex flex-col items-center justify-start pt-16 p-6 relative w-full">
        {/* Mobile Header Link */}
        <div className="absolute top-5 left-6 lg:hidden">
          <Link href="/" className="text-xl font-bold text-slate-900">MetalHub</Link>
        </div>

        <div className="w-full max-w-[450px]">
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Login to MetalHub</h2>
          </div>

          <div className="bg-white rounded-[15px] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-[#e5e7eb]">
            {/* OAuth Buttons - INLINE */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Button
                variant="outline"
                type="button"
                className="w-full h-[44px] bg-white text-slate-700 border-[#e5e7eb] rounded-xl font-semibold shadow-sm hover:bg-slate-50 transition-all text-sm px-0"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </Button>
              <Button
                type="button"
                className="w-full h-[44px] bg-[#111827] text-white hover:bg-black rounded-xl font-semibold shadow-sm transition-all text-sm px-0"
              >
                <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                Apple
              </Button>
            </div>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#e5e7eb]" /></div>
              <div className="relative flex justify-center text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                <span className="bg-white px-3">Or continue with</span>
              </div>
            </div>

            {/* Method Toggle */}
            <div className="flex p-1 bg-[#f1f5f9] rounded-xl gap-1 mb-5">
              <button
                type="button"
                onClick={() => { setMethod("email"); setOtpSent(false) }}
                className={cn(
                  "flex-1 py-1.5 text-xs font-semibold rounded-[10px] transition-all",
                  method === "email" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                )}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => { setMethod("otp"); setOtpSent(false) }}
                className={cn(
                  "flex-1 py-1.5 text-xs font-semibold rounded-[10px] transition-all",
                  method === "otp" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                )}
              >
                WhatsApp OTP
              </button>
            </div>

            {/* Form Fields */}
            {method === "email" ? (
              <form onSubmit={handleEmailLogin} className="flex flex-col gap-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email Address"
                    required
                    autoFocus
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-9 h-[42px] rounded-xl border-[#e5e7eb] text-sm focus:border-[#3b82f6] shadow-none"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-9 pr-9 h-[42px] rounded-xl border-[#e5e7eb] text-sm focus:border-[#3b82f6] shadow-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                <div className="flex justify-end -mt-1 mb-1">
                  <Link href="/forgot-password" className="text-xs font-semibold text-blue-600 hover:text-blue-800">
                    Forgot password?
                  </Link>
                </div>

                <Button type="submit" className="w-full h-[44px] text-sm font-bold text-white rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] shadow-md hover:-translate-y-[1px] transition-transform">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Login
                </Button>
              </form>
            ) : (
              <form onSubmit={otpSent ? handleOtpLogin : handleOtpRequest} className="flex flex-col gap-3">
                {!otpSent ? (
                  <>
                    <Input
                      id="phone"
                      type="tel"
                      autoFocus
                      placeholder="+91 Mobile Number"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="h-[42px] rounded-xl border-[#e5e7eb] text-sm focus:border-[#3b82f6] shadow-none"
                    />
                    <Button type="submit" className="w-full h-[44px] text-sm font-bold text-white rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] shadow-md hover:-translate-y-[1px] transition-transform">
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Send WhatsApp OTP
                    </Button>
                  </>
                ) : (
                  <>
                    <Input
                      id="otp"
                      type="text"
                      autoFocus
                      placeholder="Enter 6-digit OTP"
                      required
                      maxLength={6}
                      value={formData.otp}
                      onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                      className="h-[42px] rounded-xl border-[#e5e7eb] text-center tracking-[0.2em] font-mono focus:border-[#3b82f6] shadow-none"
                    />
                    <Button type="submit" className="w-full h-[44px] text-sm font-bold text-white rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] shadow-md hover:-translate-y-[1px] transition-transform">
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Verify OTP
                    </Button>
                    <button type="button" onClick={() => setOtpSent(false)} className="text-xs font-semibold text-slate-500 hover:text-slate-800 mt-1">
                      Change Number
                    </button>
                  </>
                )}
              </form>
            )}

            <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs font-medium text-slate-600">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-blue-600 font-bold hover:underline">
                Register securely
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
