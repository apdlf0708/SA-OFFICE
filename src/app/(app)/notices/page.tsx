"use client";

import { useEffect, useState } from "react";

type Notice = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string; role: string };
};

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [canWrite, setCanWrite] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/notices")
      .then((r) => r.json())
      .then((data) => setNotices(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setCanWrite(data?.permission === "ADMIN" || data?.permission === "MANAGER"));
  }, []);

  const submit = async () => {
    if (!title || !content) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/notices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
    setSubmitting(false);
    if (res.ok) {
      setTitle("");
      setContent("");
      setShowForm(false);
      load();
    } else {
      const data = await res.json();
      alert(data.error ?? "등록 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-medium text-gray-800">공지사항</h1>
        {canWrite && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-slate-800 text-white text-sm rounded-md px-4 py-2 hover:opacity-90"
          >
            {showForm ? "취소" : "+ 새 공지 작성"}
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5">
          <input
            className="w-full border border-gray-300 rounded-md text-sm px-3 py-2 mb-3"
            placeholder="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="w-full border border-gray-300 rounded-md text-sm px-3 py-2 mb-3"
            rows={4}
            placeholder="내용"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button
            onClick={submit}
            disabled={submitting}
            className="bg-slate-800 text-white text-sm rounded-md px-4 py-2 hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "등록 중..." : "등록"}
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {loading && <div className="text-center text-sm text-gray-400 py-10">불러오는 중...</div>}
        {!loading && notices.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl min-h-[200px] flex items-center justify-center">
            <p className="text-sm text-gray-400">등록된 공지사항이 없습니다.</p>
          </div>
        )}
        {notices.map((n) => (
          <div key={n.id} className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-800">{n.title}</span>
              <span className="text-xs text-gray-400">
                {n.author.name} · {new Date(n.createdAt).toLocaleDateString("ko-KR")}
              </span>
            </div>
            <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{n.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
