import React from 'react';
import {
  Bike,
  ShieldCheck,
  Smartphone,
  Database,
  Server,
  User,
  Heart,
  LayoutGrid,
  CheckCircle,
} from 'lucide-react';

export default function AboutPage() {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Hero Card TrackPark */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white rounded-3xl p-6 md:p-10 text-center space-y-4 shadow-xl shadow-blue-500/25">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto text-white shadow-inner">
          <Bike className="w-10 h-10 md:w-12 md:h-12" />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">TrackPark PWA</h2>
          <p className="text-xs md:text-sm text-blue-200 mt-1 max-w-lg mx-auto">
            Sistem Manajemen & Denah Parkir Modern Terintegrasi untuk Petugas Lapangan
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 bg-white/15 px-4 py-1.5 rounded-full text-xs font-bold border border-white/10">
          <ShieldCheck className="w-4 h-4 text-blue-200" />
          <span>Versi 1.1.0 (Desktop & Mobile PWA Ready)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Deskripsi Sistem */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-extrabold text-slate-800 text-base">Tentang Aplikasi</h3>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
            <strong>TrackPark</strong> adalah aplikasi Progressive Web App (PWA) responsif yang
            bekerja optimal baik di layar smartphone maupun layar monitor desktop PC/laptop. Dilengkapi
            dengan visualisasi denah kolom parkir interaktif layaknya denah reservasi kursi kereta.
          </p>
        </div>

        {/* Fitur Utama */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-extrabold text-slate-800 text-base">Fitur Utama</h3>
          <ul className="space-y-2.5 text-xs md:text-sm text-slate-600">
            <li className="flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Denah kotak kolom parkir interaktif (Seat View booking style).</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Popup detail motor instan saat slot parkir diklik.</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Sidebar navigasi desktop & Bottom bar mobile.</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Integrasi cloud database PostgreSQL Supabase real-time.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Info Teknologi & Konfigurasi */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-800 text-base">Tech Stack & Konfigurasi</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs md:text-sm">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-slate-500 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-blue-600" />
              Frontend
            </span>
            <span className="font-bold text-slate-800">React + Vite + Tailwind</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-slate-500 flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-600" />
              Backend API
            </span>
            <span className="font-bold text-slate-800">Node.js + Express.js</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-slate-500 flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" />
              Database
            </span>
            <span className="font-bold text-slate-800">Supabase PostgreSQL</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-slate-500 flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-blue-600" />
              Responsive Mode
            </span>
            <span className="font-bold text-emerald-600">Desktop & Mobile PWA</span>
          </div>
        </div>

        <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <span className="text-slate-600 font-medium">REST API Endpoint Aktif:</span>
          <span className="font-mono text-blue-700 font-bold break-all">{apiUrl}</span>
        </div>
      </div>

      {/* Profil Pengembang */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          Profil Pengembang
        </h3>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/25">
            TP
          </div>
          <div>
            <h4 className="font-black text-slate-900 text-base">Tim Developer TrackPark</h4>
            <p className="text-xs text-slate-500">Fullstack Web & Mobile System Engineering</p>
          </div>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed pt-2 border-t border-slate-100">
          Aplikasi TrackPark dirancang untuk memberikan kemudahan bagi petugas di lapangan dalam
          mengatur alokasi tempat parkir secara visual dan terstruktur, serta memonitor kapasitas
          seluruh blok secara real-time.
        </p>
      </div>

      <div className="text-center py-2 text-xs text-slate-400">
        <p>© 2026 TrackPark System. All rights reserved.</p>
      </div>
    </div>
  );
}
