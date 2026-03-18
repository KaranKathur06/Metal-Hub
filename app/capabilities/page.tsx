import ComingSoonPage from "@/components/coming-soon/ComingSoonPage"
import { comingSoonRoutes } from "@/config/comingSoonRoutes"

export const metadata = {
  title: "Advanced Capabilities Sourcing | MetalHub",
}

export default function CapabilitiesComingSoon() {
  const config = comingSoonRoutes.find((r) => r.path === "/capabilities")
  
  return (
    <ComingSoonPage 
      featureName={config?.featureName || "Advanced Capabilities"} 
      description={config?.description} 
      backLink="/"
    />
  )
}
