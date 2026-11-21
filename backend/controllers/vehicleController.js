const supabase = require('../config/supabase');

/**
 * GET /api/vehicles
 * Kembalikan semua kendaraan dengan join nama zona, dukung query parameter ?status=parked dan ?search=
 */
const getAllVehicles = async (req, res) => {
  try {
    const { status, search } = req.query;

    let query = supabase
      .from('vehicles')
      .select(`
        id,
        plate_number,
        model,
        zone_id,
        status,
        entry_time,
        notes,
        zones (
          id,
          name,
          capacity
        )
      `)
      .order('entry_time', { ascending: false });

    if (status) {
      query = query.eq('status', status.toLowerCase());
    }

    if (search && search.trim()) {
      const searchTerm = search.trim();
      query = query.or(`plate_number.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%`);
    }

    const { data: vehicles, error } = await query;

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil data kendaraan',
        error: error.message,
      });
    }

    const formatted = (vehicles || []).map((v) => ({
      ...v,
      zone_name: v.zones ? v.zones.name : null,
    }));

    return res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error saat mengambil daftar kendaraan',
      error: err.message,
    });
  }
};

/**
 * GET /api/vehicles/:id
 * Kembalikan detail 1 kendaraan beserta info zonanya
 */
const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: vehicle, error } = await supabase
      .from('vehicles')
      .select(`
        id,
        plate_number,
        model,
        zone_id,
        status,
        entry_time,
        notes,
        zones (
          id,
          name,
          capacity,
          description
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil detail kendaraan',
        error: error.message,
      });
    }

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: `Kendaraan dengan ID '${id}' tidak ditemukan`,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...vehicle,
        zone_name: vehicle.zones ? vehicle.zones.name : null,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error saat mengambil detail kendaraan',
      error: err.message,
    });
  }
};

/**
 * POST /api/vehicles
 * Tambah motor/kendaraan masuk baru
 * Body: { plate_number, model, zone_id, notes }
 */
const createVehicle = async (req, res) => {
  try {
    const { plate_number, model, zone_id, notes } = req.body;

    if (!plate_number || !plate_number.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nomor plat (plate_number) wajib diisi',
      });
    }

    if (!zone_id) {
      return res.status(400).json({
        success: false,
        message: 'Zona parkir (zone_id) wajib dipilih',
      });
    }

    const cleanPlate = plate_number.trim().toUpperCase();

    // 1. Cek apakah kendaraan dengan plat ini sudah sedang parkir
    const { data: alreadyParked, error: checkParkedError } = await supabase
      .from('vehicles')
      .select('id, plate_number, zone_id')
      .eq('plate_number', cleanPlate)
      .eq('status', 'parked')
      .maybeSingle();

    if (checkParkedError) {
      return res.status(500).json({
        success: false,
        message: 'Gagal memeriksa status kendaraan yang ada',
        error: checkParkedError.message,
      });
    }

    if (alreadyParked) {
      return res.status(400).json({
        success: false,
        message: `Kendaraan dengan plat ${cleanPlate} sudah terdaftar sedang parkir saat ini!`,
      });
    }

    // 2. Verifikasi ketersediaan dan kapasitas zona
    const { data: targetZone, error: zoneError } = await supabase
      .from('zones')
      .select('id, name, capacity')
      .eq('id', zone_id)
      .maybeSingle();

    if (zoneError || !targetZone) {
      return res.status(404).json({
        success: false,
        message: `Zona parkir dengan ID '${zone_id}' tidak ditemukan`,
      });
    }

    const { count: currentParkedCount, error: countError } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })
      .eq('zone_id', zone_id)
      .eq('status', 'parked');

    if (!countError && targetZone.capacity && currentParkedCount >= targetZone.capacity) {
      return res.status(400).json({
        success: false,
        message: `Kapasitas zona ${targetZone.name} sudah penuh (${currentParkedCount}/${targetZone.capacity})!`,
      });
    }

    // 3. Simpan data kendaraan baru
    const newVehicle = {
      plate_number: cleanPlate,
      model: model ? model.trim() : null,
      zone_id,
      status: 'parked',
      entry_time: new Date().toISOString(),
      notes: notes ? notes.trim() : null,
    };

    const { data: insertedVehicle, error: insertError } = await supabase
      .from('vehicles')
      .insert([newVehicle])
      .select(`
        id,
        plate_number,
        model,
        zone_id,
        status,
        entry_time,
        notes,
        zones (
          id,
          name
        )
      `)
      .single();

    if (insertError) {
      return res.status(500).json({
        success: false,
        message: 'Gagal menambahkan kendaraan masuk baru',
        error: insertError.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Kendaraan berhasil dicatat masuk',
      data: {
        ...insertedVehicle,
        zone_name: insertedVehicle.zones ? insertedVehicle.zones.name : targetZone.name,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error saat menambahkan kendaraan',
      error: err.message,
    });
  }
};

/**
 * PUT /api/vehicles/:id
 * Update lokasi zone_id, catatan notes, atau ubah status menjadi 'exited'
 */
const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { zone_id, notes, status, model, plate_number } = req.body;

    const { data: existing, error: findError } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (findError) {
      return res.status(500).json({
        success: false,
        message: 'Gagal mencari data kendaraan',
        error: findError.message,
      });
    }

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Kendaraan dengan ID '${id}' tidak ditemukan`,
      });
    }

    const updatePayload = {};

    if (status !== undefined) {
      const lowerStatus = status.toLowerCase();
      if (!['parked', 'exited'].includes(lowerStatus)) {
        return res.status(400).json({
          success: false,
          message: "Status tidak valid. Nilai yang diperbolehkan hanya 'parked' atau 'exited'.",
        });
      }
      updatePayload.status = lowerStatus;

      // Otomatis catat waktu keluar jika belum ada di notes
      if (lowerStatus === 'exited') {
        const currentNotes = notes !== undefined ? notes : (existing.notes || '');
        if (!currentNotes.includes('[Keluar:')) {
          const nowIso = new Date().toISOString();
          updatePayload.notes = currentNotes ? `${currentNotes} [Keluar: ${nowIso}]` : `[Keluar: ${nowIso}]`;
        }
      }
    }

    if (zone_id !== undefined) {
      const { data: zoneExists } = await supabase
        .from('zones')
        .select('id, name')
        .eq('id', zone_id)
        .maybeSingle();

      if (!zoneExists) {
        return res.status(404).json({
          success: false,
          message: `Zona tujuan dengan ID '${zone_id}' tidak ditemukan`,
        });
      }
      updatePayload.zone_id = zone_id;
    }

    if (notes !== undefined && updatePayload.notes === undefined) {
      updatePayload.notes = notes;
    }

    if (model !== undefined) {
      updatePayload.model = model ? model.trim() : null;
    }

    if (plate_number !== undefined) {
      updatePayload.plate_number = plate_number.trim().toUpperCase();
    }

    if (Object.keys(updatePayload).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tidak ada data perubahan yang dikirimkan',
      });
    }

    const { data: updatedVehicle, error: updateError } = await supabase
      .from('vehicles')
      .update(updatePayload)
      .eq('id', id)
      .select(`
        id,
        plate_number,
        model,
        zone_id,
        status,
        entry_time,
        notes,
        zones (
          id,
          name
        )
      `)
      .single();

    if (updateError) {
      return res.status(500).json({
        success: false,
        message: 'Gagal memperbarui data kendaraan',
        error: updateError.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Data kendaraan berhasil diperbarui',
      data: {
        ...updatedVehicle,
        zone_name: updatedVehicle.zones ? updatedVehicle.zones.name : null,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error saat memperbarui kendaraan',
      error: err.message,
    });
  }
};

/**
 * DELETE /api/vehicles/:id
 * Hapus data kendaraan
 */
const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: existing, error: findError } = await supabase
      .from('vehicles')
      .select('id, plate_number')
      .eq('id', id)
      .maybeSingle();

    if (findError) {
      return res.status(500).json({
        success: false,
        message: 'Gagal mencari data kendaraan',
        error: findError.message,
      });
    }

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Kendaraan dengan ID '${id}' tidak ditemukan`,
      });
    }

    const { error: deleteError } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return res.status(500).json({
        success: false,
        message: 'Gagal menghapus data kendaraan',
        error: deleteError.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Kendaraan dengan plat ${existing.plate_number} berhasil dihapus`,
      deleted_id: id,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error saat menghapus kendaraan',
      error: err.message,
    });
  }
};

module.exports = {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
};
