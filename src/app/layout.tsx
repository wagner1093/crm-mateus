import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-heading", weight: ["500", "600", "700", "800", "900"] });

export const metadata: Metadata = {
  title: "CRM MATEUS | Premium Management",
  description: "Modern CRM for High Performance Teams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${montserrat.variable} font-sans antialiased bg-gray-50 min-h-screen selection:bg-blue-500/30`}>
        <Sidebar />
        <main className="pl-24 min-h-screen transition-all duration-300">
          <div className="p-6 md:p-10">
            <div className="max-w-[1700px] mx-auto bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm min-h-[calc(100vh-80px)]">
              {children}
            </div>
          </div>
        </main>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
