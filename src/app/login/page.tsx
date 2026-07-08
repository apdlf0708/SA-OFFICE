"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "로그인에 실패했습니다.");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* 왼쪽 이미지 영역 */}
      <div className="hidden md:flex w-1/2 bg-slate-800 items-center justify-center relative overflow-hidden">
        <svg viewBox="0 0 480 480" className="w-3/4 max-w-sm relative z-10" xmlns="http://www.w3.org/2000/svg">
          <circle cx="240" cy="240" r="200" fill="#0f172a" opacity="0.4" />
          <rect x="120" y="180" width="90" height="140" rx="8" fill="#14b8a6" opacity="0.85" />
          <rect x="230" y="120" width="90" height="200" rx="8" fill="#f8fafc" opacity="0.95" />
          <rect x="340" y="200" width="70" height="120" rx="8" fill="#f59e0b" opacity="0.85" />
          <circle cx="275" cy="90" r="26" fill="#f8fafc" />
          <rect x="245" y="150" width="60" height="10" rx="5" fill="#94a3b8" />
          <rect x="245" y="170" width="40" height="10" rx="5" fill="#94a3b8" />
          <rect x="140" y="210" width="50" height="8" rx="4" fill="#f8fafc" opacity="0.6" />
          <rect x="140" y="228" width="35" height="8" rx="4" fill="#f8fafc" opacity="0.6" />
        </svg>
        <div className="absolute bottom-12 left-0 right-0 text-center z-10">
          <p className="text-white text-lg font-semibold tracking-tight">SA-OFFICE</p>
          <p className="text-slate-300 text-sm mt-1">우리 팀의 업무를 한 곳에서</p>
        </div>
      </div>

      {/* 오른쪽 로그인 폼 */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white px-6">
        <form onSubmit={submit} className="w-full max-w-sm">
          <h1 className="text-xl font-semibold text-gray-800 mb-1">로그인</h1>
          <p className="text-sm text-gray-400 mb-8">SA-OFFICE 계정으로 로그인하세요.</p>

          <label className="text-xs text-gray-500 block mb-1">아이디</label>
          <input
            className="w-full border border-gray-300 rounded-md text-sm px-3 py-2.5 mb-4"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="아이디를 입력하세요"
            autoFocus
          />

          <label className="text-xs text-gray-500 block mb-1">비밀번호</label>
          <input
            type="password"
            className="w-full border border-gray-300 rounded-md text-sm px-3 py-2.5 mb-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
          />

          {error && <p className="text-xs text-red-600 mb-3 mt-1">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-800 text-white text-sm rounded-md py-2.5 mt-4 hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>

          <p className="text-xs text-gray-400 mt-6 text-center">
            아이디/비밀번호를 모르신다면 관리자에게 문의하세요.
          </p>
        </form>
      </div>
    </div>
  );
}
