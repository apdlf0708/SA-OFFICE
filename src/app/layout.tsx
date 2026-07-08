import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SA-OFFICE",
  description: "SA-OFFICE 사내 업무 시스템",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
