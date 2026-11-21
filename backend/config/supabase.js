const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    '[TrackPark Backend] Peringatan: SUPABASE_URL atau SUPABASE_KEY belum dikonfigurasi di file environment (.env).'
  );
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

module.exports = supabase;

