import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, ChevronRight, AlertCircle } from 'lucide-react';

export default function ZoneCard({ zone }) {
  const navigate = useNavigate();

  const capacity = Number(zone.capacity) || 0;
  const parkedCount = Number(zone.parked_count) || 0;
  const percent = capacity > 0 ? Math.min(100, Math.round((parkedCount / capacity) * 100)) : 0;
  const isFull = parkedCount >= capacity && capacity > 0;

  // Warna indikator kapasitas
  let progressColor = 'bg-emerald-500';
  let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';

  if (percent >= 90 || isFull) {
    progressColor = 'bg-rose-500';
    badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (percent >= 70) {
    progressColor = 'bg-amber-500';
    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  return (
    <div
      onClick={() => navigate(`/zones/${zone.id}`)}
      className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer flex flex-col gap-3 group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition">
              {zone.name}
            </h3>
            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
              {zone.description || 'Tidak ada deskripsi'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${badgeColor}`}>
            {isFull ? 'PENUH' : `${percent}%`}
          </span>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
        </div>
      </div>

      {/* Progress Bar Kapasitas */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Terisi:</span>
          <span className="font-bold text-slate-700">
            {parkedCount} / {capacity} motor
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Info Tersisa */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
        <span>Sisa slot parkir:</span>
        <span className={`font-semibold ${isFull ? 'text-rose-600' : 'text-emerald-600'}`}>
          {isFull ? 'Kapasitas Habis' : `${zone.available_capacity ?? Math.max(0, capacity - parkedCount)} motor`}
        </span>
      </div>
    </div>
  );
}

