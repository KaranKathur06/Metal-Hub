import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewRfqPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = new URLSearchParams();

  const supplier = params.supplier;
  if (typeof supplier === "string" && supplier) {
    query.set("supplier", supplier);
  }

  const category = params.category;
  if (typeof category === "string" && category) {
    query.set("category", category);
  }

  const suffix = query.toString();
  redirect(suffix ? `/post-requirement?${suffix}` : "/post-requirement");
}
