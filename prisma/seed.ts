import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.notice.deleteMany();
  await prisma.approvalStep.deleteMany();
  await prisma.document.deleteMany();
  await prisma.user.deleteMany();

  const defaultPassword = await bcrypt.hash("1234", 10);
  const adminPassword = await bcrypt.hash("123123", 10);

  const [minsu, jihyeon, sooyoung, youngho, haneul] = await Promise.all([
    prisma.user.create({
      data: { name: "김민수", email: "minsu@company.com", username: "minsu", password: defaultPassword, role: "사원", permission: "USER" },
    }),
    prisma.user.create({
      data: { name: "박지현", email: "jihyeon@company.com", username: "jihyeon", password: defaultPassword, role: "팀장", permission: "USER" },
    }),
    prisma.user.create({
      data: { name: "이수영", email: "sooyoung@company.com", username: "sooyoung", password: defaultPassword, role: "부서장", permission: "USER" },
    }),
    prisma.user.create({
      data: { name: "최영호", email: "youngho@company.com", username: "youngho", password: defaultPassword, role: "대표", permission: "MANAGER" },
    }),
    prisma.user.create({
      data: { name: "정하늘", email: "haneul@company.com", username: "haneul", password: defaultPassword, role: "사원", permission: "USER" },
    }),
  ]);

  const admin = await prisma.user.create({
    data: { name: "관리자", email: "admin@company.com", username: "admin", password: adminPassword, role: "시스템관리자", permission: "ADMIN" },
  });

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

  await prisma.document.create({
    data: {
      title: "노트북 구매요청서",
      type: "총무",
      content: "업무용 노트북 1대 구매를 요청드립니다. 예상 금액 1,800,000원.",
      status: "PENDING",
      requesterId: minsu.id,
      steps: { create: [{ approverId: jihyeon.id, order: 1, status: "PENDING" }] },
    },
  });

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

  await prisma.notice.create({
    data: {
      title: "SA-OFFICE 오픈 안내",
      content: "사내 업무 시스템 SA-OFFICE가 오픈되었습니다. 전자결재, 캘린더 기능을 이용해보세요.",
      authorId: admin.id,
    },
  });

  console.log("시드 데이터 생성 완료");
  console.log("로그인 계정 (비밀번호: 사원/팀장/부서장/대표/사원은 1234, admin은 123123):");
  console.log(
    [minsu, jihyeon, sooyoung, youngho, haneul]
      .map((u) => `${u.username} (${u.name}/${u.role}/${u.permission})`)
      .join(", ") + `, admin (관리자/시스템관리자/ADMIN)`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
