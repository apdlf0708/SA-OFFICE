import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

// PATCH { permission?: "ADMIN" | "MANAGER" | "USER" }
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const me = getSessionUser();
  if (!me) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  if (me.permission !== "ADMIN" && me.permission !== "MANAGER") {
    return NextResponse.json({ error: "권한 부여 권한이 없습니다." }, { status: 403 });
  }

  const { permission } = await req.json();
  if (!["ADMIN", "MANAGER", "USER"].includes(permission)) {
    return NextResponse.json({ error: "permission 값이 올바르지 않습니다." }, { status: 400 });
  }

  if (params.id === me.id) {
    return NextResponse.json({ error: "본인의 권한은 스스로 변경할 수 없습니다." }, { status: 400 });
  }

  // 관리자(MANAGER)는 admin을 부여할 수 없고, 이미 admin인 사용자의 권한도 바꿀 수 없음
  if (me.permission === "MANAGER") {
    if (permission === "ADMIN") {
      return NextResponse.json({ error: "admin 권한 부여는 admin만 할 수 있습니다." }, { status: 403 });
    }
    const target = await prisma.user.findUnique({ where: { id: params.id } });
    if (target?.permission === "ADMIN") {
      return NextResponse.json({ error: "admin 사용자의 권한은 admin만 변경할 수 있습니다." }, { status: 403 });
    }
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data: { permission },
    select: { id: true, name: true, email: true, username: true, role: true, permission: true, createdAt: true },
  });

  return NextResponse.json(user);
}
