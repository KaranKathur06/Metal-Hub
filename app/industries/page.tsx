import ComingSoonPage from "@/components/coming-soon/ComingSoonPage"
import { comingSoonRoutes } from "@/config/comingSoonRoutes"

export const metadata = {
  title: "Industry Specific Sourcing | MetalHub",
}

export default function IndustriesComingSoon() {
  const config = comingSoonRoutes.find((r) => r.path === "/industries")
  
  return (
    <ComingSoonPage 
      featureName={config?.featureName || "Industry Portals"} 
      description={config?.description} 
      backLink="/"
    />
  )
}
