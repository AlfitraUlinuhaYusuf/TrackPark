/**
 * Utility helper untuk parsing dan memformat data kendaraan TrackPark
 */

export function parseVehicleData(vehicle) {
  if (!vehicle) return {};

  const entryDate = vehicle.entry_time ? new Date(vehicle.entry_time) : null;
  let exitDate = vehicle.exit_time ? new Date(vehicle.exit_time) : null;

  // Cek apakah waktu keluar tersimpan di dalam tag catatan [Keluar: ...]
  if (!exitDate && vehicle.notes) {
    const match = vehicle.notes.match(/\[Keluar:\s*([^\]]+)\]/i);
    if (match && match[1]) {
      const parsed = new Date(match[1]);
      if (!isNaN(parsed.getTime())) {
        exitDate = parsed;
      }
    }
  }

  // Hitung durasi parkir
  let durationStr = null;
  if (entryDate) {
    const endDate = exitDate || new Date();
    const diffMs = Math.max(0, endDate.getTime() - entryDate.getTime());
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    if (hours > 0) {
      durationStr = `${hours} jam ${minutes} menit`;
    } else {
      durationStr = `${Math.max(1, minutes)} menit`;
    }
  }

  // Cek apakah slot parkir spesifik tersimpan di dalam tag [Slot: ...] atau [Slot ...]
  let slotCode = null;
  if (vehicle.notes) {
    const matchSlot = vehicle.notes.match(/\[Slot:?\s*([^\]]+)\]/i);
    if (matchSlot && matchSlot[1]) {
      slotCode = matchSlot[1].trim();
    }
  }

  // Bersihkan teks catatan dari tag internal [Slot ...] dan [Keluar: ...]
  const cleanNotes = vehicle.notes
    ? vehicle.notes
        .replace(/\[Slot:?\s*[^\]]+\]/gi, '')
        .replace(/\[Keluar:\s*[^\]]+\]/gi, '')
        .trim()
    : '';

  return {
    entryDate,
    exitDate,
    durationStr,
    slotCode,
    cleanNotes,
  };
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

