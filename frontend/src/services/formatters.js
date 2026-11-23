/**
 * Utility helper untuk parsing dan memformat data kendaraan TrackPark
 */

export function parseVehicleData(vehicle) {
  if (!vehicle) return {};

  const isParked = vehicle.status === 'parked';
  const entryDate = vehicle.entry_time ? new Date(vehicle.entry_time) : null;
  let exitDate = vehicle.exit_time ? new Date(vehicle.exit_time) : null;

  // 1. Ekstrak waktu keluar jika tersimpan di dalam tag catatan [Keluar: ...]
  if (!exitDate && vehicle.notes) {
    const matchIso = vehicle.notes.match(/\[Keluar:\s*([^\]]+)\]/i);
    if (matchIso && matchIso[1]) {
      const parsed = new Date(matchIso[1]);
      if (!isNaN(parsed.getTime())) {
        exitDate = parsed;
      }
    }

    if (!exitDate) {
      const matchGeneral = vehicle.notes.match(/(?:waktu\s*)?keluar\s*[:=]\s*([0-9T:\-+.Z\s]+)/i);
      if (matchGeneral && matchGeneral[1]) {
        const parsed = new Date(matchGeneral[1]);
        if (!isNaN(parsed.getTime())) {
          exitDate = parsed;
        }
      }
    }
  }

  // 2. Hitung durasi parkir:
  // - JIKA MASIH PARKIR (status === 'parked'): durasi berjalan dari entryDate s/d waktu sekarang
  // - JIKA SUDAH KELUAR (status === 'exited'): durasi HARUS TERHENTI pada exitDate!
  let durationStr = null;
  if (entryDate) {
    if (isParked) {
      // Masih parkir (live duration)
      const diffMs = Math.max(0, new Date().getTime() - entryDate.getTime());
      durationStr = formatDuration(diffMs);
    } else {
      // SUDAH KELUAR -> Durasi terkunci pada saat motor checkout keluar
      if (exitDate) {
        const diffMs = Math.max(0, exitDate.getTime() - entryDate.getTime());
        durationStr = formatDuration(diffMs);
      } else {
        // Fallback untuk data lama tanpa timestamp keluar: JANGAN pakai new Date() agar jam tidak terus lanjut!
        durationStr = 'Selesai Parkir';
      }
    }
  }

  // 3. Cek apakah slot parkir spesifik tersimpan di dalam tag [Slot: ...] atau [Slot ...]
  let slotCode = null;
  if (vehicle.notes) {
    const matchSlot = vehicle.notes.match(/\[Slot:?\s*([^\]]+)\]/i);
    if (matchSlot && matchSlot[1]) {
      slotCode = matchSlot[1].trim();
    }
  }

  // 4. Bersihkan teks catatan dari tag internal [Slot ...] dan [Keluar: ...]
  const cleanNotes = vehicle.notes
    ? vehicle.notes
        .replace(/\[Slot:?\s*[^\]]+\]/gi, '')
        .replace(/\[Keluar:\s*[^\]]+\]/gi, '')
        .replace(/\(Keluar:\s*[^)]+\)/gi, '')
        .trim()
    : '';

  return {
    entryDate,
    exitDate,
    durationStr,
    slotCode,
    cleanNotes,
    isParked,
  };
}

function formatDuration(diffMs) {
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  if (hours > 0) {
    return `${hours} jam ${minutes} menit`;
  }
  return `${Math.max(1, minutes)} menit`;
}

export function formatTime(date) {
  if (!date) return '-';
  try {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    }) + ' WIB';
  } catch {
    return '-';
  }
}

export function formatDate(date) {
  if (!date) return '-';
  try {
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '-';
  }
}
