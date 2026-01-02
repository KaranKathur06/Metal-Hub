import ListingDetailClient from "./ListingDetailClient"

export function generateStaticParams() {
  return [{ id: "1" }, { id: "2" }, { id: "3" }, { id: "4" }, { id: "5" }]
}

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  return <ListingDetailClient id={params.id} />
}