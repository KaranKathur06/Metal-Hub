import ComingSoonPage from "@/components/coming-soon/ComingSoonPage"
import { comingSoonRoutes } from "@/config/comingSoonRoutes"

export const metadata = {
  title: "Contact Us | MetalHub",
}

export default function ContactComingSoon() {
  const config = comingSoonRoutes.find((r) => r.path === "/contact")
  
  return (
    <ComingSoonPage 
      featureName={config?.featureName || "Contact Support Portal"} 
      description={config?.description} 
      backLink="/"
    />
  )
}
