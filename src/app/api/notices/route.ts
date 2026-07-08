import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const me = getSessionUser();
  if (!me) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const notices = await prisma.notice.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { id: true, name: true, role: true } } },
  });
  return NextResponse.json(notices);
}

// POST { title, content } - admin, 관리자(MANAGER)만 작성 가능
export async function POST(req: NextRequest) {
  const me = getSessionUser();
  if (!me) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  if (me.permission !== "ADMIN" && me.permission !== "MANAGER") {
    return NextResponse.json({ error: "공지사항 작성 권한이 없습니다." }, { status: 403 });
  }

  const { title, content } = await req.json();
  if (!title || !content) {
    return NextResponse.json({ error: "제목과 내용을 입력해주세요." }, { status: 400 });
  }

  const notice = await prisma.notice.create({
    data: { title, content, authorId: me.id },
    include: { author: { select: { id: true, name: true, role: true } } },
  });
  return NextResponse.json(notice, { status: 201 });
}
