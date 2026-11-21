import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, ChevronRight, FileText, CheckCircle2, LogOut } from 'lucide-react';
import { parseVehicleData, formatTime, formatDate } from '../services/formatters';

export default function VehicleCard({ vehicle }) {
  const navigate = useNavigate();

  const isParked = vehicle.status === 'parked';
  const { entryDate, exitDate, durationStr, slotCode, cleanNotes } = parseVehicleData(vehicle);

  return (
    <div
      onClick={() => navigate(`/vehicles/${vehicle.id}`)}
      className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-all active:scale-[0.99] cursor-pointer flex flex-col gap-3 group"
    >
      <div className="flex items-start justify-between gap-3">
        {/* Plat Nomor & Model */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-block bg-slate-900 text-white font-mono font-bold px-2.5 py-1 rounded-lg text-xs md:text-sm tracking-wider shadow-xs border border-slate-700">
              {vehicle.plate_number}
            </span>

            {/* Badge Kode Slot jika ada */}
            {slotCode && (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                Slot {slotCode}
              </span>
            )}
          </div>

          <h3 className="font-semibold text-slate-800 text-xs md:text-sm mt-1.5 truncate">
            {vehicle.model || 'Motor (Tipe tidak dicatat)'}
          </h3>
        </div>

        {/* Badge Status */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
              isParked
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            {isParked ? 'Parkir' : 'Keluar'}
          </span>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
        </div>
      </div>

      {/* Lokasi Blok & Info Waktu */}
      <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-blue-700 font-medium bg-blue-50 px-2 py-0.5 rounded-md">
            <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate max-w-[130px]">
              {vehicle.zone_name || vehicle.zones?.name || 'Blok Parkir'}
            </span>
          </div>

          <div className="flex items-center gap-1 text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-[11px]">
              Masuk: {formatTime(entryDate)}
            </span>
          </div>
        </div>

        {/* Info Waktu Keluar & Durasi (Jika Status Selesai Parkir / Exited) */}
        {!isParked && exitDate && (
          <div className="flex items-center justify-between text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-100">
            <span className="text-rose-700 font-medium flex items-center gap-1">
              <LogOut className="w-3 h-3 text-rose-500" />
              Keluar: {formatTime(exitDate)}, {formatDate(exitDate)}
            </span>
            {durationStr && (
              <span className="font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                {durationStr}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Catatan jika ada */}
      {cleanNotes && (
        <div className="flex items-start gap-1.5 text-[11px] text-amber-800 bg-amber-50/80 px-2.5 py-1.5 rounded-lg border border-amber-200/60">
          <FileText className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
          <p className="line-clamp-1 italic">{cleanNotes}</p>
        </div>
      )}
    </div>
  );
}
