import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

// GET /api/documents?filter=all|기안함|결재함|진행중|완료|반려
export async function GET(req: NextRequest) {
  const me = getSessionUser();
  if (!me) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const userId = me.id;
  const filter = req.nextUrl.searchParams.get("filter") ?? "all";

  // 내가 기안했거나, 결재선에 포함된 문서만 대상으로 함
  const involvedWith: Prisma.DocumentWhereInput = {
    OR: [{ requesterId: userId }, { steps: { some: { approverId: userId } } }],
  };

  let where: Prisma.DocumentWhereInput = involvedWith;

  if (filter === "기안함") {
    where = { AND: [involvedWith, { requesterId: userId }] };
  } else if (filter === "결재함") {
    where = { AND: [involvedWith, { steps: { some: { approverId: userId, status: "PENDING" } } }] };
  } else if (filter === "진행중") {
    where = { AND: [involvedWith, { status: "PENDING" }] };
  } else if (filter === "완료") {
    where = { AND: [involvedWith, { status: "APPROVED" }] };
  } else if (filter === "반려") {
    where = { AND: [involvedWith, { status: "REJECTED" }] };
  }

  const documents = await prisma.document.findMany({
    where,
    include: {
      requester: { select: { id: true, name: true, email: true, role: true } },
      steps: {
        include: { approver: { select: { id: true, name: true, email: true, role: true } } },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(documents);
}

// POST /api/documents  { title, type, content, approverIds: string[] }
export async function POST(req: NextRequest) {
  const me = getSessionUser();
  if (!me) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const body = await req.json();
  const { title, type, content, approverIds } = body;
  const requesterId = me.id;

  if (!title || !type || !content || !Array.isArray(approverIds) || approverIds.length === 0) {
    return NextResponse.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 });
  }

  const document = await prisma.document.create({
    data: {
      title,
      type,
      content,
      requesterId,
      status: "PENDING",
      steps: {
        create: approverIds.map((approverId: string, index: number) => ({
          approverId,
          order: index + 1,
          status: index === 0 ? "PENDING" : "WAITING",
        })),
      },
    },
    include: { steps: true },
  });

  return NextResponse.json(document, { status: 201 });
}
