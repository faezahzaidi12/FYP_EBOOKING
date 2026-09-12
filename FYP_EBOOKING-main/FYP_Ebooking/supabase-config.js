// supabase-config.js
const { createClient } = supabase;

// URL API sebenar (BUKAN link dashboard)
const SUPABASE_URL = "https://doyyrhhscdpchuvpancq.supabase.co";

// Publishable / anon key anda
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRveXlyaGhzY2RwY2h1dnBhbmNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2MjkzNjksImV4cCI6MjA5NTIwNTM2OX0.liPsexqKQTnZe5UpB1DW5zpZ12I05REflxYaNbf6l8A";

// Initialize the database client
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Dedahkan juga sebagai window.supabaseClient supaya fail lain yang
// check "window.supabaseClient" (cth: check_in.html) turut berfungsi
window.supabaseClient = supabaseClient;