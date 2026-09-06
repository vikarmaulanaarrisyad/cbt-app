"use client";

import React, { useState } from "react";
import { Alert } from "@/lib/sweetalert";

interface ChatMessage {
  sender: "PROCTOR" | "NOC";
  name: string;
  time: string;
  text: string;
}

export default function SupportPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: "NOC", name: "Tim NOC Pusat (Jakarta)", time: "07:30 WIB", text: "Selamat pagi Pengawas Ruang CBT-08. Server SRV-JKT-04 dalam kondisi prima (Latensi 8ms)." },
    { sender: "PROCTOR", name: "Drs. H. Mulyono (Pengawas)", time: "08:15 WIB", text: "Terima kasih NOC, sesi 1 berjalan lancar." },
  ]);
  const [inputText, setInputText] = useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;

    const userMsg: ChatMessage = { sender: "PROCTOR", name: "Drs. H. Mulyono", time: timeStr, text: inputText.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");

    setTimeout(() => {
      const nocReply: ChatMessage = {
        sender: "NOC",
        name: "Teknisi Helpdesk NOC",
        time: timeStr,
        text: "Pesan diterima oleh Tim Infrastruktur NOC. Petugas teknisi sedang memantau kondisi ruangan Anda.",
      };
      setMessages((prev) => [...prev, nocReply]);
    }, 1000);
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-100 flex flex-col font-body-default text-slate-800 w-full min-w-0">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs shrink-0">
            <span className="material-symbols-outlined text-[22px]">support_agent</span>
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">Pusat Bantuan & Live Chat Teknisi NOC</h1>
            <p className="text-xs text-slate-500">Komunikasi Langsung Pengawas Ruangan dengan Tim Infrastruktur Server Pusat</p>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-4xl">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col h-[550px]">
            {/* Chat Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <div>
                  <p className="font-bold text-sm">Helpdesk NOC SRV-JKT-04</p>
                  <p className="text-[10px] text-emerald-400 font-mono">Tim Siaga Aktif (Latensi 8ms)</p>
                </div>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col max-w-md ${m.sender === "PROCTOR" ? "ml-auto items-end" : "items-start"}`}
                >
                  <span className="text-[10px] font-bold text-slate-500 mb-1">{m.name} • {m.time}</span>
                  <div
                    className={`p-3.5 rounded-2xl text-xs font-medium shadow-sm leading-relaxed ${
                      m.sender === "PROCTOR"
                        ? "bg-blue-600 text-white rounded-tr-none"
                        : "bg-white text-slate-800 border border-slate-200 rounded-tl-none"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Footer Input */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200 flex items-center gap-3">
              <input
                type="text"
                placeholder="Ketik pesan kendala teknis atau pertanyaan ke NOC..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer"
              >
                <span>Kirim</span>
                <span className="material-symbols-outlined text-[16px]">send</span>
              </button>
            </form>
          </div>
        </main>
    </div>
  );
}
