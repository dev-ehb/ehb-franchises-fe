"use client";

import { PssApprovalsPanel } from "@/components/pss-approvals/pss-approvals-panel";

export default function PssApprovalsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">PSS Approvals</h1>
        <p className="text-sm text-gray-500">Review and decide PSS approval requests for your territory.</p>
      </div>
      <PssApprovalsPanel readOnly={false} />
    </div>
  );
}
