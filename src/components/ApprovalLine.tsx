import { ApprovalStep } from "@/lib/types";

const statusStyle: Record<ApprovalStep["status"], { bg: string; text: string; label: string }> = {
  WAITING: { bg: "bg-gray-100", text: "text-gray-500", label: "대기" },
  PENDING: { bg: "bg-amber-100", text: "text-amber-800", label: "결재중" },
  APPROVED: { bg: "bg-teal-100", text: "text-teal-800", label: "승인" },
  REJECTED: { bg: "bg-red-100", text: "text-red-800", label: "반려" },
};

export default function ApprovalLine({ steps }: { steps: ApprovalStep[] }) {
  return (
    <div className="flex items-start bg-gray-50 rounded-lg p-4">
      {steps.map((step, i) => {
        const meta = statusStyle[step.status];
        const isLast = i === steps.length - 1;
        return (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1.5 min-w-[72px]">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${meta.bg} ${meta.text}`}>
                {step.approver.name.slice(-2)}
              </div>
              <div className="text-center">
                <div className="text-xs font-medium">{step.approver.name}</div>
                <div className="text-[11px] text-gray-400">{step.approver.role}</div>
              </div>
              <span className={`text-[11px] px-2 py-0.5 rounded-full ${meta.bg} ${meta.text}`}>{meta.label}</span>
            </div>
            {!isLast && <div className="flex-1 h-0.5 bg-gray-300 mx-1 mb-9" />}
          </div>
        );
      })}
    </div>
  );
}
