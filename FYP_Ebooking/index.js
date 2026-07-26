// ==========================================
// 1. KOD DEBUG (Untuk Semakan Sambungan)
// ==========================================
console.log("index.js is active and loaded!");
console.log("Sign Up Button detected:", document.getElementById('btn-signup'));
console.log("Login Button detected:", document.getElementById('btn-login'));

// ==========================================
// 2. KOD UTAMA (Pendaftaran & Log Masuk)
// ==========================================

const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const signupBtn = document.getElementById('btn-signup');
const loginBtn = document.getElementById('btn-login');

// Fungsi Pendaftaran (Hanya berjalan di Register.html)
if (signupBtn) {
    signupBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const email = emailInput.value;
        const password = passwordInput.value;

        if (!email || !password) {
            alert('Sila isi emel dan kata laluan.');
            return;
        }

        // Menghantar data ke database Supabase
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
        });

        if (error) {
            alert('Pendaftaran gagal: ' + error.message);
        } else {
            alert('Pendaftaran berjaya! Sila cuba log masuk sekarang.');
            window.location.href = 'index.html'; // Bawa pengguna ke login page
        }
    });
}

// Fungsi Log Masuk (Hanya berjalan di index.html)
if (loginBtn) {
    loginBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const email = emailInput.value;
        const password = passwordInput.value;

        if (!email || !password) {
            alert('Sila isi emel dan kata laluan.');
            return;
        }

        // Semak kelayakan masuk dari database Supabase
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            alert('Log masuk gagal: ' + error.message);
        } else {
            alert('Log masuk berjaya!');
            window.location.href = 'home.html'; // Bawa pengguna ke dashboard
        }
    });
}
