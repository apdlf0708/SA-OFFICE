"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ApprovalLine from "@/components/ApprovalLine";
import { Document, FILTERS, FilterKey } from "@/lib/types";

const statusBadge: Record<Document["status"], string> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-teal-100 text-teal-800",
  REJECTED: "bg-red-100 text-red-800",
};
const statusLabel: Record<Document["status"], string> = {
  PENDING: "진행중",
  APPROVED: "완료",
  REJECTED: "반려",
};

function ApprovalContent() {
  const searchParams = useSearchParams();
  const urlFilter = (searchParams.get("filter") as FilterKey) || "all";

  const [meId, setMeId] = useState<string>("");
  const [filter, setFilter] = useState<FilterKey>(urlFilter);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selected, setSelected] = useState<Document | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFilter(urlFilter);
    setSelected(null);
  }, [urlFilter]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setMeId(data?.id ?? ""));
  }, []);

  const loadDocuments = () => {
    setLoading(true);
    fetch(`/api/documents?filter=${encodeURIComponent(filter)}`)
      .then((r) => r.json())
      .then((data) => setDocuments(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(loadDocuments, [filter]);

  const decide = async (decision: "approve" | "reject") => {
    if (!selected) return;
    const res = await fetch(`/api/documents/${selected.id}/decide`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision, comment }),
    });
    if (res.ok) {
      const updated = await res.json();
      setSelected(updated);
      setComment("");
      loadDocuments();
    } else {
      const err = await res.json();
      alert(err.error ?? "처리 중 오류가 발생했습니다.");
    }
  };

  const myPendingStep = selected?.steps.find((s) => s.status === "PENDING" && s.approver.id === meId);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-lg font-medium mb-5 text-gray-800">전자결재</h1>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden min-h-[520px] p-5">
        {!selected ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-base font-medium text-gray-800">
                {FILTERS.find((f) => f.key === filter)?.label}
              </span>
              <span className="text-sm text-gray-400">{loading ? "불러오는 중..." : `${documents.length}건`}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {documents.length === 0 && !loading && (
                <div className="text-center text-sm text-gray-400 py-10">해당하는 문서가 없습니다.</div>
              )}
              {documents.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelected(d)}
                  className="flex items-center gap-3 border border-gray-200 rounded-md px-3 py-2.5 text-left hover:border-gray-300"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-800">{d.title}</div>
                    <div className="text-xs text-gray-500">
                      {d.requester.name} · {new Date(d.createdAt).toLocaleDateString("ko-KR")} · {d.type}
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full ${statusBadge[d.status]}`}>
                    {statusLabel[d.status]}
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div>
            <button onClick={() => setSelected(null)} className="text-sm text-gray-500 mb-4 flex items-center gap-1">
              ← 목록으로
            </button>
            <div className="flex items-center justify-between mb-1">
              <span className="text-base font-medium text-gray-800">{selected.title}</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full ${statusBadge[selected.status]}`}>
                {statusLabel[selected.status]}
              </span>
            </div>
            <div className="text-sm text-gray-500 mb-5">
              {selected.requester.name} 기안 · {new Date(selected.createdAt).toLocaleDateString("ko-KR")} ·{" "}
              {selected.type}
            </div>

            <ApprovalLine steps={selected.steps} />

            <div className="border-t border-gray-200 mt-5 pt-4">
              <div className="text-xs text-gray-400 mb-1.5">내용</div>
              <div className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">{selected.content}</div>
            </div>

            {myPendingStep && (
              <div className="border-t border-gray-200 mt-5 pt-4">
                <div className="text-xs text-gray-400 mb-1.5">결재 의견 (선택)</div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full border border-gray-300 rounded-md text-sm p-2 mb-3"
                  rows={2}
                  placeholder="의견을 입력하세요"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => decide("approve")}
                    className="bg-teal-700 text-white text-sm rounded-md px-4 py-2 hover:opacity-90"
                  >
                    승인
                  </button>
                  <button
                    onClick={() => decide("reject")}
                    className="bg-red-700 text-white text-sm rounded-md px-4 py-2 hover:opacity-90"
                  >
                    반려
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ApprovalPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-gray-400">불러오는 중...</div>}>
      <ApprovalContent />
    </Suspense>
  );
}
