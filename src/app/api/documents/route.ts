import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// GET /api/documents?userId=xxx&filter=all|기안함|결재함|진행중|완료|반려
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  const filter = req.nextUrl.searchParams.get("filter") ?? "all";

  if (!userId) {
    return NextResponse.json({ error: "userId가 필요합니다." }, { status: 400 });
  }

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
      requester: true,
      steps: { include: { approver: true }, orderBy: { order: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(documents);
}

// POST /api/documents  { title, type, content, requesterId, approverIds: string[] }
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, type, content, requesterId, approverIds } = body;

  if (!title || !type || !content || !requesterId || !Array.isArray(approverIds) || approverIds.length === 0) {
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
