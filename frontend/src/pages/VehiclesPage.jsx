import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import VehicleCard from '../components/VehicleCard';
import ParkingSlotGrid from '../components/ParkingSlotGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Search, RefreshCw, Bike, Plus, X, Layers, LayoutGrid } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [zones, setZones] = useState([]);
  const [selectedZoneId, setSelectedZoneId] = useState(''); // '' = semua, atau ID zona tertentu
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Ambil data kendaraan dan zona
  const fetchData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [vehiclesRes, zonesRes] = await Promise.all([
        api.getVehicles({ status: 'parked', search }),
        api.getZones(),
      ]);

      if (vehiclesRes.success) {
        setVehicles(vehiclesRes.data || []);
      } else {
        throw new Error(vehiclesRes.message || 'Gagal memuat kendaraan');
      }

      if (zonesRes.success) {
        const loadedZones = zonesRes.data || [];
        setZones(loadedZones);
        // Default pilih zona pertama jika belum ada yang dipilih
        if (!selectedZoneId && loadedZones.length > 0) {
          setSelectedZoneId(loadedZones[0].id);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchData();
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  // Handler saat mengeluarkan motor langsung dari popup denah
  const handleVehicleExit = async (vehicleId) => {
    try {
      await api.updateVehicle(vehicleId, { status: 'exited' });
      fetchData(true);
    } catch (err) {
      alert(`Gagal mengeluarkan motor: ${err.message}`);
    }
  };

  // Cari zona aktif yang dipilih untuk denah kotak-kotak kolom parkir
  const activeZone = zones.find((z) => z.id === selectedZoneId) || zones[0];
  const activeZoneVehicles = activeZone
    ? vehicles.filter((v) => v.zone_id === activeZone.id)
    : vehicles;

  // Filter list motor yang ditampilkan di bawah denah
  const filteredVehicles = selectedZoneId
    ? vehicles.filter((v) => v.zone_id === selectedZoneId)
    : vehicles;

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header Stat & Tombol Aksi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Denah & Monitoring Parkir Motor
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Total <strong>{vehicles.length}</strong> motor sedang aktif terparkir di seluruh area
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition border border-slate-200 shadow-xs disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
            <span>Segarkan</span>
          </button>

          <Link
            to="/add"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-blue-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Motor</span>
          </Link>
        </div>
      </div>

      {/* Tabs Pilihan Blok untuk Menampilkan Denah Kolom Parkir */}
      {zones.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <LayoutGrid className="w-3.5 h-3.5 text-blue-600" />
            Pilih Blok Parkir untuk Tampilan Denah:
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {zones.map((zone) => {
              const isSelected = selectedZoneId === zone.id;
              const parkedInThisZone = vehicles.filter((v) => v.zone_id === zone.id).length;
              const isFull = parkedInThisZone >= zone.capacity;

              return (
                <button
                  key={zone.id}
                  onClick={() => setSelectedZoneId(zone.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 border shadow-xs ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/10'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <span>{zone.name}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isSelected
                        ? isFull
                          ? 'bg-rose-500 text-white'
                          : 'bg-white/20 text-white'
                        : isFull
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {parkedInThisZone}/{zone.capacity}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 1. BAGIAN ATAS: DENAH KOTAK-KOTAK KOLOM PARKIR (SEAT BOOKING STYLE) */}
      {!loading && activeZone && (
        <section className="space-y-2 animate-fadeIn">
          <ParkingSlotGrid
            zone={activeZone}
            vehicles={activeZoneVehicles}
            onVehicleExit={handleVehicleExit}
          />
        </section>
      )}

      {/* 2. BAGIAN BAWAH: LIST MOTOR TERPARKIR (DENGAN PENCARIAN) */}
      <section className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-slate-800 text-base md:text-lg flex items-center gap-2">
              <Bike className="w-5 h-5 text-blue-600" />
              Daftar Motor Terparkir ({filteredVehicles.length})
            </h3>
            <p className="text-xs text-slate-500">
              {selectedZoneId && activeZone
                ? `Menampilkan motor yang berada di ${activeZone.name}`
                : 'Menampilkan seluruh motor yang sedang aktif terparkir'}
            </p>
          </div>

          {/* Bar Pencarian */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari plat nomor atau merk..."
              className="w-full bg-white pl-10 pr-9 py-2 rounded-xl border border-slate-200 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-xs placeholder:text-slate-400"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Konten List Kendaraan */}
        {loading ? (
          <LoadingSpinner message="Mengambil data kendaraan..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={() => fetchData()} />
        ) : filteredVehicles.length === 0 ? (
          <div className="py-14 bg-white rounded-3xl border border-slate-200/80 text-center space-y-3 p-4">
            <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <Bike className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-bold text-slate-700 text-sm">
                {search ? 'Tidak ada motor yang cocok' : 'Belum Ada Motor di Blok Ini'}
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {search
                  ? `Pencarian "${search}" tidak ditemukan pada daftar parkir.`
                  : 'Slot di blok ini masih kosong. Tekan tombol Catat Motor Masuk untuk mengisi.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredVehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
