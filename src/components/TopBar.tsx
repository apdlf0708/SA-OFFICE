"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Me = { id: string; name: string; role: string; permission: "ADMIN" | "MANAGER" | "USER" };

export default function TopBar() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then(setMe)
      .catch(() => setMe(null));
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-end px-5 gap-3">
      {me && (
        <span className="text-sm text-gray-600">
          {me.name} <span className="text-gray-400">({me.role})</span>
        </span>
      )}
      <button onClick={logout} className="text-xs text-gray-500 border border-gray-300 rounded-md px-3 py-1.5 hover:bg-gray-100">
        로그아웃
      </button>
    </header>
  );
}
