import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bike, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Cek apakah halaman adalah halaman detail (memerlukan tombol kembali)
  const isDetailPage =
    location.pathname.startsWith('/vehicles/') ||
    (location.pathname.startsWith('/zones/') && location.pathname !== '/zones');

  // Judul dinamis berdasarkan rute
  const getTitle = () => {
    if (location.pathname === '/vehicles') return 'Monitoring Parkir & Denah Kolom';
    if (location.pathname.startsWith('/vehicles/')) return 'Detail Kendaraan';
    if (location.pathname === '/zones') return 'Kapasitas Blok Parkir';
    if (location.pathname.startsWith('/zones/')) return 'Detail Blok Parkir';
    if (location.pathname === '/add') return 'Catat Motor Masuk Baru';
    if (location.pathname === '/history') return 'Riwayat Kendaraan Keluar';
    if (location.pathname === '/about') return 'Tentang Sistem TrackPark';
    return 'TrackPark';
  };

  const getSubtitle = () => {
    if (location.pathname === '/vehicles') return 'Denah kotak parkir interaktif ala seat view & sirkulasi aktif';
    if (location.pathname === '/zones') return 'Monitoring okupansi dan sisa slot per blok parkir';
    if (location.pathname === '/add') return 'Input data motor dan alokasikan slot parkir';
    if (location.pathname === '/history') return 'Log pencatatan seluruh kendaraan yang telah keluar';
    return 'TrackPark Parking Management System';
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-3.5 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        {isDetailPage ? (
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition border border-slate-200 shadow-xs flex items-center gap-1.5 text-xs font-semibold"
            aria-label="Kembali"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Kembali</span>
          </button>
        ) : (
          <div className="md:hidden w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Bike className="w-5 h-5" />
          </div>
        )}

        <div>
          <h1 className="font-extrabold text-slate-900 text-base md:text-lg leading-tight">
            {getTitle()}
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block mt-0.5">
            {getSubtitle()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="font-medium">Sistem Operasi Aktif</span>
        </div>

        <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl text-xs font-bold border border-blue-100">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>PWA Ready</span>
        </div>
      </div>
    </header>
  );
}
