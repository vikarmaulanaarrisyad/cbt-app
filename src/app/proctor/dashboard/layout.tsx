"use client";

import React, { useState } from "react";
import Image from "next/image";
import ProctorSidebar from "@/components/ProctorSidebar";

export default function ProctorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="bg-[#F8FAFC] font-sans text-slate-800 min-h-screen flex flex-col lg:flex-row selection:bg-blue-100 selection:text-blue-900 relative overflow-x-hidden">
      {/* Mobile Sticky Navigation Header */}
      <header className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-blue-600 transition-colors flex items-center justify-center border border-slate-200/80 shadow-xs"
            aria-label="Buka Navigation Menu"
            type="button"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>
          <Image
            alt="CBT Pro Logo"
            src="/logo.svg"
            width={120}
            height={32}
            className="h-7 w-auto object-contain"
            priority
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold uppercase tracking-wider">
            RUANG UTBK-08
          </span>
        </div>
      </header>

      {/* Main Responsive Proctor Sidebar */}
      <ProctorSidebar
        isOpenMobile={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="w-full pl-0 lg:pl-64 xl:pl-72 flex flex-col flex-1 min-h-screen overflow-x-hidden transition-[padding] duration-300">
        {children}
      </div>
    </div>
  );
}

