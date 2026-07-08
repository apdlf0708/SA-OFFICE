"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const APPROVAL_SUBMENU = [
  { label: "전체", href: "/approval?filter=all" },
  { label: "기안함", href: "/approval?filter=기안함" },
  { label: "결재함", href: "/approval?filter=결재함" },
  { label: "진행함", href: "/approval?filter=진행중" },
  { label: "완료함", href: "/approval?filter=완료" },
  { label: "반려함", href: "/approval?filter=반려" },
  { label: "+ 새 기안", href: "/approval/new" },
];

type Permission = "ADMIN" | "MANAGER" | "USER";

export default function Sidebar() {
  const pathname = usePathname();
  const isApprovalActive = pathname.startsWith("/approval");
  const isAdminActive = pathname.startsWith("/admin");
  const [approvalOpen, setApprovalOpen] = useState(isApprovalActive);
  const [adminOpen, setAdminOpen] = useState(isAdminActive);
  const [permission, setPermission] = useState<Permission>("USER");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setPermission(data?.permission ?? "USER"))
      .catch(() => setPermission("USER"));
  }, []);

  const canSeeAdminMenu = permission === "ADMIN" || permission === "MANAGER";
  const isFullAdmin = permission === "ADMIN";

  const adminSubmenu = [
    ...(isFullAdmin ? [{ label: "사용자", href: "/admin/users" }, { label: "프로젝트", href: "/admin/projects" }] : []),
    { label: "권한", href: "/admin/permissions" },
  ];

  const mainItemClass = (active: boolean) =>
    `w-full text-left px-4 py-2.5 text-sm rounded-md flex items-center justify-between ${
      active ? "bg-slate-800 text-white font-medium" : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <aside className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col">
      <div className="h-14 flex items-center px-4 border-b border-gray-200">
        <Link href="/" className="text-base font-semibold tracking-tight text-slate-800">
          SA-OFFICE
        </Link>
      </div>
      <nav className="flex-1 p-3 flex flex-col gap-1">
        <Link href="/notices" className={mainItemClass(pathname.startsWith("/notices"))}>
          공지사항
        </Link>
        <Link href="/board" className={mainItemClass(pathname.startsWith("/board"))}>
          게시판
        </Link>

        <button onClick={() => setApprovalOpen(!approvalOpen)} className={mainItemClass(isApprovalActive && !approvalOpen)}>
          <span>전자결재</span>
          <span className="text-xs text-gray-400">{approvalOpen ? "▾" : "▸"}</span>
        </button>
        {approvalOpen && (
          <div className="ml-2 flex flex-col gap-0.5 border-l border-gray-200 pl-3 mb-1">
            {APPROVAL_SUBMENU.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm px-3 py-1.5 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900">
                {item.label}
              </Link>
            ))}
          </div>
        )}

        {canSeeAdminMenu && (
          <>
            <button onClick={() => setAdminOpen(!adminOpen)} className={mainItemClass(isAdminActive && !adminOpen)}>
              <span>관리</span>
              <span className="text-xs text-gray-400">{adminOpen ? "▾" : "▸"}</span>
            </button>
            {adminOpen && (
              <div className="ml-2 flex flex-col gap-0.5 border-l border-gray-200 pl-3 mb-1">
                {adminSubmenu.map((item) => (
                  <Link key={item.href} href={item.href} className="text-sm px-3 py-1.5 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900">
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </nav>
    </aside>
  );
}
