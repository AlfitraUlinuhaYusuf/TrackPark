import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import ParkingSlotGrid from '../components/ParkingSlotGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import { PlusCircle, Bike, MapPin, FileText, CheckCircle2, AlertCircle, LayoutGrid } from 'lucide-react';

export default function AddVehiclePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [plateNumber, setPlateNumber] = useState('');
  const [model, setModel] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [selectedSlotCode, setSelectedSlotCode] = useState(null); // misal: 'A-03'
  const [notes, setNotes] = useState('');

  const [zones, setZones] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Ambil daftar zona dan motor yang sedang parkir
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [zonesRes, vehiclesRes] = await Promise.all([
          api.getZones(),
          api.getVehicles({ status: 'parked' }),
        ]);

        if (zonesRes.success && zonesRes.data) {
          setZones(zonesRes.data);

          // Cek apakah ada zone_id dari query parameter
          const paramZoneId = searchParams.get('zone_id');
          const paramSlot = searchParams.get('slot');

          if (paramZoneId && zonesRes.data.some((z) => z.id === paramZoneId)) {
            setZoneId(paramZoneId);
          } else {
            const availableZone = zonesRes.data.find((z) => !z.is_full) || zonesRes.data[0];
            if (availableZone) {
              setZoneId(availableZone.id);
            }
          }

          if (paramSlot) {
            setSelectedSlotCode(paramSlot);
          }
        }

        if (vehiclesRes.success && vehiclesRes.data) {
          setVehicles(vehiclesRes.data);
        }
      } catch (err) {
        setErrorMessage('Gagal memuat data zona parkir. Pastikan server backend aktif.');
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, [searchParams]);

  // Zona yang saat ini dipilih
  const currentZone = zones.find((z) => z.id === zoneId) || zones[0];
  const currentZoneVehicles = currentZone
    ? vehicles.filter((v) => v.zone_id === currentZone.id)
    : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessData(null);

    if (!plateNumber.trim()) {
      setErrorMessage('Nomor plat kendaraan wajib diisi!');
      return;
    }

    if (!zoneId) {
      setErrorMessage('Silakan pilih blok parkir!');
      return;
    }

    setSubmitting(true);

    try {
      // Masukkan penanda slot ke notes jika petugas memilih slot tertentu
      let finalNotes = notes.trim();
      if (selectedSlotCode) {
        finalNotes = `[Slot ${selectedSlotCode}] ${finalNotes}`.trim();
      }

      const response = await api.createVehicle({
        plate_number: plateNumber.trim().toUpperCase(),
        model: model.trim() || null,
        zone_id: zoneId,
        notes: finalNotes || null,
      });

      if (response.success) {
        setSuccessData(response.data);
        // Refresh daftar kendaraan lokal
        setVehicles((prev) => [response.data, ...prev]);
        // Reset form
        setPlateNumber('');
        setModel('');
        setNotes('');
        setSelectedSlotCode(null);
      } else {
        throw new Error(response.message || 'Gagal mencatat kendaraan');
      }
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
          Catat Motor Masuk Baru
        </h2>
        <p className="text-xs md:text-sm text-slate-500 mt-0.5">
          Input identitas kendaraan dan pilih kotak kolom parkir yang ingin ditempati
        </p>
      </div>

      {/* Sukses Alert */}
      {successData && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-3xl p-5 space-y-2.5 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <h4 className="font-extrabold text-sm md:text-base">Kendaraan Berhasil Dicatat Masuk!</h4>
          </div>
          <p className="text-xs md:text-sm text-emerald-700">
            Plat <strong>{successData.plate_number}</strong> telah dialokasikan ke{' '}
            <strong>{successData.zone_name || 'Blok Parkir'}</strong>.
          </p>
          <div className="pt-2 flex gap-2.5">
            <button
              onClick={() => navigate(`/vehicles/${successData.id}`)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition active:scale-95"
            >
              Lihat Detail
            </button>
            <button
              onClick={() => setSuccessData(null)}
              className="px-4 py-2 bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-50 rounded-xl text-xs font-bold transition active:scale-95"
            >
              Catat Motor Lainnya
            </button>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-3xl p-4 flex items-start gap-2.5 text-xs shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h5 className="font-bold">Gagal Menyimpan Data</h5>
            <p className="text-rose-700">{errorMessage}</p>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Menyiapkan formulir input..." />
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl p-5 md:p-8 border border-slate-200 shadow-sm space-y-5"
        >
          {/* Plat Nomor */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-2 uppercase tracking-wide">
              Nomor Plat Motor <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
              placeholder="Contoh: B 1234 XYZ"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-base md:text-lg font-mono font-bold tracking-wider text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition placeholder:font-sans placeholder:font-normal placeholder:text-sm placeholder:text-slate-400"
            />
            <p className="text-[11px] text-slate-400 mt-1.5">
              Huruf otomatis kapital saat diketik
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Model / Merk Motor */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                <Bike className="w-4 h-4 text-blue-600" />
                Jenis / Merk Motor
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Contoh: Honda Vario 160"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs md:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition placeholder:text-slate-400"
              />
            </div>

            {/* Pilihan Blok Parkir */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-600" />
                Pilih Blok Parkir <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={zoneId}
                onChange={(e) => {
                  setZoneId(e.target.value);
                  setSelectedSlotCode(null); // Reset slot jika ganti blok
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs md:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.id} disabled={z.is_full}>
                    {z.name} {z.is_full ? '(PENUH)' : `(${z.parked_count}/${z.capacity} motor)`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* PILIHAN KOTAK SLOT PARKIR INTERAKTIF */}
          {currentZone && (
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <LayoutGrid className="w-4 h-4 text-blue-600" />
                  Mau Dimasukkan ke Kotak Parkir Mana?
                </label>

                {selectedSlotCode ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-bold bg-blue-600 text-white px-2.5 py-0.5 rounded-lg shadow-xs">
                      Slot {selectedSlotCode}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedSlotCode(null)}
                      className="text-[11px] text-slate-400 hover:text-rose-600 underline"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-400 italic">
                    (Opsional / Otomatis jika tidak dipilih)
                  </span>
                )}
              </div>

              {/* Komponen Denah dalam Mode Pemilihan Slot */}
              <ParkingSlotGrid
                zone={currentZone}
                vehicles={currentZoneVehicles}
                isSelectMode={true}
                selectedSlotCode={selectedSlotCode}
                onSelectSlot={(code) => setSelectedSlotCode(code)}
              />
            </div>
          )}

          {/* Catatan Motor */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-600" />
              Catatan Kondisi / Barang Titipan (Opsional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: 1 helm KYT di spion kiri, body samping ada lecet..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs md:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || zones.length === 0}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-500/25 transition active:scale-[0.99] disabled:opacity-50"
          >
            <PlusCircle className="w-5 h-5" />
            <span>
              {submitting
                ? 'Menyimpan ke Server...'
                : selectedSlotCode
                ? `Simpan Motor di Slot ${selectedSlotCode}`
                : 'Simpan Motor Masuk'}
            </span>
          </button>
        </form>
      )}
    </div>
  );
}
