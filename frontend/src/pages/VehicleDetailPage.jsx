import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import {
  MapPin,
  Clock,
  LogOut,
  Trash2,
  Save,
  CheckCircle2,
  AlertTriangle,
  LayoutGrid,
} from 'lucide-react';
import { parseVehicleData, formatTime, formatDate } from '../services/formatters';

export default function VehicleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState(null);
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [error, setError] = useState(null);

  // Load detail kendaraan dan daftar zona
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [vehicleRes, zonesRes] = await Promise.all([
          api.getVehicleById(id),
          api.getZones(),
        ]);

        if (vehicleRes.success && vehicleRes.data) {
          setVehicle(vehicleRes.data);
          setSelectedZone(vehicleRes.data.zone_id || '');
          const { cleanNotes } = parseVehicleData(vehicleRes.data);
          setNotes(cleanNotes || '');
        } else {
          throw new Error(vehicleRes.message || 'Kendaraan tidak ditemukan');
        }

        if (zonesRes.success) {
          setZones(zonesRes.data || []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  // Simpan perubahan lokasi blok (zone_id) atau catatan
  const handleSaveLocation = async (e) => {
    e.preventDefault();
    if (!selectedZone) return;

    setSubmitting(true);
    setActionSuccess('');
    setError(null);

    try {
      const { slotCode } = parseVehicleData(vehicle);
      // Pertahankan tag slot jika ada
      const finalNotes = slotCode ? `[Slot ${slotCode}] ${notes}`.trim() : notes.trim();

      const res = await api.updateVehicle(id, {
        zone_id: selectedZone,
        notes: finalNotes || null,
      });

      if (res.success) {
        setVehicle(res.data);
        setActionSuccess('Lokasi blok parkir dan catatan berhasil diperbarui!');
        setTimeout(() => setActionSuccess(''), 3000);
      } else {
        throw new Error(res.message || 'Gagal memperbarui kendaraan');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Selesaikan parkir (Ubah status menjadi 'exited' dan catat waktu keluar)
  const handleExitVehicle = async () => {
    const confirm = window.confirm(
      `Konfirmasi: Motor ${vehicle.plate_number} akan diselesaikan parkirnya dan dicatat keluar sekarang?`
    );
    if (!confirm) return;

    setSubmitting(true);
    setError(null);

    try {
      const nowIso = new Date().toISOString();
      const { slotCode, cleanNotes } = parseVehicleData(vehicle);
      
      // Catat waktu keluar permanen ke format [Keluar: ISO]
      let exitNotes = `[Keluar: ${nowIso}]`;
      if (slotCode) exitNotes = `[Slot ${slotCode}] ${exitNotes}`;
      if (cleanNotes) exitNotes = `${exitNotes} ${cleanNotes}`;

      const res = await api.updateVehicle(id, {
        status: 'exited',
        notes: exitNotes,
      });

      if (res.success) {
        alert(`Motor ${vehicle.plate_number} berhasil dicatat keluar!`);
        navigate('/history');
      } else {
        throw new Error(res.message || 'Gagal menyelesaikan parkir');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Hapus data kendaraan
  const handleDeleteVehicle = async () => {
    const confirm = window.confirm(
      `PERINGATAN: Apakah Anda yakin ingin menghapus data motor ${vehicle.plate_number}? Data akan dihapus permanen.`
    );
    if (!confirm) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await api.deleteVehicle(id);
      if (res.success) {
        alert(`Data motor ${vehicle.plate_number} berhasil dihapus.`);
        navigate('/vehicles');
      } else {
        throw new Error(res.message || 'Gagal menghapus kendaraan');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Memuat detail kendaraan..." />;
  if (error && !vehicle) return <ErrorMessage message={error} onRetry={() => navigate('/vehicles')} />;
  if (!vehicle) return null;

  const isParked = vehicle.status === 'parked';
  const { entryDate, exitDate, durationStr, slotCode, cleanNotes } = parseVehicleData(vehicle);

  return (
    <div className="p-4 md:p-8 space-y-5 max-w-2xl mx-auto">
      {/* Banner Notifikasi Sukses */}
      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Error Action Banner */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Kartu Plat & Info Utama */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center space-y-4">
        <div className="inline-block bg-slate-900 text-white font-mono font-black text-2xl px-6 py-2.5 rounded-2xl shadow-md border-2 border-slate-700 tracking-wider">
          {vehicle.plate_number}
        </div>

        <div>
          <h2 className="font-extrabold text-slate-800 text-base md:text-lg">
            {vehicle.model || 'Motor (Merk tidak dicatat)'}
          </h2>

          <div className="flex items-center justify-center gap-2 mt-2">
            <span
              className={`text-xs px-3 py-1 rounded-full font-extrabold border ${
                isParked
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {isParked ? 'Sedang Terparkir' : 'Sudah Keluar'}
            </span>

            {slotCode && (
              <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200 flex items-center gap-1">
                <LayoutGrid className="w-3.5 h-3.5 text-blue-600" />
                Slot {slotCode}
              </span>
            )}
          </div>
        </div>

        {/* Info Grid Responsif */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left pt-3 border-t border-slate-100 text-xs">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
              <MapPin className="w-3 h-3 text-blue-600" />
              Blok Parkir
            </span>
            <p className="font-extrabold text-slate-800 truncate">
              {vehicle.zone_name || vehicle.zones?.name || 'Belum diatur'}
            </p>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-600" />
              Waktu Masuk
            </span>
            <p className="font-extrabold text-slate-800">
              {formatTime(entryDate)}, {formatDate(entryDate)}
            </p>
          </div>

          {/* Waktu Keluar jika ada */}
          {exitDate && (
            <div className="bg-rose-50/80 p-3 rounded-2xl border border-rose-100 space-y-1">
              <span className="text-rose-500 text-[10px] uppercase font-bold flex items-center gap-1">
                <LogOut className="w-3 h-3 text-rose-600" />
                Waktu Keluar
              </span>
              <p className="font-extrabold text-rose-900">
                {formatTime(exitDate)}, {formatDate(exitDate)}
              </p>
            </div>
          )}

          {/* Durasi Parkir */}
          {durationStr && (
            <div className="bg-emerald-50/80 p-3 rounded-2xl border border-emerald-100 space-y-1">
              <span className="text-emerald-600 text-[10px] uppercase font-bold flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-600" />
                Total Durasi Parkir
              </span>
              <p className="font-extrabold text-emerald-900">
                {durationStr}
              </p>
            </div>
          )}
        </div>

        {cleanNotes && (
          <div className="bg-amber-50 text-amber-900 p-3 rounded-2xl text-xs text-left italic border border-amber-200">
            Catatan: "{cleanNotes}"
          </div>
        )}
      </div>

      {/* Form Pindah Blok / Update Catatan (Hanya jika masih status 'parked') */}
      {isParked && (
        <form
          onSubmit={handleSaveLocation}
          className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3.5"
        >
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-blue-600" />
            Pindahkan Blok Parkir / Perbarui Catatan
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Pilih Blok Parkir Tujuan:
            </label>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            >
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name} ({z.parked_count ?? '0'}/{z.capacity} motor)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Catatan Kondisi Motor:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: helm ditaruh di spion kiri, lecet di knalpot..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition placeholder:text-slate-400 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-1.5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition active:scale-[0.99] disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
          </button>
        </form>
      )}

      {/* Tombol Aksi Utama */}
      <div className="space-y-2.5 pt-1">
        {isParked && (
          <button
            onClick={handleExitVehicle}
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-extrabold shadow-lg shadow-emerald-600/20 transition active:scale-[0.99] disabled:opacity-50"
          >
            <LogOut className="w-5 h-5" />
            <span>Selesaikan Parkir & Catat Waktu Keluar</span>
          </button>
        )}

        <button
          onClick={handleDeleteVehicle}
          disabled={submitting}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-2xl text-xs font-semibold border border-slate-200 hover:border-rose-200 transition active:scale-[0.99] disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          <span>Hapus Data Kendaraan Ini</span>
        </button>
      </div>
    </div>
  );
}
