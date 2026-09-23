import type { Metadata } from "next";
import { Sarabun, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { I18nProvider } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import { MotionProvider } from "@/components/motion";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const sarabun = Sarabun({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["thai", "latin"],
  variable: "--font-sarabun",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Plantable - ระบบวิเคราะห์ดินและแนะนำพืชเพาะปลูก",
  description: "เปลี่ยนผลวิเคราะห์ธาตุอาหารในดิน (NPK & pH) ให้กลายเป็นคำแนะนำการเพาะปลูกที่แม่นยำทางวิทยาศาสตร์",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className={cn("h-full antialiased", sarabun.variable, geistMono.variable)}
    >
      <body className="flex min-h-full flex-col font-sans">
        <I18nProvider initialLocale={locale}>
          <MotionProvider>
            <TooltipProvider>
              {children}
              <Toaster position="top-center" richColors={false} />
            </TooltipProvider>
          </MotionProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
