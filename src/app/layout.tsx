import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Mono, DM_Sans } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Toaster } from "react-hot-toast";

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"], 
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800"]
});

const dmMono = DM_Mono({ 
  subsets: ["latin"], 
  variable: "--font-mono",
  weight: ["400", "500"]
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dmsans",
  weight: ["400", "500", "700"]
});

export const metadata: Metadata = {
  title: "CRM Mateus",
  description: "Modern CRM for High Performance Teams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${jakarta.variable} ${dmMono.variable} ${dmSans.variable} font-sans antialiased bg-[#F7F7F8] min-h-screen selection:bg-blue-100`}>
        <Sidebar />
        <main className="pl-[78px] min-h-screen transition-all duration-300">
          <div className="p-5 md:p-7">
            <div className="max-w-[1600px] mx-auto bg-white rounded-2xl p-7 border border-gray-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.03)] min-h-[calc(100vh-56px)]">
              {children}
            </div>
          </div>
        </main>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '500',
              padding: '10px 14px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
            }
          }}
        />
      </body>
    </html>
  );
}
