"use client"

import { useState } from "react"
import Link from "next/link"
import { Bell, ArrowLeft, Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ComingSoonPageProps {
  featureName: string
  description?: string
  backLink?: string
}

export default function ComingSoonPage({ 
  featureName, 
  description = "We are currently building this feature to bring you a more powerful and seamless experience on MetalHub. Join the waitlist to receive priority access the moment we launch.", 
  backLink = "/" 
}: ComingSoonPageProps) {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus("loading")
    
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, feature: featureName }),
      })
      
      if (!res.ok) throw new Error("Failed to subscribe")
      setStatus("success")
      setEmail("")
    } catch {
      setStatus("error")
    }
  }

  return (
    <div className="flex min-h-[90vh] w-full flex-col items-center justify-center bg-[#0a0f1c] relative overflow-hidden px-6 py-20">
      
      {/* Dynamic Background Assets */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-5 mix-blend-screen pointer-events-none" 
        style={{ backgroundImage: "url('/placeholder-metal.jpg')" }} 
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#1e3a8a]/20 via-[#0a0f1c]/90 to-[#0a0f1c]" />
      
      {/* Decorative Aurora Glow */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container Layering */}
      <div className="relative z-10 flex w-full max-w-[680px] flex-col rounded-[24px] border border-white/5 bg-slate-900/40 p-10 backdrop-blur-2xl shadow-2xl animate-in zoom-in-95 duration-700 fade-in slide-in-from-bottom-8">
        
        <Link 
          href={backLink} 
          className="mb-10 inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> 
          Return to platform
        </Link>
        
        <div className="mb-6 inline-flex w-fit items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-[13px] font-bold tracking-wide uppercase text-blue-300 drop-shadow-md">
          <Sparkles className="mr-2 h-4 w-4 text-blue-400" />
          Under Construction
        </div>

        <h1 className="mb-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl">
          {featureName}
        </h1>
        
        <p className="mb-10 max-w-[540px] text-lg leading-relaxed text-slate-300">
          {description}
        </p>

        {/* Action Waitlist Form Overlay */}
        <form onSubmit={handleSubmit} className="relative w-full max-w-[480px]">
          <div className="flex flex-col gap-3 sm:flex-row shadow-[0_15px_30px_rgba(0,0,0,0.1)]">
            <div className="relative flex-1">
              <Bell className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <Input
                type="email"
                placeholder="Enter work email..."
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (status === "error") setStatus("idle")
                }}
                disabled={status === "loading" || status === "success"}
                className="h-14 w-full rounded-xl border-slate-700 bg-slate-900/60 pl-12 text-base text-white placeholder:text-slate-500 focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500 shadow-inner"
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={status === "loading" || status === "success"}
              className="h-14 rounded-xl bg-[#3b82f6] px-8 text-base font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-[#2563eb] disabled:cursor-not-allowed disabled:bg-slate-800 disabled:opacity-100 disabled:hover:translate-y-0"
            >
              {status === "loading" ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : status === "success" ? (
                "Waitlisted!"
              ) : (
                "Notify Me"
              )}
            </Button>
          </div>
          
          <div className="h-8 pt-3 pl-2">
            {status === "error" && (
              <p className="text-sm font-semibold text-red-400 animate-in fade-in">
                Waitlist server busy. Please verify connection and retry.
              </p>
            )}
            {status === "success" && (
              <p className="text-sm font-semibold text-emerald-400 animate-in fade-in slide-in-from-bottom-2">
                Thank you! We&apos;ll sequence you into our early-access pipeline.
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
