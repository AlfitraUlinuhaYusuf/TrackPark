import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import VehicleCard from '../components/VehicleCard';
import ParkingSlotGrid from '../components/ParkingSlotGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Layers, Bike } from 'lucide-react';
import { parseVehicleData } from '../services/formatters';

export default function ZoneDetailPage() {
  const { id } = useParams();

  const [zone, setZone] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchZoneDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getZoneById(id);
      if (response.success && response.data) {
        setZone(response.data);
      } else {
        throw new Error(response.message || 'Blok tidak ditemukan');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZoneDetail();
  }, [id]);

  const handleVehicleExit = async (vehicleId) => {
    try {
      const target = zone?.vehicles?.find((v) => v.id === vehicleId);
      const nowIso = new Date().toISOString();
      const { slotCode, cleanNotes } = parseVehicleData(target);
      
      let exitNotes = `[Keluar: ${nowIso}]`;
      if (slotCode) exitNotes = `[Slot ${slotCode}] ${exitNotes}`;
      if (cleanNotes) exitNotes = `${exitNotes} ${cleanNotes}`;

      await api.updateVehicle(vehicleId, {
        status: 'exited',
        exit_time: nowIso,
        notes: exitNotes,
      });

      fetchZoneDetail();
    } catch (err) {
      alert(`Gagal mengeluarkan motor: ${err.message}`);
    }
  };

  if (loading) return <LoadingSpinner message="Mengambil detail blok parkir..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchZoneDetail} />;
  if (!zone) return null;

  const capacity = Number(zone.capacity) || 0;
  const vehicles = zone.vehicles || [];
  const parkedCount = vehicles.length;
  const percent = capacity > 0 ? Math.min(100, Math.round((parkedCount / capacity) * 100)) : 0;
  const isFull = parkedCount >= capacity && capacity > 0;

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Banner Ringkasan Blok */}
      <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <Layers className="w-7 h-7" />
            </div>
            <div>
              <h2 className="font-black text-slate-900 text-lg md:text-xl">{zone.name}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {zone.description || 'Area penataan parkir kendaraan'}
              </p>
            </div>
          </div>
          <span
            className={`text-xs px-3 py-1 rounded-full font-extrabold border self-start sm:self-auto ${
              isFull
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
          >
            {isFull ? 'KAPASITAS PENUH' : `${percent}% TERISI`}
          </span>
        </div>

        {/* Bar Kapasitas */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Terisi saat ini:</span>
            <span className="font-extrabold text-slate-800">
              {parkedCount} / {capacity} motor
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isFull ? 'bg-rose-500' : percent >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 pt-0.5">
            <span>Sisa slot tersedia:</span>
            <strong className={isFull ? 'text-rose-600' : 'text-emerald-600'}>
              {Math.max(0, capacity - parkedCount)} motor
            </strong>
          </div>
        </div>
      </div>

      {/* 1. DENAH KOTAK-KOTAK KOLOM PARKIR INTERAKTIF (EKSKLUSIF DI SINI) */}
      <section className="space-y-2">
        <ParkingSlotGrid
          zone={zone}
          vehicles={vehicles}
          onVehicleExit={handleVehicleExit}
        />
      </section>

      {/* 2. DAFTAR MOTOR DI BAWAH DENAH */}
      <section className="space-y-4 pt-4 border-t border-slate-200">
        <div>
          <h3 className="font-extrabold text-slate-800 text-base md:text-lg flex items-center gap-2">
            <Bike className="w-5 h-5 text-blue-600" />
            Daftar Motor di {zone.name} ({vehicles.length})
          </h3>
          <p className="text-xs text-slate-500">
            Daftar seluruh kendaraan yang menempati slot di blok ini
          </p>
        </div>

        {vehicles.length === 0 ? (
          <div className="py-14 bg-white rounded-3xl border border-slate-200/80 text-center space-y-2 p-4">
            <Bike className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">
              Belum ada motor yang parkir di blok ini.
            </p>
            <p className="text-xs text-slate-400">
              Semua slot masih kosong dan siap digunakan.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {vehicles.map((v) => (
              <VehicleCard
                key={v.id}
                vehicle={{
                  ...v,
                  zone_name: zone.name,
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
