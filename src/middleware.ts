import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "sa_office_session";

// Edge 런타임에서는 Buffer 대신 atob를 사용해 가볍게 디코딩합니다.
function decodeSession(value: string): { id: string; permission: "ADMIN" | "MANAGER" | "USER" } | null {
  try {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(escape(atob(base64)));
    const parsed = JSON.parse(json);
    if (parsed && typeof parsed.id === "string") return parsed;
    return null;
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 인증 관련 API는 항상 통과
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(SESSION_COOKIE)?.value;
  const session = cookie ? decodeSession(cookie) : null;

  if (pathname === "/login") {
    if (session) return NextResponse.redirect(new URL("/", req.url));
    return NextResponse.next();
  }

  if (!session) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin")) {
    // "권한" 메뉴는 admin과 관리자(MANAGER) 둘 다 접근 가능, 나머지(사용자/프로젝트)는 admin 전용
    const isPermissionsPage = pathname.startsWith("/admin/permissions");
    const allowed = isPermissionsPage
      ? session.permission === "ADMIN" || session.permission === "MANAGER"
      : session.permission === "ADMIN";
    if (!allowed) return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
