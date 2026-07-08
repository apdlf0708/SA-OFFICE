import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

function requireAdmin() {
  const me = getSessionUser();
  if (!me) return { error: NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 }) };
  if (me.permission !== "ADMIN") return { error: NextResponse.json({ error: "admin 권한이 필요합니다." }, { status: 403 }) };
  return { me };
}

function requireAdminOrManager() {
  const me = getSessionUser();
  if (!me) return { error: NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 }) };
  if (me.permission !== "ADMIN" && me.permission !== "MANAGER") {
    return { error: NextResponse.json({ error: "권한이 필요합니다." }, { status: 403 }) };
  }
  return { me };
}

export async function GET() {
  const auth = requireAdminOrManager();
  if (auth.error) return auth.error;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, username: true, role: true, permission: true, createdAt: true },
  });
  return NextResponse.json(users);
}

// POST { name, email, username, password, role } - 권한(permission)은 항상 USER로 자동 부여됨
export async function POST(req: NextRequest) {
  const auth = requireAdmin();
  if (auth.error) return auth.error;

  const { name, email, username, password, role } = await req.json();
  if (!name || !email || !username || !password || !role) {
    return NextResponse.json({ error: "모든 항목을 입력해주세요." }, { status: 400 });
  }

  const exists = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
  if (exists) {
    return NextResponse.json({ error: "이미 사용 중인 아이디 또는 이메일입니다." }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, username, password: hashed, role, permission: "USER" },
    select: { id: true, name: true, email: true, username: true, role: true, permission: true, createdAt: true },
  });

  return NextResponse.json(user, { status: 201 });
}
