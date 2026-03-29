import { redirect } from 'next/navigation';

export default function SuppliersPage() {
  redirect('/marketplace?type=suppliers');
}
