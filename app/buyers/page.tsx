import { redirect } from 'next/navigation';

export default function BuyersPage() {
  redirect('/marketplace?type=buyers');
}
