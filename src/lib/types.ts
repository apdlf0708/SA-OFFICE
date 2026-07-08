export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type ApprovalStep = {
  id: string;
  order: number;
  status: "WAITING" | "PENDING" | "APPROVED" | "REJECTED";
  comment: string | null;
  approver: User;
};

export type Document = {
  id: string;
  title: string;
  type: string;
  content: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  requester: User;
  steps: ApprovalStep[];
};

export type Permission = "ADMIN" | "MANAGER" | "USER";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  permission: Permission;
  createdAt: string;
};

export const FILTERS = [
  { key: "all", label: "전체" },
  { key: "기안함", label: "기안함" },
  { key: "결재함", label: "결재함" },
  { key: "진행중", label: "진행함" },
  { key: "완료", label: "완료함" },
  { key: "반려", label: "반려함" },
] as const;

export type FilterKey = (typeof FILTERS)[number]["key"];
