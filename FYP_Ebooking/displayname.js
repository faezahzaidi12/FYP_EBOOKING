// ====================================================================
// DISPLAYNAME.JS - CENTRAL SUPABASE BACKEND SERVICE (DATABASE CONNECTED) [33]
// ====================================================================

const supabaseUrl = 'https://doyyrhhscdpchuvpancq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRveXlyaGhzY2RwY2h1dnBhbmNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2MjkzNjksImV4cCI6MjA5NTIwNTM2OX0.liPsexqKQTnZe5UpB1DW5zpZ12I05REflxYaNbf6l8A';

// Inisialisasi sambungan Supabase [1.1.3]
const _supabase = supabase.createClient(supabaseUrl, supabaseAnonKey);

// 1. Fungsi Pendaftaran Pengguna Baharu [1.1.3]
async function registerUser() {
    const username = document.getElementById('username').value.trim();
    const icNumber = document.getElementById('icNumber').value.trim();
    const course = document.getElementById('mCourse').value; // DIKEMASKINI: Mengikut ID mCourse korang [33]
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!username || !icNumber || !course || !email || !password) {
        alert("PLEASE FILL ALL FIELDS!");
        return;
    }

    if (icNumber.length < 14) {
        alert("PLEASE ENTER A VALID 12-DIGIT IC NUMBER!");
        return;
    }

    if (password.length < 8) {
        alert("PASSWORD MUST BE AT LEAST 8 CHARACTERS LONG!");
        return;
    }

    const { data, error } = await _supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                display_name: username, // Menyimpan ke "Display Name" Supabase Auth [1.1.3]
                full_name: username,
                ic_number: icNumber,
                subject: course
            }
        }
    });

    if (error) {
        alert("Pendaftaran Gagal: " + error.message);
        console.error(error);
    } else {
        alert('Account Created Successfully!');
        window.location.href = 'index.html';
    }
}

// 2. Fungsi Log Masuk [1.1.3]
async function doLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPass').value;

    if (!email || !password) {
        alert("PLEASE FILL ALL FIELDS!");
        return;
    }

    const { data, error } = await _supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        alert("Login Gagal: " + error.message);
        console.error(error);
    } else {
        localStorage.setItem('currentUser', data.user.user_metadata.display_name || data.user.email);
        localStorage.setItem('currentUserId', data.user.id);
        
        alert('Login Successful! Welcome back.');
        window.location.href = 'home.html'; // Bawa ke home.html [35]
    }
}

// ====================================================================
// B. SISTEM TEMPAHAN BILIK & KEMUDAHAN (BOOKINGS) [1.1.3, 33, 35]
// ====================================================================

// 1. Tarik data tempahan aktif dari database (SELECT) [1.1.3]
async function fetchBookingsFromDb(roomName) {
    const { data, error } = await _supabase
        .from('bookings')
        .select('*')
        .eq('room_name', roomName)
        .in('status', ['Pending', 'Checked-In']);
    return { data, error };
}

// 2. Hantar tempahan baharu ke database (INSERT) [1.1.3]
async function insertNewBooking(userId, username, roomName, date, day, startTime, endTime, subject, lecturer) {
    const { data, error } = await _supabase
        .from('bookings')
        .insert([
            {
                user_id: userId,
                room_name: roomName,
                booked_by: username,
                booking_date: date,
                booking_day: day,
                start_time: startTime,
                end_time: endTime,
                subject: subject,
                lecturer: lecturer,
                status: 'Pending'
            }
        ]);
    return { data, error };
}

// 3. Sahkan Kehadiran (UPDATE status -> Checked-In) [18, 45]
async function updateBookingToCheckIn(bookingId) {
    const { error } = await _supabase
        .from('bookings')
        .update({ status: 'Checked-In' })
        .eq('id', bookingId);
    return { error };
}

// 4. Batal Tempahan (UPDATE status -> Cancelled)
async function updateBookingToCancelled(bookingId) {
    const { error } = await _supabase
        .from('bookings')
        .update({ status: 'Cancelled' })
        .eq('id', bookingId);
    return { error };
}

// ====================================================================
// C. FUNGSI PEMBANTU (HELPERS) [1.1.2]
// ====================================================================

function convertTo24Hour(timeStr) {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours, 10);
    if (hours === 12) hours = 0;
    if (modifier === 'PM') hours += 12;
    return `${hours.toString().padStart(2, '0')}:${minutes}:00`;
}

function convertToUITime(dbTime) {
    let [hours, minutes] = dbTime.split(':');
    hours = parseInt(hours, 10);
    let modifier = 'AM';
    if (hours >= 12) {
        modifier = 'PM';
        if (hours > 12) hours -= 12;
    }
    if (hours === 0) hours = 12;
    return `${hours}:${minutes} ${modifier}`;
}

// DIKEMASKINI: Pembetulan ejaan TUESDAY [22]
function formattedDateString(dayName) {
    const daysOfWeek = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY"];
    const targetIdx = daysOfWeek.indexOf(dayName);
    const today = new Date();
    const currentIdx = today.getDay(); 
    
    let diff = targetIdx - currentIdx;
    
    if (diff < 0) {
        diff += 7;
    }
    
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + diff);
    
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const date = String(targetDate.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${date}`;
}

function isCheckInWindowActive(bookingDateStr, startTimeStr) {
    const today = new Date();
    const [year, month, day] = bookingDateStr.split('-');
    const [hours, minutes] = startTimeStr.split(':');
    
    const bookingDateTime = new Date(
        parseInt(year),
        parseInt(month) - 1, 
        parseInt(day),
        parseInt(hours),
        parseInt(minutes),
        0,
        0
    );
    
    const windowStart = new Date(bookingDateTime.getTime() - 15 * 60 * 1000);
    const windowEnd = new Date(bookingDateTime.getTime() + 15 * 60 * 1000);
    
    return (today >= windowStart && today <= windowEnd);
}