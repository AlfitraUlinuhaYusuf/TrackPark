import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import ZoneCard from '../components/ZoneCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Layers, RefreshCw, BarChart3, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ZonesPage() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchZones = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const response = await api.getZones();
      if (response.success) {
        setZones(response.data || []);
      } else {
        throw new Error(response.message || 'Gagal memuat zona parkir');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const totalCapacity = zones.reduce((acc, curr) => acc + (Number(curr.capacity) || 0), 0);
  const totalParked = zones.reduce((acc, curr) => acc + (Number(curr.parked_count) || 0), 0);
  const overallPercent = totalCapacity > 0 ? Math.round((totalParked / totalCapacity) * 100) : 0;

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Status Kapasitas Blok Parkir
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Monitoring okupansi real-time pada {zones.length} blok parkir
          </p>
        </div>
        <button
          onClick={() => fetchZones(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition border border-slate-200 shadow-xs self-start sm:self-auto"
          title="Refresh Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* Ringkasan Akumulasi Kapasitas Desktop & Mobile */}
      {!loading && !error && zones.length > 0 && (
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white rounded-3xl p-5 md:p-8 shadow-xl shadow-blue-500/20 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs md:text-sm font-bold text-blue-100 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-300" />
              Total Okupansi Parkir Seluruh Area
            </span>
            <span className="text-xs font-black bg-white/20 px-3 py-1 rounded-full backdrop-blur-md self-start sm:self-auto">
              {overallPercent}% Kapasitas Terisi
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-xs">
              <p className="text-xs text-blue-200">Motor Terparkir</p>
              <p className="text-2xl md:text-3xl font-black mt-1">{totalParked}</p>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-xs">
              <p className="text-xs text-blue-200">Total Kuota Parkir</p>
              <p className="text-2xl md:text-3xl font-black mt-1">{totalCapacity}</p>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-xs">
              <p className="text-xs text-blue-200">Sisa Slot Kosong</p>
              <p className="text-2xl md:text-3xl font-black mt-1 text-emerald-300">
                {Math.max(0, totalCapacity - totalParked)}
              </p>
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <div className="w-full bg-black/20 rounded-full h-3 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${overallPercent}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Grid Kartu Blok Responsif */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          Rincian Blok Parkir (Klik untuk Melihat Denah Slot)
        </h3>

        {loading ? (
          <LoadingSpinner message="Mengambil status blok parkir..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={() => fetchZones()} />
        ) : zones.length === 0 ? (
          <div className="py-16 text-center space-y-2 bg-white rounded-3xl border border-slate-200 p-6">
            <Layers className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-semibold text-slate-700 text-sm">Belum Ada Blok Parkir</h3>
            <p className="text-xs text-slate-400">
              Jalankan skrip schema SQL di Supabase untuk memasukkan zona awal.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {zones.map((zone) => (
              <ZoneCard key={zone.id} zone={zone} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
