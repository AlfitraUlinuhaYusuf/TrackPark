import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Pages
import VehiclesPage from './pages/VehiclesPage';
import VehicleDetailPage from './pages/VehicleDetailPage';
import ZonesPage from './pages/ZonesPage';
import ZoneDetailPage from './pages/ZoneDetailPage';
import AddVehiclePage from './pages/AddVehiclePage';
import HistoryPage from './pages/HistoryPage';
import AboutPage from './pages/AboutPage';

export default function App() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    let pageTitle = 'TrackPark - Sistem Parkir Petugas';

    if (path === '/vehicles') pageTitle = 'TrackPark - Motor Terparkir';
    else if (path.startsWith('/vehicles/')) pageTitle = 'TrackPark - Detail Kendaraan';
    else if (path === '/zones') pageTitle = 'TrackPark - Kapasitas Blok Parkir';
    else if (path.startsWith('/zones/')) pageTitle = 'TrackPark - Denah Blok';
    else if (path === '/add') pageTitle = 'TrackPark - Catat Motor Masuk';
    else if (path === '/history') pageTitle = 'TrackPark - Riwayat Parkir';
    else if (path === '/about') pageTitle = 'TrackPark - Tentang Sistem';

    document.title = pageTitle;
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-row selection:bg-blue-200">
      <Sidebar />

      <div className="w-full flex-1 flex flex-col min-h-screen bg-slate-50 shadow-xs border-r border-slate-200">
        <Navbar />

        <main className="flex-1 pb-24 md:pb-8 overflow-y-auto">
          <div className="w-full max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/vehicles" replace />} />
              <Route path="/vehicles" element={<VehiclesPage />} />
              <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
              <Route path="/zones" element={<ZonesPage />} />
              <Route path="/zones/:id" element={<ZoneDetailPage />} />
              <Route path="/add" element={<AddVehiclePage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="*" element={<Navigate to="/vehicles" replace />} />
            </Routes>
          </div>
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
