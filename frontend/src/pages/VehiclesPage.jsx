import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import VehicleCard from '../components/VehicleCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Search, RefreshCw, Bike, X, Filter } from 'lucide-react';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [zones, setZones] = useState([]);
  const [selectedZoneId, setSelectedZoneId] = useState(''); // '' = Semua Blok
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

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
        setZones(zonesRes.data || []);
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

  // Filter kendaraan berdasarkan zona jika dipilih
  const filteredVehicles = selectedZoneId
    ? vehicles.filter((v) => v.zone_id === selectedZoneId)
    : vehicles;

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header Utama Halaman List 1: Fokus Informasi & Monitoring */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Bike className="w-6 h-6 text-blue-600" />
            Daftar Motor Terparkir
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Total <strong>{vehicles.length}</strong> motor sedang aktif terparkir saat ini
          </p>
        </div>

        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition border border-slate-200 shadow-xs self-start sm:self-auto disabled:opacity-50"
          title="Refresh Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* Filter Blok & Bar Pencarian Cepat Plat Nomor */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari plat nomor atau tipe motor..."
            className="w-full bg-slate-50 pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition placeholder:text-slate-400"
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

        {/* Filter Tab Kategori Blok */}
        {zones.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-slate-100 text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1 mr-1 text-[11px]">
              <Filter className="w-3 h-3 text-slate-400" />
              Blok:
            </span>

            <button
              onClick={() => setSelectedZoneId('')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                selectedZoneId === ''
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua Blok ({vehicles.length})
            </button>

            {zones.map((zone) => {
              const isSelected = selectedZoneId === zone.id;
              const countInZone = vehicles.filter((v) => v.zone_id === zone.id).length;

              return (
                <button
                  key={zone.id}
                  onClick={() => setSelectedZoneId(zone.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{zone.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {countInZone}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Konten Daftar Kendaraan (Halaman List Utama 1) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            Menampilkan <strong>{filteredVehicles.length}</strong> motor aktif
          </span>
          <span className="italic">
            Klik kartu motor untuk detail & checkout keluar
          </span>
        </div>

        {loading ? (
          <LoadingSpinner message="Mengambil daftar kendaraan terparkir..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={() => fetchData()} />
        ) : filteredVehicles.length === 0 ? (
          <div className="py-16 bg-white rounded-3xl border border-slate-200/80 text-center space-y-3 p-6">
            <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <Bike className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-bold text-slate-700 text-sm">
                {search ? 'Tidak ada motor yang cocok' : 'Belum Ada Motor Terparkir'}
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {search
                  ? `Kata kunci "${search}" tidak ditemukan pada daftar parkir aktif.`
                  : 'Saat ini belum ada kendaraan yang sedang parkir di area ini.'}
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
