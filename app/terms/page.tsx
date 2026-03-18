import ComingSoonPage from "@/components/coming-soon/ComingSoonPage"
import { comingSoonRoutes } from "@/config/comingSoonRoutes"

export const metadata = {
  title: "Terms of Service | MetalHub",
}

export default function TermsComingSoon() {
  const config = comingSoonRoutes.find((r) => r.path === "/terms")
  
  return (
    <ComingSoonPage 
      featureName={config?.featureName || "Terms of Service"} 
      description={config?.description} 
      backLink="/"
    />
  )
}
