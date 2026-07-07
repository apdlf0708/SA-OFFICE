import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.approvalStep.deleteMany();
  await prisma.document.deleteMany();
  await prisma.user.deleteMany();

  const [minsu, jihyeon, sooyoung, youngho, haneul] = await Promise.all([
    prisma.user.create({ data: { name: "김민수", email: "minsu@company.com", role: "사원" } }),
    prisma.user.create({ data: { name: "박지현", email: "jihyeon@company.com", role: "팀장" } }),
    prisma.user.create({ data: { name: "이수영", email: "sooyoung@company.com", role: "부서장" } }),
    prisma.user.create({ data: { name: "최영호", email: "youngho@company.com", role: "대표" } }),
    prisma.user.create({ data: { name: "정하늘", email: "haneul@company.com", role: "사원" } }),
  ]);

  // 1. 진행중 문서 (팀장 승인, 부서장 대기중)
  await prisma.document.create({
    data: {
      title: "연차 휴가 신청서",
      type: "인사",
      content: "2026년 7월 20일부터 7월 22일까지 연차 사용을 신청합니다.",
      status: "PENDING",
      requesterId: minsu.id,
      steps: {
        create: [
          { approverId: jihyeon.id, order: 1, status: "APPROVED", decidedAt: new Date() },
          { approverId: sooyoung.id, order: 2, status: "PENDING" },
          { approverId: youngho.id, order: 3, status: "WAITING" },
        ],
      },
    },
  });

  // 2. 반려된 문서
  await prisma.document.create({
    data: {
      title: "출장비 지출결의서",
      type: "회계",
      content: "부산 출장 관련 교통비 및 숙박비 320,000원 지출 결의를 요청합니다.",
      status: "REJECTED",
      requesterId: haneul.id,
      steps: {
        create: [
          { approverId: jihyeon.id, order: 1, status: "APPROVED", decidedAt: new Date() },
          { approverId: sooyoung.id, order: 2, status: "REJECTED", comment: "예산 초과, 재작성 요청", decidedAt: new Date() },
        ],
      },
    },
  });

  // 3. 첫 결재 대기중인 문서
  await prisma.document.create({
    data: {
      title: "노트북 구매요청서",
      type: "총무",
      content: "업무용 노트북 1대 구매를 요청드립니다. 예상 금액 1,800,000원.",
      status: "PENDING",
      requesterId: minsu.id,
      steps: {
        create: [{ approverId: jihyeon.id, order: 1, status: "PENDING" }],
      },
    },
  });

  // 4. 완료된 문서
  await prisma.document.create({
    data: {
      title: "재택근무 신청서",
      type: "인사",
      content: "개인 사유로 7월 1주간 재택근무를 신청합니다.",
      status: "APPROVED",
      requesterId: haneul.id,
      steps: {
        create: [
          { approverId: jihyeon.id, order: 1, status: "APPROVED", decidedAt: new Date() },
          { approverId: sooyoung.id, order: 2, status: "APPROVED", decidedAt: new Date() },
          { approverId: youngho.id, order: 3, status: "APPROVED", decidedAt: new Date() },
        ],
      },
    },
  });

  console.log("시드 데이터 생성 완료");
  console.log("데모 계정:", [minsu, jihyeon, sooyoung, youngho, haneul].map((u) => `${u.name}(${u.role})`).join(", "));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
