import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Bike,
  Layers,
  PlusCircle,
  History,
  Info,
  ShieldCheck,
  MapPin,
  ExternalLink,
} from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    {
      to: '/vehicles',
      label: 'Motor Terparkir',
      sublabel: 'Daftar & denah parkir',
      icon: Bike,
    },
    {
      to: '/zones',
      label: 'Kapasitas Blok',
      sublabel: 'Status ruang & kuota',
      icon: Layers,
    },
    {
      to: '/add',
      label: 'Catat Motor Masuk',
      sublabel: 'Input kendaraan baru',
      icon: PlusCircle,
      highlight: true,
    },
    {
      to: '/history',
      label: 'Riwayat Parkir',
      sublabel: 'Data kendaraan keluar',
      icon: History,
    },
    {
      to: '/about',
      label: 'Tentang Aplikasi',
      sublabel: 'Info sistem & pengembang',
      icon: Info,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white border-r border-slate-200 min-h-screen shrink-0 sticky top-0 h-screen select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100 flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
          <Bike className="w-6 h-6 stroke-[2.2]" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-extrabold text-slate-900 text-lg tracking-tight">TrackPark</h1>
            <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded">
              PWA
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">Sistem Parkir Petugas</p>
        </div>
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Menu Utama
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-3.5 py-3 rounded-2xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold'
                    : item.highlight
                    ? 'bg-blue-50/70 text-blue-700 hover:bg-blue-100/70 font-semibold border border-blue-100'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`p-2 rounded-xl transition ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.highlight
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-blue-600'
                    }`}
                  >
                    <Icon className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm leading-tight truncate">{item.label}</div>
                    <div
                      className={`text-[11px] truncate mt-0.5 ${
                        isActive ? 'text-blue-100 font-normal' : 'text-slate-400'
                      }`}
                    >
                      {item.sublabel}
                    </div>
                  </div>
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Petugas Info Footer */}
      <div className="p-4 m-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-slate-500 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Status Petugas
          </span>
          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
            ONLINE
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-tight">
          Terhubung ke PostgreSQL Supabase & Server Express.js
        </p>
      </div>
    </aside>
  );
}

