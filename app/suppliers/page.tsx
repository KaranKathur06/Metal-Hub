import { redirect } from 'next/navigation';

export default function SuppliersPage() {
  redirect('/marketplace?tab=suppliers');
}
