import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-vazirmatn",
});

export const metadata: Metadata = {
  title: "واژل | Wordle فارسی - بازی حدس کلمات ۵ حرفی",
  description: "بازی حدس کلمات معنادار فارسی. با کیبورد فارسی کلمه را حدس بزنید، رتبه خود را در جدول رده‌بندی ثبت کنید و نتیجه را در اینستاگرام و توییتر به اشتراک بگذارید.",
  keywords: ["wordle", "وردل", "واژل", "بازی کلمات", "کلمه بازی", "wordle فارسی"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} font-sans h-full`}>
      <body className="min-h-full bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
