import ComingSoonPage from "@/components/coming-soon/ComingSoonPage"
import { comingSoonRoutes } from "@/config/comingSoonRoutes"

export const metadata = {
  title: "Refund Policy | MetalHub",
}

export default function RefundComingSoon() {
  const config = comingSoonRoutes.find((r) => r.path === "/refund")
  
  return (
    <ComingSoonPage 
      featureName={config?.featureName || "Global Refund Policy"} 
      description={config?.description} 
      backLink="/"
    />
  )
}
