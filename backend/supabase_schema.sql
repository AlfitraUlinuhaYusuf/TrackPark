-- =======================================================
-- TrackPark: Database Schema & Seed Data (Supabase / PostgreSQL)
-- Jalankan skrip ini di SQL Editor pada Dashboard Supabase
-- =======================================================

-- Aktifkan ekstensi uuid-ossp jika belum aktif
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Buat Tabel: zones
CREATE TABLE IF NOT EXISTS zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    capacity INT NOT NULL DEFAULT 10,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Buat Tabel: vehicles
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plate_number TEXT NOT NULL,
    model TEXT,
    zone_id UUID REFERENCES zones(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'parked' CHECK (status IN ('parked', 'exited')),
    entry_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Indeks untuk Optimasi Query
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_zone_id ON vehicles(zone_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_plate_number ON vehicles(plate_number);
CREATE INDEX IF NOT EXISTS idx_vehicles_entry_time ON vehicles(entry_time DESC);

-- 4. Sample Data Awal (Opsional)
INSERT INTO zones (name, capacity, description) VALUES
('Zona A - Motor Matic', 20, 'Area parkir khusus sepeda motor matic di sisi utara'),
('Zona B - Motor Bebek & Kopling', 15, 'Area parkir sepeda motor manual dan kopling di sisi timur'),
('Zona C - VIP & Karyawan', 10, 'Area parkir khusus pengunjung VIP dan staf kantor')
ON CONFLICT DO NOTHING;

