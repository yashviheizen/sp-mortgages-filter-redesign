"use client";

import {
  Bell, ChevronsUpDown, Clock, LayoutGrid, Megaphone, MessageCircle, PanelLeft, UserPlus, Users, ContactRound,
} from "lucide-react";

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid h-8 w-8 place-items-center rounded-md bg-white">
        <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden>
          <circle cx="16" cy="16" r="13" fill="#0f1f33" />
          <path d="M20.5 10.5c-1-1-2.6-1.6-4.4-1.6-2.8 0-4.6 1.4-4.6 3.5 0 4.6 9.2 2.6 9.2 7 0 2.2-2 3.7-4.8 3.7-2 0-3.8-.7-5-2" fill="none" stroke="#4ade80" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </div>
      <div className="leading-tight">
        <div className="text-[13px] font-semibold text-white">SP Mortgages</div>
        <div className="text-[10px] font-medium tracking-[0.14em] text-white/55">ADMIN CONSOLE</div>
      </div>
    </div>
  );
}

const NAV = [
  { label: "Dashboard", icon: LayoutGrid },
  { label: "Queries", icon: MessageCircle, active: true, count: 13 },
  { label: "Clients", icon: ContactRound },
  { label: "Referrals", icon: UserPlus },
  { label: "Extension Requests", icon: Clock },
  { label: "Team", icon: Users },
  { label: "Broadcast", icon: Megaphone },
];

export function Sidebar() {
  return (
    <aside className="flex w-[228px] shrink-0 flex-col bg-navy-900 text-white/80">
      <div className="px-[18px] pt-[14px] pb-7">
        <Logo />
      </div>
      <div className="px-[18px] pb-2 text-[11px] font-medium text-white/50">Menu</div>
      <nav className="flex flex-col gap-0.5 px-2.5 text-[13px]">
        {NAV.map(({ label, icon: Icon, active, count }) => (
          <div key={label}>
            <a
              href="#"
              className={`flex items-center gap-2.5 rounded-md px-2 py-[7px] transition-colors ${
                active ? "bg-navy-800 text-white" : "hover:bg-navy-800/60 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4 opacity-80" strokeWidth={1.75} />
              <span className="flex-1">{label}</span>
              {count != null && <span className="text-[11px] text-white/70">{count}</span>}
            </a>
            {active && (
              <div className="mt-0.5 flex flex-col gap-0.5 pl-5 pr-2.5">
                <a href="#" className="rounded-md bg-navy-800/70 px-2 py-[6px] text-white">Open queries</a>
                <a href="#" className="rounded-md px-2 py-[6px] hover:bg-navy-800/60 hover:text-white">Closed/resolved queries</a>
              </div>
            )}
          </div>
        ))}
      </nav>
      <div className="mt-auto flex items-center gap-2.5 border-t border-white/5 px-[18px] py-3.5">
        <div className="grid h-7 w-7 place-items-center rounded-md bg-emerald-700 text-[11px] font-semibold text-white">R</div>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="text-[12.5px] text-white">Rajesh</div>
          <div className="truncate text-[11px] text-white/60">rajeshsmfh@gmail.com</div>
        </div>
        <ChevronsUpDown className="h-3.5 w-3.5 text-white/60" />
      </div>
    </aside>
  );
}

export function Header() {
  return (
    <header className="flex h-[56px] shrink-0 items-center gap-4 border-b border-gray-200 px-4">
      <button className="grid h-7 w-7 place-items-center rounded-md text-gray-600 hover:bg-gray-100" aria-label="Toggle sidebar">
        <PanelLeft className="h-4 w-4" strokeWidth={1.75} />
      </button>
      <div className="leading-tight">
        <h1 className="text-[15px] font-semibold text-gray-900">Queries</h1>
        <p className="text-[11.5px] text-gray-500">Queries that are still open</p>
      </div>
      <div className="ml-auto flex items-center gap-5">
        <button className="relative text-gray-600" aria-label="Notifications">
          <Bell className="h-4 w-4" strokeWidth={1.75} />
          <span className="absolute -top-2 -right-2.5 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[9px] font-semibold text-white">9+</span>
        </button>
        <div className="flex items-center gap-2.5">
          <div className="text-right leading-tight">
            <div className="text-[12.5px] font-medium text-gray-900">Rajesh</div>
            <div className="text-[11px] text-gray-500">Super Admin</div>
          </div>
          <div className="grid h-7 w-7 place-items-center rounded-full bg-emerald-700 text-[11px] font-semibold text-white">R</div>
        </div>
      </div>
    </header>
  );
}
