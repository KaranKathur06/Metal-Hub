import ComingSoonPage from "@/components/coming-soon/ComingSoonPage"
import { comingSoonRoutes } from "@/config/comingSoonRoutes"

export const metadata = {
  title: "Careers Hub | MetalHub",
}

export default function CareersComingSoon() {
  const config = comingSoonRoutes.find((r) => r.path === "/careers")
  
  return (
    <ComingSoonPage 
      featureName={config?.featureName || "Careers Hub"} 
      description={config?.description} 
      backLink="/"
    />
  )
}
