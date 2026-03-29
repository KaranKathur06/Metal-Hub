"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, Lock, User, Phone, Loader2, CheckCircle, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "buyer",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      if (formData.role === "buyer") {
        router.push("/marketplace")
      } else {
        router.push("/dashboard/seller")
      }
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
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative w-full overflow-y-auto lg:overflow-hidden">
        {/* Mobile Header Link */}
        <div className="absolute top-6 left-6 lg:hidden">
          <Link href="/" className="text-xl font-bold text-slate-900">MetalHub</Link>
        </div>

        <div className="w-full max-w-[470px] mt-10 lg:mt-0 pb-8 lg:pb-19">
          <div className="mb-4">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Account</h2>
          </div>

          <div className="bg-white rounded-[14px] p-5 shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-[#e5e7eb]">
            {/* OAuth Buttons - INLINE */}
            <div className="grid grid-cols-2 gap-3 mb-5">
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

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#e5e7eb]" /></div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <span className="bg-white px-2">OR REGISTER</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">

              {/* Profile Inputs */}
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="name"
                  autoFocus
                  placeholder="Full Company or Name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pl-9 h-[42px] rounded-xl border-[#e5e7eb] text-sm focus:border-[#3b82f6] shadow-none"
                  disabled={isLoading}
                />
              </div>

              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-9 h-[42px] rounded-xl border-[#e5e7eb] text-sm focus:border-[#3b82f6] shadow-none"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Phone"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="pl-9 h-[42px] rounded-xl border-[#e5e7eb] text-sm focus:border-[#3b82f6] shadow-none"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Segmented Control Role Selector */}
              <div className="mt-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">I AM A:</div>
                <div className="flex p-1 bg-[#f1f5f9] rounded-xl gap-1">
                  {[
                    { value: "buyer", label: "Buyer" },
                    { value: "seller", label: "Seller" },
                    { value: "both", label: "Both" },
                  ].map((role) => (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: role.value })}
                      disabled={isLoading}
                      className={cn(
                        "flex-1 py-1.5 text-xs font-semibold rounded-[10px] transition-all",
                        formData.role === role.value
                          ? "bg-[#1e3a8a] text-white shadow-sm pointer-events-none"
                          : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                      )}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Password Inputs */}
              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-9 pr-8 h-[42px] rounded-xl border-[#e5e7eb] text-sm focus:border-[#3b82f6] shadow-none"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="pl-9 pr-8 h-[42px] rounded-xl border-[#e5e7eb] text-sm focus:border-[#3b82f6] shadow-none"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full h-[44px] text-sm font-bold text-white rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] shadow-md hover:-translate-y-[1px] transition-transform mt-2" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-100 text-center text-xs font-medium text-slate-600">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 font-bold hover:underline">
                Login
              </Link>
            </div>

          </div>
        </div>
      </div >
    </div >
  )
}

