"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import MobileWrapper from "@/app/MobileWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MobileWrapper>
          <Navbar
            shop={sidebarOpen}
            onMenuClick={() => setSidebarOpen((prev) => !prev)}
          />

          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          <main className="pt-16 md:ml-64">{children}</main>
        </MobileWrapper>
      </body>
    </html>
  );
}
