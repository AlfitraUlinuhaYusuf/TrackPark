import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ message = 'Memuat data...' }) {
  return (
    <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      <p className="text-xs font-medium">{message}</p>
    </div>
  );
}

