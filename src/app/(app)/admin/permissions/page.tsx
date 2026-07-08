"use client";

import { useEffect, useState } from "react";
import { AdminUser, Permission } from "@/lib/types";

const PERMISSION_LABEL: Record<Permission, string> = { ADMIN: "admin", MANAGER: "관리자", USER: "사용자" };

export default function AdminPermissionsPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<{ id: string; permission: Permission } | null>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/users")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then(setMe);
  }, []);

  const changePermission = async (user: AdminUser, permission: Permission) => {
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ permission }),
    });
    if (res.ok) {
      load();
    } else {
      const data = await res.json();
      alert(data.error ?? "변경 중 오류가 발생했습니다.");
    }
  };

  const availableOptions = (target: AdminUser): Permission[] => {
    if (!me) return [];
    if (me.permission === "ADMIN") return ["USER", "MANAGER", "ADMIN"];
    // 관리자(MANAGER): admin 대상은 손댈 수 없고, admin 등급 부여도 불가
    if (target.permission === "ADMIN") return [];
    return ["USER", "MANAGER"];
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-lg font-medium mb-1 text-gray-800">권한 관리</h1>
      <p className="text-sm text-gray-400 mb-5">
        사용자 / 관리자(권한 부여·공지사항 작성) / admin(전체 기능) 3단계로 권한을 지정합니다.
      </p>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="grid grid-cols-[1fr_100px_160px] gap-2 px-4 py-2.5 bg-gray-50 text-xs text-gray-500 font-medium border-b border-gray-200">
          <span>이름 / 역할</span>
          <span>현재 권한</span>
          <span>변경</span>
        </div>
        {loading && <div className="text-center text-sm text-gray-400 py-8">불러오는 중...</div>}
        {!loading &&
          users.map((u) => {
            const options = availableOptions(u);
            const isSelf = me?.id === u.id;
            return (
              <div key={u.id} className="grid grid-cols-[1fr_100px_160px] gap-2 px-4 py-3 border-b border-gray-100 text-sm items-center">
                <span>
                  {u.name} <span className="text-gray-400 text-xs">({u.role})</span>
                </span>
                <span
                  className={
                    u.permission === "ADMIN"
                      ? "text-red-700 font-medium"
                      : u.permission === "MANAGER"
                      ? "text-teal-700 font-medium"
                      : "text-gray-400"
                  }
                >
                  {PERMISSION_LABEL[u.permission]}
                </span>
                {isSelf || options.length === 0 ? (
                  <span className="text-xs text-gray-300">변경 불가</span>
                ) : (
                  <select
                    className="text-xs border border-gray-300 rounded-md px-2 py-1.5"
                    value={u.permission}
                    onChange={(e) => changePermission(u, e.target.value as Permission)}
                  >
                    {[u.permission, ...options.filter((o) => o !== u.permission)].map((o) => (
                      <option key={o} value={o}>
                        {PERMISSION_LABEL[o]}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
