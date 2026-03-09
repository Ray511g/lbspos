import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { SyncManager } from "@/components/SyncManager";
import { LiveAlerts } from "@/components/LiveAlerts";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "BarPOS | Liquor Store & Bar System",
  description: "Specialized POS solution for modern liquor stores and bars.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BarPOS",
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn(inter.variable, outfit.variable, "antialiased flex h-screen overflow-hidden")}>
        <SyncManager />
        <LiveAlerts />
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-navy-950 px-4 lg:px-8 py-20 lg:py-8 transition-all duration-300">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
