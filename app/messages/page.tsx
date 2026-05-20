"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MessageInbox } from "@/components/marketplace/MessageInbox";

export default function MessagesPage() {
  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to dashboard
        </Link>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Messages</h1>
        <p className="mt-1 text-sm text-slate-600">
          Procurement conversations tied to your RFQs and quotes.
        </p>
      </div>

      <MessageInbox />
    </div>
  );
}
