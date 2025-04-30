import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientBackButtonWrapper from "@/components/providers/ClientBackButtonWrapper";
import AppFooter from "@/components/ui/AppFooter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Skat Tracker",
  description: "Track your Skat games",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientBackButtonWrapper>
          <div className="flex flex-col h-[calc(100dvh)]">
            <div className="flex-1 overflow-auto">
              {children}
            </div>
            <AppFooter companyName="Bali Code" />
          </div>
        </ClientBackButtonWrapper>
      </body>
    </html>
  );
}