"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ApprovalLine from "@/components/ApprovalLine";
import { Document, FILTERS, FilterKey, User } from "@/lib/types";

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

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selected, setSelected] = useState<Document | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((data: User[]) => {
        setUsers(data);
        const saved = localStorage.getItem("currentUserId");
        setCurrentUserId(saved && data.some((u) => u.id === saved) ? saved : data[0]?.id ?? "");
      });
  }, []);

  useEffect(() => {
    if (currentUserId) localStorage.setItem("currentUserId", currentUserId);
  }, [currentUserId]);

  const loadDocuments = () => {
    if (!currentUserId) return;
    setLoading(true);
    fetch(`/api/documents?userId=${currentUserId}&filter=${encodeURIComponent(filter)}`)
      .then((r) => r.json())
      .then((data) => setDocuments(data))
      .finally(() => setLoading(false));
  };

  useEffect(loadDocuments, [currentUserId, filter]);

  const decide = async (decision: "approve" | "reject") => {
    if (!selected) return;
    const res = await fetch(`/api/documents/${selected.id}/decide`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUserId, decision, comment }),
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

  const myPendingStep = selected?.steps.find((s) => s.status === "PENDING" && s.approver.id === currentUserId);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-medium">전자결재 시스템</h1>
        <select
          className="border border-gray-300 rounded-md text-sm px-3 py-1.5 bg-white"
          value={currentUserId}
          onChange={(e) => setCurrentUserId(e.target.value)}
        >
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.role})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-[180px_1fr] gap-0 bg-white rounded-xl border border-gray-200 overflow-hidden min-h-[520px]">
        <div className="bg-gray-50 border-r border-gray-200 p-3">
          <Link
            href="/new"
            className="w-full mb-4 flex items-center justify-center gap-1.5 bg-navy text-white text-sm rounded-md py-2 hover:opacity-90"
          >
            + 새 기안
          </Link>
          <nav className="flex flex-col gap-1">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => {
                  setFilter(f.key);
                  setSelected(null);
                }}
                className={`text-left text-sm px-3 py-2 rounded-md ${
                  filter === f.key ? "bg-white font-medium shadow-sm" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {f.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-5">
          {!selected ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <span className="text-base font-medium">
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
                      <div className="text-sm font-medium">{d.title}</div>
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
                <span className="text-base font-medium">{selected.title}</span>
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
                <div className="text-sm leading-relaxed whitespace-pre-wrap">{selected.content}</div>
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
    </div>
  );
}
