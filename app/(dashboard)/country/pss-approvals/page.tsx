"use client";

import { PssApprovalsPanel } from "@/components/pss-approvals/pss-approvals-panel";

export default function PssApprovalsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">PSS Approvals</h1>
        <p className="text-sm text-gray-500">PSS approval requests across every sub-franchise in your country (read-only).</p>
      </div>
      <PssApprovalsPanel readOnly={true} />
    </div>
  );
}
