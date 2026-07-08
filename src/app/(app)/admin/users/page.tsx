"use client";

import { useEffect, useState } from "react";
import { AdminUser } from "@/lib/types";

const ROLE_OPTIONS = ["사원", "팀장", "부서장", "대표"];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", username: "", password: "", role: ROLE_OPTIONS[0] });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const submit = async () => {
    setError("");
    if (!form.name || !form.email || !form.username || !form.password) {
      setError("모든 항목을 입력해주세요.");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSubmitting(false);
    if (res.ok) {
      setForm({ name: "", email: "", username: "", password: "", role: ROLE_OPTIONS[0] });
      load();
    } else {
      const data = await res.json();
      setError(data.error ?? "등록 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-lg font-medium mb-5 text-gray-800">사용자 관리</h1>

      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5">
        <p className="text-sm font-medium text-gray-700 mb-3">새 직원 계정 등록</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input
            className="border border-gray-300 rounded-md text-sm px-3 py-2"
            placeholder="이름"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <select
            className="border border-gray-300 rounded-md text-sm px-3 py-2"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <input
            className="border border-gray-300 rounded-md text-sm px-3 py-2"
            placeholder="이메일"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="border border-gray-300 rounded-md text-sm px-3 py-2"
            placeholder="로그인 아이디"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          <input
            type="password"
            className="border border-gray-300 rounded-md text-sm px-3 py-2 col-span-2"
            placeholder="초기 비밀번호"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
        <button
          onClick={submit}
          disabled={submitting}
          className="bg-slate-800 text-white text-sm rounded-md px-4 py-2 hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "등록 중..." : "계정 등록"}
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_100px_90px] gap-2 px-4 py-2.5 bg-gray-50 text-xs text-gray-500 font-medium border-b border-gray-200">
          <span>이름 / 아이디</span>
          <span>이메일</span>
          <span>역할</span>
          <span>권한</span>
        </div>
        {loading && <div className="text-center text-sm text-gray-400 py-8">불러오는 중...</div>}
        {!loading &&
          users.map((u) => (
            <div key={u.id} className="grid grid-cols-[1fr_1fr_100px_90px] gap-2 px-4 py-3 border-b border-gray-100 text-sm items-center">
              <span>
                {u.name} <span className="text-gray-400 text-xs">({u.username})</span>
              </span>
              <span className="text-gray-600">{u.email}</span>
              <span className="text-gray-600">{u.role}</span>
              <span
                className={
                  u.permission === "ADMIN"
                    ? "text-red-700 font-medium"
                    : u.permission === "MANAGER"
                    ? "text-teal-700 font-medium"
                    : "text-gray-400"
                }
              >
                {u.permission === "ADMIN" ? "admin" : u.permission === "MANAGER" ? "관리자" : "사용자"}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
