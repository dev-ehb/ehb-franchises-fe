"use client";

import { useState } from "react";
import {
  useGetPssApprovalsQuery,
  useGetPssApprovalDetailQuery,
  useDecidePssApprovalMutation,
} from "@/lib/store/api/franchises.api";

const ITEM_LABELS: Record<string, string> = {
  title: "Title", description: "Description", price: "Price", category: "Category",
  images: "Images", stock: "Stock", seller_id: "Seller", business_name: "Business name",
  business_category: "Business category", business_type: "Business type",
  cnic_front: "CNIC front", cnic_back: "CNIC back", facial: "Facial (selfie)",
};

function isImg(key: string, value: unknown): boolean {
  const s = String(value);
  return (
    /^data:image\//.test(s) ||
    (/^https?:\/\/\S+$/.test(s) && /(cnic|facial|selfie|photo|proof|image|logo)/i.test(key))
  );
}

type Mode = "approve" | "reject" | "changes_requested" | null;

export function PssApprovalsPanel({ readOnly }: { readOnly: boolean }) {
  const { data, isLoading, isError } = useGetPssApprovalsQuery();
  const [selected, setSelected] = useState<string | null>(null);
  const { data: detail } = useGetPssApprovalDetailQuery(selected ?? "", { skip: !selected });
  const [decide, { isLoading: deciding }] = useDecidePssApprovalMutation();

  const [mode, setMode] = useState<Mode>(null);
  const [sqLevel, setSqLevel] = useState("5");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [items, setItems] = useState<string[]>([]);
  const [err, setErr] = useState("");

  const canDecide = !readOnly && (data?.can_decide ?? false);

  const reset = () => { setMode(null); setReason(""); setMessage(""); setItems([]); setErr(""); };

  const submit = async () => {
    if (!selected || !mode) return;
    setErr("");
    const body: Record<string, unknown> = { decision: mode };
    if (mode === "approve") body.sq_level_assigned = Number(sqLevel);
    if (mode === "reject") { if (!reason.trim()) { setErr("Rejection reason required"); return; } body.rejection_reason = reason; }
    if (mode === "changes_requested") { if (!message.trim()) { setErr("Message required"); return; } body.review_message = message; body.requested_items = items; }
    try {
      await decide({ id: selected, body }).unwrap();
      setSelected(null); reset();
    } catch { setErr("Failed to submit decision"); }
  };

  if (isLoading) return <p className="text-sm text-gray-500">Loading…</p>;
  if (isError) return <p className="text-sm text-red-600">Could not load PSS approvals.</p>;

  const requests = data?.requests ?? [];
  const entityKeys = detail?.entity_data ? Object.keys(detail.entity_data) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* List */}
      <div className="space-y-2">
        <p className="text-xs text-gray-500">
          {requests.length} request{requests.length === 1 ? "" : "s"}
          {readOnly ? " (read-only — view across your franchises)" : ""}
        </p>
        {requests.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">
            No PSS requests assigned.
          </div>
        )}
        {requests.map((r) => (
          <button
            key={r.id}
            onClick={() => { setSelected(r.id); reset(); }}
            className={`w-full rounded-lg border p-3 text-left text-sm transition-colors ${
              selected === r.id ? "border-blue-500 bg-blue-50" : "border-gray-100 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium capitalize">{r.entity_type.replace(/_/g, " ")}</span>
              <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600 capitalize">
                {(r.status ?? "").replace(/_/g, " ")}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-gray-500">
              {r.platform_id} · {r.criteria_met}/{r.total_criteria} criteria · {new Date(r.created_at).toLocaleString()}
            </p>
          </button>
        ))}
      </div>

      {/* Detail + decision */}
      <div className="rounded-lg border border-gray-100 p-4">
        {!selected ? (
          <p className="text-sm text-gray-400">Select a request to view details.</p>
        ) : !detail ? (
          <p className="text-sm text-gray-500">Loading details…</p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold capitalize">{detail.entity_type.replace(/_/g, " ")}</h3>
              <span className="text-xs text-gray-500">Score: {detail.sq_score ?? "—"}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {entityKeys.map((k) => {
                const v = (detail.entity_data as Record<string, unknown>)[k];
                const img = isImg(k, v);
                return (
                  <div key={k} className={`rounded bg-gray-50 p-2 ${img ? "col-span-2" : ""}`}>
                    <span className="block text-[10px] uppercase text-gray-400">{ITEM_LABELS[k] ?? k}</span>
                    {img ? (
                      <a href={String(v)} target="_blank" rel="noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={String(v)} alt={k} className="mt-1 max-h-40 w-auto rounded border object-contain bg-white" />
                      </a>
                    ) : (
                      <span className="block break-all text-xs text-gray-800">{String(v)}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {!canDecide ? (
              <p className="rounded bg-gray-50 px-2 py-1.5 text-xs text-gray-500">
                Read-only — only the assigned sub-franchise can decide.
              </p>
            ) : (
              <div className="space-y-2 border-t border-gray-100 pt-3">
                <div className="grid grid-cols-3 gap-2">
                  {(["approve", "reject", "changes_requested"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`rounded-lg border px-2 py-1.5 text-xs font-medium ${
                        mode === m ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-100 hover:bg-gray-50"
                      }`}
                    >
                      {m === "changes_requested" ? "Request Changes" : m.charAt(0).toUpperCase() + m.slice(1)}
                    </button>
                  ))}
                </div>

                {mode === "approve" && (
                  <label className="block text-xs text-gray-600">
                    SQ level
                    <select value={sqLevel} onChange={(e) => setSqLevel(e.target.value)} className="mt-1 w-full rounded border px-2 py-1 text-sm">
                      {[1, 2, 3, 5, 7, 10].map((l) => <option key={l} value={l}>SQ{l}</option>)}
                    </select>
                  </label>
                )}
                {mode === "reject" && (
                  <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} placeholder="Reason for rejection…" className="w-full rounded border px-2 py-1 text-sm" />
                )}
                {mode === "changes_requested" && (
                  <div className="space-y-1.5">
                    <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2} placeholder="What should the seller fix?" className="w-full rounded border px-2 py-1 text-sm" />
                    <div className="grid grid-cols-2 gap-1">
                      {entityKeys.map((k) => (
                        <label key={k} className="flex items-center gap-1.5 rounded border px-1.5 py-1 text-[11px]">
                          <input
                            type="checkbox"
                            checked={items.includes(k)}
                            onChange={(e) => setItems(e.target.checked ? [...items, k] : items.filter((x) => x !== k))}
                          />
                          <span className="truncate">{ITEM_LABELS[k] ?? k}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {err && <p className="text-xs text-red-600">{err}</p>}

                {mode && (
                  <button onClick={submit} disabled={deciding} className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                    {deciding ? "Submitting…" : "Submit decision"}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
