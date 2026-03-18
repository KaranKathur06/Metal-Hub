import ComingSoonPage from "@/components/coming-soon/ComingSoonPage"
import { comingSoonRoutes } from "@/config/comingSoonRoutes"

export const metadata = {
  title: "Analytics Dashboard | MetalHub",
}

export default function AnalyticsComingSoon() {
  const config = comingSoonRoutes.find((r) => r.path === "/dashboard/analytics")
  
  return (
    <ComingSoonPage 
      featureName={config?.featureName || "Analytics"} 
      description={config?.description} 
      backLink="/dashboard/seller"
    />
  )
}
