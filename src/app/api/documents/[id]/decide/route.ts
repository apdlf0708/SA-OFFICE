import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

// POST /api/documents/:id/decide  { decision: 'approve' | 'reject', comment? }
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const me = getSessionUser();
  if (!me) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const documentId = params.id;
  const { decision, comment } = await req.json();
  const userId = me.id;

  if (!["approve", "reject"].includes(decision)) {
    return NextResponse.json({ error: "decision(approve|reject)이 필요합니다." }, { status: 400 });
  }

  const myStep = await prisma.approvalStep.findFirst({
    where: { documentId, approverId: userId, status: "PENDING" },
  });

  if (!myStep) {
    return NextResponse.json({ error: "지금 결재할 차례가 아니거나 이미 처리된 문서입니다." }, { status: 403 });
  }

  if (decision === "reject") {
    await prisma.$transaction([
      prisma.approvalStep.update({
        where: { id: myStep.id },
        data: { status: "REJECTED", comment, decidedAt: new Date() },
      }),
      prisma.document.update({
        where: { id: documentId },
        data: { status: "REJECTED" },
      }),
    ]);
    const rejected = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        steps: {
          include: { approver: { select: { id: true, name: true, email: true, role: true } } },
          orderBy: { order: "asc" },
        },
        requester: { select: { id: true, name: true, email: true, role: true } },
      },
    });
    return NextResponse.json(rejected);
  }

  // 승인 처리: 다음 순서가 있으면 그 사람에게 PENDING 넘기고, 없으면 문서 최종 승인
  const nextStep = await prisma.approvalStep.findFirst({
    where: { documentId, order: myStep.order + 1 },
  });

  const updates = [
    prisma.approvalStep.update({
      where: { id: myStep.id },
      data: { status: "APPROVED", comment, decidedAt: new Date() },
    }),
  ];

  if (nextStep) {
    updates.push(
      prisma.approvalStep.update({
        where: { id: nextStep.id },
        data: { status: "PENDING" },
      })
    );
  } else {
    updates.push(
      prisma.document.update({
        where: { id: documentId },
        data: { status: "APPROVED" },
      }) as any
    );
  }

  await prisma.$transaction(updates as any);

  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      steps: {
        include: { approver: { select: { id: true, name: true, email: true, role: true } } },
        orderBy: { order: "asc" },
      },
      requester: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  return NextResponse.json(document);
}
