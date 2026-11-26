import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bike, CheckCircle, ExternalLink, LogOut, X } from 'lucide-react';
import { parseVehicleData, formatTime, formatDate } from '../services/formatters';

export default function ParkingSlotGrid({
  zone,
  vehicles = [],
  onVehicleExit,
  // Props untuk mode pemilihan slot di halaman Catat Masuk (/add)
  isSelectMode = false,
  selectedSlotCode = null,
  onSelectSlot = null,
}) {
  const navigate = useNavigate();
  const [activeSlotModal, setActiveSlotModal] = useState(null); // { slotNumber, slotCode, isOccupied, vehicle }

  const capacity = Number(zone?.capacity) || 10;
  const zonePrefix = zone?.name ? zone.name.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase() : 'Z';

  // 1. Petakan kendaraan aktif (parked) ke nomor slot
  const parkedVehicles = vehicles.filter((v) => v.status === 'parked');
  
  const slotOccupancyMap = {};
  const unassignedVehicles = [];

  parkedVehicles.forEach((v) => {
    const { slotCode } = parseVehicleData(v);
    let assigned = false;

    if (slotCode) {
      const numMatch = slotCode.match(/(\d+)/);
      if (numMatch) {
        const slotNum = parseInt(numMatch[1], 10);
        if (slotNum >= 1 && slotNum <= capacity && !slotOccupancyMap[slotNum]) {
          slotOccupancyMap[slotNum] = v;
          assigned = true;
        }
      }
    }

    if (!assigned) {
      unassignedVehicles.push(v);
    }
  });

  // Isi kendaraan yang belum punya slot spesifik ke slot kosong pertama
  let unassignedIndex = 0;
  for (let i = 1; i <= capacity; i++) {
    if (!slotOccupancyMap[i] && unassignedIndex < unassignedVehicles.length) {
      slotOccupancyMap[i] = unassignedVehicles[unassignedIndex];
      unassignedIndex++;
    }
  }

  // 2. Buat array slot berukuran tetap
  const slots = Array.from({ length: capacity }, (_, i) => {
    const slotNumber = i + 1;
    const slotCode = `${zonePrefix}-${String(slotNumber).padStart(2, '0')}`;
    const vehicle = slotOccupancyMap[slotNumber] || null;

    return {
      slotNumber,
      slotCode,
      isOccupied: Boolean(vehicle),
      vehicle,
    };
  });

  const occupiedCount = parkedVehicles.length;
  const emptyCount = Math.max(0, capacity - occupiedCount);

  const handleSlotClick = (slot) => {
    if (isSelectMode) {
      if (slot.isOccupied) return;
      if (onSelectSlot) {
        onSelectSlot(slot.slotCode);
      }
      return;
    }

    setActiveSlotModal(slot);
  };

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl p-3.5 sm:p-5 border border-slate-200 shadow-sm space-y-3">
      {/* Header Slot & Legend Compact */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="font-extrabold text-slate-900 text-sm md:text-base">
              {isSelectMode ? 'Pilih Kotak Slot Parkir' : `Denah Kolom Parkir ${zone?.name || ''}`}
            </h3>
            <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded border border-blue-200">
              {capacity} Slot
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            {isSelectMode
              ? 'Klik salah satu kotak hijau yang kosong untuk menentukan posisi motor'
              : 'Klik kotak merah untuk melihat identitas motor yang sedang parkir'}
          </p>
        </div>

        {/* Legend Ringkas & Rapi */}
        <div className="flex items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
            <span className="text-slate-600 font-medium">Kosong ({emptyCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
            <span className="text-slate-600 font-medium">Terisi ({occupiedCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-600 ring-2 ring-blue-300"></span>
            <span className="text-slate-600 font-medium">Dipilih</span>
          </div>
        </div>
      </div>

      {/* Grid Denah Tempat Parkir Compact & Posisi Konsisten */}
      <div className="bg-slate-50/90 rounded-2xl p-3 border border-dashed border-slate-200 flex justify-center">
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2 justify-items-center w-full max-w-2xl">
          {slots.map((slot) => {
            const isSelected = isSelectMode
              ? selectedSlotCode === slot.slotCode
              : activeSlotModal?.slotNumber === slot.slotNumber;

            return (
              <button
                key={slot.slotNumber}
                type="button"
                onClick={() => handleSlotClick(slot)}
                disabled={isSelectMode && slot.isOccupied}
                title={
                  slot.isOccupied
                    ? `Slot ${slot.slotCode}: ${slot.vehicle.plate_number}`
                    : `Slot ${slot.slotCode}: Kosong`
                }
                className={`relative flex flex-col items-center justify-between p-1 rounded-xl border transition-all duration-150 select-none w-11 h-12 sm:w-12 sm:h-13 active:scale-90 focus:outline-none ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-700 shadow-md ring-2 ring-blue-300 scale-105 z-10'
                    : slot.isOccupied
                    ? 'bg-rose-50 border-rose-300 text-rose-800 hover:border-rose-400 hover:bg-rose-100/70'
                    : isSelectMode
                    ? 'bg-emerald-50/90 border-emerald-300 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-500 cursor-pointer shadow-xs'
                    : 'bg-white border-emerald-200 text-emerald-800 hover:border-emerald-400 hover:bg-emerald-50/60'
                } ${isSelectMode && slot.isOccupied ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {/* Kode Slot Ringkas */}
                <span
                  className={`text-[9px] font-mono font-black tracking-tighter ${
                    isSelected
                      ? 'text-white'
                      : slot.isOccupied
                      ? 'text-rose-600'
                      : 'text-emerald-700'
                  }`}
                >
                  {String(slot.slotNumber).padStart(2, '0')}
                </span>

                {/* Ikon Motor / Indikator */}
                <div className="my-0.5">
                  {slot.isOccupied ? (
                    <Bike
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                        isSelected ? 'text-white' : 'text-rose-600'
                      }`}
                    />
                  ) : (
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isSelected ? 'bg-white' : 'bg-emerald-400'
                      }`}
                    />
                  )}
                </div>

                {/* Potongan Plat Nomor atau Status */}
                <span
                  className={`text-[8px] font-mono font-bold truncate max-w-full leading-none ${
                    isSelected
                      ? 'text-blue-100'
                      : slot.isOccupied
                      ? 'text-slate-800'
                      : 'text-emerald-600'
                  }`}
                >
                  {slot.isOccupied
                    ? slot.vehicle.plate_number.replace(/\s+/g, '').slice(-4)
                    : isSelected
                    ? 'PILIH'
                    : 'OPEN'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* POPUP MODAL SAAT KOTAK PARKIR DIKLIK (MODE VIEW) */}
      {activeSlotModal && !isSelectMode && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setActiveSlotModal(null)}
        >
          <div
            className="bg-white rounded-3xl p-5 md:p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black font-mono px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                  SLOT PARKIR: {activeSlotModal.slotCode}
                </span>
                <h4 className="font-extrabold text-slate-900 text-base md:text-lg mt-1">
                  {activeSlotModal.isOccupied ? 'Detail Kendaraan Terparkir' : 'Tempat Parkir Kosong'}
                </h4>
              </div>
              <button
                onClick={() => setActiveSlotModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            {activeSlotModal.isOccupied ? (
              <div className="space-y-3.5">
                {/* Plat Nomor Besar */}
                <div className="bg-slate-900 text-white font-mono font-black text-center py-2.5 rounded-2xl tracking-wider text-xl shadow-md border-2 border-slate-700">
                  {activeSlotModal.vehicle.plate_number}
                </div>

                <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium">Merk / Tipe:</span>
                    <span className="font-bold text-slate-800">
                      {activeSlotModal.vehicle.model || 'Tidak dicatat'}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium">Lokasi Blok:</span>
                    <span className="font-bold text-blue-600">
                      {zone?.name || activeSlotModal.vehicle.zone_name || 'Blok Parkir'}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium">Waktu Masuk:</span>
                    <span className="font-bold text-slate-800">
                      {formatTime(new Date(activeSlotModal.vehicle.entry_time))},{' '}
                      {formatDate(new Date(activeSlotModal.vehicle.entry_time))}
                    </span>
                  </div>

                  {parseVehicleData(activeSlotModal.vehicle).durationStr && (
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500 font-medium">Durasi Parkir:</span>
                      <span className="font-bold text-emerald-600">
                        {parseVehicleData(activeSlotModal.vehicle).durationStr}
                      </span>
                    </div>
                  )}

                  {parseVehicleData(activeSlotModal.vehicle).cleanNotes && (
                    <div className="pt-1">
                      <span className="text-slate-500 font-medium block mb-0.5">Catatan:</span>
                      <p className="bg-amber-50 text-amber-900 p-2 rounded-xl italic border border-amber-200">
                        "{parseVehicleData(activeSlotModal.vehicle).cleanNotes}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Tombol Aksi Langsung dari Modal */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => {
                      setActiveSlotModal(null);
                      navigate(`/vehicles/${activeSlotModal.vehicle.id}`);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition active:scale-95"
                  >
                    <span>Detail Lengkap</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      const confirm = window.confirm(
                        `Keluarkan motor ${activeSlotModal.vehicle.plate_number} dari slot ${activeSlotModal.slotCode}?`
                      );
                      if (confirm && onVehicleExit) {
                        onVehicleExit(activeSlotModal.vehicle.id);
                        setActiveSlotModal(null);
                      }
                    }}
                    className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/20 transition active:scale-95"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluarkan Motor</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Slot {activeSlotModal.slotCode} Masih Kosong
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Slot ini siap ditempati motor berikutnya yang masuk.
                  </p>
                </div>
                <button
                  onClick={() => setActiveSlotModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Tutup
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
