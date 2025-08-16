import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ReduxProvider from "../store/ReduxProvider";
const inter = Inter({ subsets: ["latin"] });
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "VdoTube",
  description: "Video Social Media platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ReduxProvider>
      <html lang="en">
        <body className={inter.className}>
          <Navbar />
          {children}
          <Analytics />
          <Toaster />
        </body>
      </html>
    </ReduxProvider>
  );
}