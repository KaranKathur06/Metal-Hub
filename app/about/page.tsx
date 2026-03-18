import ComingSoonPage from "@/components/coming-soon/ComingSoonPage"
import { comingSoonRoutes } from "@/config/comingSoonRoutes"

export const metadata = {
  title: "About Us | MetalHub",
}

export default function AboutComingSoon() {
  const config = comingSoonRoutes.find((r) => r.path === "/about")
  
  return (
    <ComingSoonPage 
      featureName={config?.featureName || "About Us"} 
      description={config?.description} 
      backLink="/"
    />
  )
}
