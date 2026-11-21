import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="m-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex flex-col items-center text-center gap-2">
      <AlertCircle className="w-7 h-7 text-rose-600 shrink-0" />
      <div className="space-y-0.5">
        <h4 className="font-semibold text-sm">Terjadi Kesalahan</h4>
        <p className="text-xs text-rose-700">{message || 'Gagal mengambil data dari server.'}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-sm transition active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Coba Lagi</span>
        </button>
      )}
    </div>
  );
}

