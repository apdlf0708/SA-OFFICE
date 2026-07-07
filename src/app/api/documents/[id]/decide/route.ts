import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/documents/:id/decide  { userId, decision: 'approve' | 'reject', comment? }
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const documentId = params.id;
  const { userId, decision, comment } = await req.json();

  if (!userId || !["approve", "reject"].includes(decision)) {
    return NextResponse.json({ error: "userId와 decision(approve|reject)이 필요합니다." }, { status: 400 });
  }

  const myStep = await prisma.approvalStep.findFirst({
    where: { documentId, approverId: userId, status: "PENDING" },
  });

  if (!myStep) {
    return NextResponse.json({ error: "지금 결재할 차례가 아니거나 이미 처리된 문서입니다." }, { status: 403 });
  }

  if (decision === "reject") {
    const [, document] = await prisma.$transaction([
      prisma.approvalStep.update({
        where: { id: myStep.id },
        data: { status: "REJECTED", comment, decidedAt: new Date() },
      }),
      prisma.document.update({
        where: { id: documentId },
        data: { status: "REJECTED" },
      }),
    ]);
    return NextResponse.json(document);
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
    include: { steps: { include: { approver: true }, orderBy: { order: "asc" } }, requester: true },
  });

  return NextResponse.json(document);
}
