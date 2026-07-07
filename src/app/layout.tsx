import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "전자결재 시스템",
  description: "다우오피스 스타일의 전자결재 데모 프로젝트",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
