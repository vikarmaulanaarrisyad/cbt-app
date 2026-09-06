import React from "react";
import ProctorSidebar from "@/components/ProctorSidebar";

export default function ProctorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#F8FAFC] font-sans text-slate-800 min-h-screen flex selection:bg-blue-100 selection:text-blue-900 overflow-hidden relative">
      <ProctorSidebar />
      <div className="w-full pl-72 flex flex-col flex-1 h-screen overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
