import type { Metadata } from "next";
import { Sarabun, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const sarabun = Sarabun({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-sarabun",
  display: "swap",
});

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Plantable - ระบบวิเคราะห์ดินและแนะนำพืชเพาะปลูก",
  description: "เปลี่ยนผลวิเคราะห์ธาตุอาหารในดิน (NPK & pH) ให้กลายเป็นคำแนะนำการเพาะปลูกที่แม่นยำทางวิทยาศาสตร์",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={cn("h-full", "antialiased", sarabun.variable, geistMono.variable, inter.variable, "font-sans")}
    >
      <body className="min-h-full flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">{children}</body>
    </html>
  );
}
