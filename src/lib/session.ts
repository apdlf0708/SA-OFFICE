import { cookies } from "next/headers";

// 참고: 학습/데모용 MVP라서 쿠키에 서명(HMAC)을 하지 않은 단순 base64 방식입니다.
// 실제 서비스로 전환할 때는 NextAuth.js 또는 서명된 JWT로 교체하는 것을 추천합니다.

export const SESSION_COOKIE = "sa_office_session";

export type Permission = "ADMIN" | "MANAGER" | "USER";

export type SessionUser = {
  id: string;
  name: string;
  role: string;
  permission: Permission;
};

export function encodeSession(user: SessionUser): string {
  return Buffer.from(JSON.stringify(user)).toString("base64url");
}

export function decodeSession(value: string): SessionUser | null {
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf-8"));
    if (parsed && typeof parsed.id === "string") return parsed as SessionUser;
    return null;
  } catch {
    return null;
  }
}

// 서버 컴포넌트/라우트 핸들러에서 현재 로그인한 사용자 정보를 읽을 때 사용
export function getSessionUser(): SessionUser | null {
  const value = cookies().get(SESSION_COOKIE)?.value;
  if (!value) return null;
  return decodeSession(value);
}
