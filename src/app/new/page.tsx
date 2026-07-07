"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/lib/types";

const DOC_TYPES = ["인사", "회계", "총무", "구매", "기타"];

export default function NewDocument() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [requesterId, setRequesterId] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState(DOC_TYPES[0]);
  const [content, setContent] = useState("");
  const [approverIds, setApproverIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((data: User[]) => {
        setUsers(data);
        const saved = localStorage.getItem("currentUserId");
        setRequesterId(saved && data.some((u) => u.id === saved) ? saved : data[0]?.id ?? "");
      });
  }, []);

  const addApprover = (id: string) => {
    if (!id || approverIds.includes(id)) return;
    setApproverIds([...approverIds, id]);
  };
  const removeApprover = (id: string) => setApproverIds(approverIds.filter((a) => a !== id));

  const submit = async () => {
    if (!title || !content || approverIds.length === 0) {
      alert("제목, 내용, 결재선을 모두 입력해주세요.");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, type, content, requesterId, approverIds }),
    });
    setSubmitting(false);
    if (res.ok) {
      router.push("/");
    } else {
      const err = await res.json();
      alert(err.error ?? "기안 등록 중 오류가 발생했습니다.");
    }
  };

  const userName = (id: string) => users.find((u) => u.id === id)?.name ?? "";

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-lg font-medium mb-6">새 결재 문서 기안</h1>

      <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-4">
        <div>
          <label className="text-xs text-gray-500 block mb-1">기안자</label>
          <select
            className="w-full border border-gray-300 rounded-md text-sm px-3 py-2"
            value={requesterId}
            onChange={(e) => setRequesterId(e.target.value)}
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">문서 종류</label>
          <select
            className="w-full border border-gray-300 rounded-md text-sm px-3 py-2"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {DOC_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">제목</label>
          <input
            className="w-full border border-gray-300 rounded-md text-sm px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 연차 휴가 신청서"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">내용</label>
          <textarea
            className="w-full border border-gray-300 rounded-md text-sm px-3 py-2"
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="결재 요청 내용을 입력하세요"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">결재선 (승인 순서대로 추가)</label>
          <select
            className="w-full border border-gray-300 rounded-md text-sm px-3 py-2 mb-2"
            value=""
            onChange={(e) => addApprover(e.target.value)}
          >
            <option value="">결재자 추가...</option>
            {users
              .filter((u) => !approverIds.includes(u.id))
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
          </select>
          {approverIds.length > 0 && (
            <ol className="flex flex-col gap-1.5">
              {approverIds.map((id, i) => (
                <li key={id} className="flex items-center gap-2 text-sm bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5">
                  <span className="text-gray-400">{i + 1}.</span>
                  <span className="flex-1">{userName(id)}</span>
                  <button onClick={() => removeApprover(id)} className="text-gray-400 hover:text-red-600 text-xs">
                    삭제
                  </button>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="flex gap-2 mt-2">
          <button
            onClick={submit}
            disabled={submitting}
            className="bg-navy text-white text-sm rounded-md px-4 py-2 hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "제출 중..." : "상신하기"}
          </button>
          <button onClick={() => router.push("/")} className="text-sm text-gray-500 px-4 py-2">
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
