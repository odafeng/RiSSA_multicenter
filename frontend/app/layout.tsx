import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "RiSSA 研究平台",
  description: "多中心臨床資料管理系統",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <footer className="py-6 text-center text-sm text-muted-foreground border-t mt-auto">
          <p>Developed by 高雄榮總黃士峯醫師</p>
        </footer>
      </body>
    </html>
  );
}
