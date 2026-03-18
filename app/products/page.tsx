import ComingSoonPage from "@/components/coming-soon/ComingSoonPage"
import { comingSoonRoutes } from "@/config/comingSoonRoutes"

export const metadata = {
  title: "Products Catalog | MetalHub",
}

export default function ProductsComingSoon() {
  const config = comingSoonRoutes.find((r) => r.path === "/products")
  
  return (
    <ComingSoonPage 
      featureName={config?.featureName || "Category Products Index"} 
      description={config?.description} 
      backLink="/"
    />
  )
}
