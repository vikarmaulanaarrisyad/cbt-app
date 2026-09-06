"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ProctorSidebar() {
  const pathname = usePathname();

  const navGroups = [
    {
      title: "Monitoring Utama",
      links: [
        { href: "/proctor/dashboard", icon: "dashboard", label: "Dashboard Live", badge: "38" },
        { href: "#", icon: "grid_view", label: "Denah Lab & Workstation" },
        { href: "#", icon: "key", label: "Rotasi Token" },
      ]
    },
    {
      title: "Integritas & Laporan",
      links: [
        { href: "#", icon: "shield_alert", label: "Log Integritas", badge: "2 Alert", badgeColor: "red" },
        { href: "#", icon: "description", label: "Berita Acara (BAP)" },
        { href: "#", icon: "fact_check", label: "Daftar Presensi" },
      ]
    },
    {
      title: "Manajemen Ujian",
      links: [
        { href: "/proctor/dashboard/questions", icon: "library_books", label: "Bank Soal" },
      ]
    },
    {
      title: "Pengaturan",
      links: [
        { href: "#", icon: "devices", label: "Manajemen Kiosk" },
        { href: "#", icon: "support_agent", label: "Hubungi Teknisi" },
      ]
    }
  ];

  return (
    <aside className="fixed top-0 left-0 bottom-0 w-72 bg-[#0a0f1c] text-slate-300 z-50 flex flex-col justify-between shadow-2xl border-r border-slate-800/50">
      <div className="flex flex-col flex-1 overflow-y-auto custom-scrollbar">
        {/* Brand & Room Info */}
        <div className="p-6 border-b border-slate-800/80 flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          
          <Image
            alt="CBT Pro Logo"
            className="h-10 w-auto object-contain object-left relative z-10"
            src="/logo.svg"
            width={240}
            height={60}
            priority
          />
          
          <div className="flex items-center justify-between mt-2 relative z-10">
            <div className="flex flex-col">
              <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                Sesi Pengawasan
              </span>
              <span className="text-white font-semibold text-sm">
                RUANG UTBK-08
              </span>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Online</span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-8 flex-1 mt-2 relative z-10">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-2">
              <p className="px-3 text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3">{group.title}</p>
              {group.links.map((link, lIdx) => {
                const isDashboardLive = pathname === "/proctor/dashboard" && link.href === "/proctor/dashboard";
                const isActive = pathname === link.href || (link.href !== "/proctor/dashboard" && link.href !== "#" && pathname.startsWith(link.href));
                const active = isActive || isDashboardLive;
                
                return (
                  <Link
                    key={lIdx}
                    href={link.href}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                      active 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`material-symbols-outlined text-[20px] ${!active && link.badgeColor === 'red' ? 'group-hover:text-red-400 transition-colors' : ''}`}>
                        {link.icon}
                      </span>
                      <span className="text-[13px] font-medium">{link.label}</span>
                    </div>
                    {link.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        link.badgeColor === 'red' && !active
                          ? 'bg-red-500/20 text-red-400 border-red-500/20' 
                          : active 
                            ? 'bg-slate-900/50 text-white border-transparent' 
                            : 'bg-slate-900/50 text-slate-400 border-transparent'
                      }`}>
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Proctor Profile Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-[#0a0f1c]/80 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/60 transition-colors cursor-pointer group">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-linear-to-tr from-blue-600 to-blue-400 flex items-center justify-center shrink-0 text-white font-bold shadow-inner">
              HM
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-white font-semibold truncate leading-tight group-hover:text-blue-200 transition-colors">
                Drs. H. Mulyono
              </p>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                NIP 19780512-200501
              </p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-white transition-colors p-1" title="Logout">
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </div>
      
      {/* Global CSS for custom scrollbar mapping to UI */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.4); border-radius: 10px; }
      `}} />
    </aside>
  );
}
