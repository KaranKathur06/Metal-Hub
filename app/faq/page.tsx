import ComingSoonPage from "@/components/coming-soon/ComingSoonPage"
import { comingSoonRoutes } from "@/config/comingSoonRoutes"

export const metadata = {
  title: "FAQ | MetalHub",
}

export default function FAQComingSoon() {
  const config = comingSoonRoutes.find((r) => r.path === "/faq")
  
  return (
    <ComingSoonPage 
      featureName={config?.featureName || "FAQ Portal"} 
      description={config?.description} 
      backLink="/"
    />
  )
}
