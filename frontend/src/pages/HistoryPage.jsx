import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import VehicleCard from '../components/VehicleCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { History, Search, RefreshCw, X, Clock, CheckCircle } from 'lucide-react';

export default function HistoryPage() {
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const response = await api.getVehicles({ status: 'exited', search });
      if (response.success) {
        setVehicles(response.data || []);
      } else {
        throw new Error(response.message || 'Gagal memuat riwayat parkir');
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
      fetchHistory();
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-blue-600" />
            Riwayat Kendaraan Keluar
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Log pencatatan waktu masuk, waktu keluar, dan durasi parkir seluruh kendaraan
          </p>
        </div>
        <button
          onClick={() => fetchHistory(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition border border-slate-200 shadow-xs self-start sm:self-auto"
          title="Refresh Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
          <span>Segarkan</span>
        </button>
      </div>

      {/* Bar Pencarian */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari plat nomor atau merk di riwayat..."
          className="w-full bg-white pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-xs placeholder:text-slate-400"
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

      {/* Konten Riwayat Grid Responsif */}
      {loading ? (
        <LoadingSpinner message="Mengambil riwayat parkir..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={() => fetchHistory()} />
      ) : vehicles.length === 0 ? (
        <div className="py-16 text-center space-y-2 bg-white rounded-3xl border border-slate-200 p-6">
          <History className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-sm">
            {search ? 'Tidak Ada Riwayat Ditemukan' : 'Belum Ada Riwayat Keluar'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {search
              ? `Tidak ada kendaraan dengan kata kunci "${search}" di riwayat.`
              : 'Kendaraan yang telah diselesaikan parkirnya dan dicatat waktu keluarnya akan tampil di halaman ini.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>
      )}
    </div>
  );
}
