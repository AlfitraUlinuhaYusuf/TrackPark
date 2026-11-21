/**
 * Service API TrackPark
 * Terhubung langsung ke REST API Backend Express.js
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Helper generic fetch dengan parsing json & error handling terstandarisasi
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || `Request gagal dengan status ${response.status}`);
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Gagal terhubung ke server backend. Pastikan server sudah berjalan.');
    }
    throw error;
  }
}

export const api = {
  // === ZONES ===
  // Mengambil semua zona beserta parked_count & available_capacity
  getZones: () => request('/zones'),

  // Mengambil detail 1 zona beserta daftar kendaraan parked
  getZoneById: (id) => request(`/zones/${id}`),

  // === VEHICLES ===
  // Mengambil daftar kendaraan dengan query params ?status= dan ?search=
  getVehicles: ({ status, search } = {}) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search && search.trim()) params.append('search', search.trim());
    const queryString = params.toString();
    return request(`/vehicles${queryString ? `?${queryString}` : ''}`);
  },

  // Mengambil detail 1 kendaraan beserta data zonanya
  getVehicleById: (id) => request(`/vehicles/${id}`),

  // Mencatat motor masuk baru (POST)
  createVehicle: ({ plate_number, model, zone_id, notes }) =>
    request('/vehicles', {
      method: 'POST',
      body: JSON.stringify({ plate_number, model, zone_id, notes }),
    }),

  // Memperbarui data motor (pindah zone_id, notes, status='exited') (PUT)
  updateVehicle: (id, payload) =>
    request(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  // Menghapus data motor (DELETE)
  deleteVehicle: (id) =>
    request(`/vehicles/${id}`, {
      method: 'DELETE',
    }),
};

