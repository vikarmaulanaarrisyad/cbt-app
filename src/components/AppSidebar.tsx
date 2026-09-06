"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { hasPermission, getRoleLabel, getRoleBadgeStyle, Permission } from "@/lib/rbac";
import { Alert } from "@/lib/sweetalert";
import {
  EducationLevel,
  getActiveEducationLevel,
  setActiveEducationLevel,
  EVENT_JENJANG_CHANGE,
} from "@/lib/education-level";

export type AppRole = "ADMIN" | "TEACHER" | "PROCTOR" | "STUDENT";

export interface UserProfile {
  id: string;
  nip?: string;
  name: string;
  email?: string;
  role: string;
  labAllocation?: string;
  educationLevel?: string;
  schoolId?: string;
  schoolName?: string;
  npsn?: string;
}

export interface AppSidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  activeRole?: AppRole;
}

interface NavLink {
  href: string;
  icon: string;
  label: string;
  badge?: string;
  badgeColor?: string;
  permission?: Permission;
}

interface NavGroup {
  title: string;
  links: NavLink[];
}

export default function AppSidebar({
  isOpenMobile = false,
  onCloseMobile,
  activeRole,
}: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentRole, setCurrentRole] = useState<AppRole>(activeRole || "PROCTOR");
  const [educationLevel, setEducationLevel] = useState<EducationLevel>("SEMUA");

  useEffect(() => {
    setEducationLevel(getActiveEducationLevel());
    const handleJenjangEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ educationLevel: EducationLevel }>;
      if (customEvent.detail && customEvent.detail.educationLevel) {
        setEducationLevel(customEvent.detail.educationLevel);
      }
    };
    window.addEventListener(EVENT_JENJANG_CHANGE, handleJenjangEvent);
    return () => window.removeEventListener(EVENT_JENJANG_CHANGE, handleJenjangEvent);
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.user) {
          setUser(data.data.user);
          if (!activeRole) {
            setCurrentRole(data.data.user.role as AppRole);
          }
          if (data.data.user.educationLevel) {
            const lvl = data.data.user.educationLevel.toUpperCase() as EducationLevel;
            setEducationLevel(lvl);
            setActiveEducationLevel(lvl);
          }
        }
      })
      .catch(() => {});
  }, [activeRole]);

  useEffect(() => {
    if (activeRole) {
      setCurrentRole(activeRole);
    }
  }, [activeRole]);

  // Event listener for dynamic role changes from dashboard mode switcher
  useEffect(() => {
    const handleRoleEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ role: AppRole }>;
      if (customEvent.detail && customEvent.detail.role) {
        setCurrentRole(customEvent.detail.role);
      }
    };
    window.addEventListener("cbt-role-change", handleRoleEvent);
    return () => window.removeEventListener("cbt-role-change", handleRoleEvent);
  }, []);

  // Auto-close mobile drawer on route change
  useEffect(() => {
    if (onCloseMobile) {
      onCloseMobile();
    }
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      Alert.success("Logout Berhasil", "Anda telah keluar dari konsol.");
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  // Theme styling helpers based on active role
  const getRoleTheme = (role: AppRole) => {
    switch (role) {
      case "ADMIN":
        return {
          activeBg: "bg-purple-50/90 text-purple-950 border border-purple-200/90 shadow-2xs font-bold",
          activeIndicator: "bg-purple-600",
          hoverBg: "text-slate-600 hover:text-purple-950 hover:bg-purple-50/50 font-medium",
          iconActiveBg: "bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-xs shadow-purple-500/30",
          badgeActive: "bg-purple-600 text-white border-purple-500",
          avatarBg: "bg-gradient-to-tr from-purple-600 to-indigo-600",
          hoverText: "group-hover:text-purple-700",
        };
      case "TEACHER":
        return {
          activeBg: "bg-amber-50/90 text-amber-950 border border-amber-200/90 shadow-2xs font-bold",
          activeIndicator: "bg-amber-600",
          hoverBg: "text-slate-600 hover:text-amber-950 hover:bg-amber-50/50 font-medium",
          iconActiveBg: "bg-gradient-to-tr from-amber-600 to-orange-600 text-white shadow-xs shadow-amber-500/30",
          badgeActive: "bg-amber-600 text-white border-amber-500",
          avatarBg: "bg-gradient-to-tr from-amber-600 to-orange-600",
          hoverText: "group-hover:text-amber-700",
        };
      case "PROCTOR":
      default:
        return {
          activeBg: "bg-blue-50/90 text-blue-950 border border-blue-200/90 shadow-2xs font-bold",
          activeIndicator: "bg-blue-600",
          hoverBg: "text-slate-600 hover:text-blue-950 hover:bg-blue-50/50 font-medium",
          iconActiveBg: "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xs shadow-blue-500/30",
          badgeActive: "bg-blue-600 text-white border-blue-500",
          avatarBg: "bg-gradient-to-tr from-blue-600 to-indigo-600",
          hoverText: "group-hover:text-blue-700",
        };
    }
  };

  // Role-specific navigation groups
  const getNavGroups = (role: AppRole): NavGroup[] => {
    const effectiveLevel = user?.educationLevel && user.educationLevel !== "SEMUA"
      ? user.educationLevel
      : educationLevel !== "SEMUA"
      ? educationLevel
      : null;

    const classLabel = effectiveLevel ? `Kelas & Rombel (${effectiveLevel})` : "Kelas & Rombel";
    const subjectLabel = effectiveLevel ? `Mata Pelajaran (${effectiveLevel})` : "Mata Pelajaran";
    const questionLabel = effectiveLevel ? `Bank Soal (${effectiveLevel})` : "Bank Soal Multi-Jenjang";

    switch (role) {
      case "ADMIN":
        return [
          {
            title: "Pusat Kontrol Sistem",
            links: [
              { href: "/proctor/dashboard", icon: "dashboard", label: "Dashboard Utama" },
              { href: "/proctor/dashboard/integrity-logs", icon: "security", label: "Log Audit & Integritas", badge: "Live", badgeColor: "blue" },
              { href: "/proctor/dashboard/workstations", icon: "grid_view", label: "Monitoring Workstation" },
            ],
          },
          {
            title: "Manajemen Master Data",
            links: [
              { href: "/proctor/dashboard/classes", icon: "meeting_room", label: classLabel },
              { href: "/proctor/dashboard/subjects", icon: "menu_book", label: subjectLabel, permission: "subjects:view" },
              { href: "/proctor/dashboard/users", icon: "manage_accounts", label: "Kelola User & Hak Akses", permission: "users:manage" },
              { href: "/proctor/dashboard/semesters", icon: "date_range", label: "Master Semester & Tahun", permission: "semesters:manage" },
            ],
          },
          {
            title: "Bank Soal & Kurikulum",
            links: [
              { href: "/proctor/dashboard/questions", icon: "library_books", label: questionLabel, permission: "questions:view" },
              { href: "/proctor/dashboard/questions/create", icon: "post_add", label: "Buat Soal Baru" },
            ],
          },
          {
            title: "Perangkat & Helpdesk",
            links: [
              { href: "/proctor/dashboard/kiosk", icon: "devices", label: "Manajemen Client Kiosk" },
              { href: "/proctor/dashboard/support", icon: "support_agent", label: "NOC Helpdesk Support" },
            ],
          },
        ];

      case "TEACHER":
        return [
          {
            title: "Pusat Bank Soal",
            links: [
              { href: "/proctor/dashboard", icon: "auto_stories", label: "Dashboard Guru" },
              { href: "/proctor/dashboard/questions", icon: "library_books", label: questionLabel, permission: "questions:view" },
              { href: "/proctor/dashboard/questions/create", icon: "add_box", label: "Buat Butir Soal Baru" },
            ],
          },
          {
            title: "Jadwal & Rombel",
            links: [
              { href: "/proctor/dashboard/classes", icon: "meeting_room", label: classLabel },
              { href: "/proctor/dashboard/subjects", icon: "menu_book", label: subjectLabel, permission: "subjects:view" },
              { href: "/proctor/dashboard/semesters", icon: "calendar_month", label: "Data Semester Ujian", permission: "semesters:manage" },
            ],
          },
          {
            title: "Laporan & Presensi",
            links: [
              { href: "/proctor/dashboard/attendance", icon: "fact_check", label: "Daftar Presensi Siswa", permission: "proctor:view" },
              { href: "/proctor/dashboard/bap", icon: "description", label: "Berita Acara (BAP)", permission: "proctor:view" },
            ],
          },
          {
            title: "Bantuan",
            links: [
              { href: "/proctor/dashboard/support", icon: "help", label: "Pusat Bantuan Guru" },
            ],
          },
        ];

      case "STUDENT":
        return [
          {
            title: "Ujian Saya",
            links: [
              { href: "/student/dashboard", icon: "dashboard", label: "Dashboard Peserta" },
              { href: "/exam", icon: "assignment", label: "Ruang Konfirmasi Ujian" },
            ],
          },
        ];

      case "PROCTOR":
      default:
        return [
          {
            title: "Monitoring Ruangan",
            links: [
              { href: "/proctor/dashboard", icon: "dashboard", label: "Dashboard Live", badge: "38" },
              { href: "/proctor/dashboard/workstations", icon: "grid_view", label: "Denah Lab & Workstation" },
              { href: "/proctor/dashboard/tokens", icon: "key", label: "Rotasi Token Ruangan" },
            ],
          },
          {
            title: "Master Data & Rombel",
            links: [
              { href: "/proctor/dashboard/classes", icon: "meeting_room", label: classLabel },
              { href: "/proctor/dashboard/subjects", icon: "menu_book", label: subjectLabel, permission: "subjects:view" },
            ],
          },
          {
            title: "Integritas & Laporan",
            links: [
              { href: "/proctor/dashboard/integrity-logs", icon: "security", label: "Log Integritas", badge: "2 Alert", badgeColor: "red" },
              { href: "/proctor/dashboard/bap", icon: "description", label: "Berita Acara (BAP)" },
              { href: "/proctor/dashboard/attendance", icon: "fact_check", label: "Daftar Presensi" },
            ],
          },
          {
            title: "Pengaturan & Helpdesk",
            links: [
              { href: "/proctor/dashboard/kiosk", icon: "devices", label: "Manajemen Kiosk" },
              { href: "/proctor/dashboard/support", icon: "support_agent", label: "Hubungi Teknisi NOC" },
            ],
          },
        ];
    }
  };

  const navGroups = getNavGroups(currentRole);
  const badgeStyle = getRoleBadgeStyle(currentRole);
  const themeStyle = getRoleTheme(currentRole);
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "HM";

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 xl:w-72 bg-white text-slate-800 z-50 flex flex-col justify-between shadow-2xl border-r border-slate-200/80 transition-all duration-300 ease-in-out ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand & Room/Role Info - Fixed shrink-0 header so it is NEVER squished or clipped */}
        <div className="shrink-0 p-4 xl:p-5 pt-5 xl:pt-6 border-b border-slate-200/80 flex flex-col gap-3.5 relative bg-gradient-to-b from-slate-50/90 via-white to-white z-20">
          <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-none">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
          </div>

          {/* Top Logo & System Indicator */}
          <div className="flex items-center justify-between relative z-10 pt-0.5">
            <div className="flex items-center gap-2">
              <Image
                alt="CBT Pro Logo"
                className="h-8 xl:h-8.5 w-auto object-contain object-left"
                src="/logo.svg"
                width={200}
                height={50}
                priority
              />
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-[10px] font-extrabold tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Live
              </span>
            </div>

            {/* Close Button for Mobile Drawer */}
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
                title="Tutup Menu"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            )}
          </div>

          {/* Institution & Lab Card */}
          <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-50/80 via-white to-blue-50/20 border border-slate-200/90 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)] flex flex-col gap-2 relative z-10 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs shadow-blue-500/20">
                  <span className="material-symbols-outlined text-[15px]">account_balance</span>
                </div>
                <span className="text-xs font-black text-slate-900 uppercase tracking-tight truncate">
                  {user?.schoolName || "MI Bustanul Huda 01 Dawuhan"}
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 border ${badgeStyle.bg} ${badgeStyle.border} ${badgeStyle.text}`}>
                {currentRole}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 text-[10px] text-slate-500 font-semibold px-0.5 pt-1.5 border-t border-slate-100">
              <span className="flex items-center gap-1.5 min-w-0 truncate text-slate-600 font-medium">
                <span className="material-symbols-outlined text-[13px] text-blue-600 shrink-0">desktop_windows</span>
                <span className="truncate">{user?.labAllocation || "Lab CBT Utama"}</span>
              </span>
              <span className="font-mono text-slate-400 shrink-0 text-[9.5px]">NPSN: {user?.npsn || "11123304"}</span>
            </div>
          </div>

          {/* Jenjang Indicator or Switcher */}
          {user?.educationLevel && user.educationLevel !== "SEMUA" ? (
            <div className="relative z-10 shrink-0">
              <div className="p-2.5 bg-slate-50/90 rounded-xl border border-slate-200/90 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    user.educationLevel === "MI" ? "bg-emerald-500" : user.educationLevel === "MTS" ? "bg-sky-500" : "bg-purple-500"
                  }`}></span>
                  <div className="truncate">
                    <div className="text-[9px] font-black uppercase tracking-wider text-slate-400 leading-none">Lingkup Jenjang</div>
                    <div className="text-xs font-bold text-slate-800 leading-tight mt-0.5 truncate">
                      {user.educationLevel === "MI" ? "Madrasah Ibtidaiyah" : user.educationLevel === "MTS" ? "Madrasah Tsanawiyah" : "Madrasah Aliyah"}
                    </div>
                  </div>
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border shrink-0 ${
                  user.educationLevel === "MI"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : user.educationLevel === "MTS"
                    ? "bg-sky-50 text-sky-700 border-sky-200"
                    : "bg-purple-50 text-purple-700 border-purple-200"
                }`}>
                  {user.educationLevel}
                </span>
              </div>
            </div>
          ) : (
            <div className="relative z-10 shrink-0">
              <div className="flex items-center justify-between mb-1.5 px-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px] text-blue-600">school</span>
                  Filter Jenjang
                </span>
                <span className="text-[9px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60 uppercase">
                  {educationLevel}
                </span>
              </div>
              
              <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 shadow-2xs">
                {[
                  { key: "SEMUA" as EducationLevel, label: "Semua", dot: "bg-blue-500" },
                  { key: "MI" as EducationLevel, label: "MI", dot: "bg-emerald-500" },
                  { key: "MTS" as EducationLevel, label: "MTs", dot: "bg-sky-500" },
                  { key: "MA" as EducationLevel, label: "MA", dot: "bg-purple-500" },
                ].map((item) => {
                  const isActive = educationLevel === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        setEducationLevel(item.key);
                        setActiveEducationLevel(item.key);
                      }}
                      className={`py-1.5 px-1 text-[11px] font-bold rounded-lg transition-all duration-150 cursor-pointer flex items-center justify-center gap-1 ${
                        isActive
                          ? "bg-white text-slate-900 shadow-xs border border-slate-200/80 font-black scale-[1.02]"
                          : "text-slate-500 hover:text-slate-800 hover:bg-white/50"
                      }`}
                      title={`Tampilkan data jenjang ${item.label}`}
                    >
                      {isActive && <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`}></span>}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Navigation Area - Starts cleanly below the header */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
          <nav className="p-3 xl:p-4 pt-4 xl:pt-4.5 space-y-5">
            {navGroups.map((group, gIdx) => {
              const filteredLinks = group.links.filter(
                (link) => !link.permission || hasPermission(user || currentRole, link.permission)
              );

              if (filteredLinks.length === 0) return null;

              return (
                <div key={gIdx} className="space-y-1">
                  <div className="px-2.5 flex items-center justify-between mb-1.5">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      {group.title}
                    </p>
                  </div>
                  {filteredLinks.map((link, lIdx) => {
                    const isDashboardLive =
                      pathname === "/proctor/dashboard" && link.href === "/proctor/dashboard";
                    const isActive =
                      pathname === link.href ||
                      (link.href !== "/proctor/dashboard" &&
                        link.href !== "#" &&
                        pathname.startsWith(link.href));
                    const active = isActive || isDashboardLive;
                    const isRedAlert = link.badgeColor === "red";

                    return (
                      <Link
                        key={lIdx}
                        href={link.href}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 group relative ${
                          active
                            ? `${themeStyle.activeBg} font-bold`
                            : isRedAlert
                            ? "text-slate-600 hover:text-rose-700 hover:bg-rose-50/60 font-medium"
                            : `${themeStyle.hoverBg}`
                        }`}
                      >
                        {/* Active indicator bar */}
                        {active && (
                          <span
                            className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-full ${themeStyle.activeIndicator}`}
                          />
                        )}

                        <div className="flex items-center gap-2.5 xl:gap-3 min-w-0 flex-1">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 overflow-hidden select-none transition-all duration-150 ${
                              active
                                ? themeStyle.iconActiveBg
                                : isRedAlert
                                ? "bg-rose-50 text-rose-600 group-hover:bg-rose-100 group-hover:text-rose-700 border border-rose-200/60"
                                : "bg-slate-100 text-slate-500 group-hover:bg-slate-200/80 group-hover:text-slate-900"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[19px] leading-none select-none pointer-events-none">
                              {link.icon}
                            </span>
                          </div>
                          <span className={`text-[13px] tracking-tight truncate ${
                            active ? "text-slate-900 font-extrabold" : "text-slate-600 font-semibold group-hover:text-slate-900"
                          }`}>
                            {link.label}
                          </span>
                        </div>

                        {link.badge && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors flex items-center gap-1.5 shadow-2xs shrink-0 whitespace-nowrap ml-1.5 ${
                              isRedAlert && !active
                                ? "bg-rose-50 text-rose-700 border-rose-200 font-extrabold"
                                : isRedAlert && active
                                ? "bg-rose-600 text-white border-rose-500 font-extrabold shadow-sm"
                                : active
                                ? `${themeStyle.badgeActive} shadow-xs font-black`
                                : "bg-slate-100 text-slate-600 border-slate-200 font-bold"
                            }`}
                          >
                            {isRedAlert && (
                              <span
                                className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                                  active ? "bg-white" : "bg-rose-600"
                                }`}
                              ></span>
                            )}
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </nav>
        </div>

        {/* User Profile Footer - Fixed at bottom */}
        <div className="shrink-0 p-3 xl:p-4 pb-8 sm:pb-9 border-t border-slate-200/80 bg-gradient-to-t from-slate-50/80 to-white z-20">
          <div className="flex items-center justify-between gap-2.5 p-2.5 xl:p-3 rounded-2xl bg-white border border-slate-200/90 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] hover:border-slate-300 transition-all duration-200 group">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="relative shrink-0">
                <div className={`w-9 h-9 rounded-full ${themeStyle.avatarBg} flex items-center justify-center text-white font-black text-xs shadow-xs select-none ring-2 ring-white`}>
                  {initials}
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white absolute -bottom-0.5 -right-0.5" title="Status: Online"></span>
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-xs text-slate-900 font-black truncate leading-tight ${themeStyle.hoverText} transition-colors`}>
                  {user?.name || "Drs. H. Mulyono"}
                </p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5 font-medium">
                  {user?.schoolName ? user.schoolName : `NIP ${user?.nip || "198402122008011004"}`}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors p-1.5 rounded-xl shrink-0"
              title="Keluar Konsol"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>
        </div>

        {/* Custom scrollbar style */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
          .custom-scrollbar::-webkit-scrollbar { width: 5px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(203, 213, 225, 0.8); border-radius: 10px; }
        `,
          }}
        />
      </aside>
    </>
  );
}
