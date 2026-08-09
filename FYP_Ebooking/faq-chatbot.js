// MyTVETMARA FAQ Chatbot — Modern Teal-Blue + Draggable + Supabase Schedule
(function () {
  if (window.__rbxFaqLoaded) return;
  window.__rbxFaqLoaded = true;

  const FAQS = [
    { q: ['how', 'book', 'room', 'reserve', 'tempah', 'cara'], a: "To book a room: Login → HOME → GO TO BOOKING SYSTEM → choose a building (DFK / Library / Sport) → pick a room → tap an available time slot." },
    { q: ['check', 'in', 'checkin', 'check-in info 📍'], a: "Pending check-ins appear on your HOME dashboard under 'PENDING CHECK-IN'. Click the yellow card to confirm your check-in." },
    { q: ['cancel', 'booking', 'batal'], a: "Bookings you don't check-in on time are auto-cancelled by the system. To cancel manually, open the booking from your dashboard." },
    { q: ['login', 'log in', 'sign in'], a: "Use your registered email and password on the LOG IN page. If you don't have an account, click SIGN UP." },
    { q: ['register', 'sign up', 'signup', 'account'], a: "Click SIGN UP on the login page and fill in your name, email and password. You'll receive a confirmation email." },
    { q: ['password', 'forgot', 'reset'], a: "Password reset isn't in-app yet — please contact the admin to reset your password." },
    { q: ['facility', 'facilities', 'sport', 'library', 'dfk', 'available'], a: "Available facilities: DFK Building (Rooms 1–10), Library (Century 21st, Literasi 1 & 2), and Sports (Badminton, Field, Ping Pong, Takraw, Volleyball)." },
    { q: ['time', 'slot', 'hour', 'when', 'open'], a: "Time slots are shown on each room's timetable. Green/white = available, red = booked. Tap any available slot to book." },
    { q: ['maintenance', 'report', 'issue', 'broken', 'rosak', 'projector', 'aircond', 'light', 'lampu', 'kerusi', 'report issue 🛠️'], a: "🛠️ Found a broken item? You can submit a report using the 'Maintenance Report' form on your check-in page." },
    { q: ['feedback', 'rating', 'star', 'review', 'komen', 'bintang', 'feedback ⭐'], a: "⭐ We value your feedback! Rate your classroom experience (1-5 stars) after your check-in session." },
    { q: ['quota', 'limit', 'max', 'maximum', 'berapa', 'had', 'banyak', 'quota limit 📌'], a: "📌 Booking Quota: Students can have up to 3 active bookings at a time (maximum 12 hours per week)." },
    { q: ['pending', 'approval', 'lulus', 'approve', 'status', 'admin'], a: "⏳ Pending bookings require admin approval. Approval usually takes 1-2 hours during office hours." },
    { q: ['late', 'lewat', 'grace', 'minit', 'terlepas', 'auto cancel', 'autocancel'], a: "⏰ Grace Period: You have 15 minutes to check in after your booking time starts. After 15 minutes, your booking will be automatically cancelled!" },
    { q: ['advance', 'early', 'awal', 'days', 'hari', 'bila', 'future'], a: "📅 Advance Booking: You can book facilities up to 7 days in advance." },
    { q: ['operation', 'operating', 'hours', 'waktu', 'operasi', 'weekend', 'sabtu', 'ahad', 'buka', 'tutup', 'operating hours 🕒'], a: "🕒 Operating Hours: Monday–Friday (8:00 AM – 5:00 PM). Facilities are closed on Weekends & Public Holidays." },
    { q: ['admin', 'contact', 'help', 'support'], a: "For issues not answered here, please contact your TVET MARA administrator." },
    { q: ['who', 'what', 'mytvetmara', 'about'], a: "MyTVETMARA e-Booking is the official room & facility booking system for TVET MARA students and staff." }
  ];

  const GREETING = "Hi! 👋 I'm MARA BOT. How can I help you today?";
  const FALLBACK = "Sorry, I don't have an answer for that. Try keywords like: book, check-in, my schedule, facility, report issue.";

  function findAnswer(text) {
    const t = text.toLowerCase();
    let best = null, bestScore = 0;
    for (const f of FAQS) {
      const score = f.q.reduce((s, k) => s + (t.includes(k) ? 1 : 0), 0);
      if (score > bestScore) { bestScore = score; best = f; }
    }
    return best ? best.a : FALLBACK;
  }

  const css = `
#rbxFab {
  position: fixed; bottom: 20px; right: 20px; z-index: 9998;
  width: 60px; height: 60px; border-radius: 50%;
  background: #0096B4; color: #fff;
  border: none; box-shadow: 0 4px 15px rgba(0, 150, 180, 0.4);
  font-size: 30px; display: flex; align-items: center; justify-content: center;
  cursor: pointer; animation: rbxPulse 2s infinite;
  touch-action: none; user-select: none;
}
@keyframes rbxPulse {
  0% { box-shadow: 0 0 0 0 rgba(0, 150, 180, 0.7); }
  70% { box-shadow: 0 0 0 15px rgba(0, 150, 180, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 150, 180, 0); }
}
#rbxChat {
  position: fixed; bottom: 95px; right: 20px; z-index: 9999;
  width: 340px; max-width: calc(100vw - 32px); height: 480px; max-height: calc(100vh - 140px);
  background: #fff;
  border: 5px solid #393B3D;
  box-shadow: 10px 10px 0 rgba(0, 0, 0, .5);
  display: none; flex-direction: column; font-family: 'Poppins', sans-serif;
  border-radius: 0;
}
#rbxChat.open { display: flex; }
#rbxChatHead { 
  background: #393B3D; color: #FFC800; padding: 12px 14px; 
  border-bottom: 4px solid #00A2FF;
  font-family: 'Bungee', cursive; font-size: 15px;
  display: flex; justify-content: space-between; align-items: center;
  cursor: move; user-select: none; touch-action: none;
}
#rbxChatHead button { background: transparent; border: 0; color: #fff; font-size: 22px; cursor: pointer; line-height: 1; font-family: 'Bungee', cursive; }
#rbxChatBody { flex: 1; overflow-y: auto; padding: 12px; background: #f5f5f5; }
.rbx-msg { 
  margin-top: 10px; padding: 10px 12px; margin-bottom: 14px; padding: 10px 12px; 
  border: 3px solid #393B3D; box-shadow: 3px 3px 0 rgba(0, 0, 0, .2);
  font-size: 13px; line-height: 1.4; word-wrap: break-word; border-radius: 0;
}
.rbx-msg.bot { background: #fff; color: #000; }
.rbx-msg.user { background: #fcc500; color: #000; font-weight: bold; margin-left: auto; }
#rbxChatForm { display: flex; border-top: 4px solid #393B3D; background: #fff; }
#rbxChatInput { flex: 1; border: 0; padding: 12px; font-family: 'Poppins', sans-serif; font-size: 13px; outline: none; }
#rbxChatSend { 
  border: 0; background: #00E22D; color: #fff; 
  font-family: 'Bungee', cursive; padding: 0 16px; cursor: pointer; font-size: 13px; border-radius: 0; 
}
.rbx-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.rbx-chip { 
  background: #fff; border: 2px solid #393B3D; box-shadow: 2px 2px 0 #393B3D;
  padding: 5px 9px; font-size: 11px; cursor: pointer; 
  font-family: 'Bungee', cursive; text-transform: uppercase; border-radius: 0;
  transition: background 0.2s;
}
.rbx-chip:hover { background: #eaf7ff; }
@media (max-width: 575.98px) {
  #rbxFab { width: 54px; height: 54px; font-size: 26px; bottom: 16px; right: 16px; }
  #rbxChat { right: 12px; left: 12px; width: auto; bottom: 80px; height: 70vh; }
}
  `;
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  const fab = document.createElement('button'); fab.id = 'rbxFab'; fab.textContent = '🤖';
  const panel = document.createElement('div'); panel.id = 'rbxChat';
  panel.innerHTML = `<div id="rbxChatHead"><span>🤖 MARA BOT</span><button id="rbxChatClose">×</button></div><div id="rbxChatBody"></div><form id="rbxChatForm" autocomplete="off"><input id="rbxChatInput" type="text" placeholder="Ask a question..."/><button id="rbxChatSend" type="submit">SEND</button></form>`;

  document.body.appendChild(fab); document.body.appendChild(panel);
  const body = panel.querySelector('#rbxChatBody'), form = panel.querySelector('#rbxChatForm'), input = panel.querySelector('#rbxChatInput');

  function clamp(v, min, max) { return Math.min(Math.max(v, min), max); }

  let dragActive = false, dragStarted = false, startX = 0, startY = 0, origX = 0, origY = 0, ignoreFabClick = false;
  function onFabDragStart(e) { 
    const p = e.type.startsWith('touch') ? e.touches[0] : e; if (!p) return; 
    e.preventDefault(); dragActive = true; dragStarted = false; 
    startX = p.clientX; startY = p.clientY; 
    const r = fab.getBoundingClientRect(); origX = r.left; origY = r.top; 
    document.addEventListener('mousemove', onFabDragMove); document.addEventListener('mouseup', onFabDragEnd); 
    document.addEventListener('touchmove', onFabDragMove, { passive: false }); document.addEventListener('touchend', onFabDragEnd); 
  }
  function onFabDragMove(e) { 
    if (!dragActive) return; const p = e.type.startsWith('touch') ? e.touches[0] : e; if (!p) return; 
    e.preventDefault(); const dx = p.clientX - startX, dy = p.clientY - startY; 
    if (!dragStarted && Math.abs(dx) + Math.abs(dy) > 6) dragStarted = true; 
    if (!dragStarted) return; 
    fab.style.position = 'fixed'; 
    fab.style.left = clamp(origX + dx, 8, window.innerWidth - fab.offsetWidth - 8) + 'px'; 
    fab.style.top = clamp(origY + dy, 8, window.innerHeight - fab.offsetHeight - 8) + 'px'; 
    fab.style.bottom = 'auto'; fab.style.right = 'auto'; 
  }
  function onFabDragEnd() { 
    if (!dragActive) return; dragActive = false; 
    if (dragStarted) { ignoreFabClick = true; window.setTimeout(() => { ignoreFabClick = false; }, 0); } 
    document.removeEventListener('mousemove', onFabDragMove); document.removeEventListener('mouseup', onFabDragEnd); 
    document.removeEventListener('touchmove', onFabDragMove); document.removeEventListener('touchend', onFabDragEnd); 
  }
  let chatDragActive = false, chatStartX = 0, chatStartY = 0, chatOrigX = 0, chatOrigY = 0;
  const chatHead = panel.querySelector('#rbxChatHead');
  function onChatDragStart(e) {
    if (e.target.id === 'rbxChatClose') return;
    const p = e.type.startsWith('touch') ? e.touches[0] : e; if (!p) return;
    chatDragActive = true; chatStartX = p.clientX; chatStartY = p.clientY;
    const r = panel.getBoundingClientRect(); chatOrigX = r.left; chatOrigY = r.top;
    document.addEventListener('mousemove', onChatDragMove); document.addEventListener('mouseup', onChatDragEnd);
    document.addEventListener('touchmove', onChatDragMove, { passive: false }); document.addEventListener('touchend', onChatDragEnd);
  }
  function onChatDragMove(e) {
    if (!chatDragActive) return; const p = e.type.startsWith('touch') ? e.touches[0] : e; if (!p) return;
    e.preventDefault(); const dx = p.clientX - chatStartX, dy = p.clientY - chatStartY;
    panel.style.position = 'fixed';
    panel.style.left = clamp(chatOrigX + dx, 8, window.innerWidth - panel.offsetWidth - 8) + 'px';
    panel.style.top = clamp(chatOrigY + dy, 8, window.innerHeight - panel.offsetHeight - 8) + 'px';
    panel.style.bottom = 'auto'; panel.style.right = 'auto';
  }
  function onChatDragEnd() {
    if (!chatDragActive) return; chatDragActive = false;
    document.removeEventListener('mousemove', onChatDragMove); document.removeEventListener('mouseup', onChatDragEnd);
    document.removeEventListener('touchmove', onChatDragMove); document.removeEventListener('touchend', onChatDragEnd);
  }
  chatHead.addEventListener('mousedown', onChatDragStart); chatHead.addEventListener('touchstart', onChatDragStart, { passive: false });

  function addMsg(text, who) { 
    const m = document.createElement('div'); m.className = 'rbx-msg ' + who; 
    m.innerHTML = text.replace(/\n/g, '<br>'); body.appendChild(m); body.scrollTop = body.scrollHeight; 
  }

  const mainMenuChips = ['How to book?', 'Check-in info 📍', 'My Schedule 📅', 'Quota limit 📌', 'Report Issue 🛠️', 'Feedback ⭐', 'Operating Hours 🕒'];

  function addChips(labels) { 
    const wrap = document.createElement('div'); wrap.className = 'rbx-chips'; 
    labels.forEach(label => { 
      const c = document.createElement('button'); c.type = 'button'; c.className = 'rbx-chip'; c.textContent = label; 
      c.onclick = () => { input.value = label; form.dispatchEvent(new Event('submit', {cancelable:true})); }; 
      wrap.appendChild(c); 
    }); 
    body.appendChild(wrap); 
  }

  function handleScheduleRouting(val) {
    if (val === 'My Schedule 📅' || val.toLowerCase() === 'schedule' || val.toLowerCase() === 'jadual') {
      addMsg("Which semester are you in?", 'bot');
      addChips(['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', '⬅️ Back to Menu']);
      return true;
    }
    if (val === 'Semester 5') {
      addMsg("You selected Semester 5. Which class are you in?", 'bot');
      addChips(['5A', '5B', '⬅️ Back to Menu']);
      return true;
    }
    if (val === 'Semester 1' || val === 'Semester 2' || val === 'Semester 3' || val === 'Semester 4') {
      addMsg("Schedules for this semester are not uploaded yet. Please check back later.", 'bot');
      addChips(['⬅️ Back to Menu']);
      return true;
    }
    if (val === '5A' || val === '5a') { fetchScheduleFromDatabase('5A'); return true; }
    if (val === '5B' || val === '5b') { fetchScheduleFromDatabase('5B'); return true; }
    return false;
  }

  // Pencarian Supabase Client yang betul
  function getSupabaseClient() {
    if (window.supabase && typeof window.supabase.from === 'function') return window.supabase;
    if (window.supabaseClient && typeof window.supabaseClient.from === 'function') return window.supabaseClient;
    if (window.sb && typeof window.sb.from === 'function') return window.sb;
    return null;
  }

    async function fetchScheduleFromDatabase(className) {
    addMsg(`⏳ Fetching timetable for Class ${className}...`, 'bot');

    try {
      const supabase = getSupabaseClient(); 
      
      if (!supabase) {
        addMsg("⚠️ Database connection not found.", 'bot');
        addChips(['⬅️ Back to Menu']);
        return;
      }

      // CHECK JIKA USER SUDAH LOGIN ATAU BELUM
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        addMsg("🔒 Please log in or sign up first to view the class schedule.", 'bot');
        addChips(['⬅️ Back to Menu']);
        return;
      }

      // KALAU SUDAH LOGIN, BARU FETCH JADUAL
      const { data: schedule, error } = await supabase
        .from('class_schedules')
        .select('day, time, subject, teacher, room')
        .eq('class_name', className)
        .order('day_order', { ascending: true })
        .order('time', { ascending: true });

      if (error) throw error;
      
      if (!schedule || schedule.length === 0) {
        addMsg(`No timetable found for Class ${className}.`, 'bot');
        addChips(['⬅️ Back to Menu']);
        return;
      }

      let scheduleText = `📅 <strong>Class ${className} Timetable</strong><br>`;
      if (className === '5A') scheduleText += `👨‍🏫 <strong>Penyelia:</strong> En. Ahmad Suzzali b Abdul Rahim<br>`;
      else if (className === '5B') scheduleText += `👨‍🏫 <strong>Penyelia:</strong> En. Ruslan bin Sharuddin<br>`;
      
      scheduleText += `<br>`;
      let currentDay = "";
      
      schedule.forEach(item => {
        if (item.day !== currentDay) {
          scheduleText += `<strong>--- ${item.day.toUpperCase()} ---</strong><br>`;
          currentDay = item.day;
        }
        if (item.subject === 'REHAT') {
          scheduleText += `[${item.time}] 🟡 REHAT<br>`;
        } else if (item.subject === 'Perhimpunan / Bacaan Yaasin') {
          scheduleText += `[${item.time}] 📢 ${item.subject}<br>`;
        } else {
          let details = item.subject;
          if (item.teacher) details += ` (${item.teacher})`;
          if (item.room) details += ` @ ${item.room}`;
          scheduleText += `[${item.time}] ${details}<br>`;
        }
      });
      
      addMsg(scheduleText, 'bot');
      addChips(['⬅️ Back to Menu']);

    } catch (error) {
      console.error("Schedule fetch error:", error);
      addMsg("⚠️ Error: " + error.message, 'bot');
      addChips(['⬅️ Back to Menu']);
    }
  }

  let opened = false;
  function open() { panel.classList.add('open'); if (!opened) { opened = true; addMsg(GREETING, 'bot'); addChips(mainMenuChips); } setTimeout(() => input.focus(), 50); }
  function close() { panel.classList.remove('open'); }

  fab.addEventListener('click', (e) => { if (ignoreFabClick) { e.preventDefault(); return; } if (dragStarted) { dragStarted = false; return; } panel.classList.contains('open') ? close() : open(); });
  fab.addEventListener('mousedown', onFabDragStart); fab.addEventListener('touchstart', onFabDragStart, { passive: false });
  panel.querySelector('#rbxChatClose').addEventListener('click', close);
  
  form.addEventListener('submit', (e) => { 
    e.preventDefault(); 
    const val = input.value.trim(); 
    if (!val) return; 
    addMsg(val, 'user'); 
    input.value = ''; 

    if (val === '⬅️ Back to Menu') {
       addChips(mainMenuChips);
       return;
    }

    const isScheduleRoute = handleScheduleRouting(val);

    if (!isScheduleRoute) {
      setTimeout(() => addMsg(findAnswer(val), 'bot'), 300); 
    }
  });
})();
