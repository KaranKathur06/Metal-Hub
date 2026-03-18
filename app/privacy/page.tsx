import ComingSoonPage from "@/components/coming-soon/ComingSoonPage"
import { comingSoonRoutes } from "@/config/comingSoonRoutes"

export const metadata = {
  title: "Privacy Policy | MetalHub",
}

export default function PrivacyComingSoon() {
  const config = comingSoonRoutes.find((r) => r.path === "/privacy")
  
  return (
    <ComingSoonPage 
      featureName={config?.featureName || "Privacy Policy Center"} 
      description={config?.description} 
      backLink="/"
    />
  )
}
