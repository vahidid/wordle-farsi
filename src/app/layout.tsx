import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const vazirmatn = localFont({
  src: [
    {
      path: "./fonts/Vazirmatn-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Vazirmatn-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/Vazirmatn-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/Vazirmatn-ExtraBold.woff2",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-vazirmatn",
  display: "swap",
});

export const metadata: Metadata = {
  title: "واژه‌چین | Wordle فارسی - بازی حدس کلمات ۵ حرفی",
  description: "بازی حدس کلمات معنادار فارسی. با کیبورد فارسی کلمه را حدس بزنید، رتبه خود را در جدول رده‌بندی ثبت کنید و نتیجه را در اینستاگرام و توییتر به اشتراک بگذارید.",
  keywords: ["wordle", "وردل", "واژه‌چین", "بازی کلمات", "کلمه بازی", "wordle فارسی"],
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
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} h-full`}>
      <body className="min-h-full bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
