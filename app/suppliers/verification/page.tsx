import ComingSoonPage from "@/components/coming-soon/ComingSoonPage"
import { comingSoonRoutes } from "@/config/comingSoonRoutes"

export const metadata = {
  title: "Supplier Verification | MetalHub",
}

export default function VerificationComingSoon() {
  const config = comingSoonRoutes.find((r) => r.path === "/suppliers/verification")
  
  return (
    <ComingSoonPage 
      featureName={config?.featureName || "Verification Flow"} 
      description={config?.description} 
      backLink="/dashboard/seller"
    />
  )
}
