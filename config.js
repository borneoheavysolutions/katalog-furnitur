// Konfigurasi Kredensial Supabase
const SUPABASE_URL = 'https://lbtubgdmbetgtgjdotge.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxidHViZ2RtYmV0Z3RnamRvdGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzNzYwODQsImV4cCI6MjA5MDk1MjA4NH0.E_HLflpdG-0slO1bJeiuCAXq07gdAYNDd_zq1t5JPfU';

// Membuat instance Supabase Client ke dalam variabel global
window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
