// MyTVETMARA FAQ Chatbot — Modern Teal-Blue Design + Draggable
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
  const FALLBACK = "Sorry, I don't have an answer for that. Try keywords like: book, check-in, facility, report issue, feedback.";

  function findAnswer(text) {
    const t = text.toLowerCase();
    let best = null, bestScore = 0;
    for (const f of FAQS) {
      const score = f.q.reduce((s, k) => s + (t.includes(k) ? 1 : 0), 0);
      if (score > bestScore) { bestScore = score; best = f; }
    }
    return best ? best.a : FALLBACK;
  }

  /* ==========================================
     CSS DESIGN MODEN TEAL-BLUE (TANPA BORDER TEBAL)
     ========================================== */
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

/* 1. TETINGKAP CHAT ROBLOX (Seperti Gambar) */
#rbxChat {
  position: fixed; bottom: 95px; right: 20px; z-index: 9999;
  width: 340px; max-width: calc(100vw - 32px); height: 480px; max-height: calc(100vh - 140px);
  background: #fff;
  border: 5px solid #393B3D;              /* Border hitam tebal 5px */
  box-shadow: 10px 10px 0 rgba(0, 0, 0, .5);/* Bayang 3D tebal */
  display: none; flex-direction: column; font-family: 'Poppins', sans-serif;
  border-radius: 0;                       /* Bucu petak tajam */
}

#rbxChat.open { display: flex; }

/* 2. HEADER ATAS (Hitam, Tajuk Kuning, Garisan Biru) */
#rbxChatHead { 
  background: #393B3D;                     /* Latar Gelap */
  color: #FFC800;                          /* Teks Tajuk KUNING */
  padding: 12px 14px; 
  border-bottom: 4px solid #00A2FF;        /* Garisan bawah BIRU */
  font-family: 'Bungee', cursive; font-size: 15px;
  display: flex; justify-content: space-between; align-items: center;
  cursor: move; user-select: none; touch-action: none;
}

#rbxChatHead button { background: transparent; border: 0; color: #fff; font-size: 22px; cursor: pointer; line-height: 1; font-family: 'Bungee', cursive; }

#rbxChatBody { flex: 1; overflow-y: auto; padding: 12px; background: #f5f5f5; }

/* 3. GELEMBUNG MESEJ ROBLOX (Border 3px + Bayang 3px) */
.rbx-msg { 
  margin-top: 10px; padding: 10px 12px; 
  margin-bottom: 14px; padding: 10px 12px; 
  border: 3px solid #393B3D;               /* Border tebal 3px */
  box-shadow: 3px 3px 0 rgba(0, 0, 0, .2); /* Bayang 3D 3px */
  font-size: 13px; line-height: 1.4; word-wrap: break-word; 
  border-radius: 0;
}

.rbx-msg.bot { background: #fff; color: #000; }
.rbx-msg.user { background: #fcc500; color: #000; font-weight: bold; margin-left: auto; } /* User KUNING */

/* 4. FORM INPUT & BUTANG SEND (Hijau Roblox) */
#rbxChatForm { display: flex; border-top: 4px solid #393B3D; background: #fff; }
#rbxChatInput { flex: 1; border: 0; padding: 12px; font-family: 'Poppins', sans-serif; font-size: 13px; outline: none; }
#rbxChatSend { 
  border: 0; 
  background: #00E223;                     /* Hijau Terang Roblox */
  color: #fff; 
  font-family: 'Bungee', cursive; 
  padding: 0 16px; cursor: pointer; font-size: 13px; border-radius: 0; 
}

/* 5. BUTANG QUICK CHIPS (Kotak Petak Border) */
.rbx-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }

.rbx-chip { 
  background: #fff; 
  border: 2px solid #393B3D;               /* Border tebal 2px */
  box-shadow: 2px 2px 0 #393B3D;           /* Bayang 3D 2px */
  padding: 5px 9px; font-size: 11px; cursor: pointer; 
  font-family: 'Bungee', cursive;          /* Font Bungee Roblox */
  text-transform: uppercase; border-radius: 0;
  transition: background 0.2s;
}

.rbx-chip:hover { background: #eaf7ff; }

@media (max-width: 575.98px) {
  #rbxFab { width: 54px; height: 54px; font-size: 26px; bottom: 16px; right: 16px; }
  #rbxChat { right: 12px; left: 12px; width: auto; bottom: 80px; height: 70vh; }
}
  `;
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  // Build UI
  const fab = document.createElement('button'); fab.id = 'rbxFab'; fab.textContent = '🤖';
  const panel = document.createElement('div'); panel.id = 'rbxChat';
  panel.innerHTML = `<div id="rbxChatHead"><span>🤖 MARA BOT</span><button id="rbxChatClose">×</button></div><div id="rbxChatBody"></div><form id="rbxChatForm" autocomplete="off"><input id="rbxChatInput" type="text" placeholder="Ask a question..."/><button id="rbxChatSend" type="submit">SEND</button></form>`;

  document.body.appendChild(fab); document.body.appendChild(panel);
  const body = panel.querySelector('#rbxChatBody'), form = panel.querySelector('#rbxChatForm'), input = panel.querySelector('#rbxChatInput');

  function clamp(v, min, max) { return Math.min(Math.max(v, min), max); }

  /* ==========================================
     1. DRAG LOGIC UNTUK BUTANG TERAPUNG (#rbxFab)
     ========================================== */
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

  /* ==========================================
     2. DRAG LOGIC UNTUK WINDOW CHAT PANEL (#rbxChat)
     ========================================== */
  let chatDragActive = false, chatStartX = 0, chatStartY = 0, chatOrigX = 0, chatOrigY = 0;
  const chatHead = panel.querySelector('#rbxChatHead');

  function onChatDragStart(e) {
    if (e.target.id === 'rbxChatClose') return;
    const p = e.type.startsWith('touch') ? e.touches[0] : e; if (!p) return;
    chatDragActive = true;
    chatStartX = p.clientX; chatStartY = p.clientY;
    const r = panel.getBoundingClientRect();
    chatOrigX = r.left; chatOrigY = r.top;
    document.addEventListener('mousemove', onChatDragMove);
    document.addEventListener('mouseup', onChatDragEnd);
    document.addEventListener('touchmove', onChatDragMove, { passive: false });
    document.addEventListener('touchend', onChatDragEnd);
  }

  function onChatDragMove(e) {
    if (!chatDragActive) return;
    const p = e.type.startsWith('touch') ? e.touches[0] : e; if (!p) return;
    e.preventDefault();
    const dx = p.clientX - chatStartX, dy = p.clientY - chatStartY;
    panel.style.position = 'fixed';
    panel.style.left = clamp(chatOrigX + dx, 8, window.innerWidth - panel.offsetWidth - 8) + 'px';
    panel.style.top = clamp(chatOrigY + dy, 8, window.innerHeight - panel.offsetHeight - 8) + 'px';
    panel.style.bottom = 'auto'; panel.style.right = 'auto';
  }

  function onChatDragEnd() {
    if (!chatDragActive) return;
    chatDragActive = false;
    document.removeEventListener('mousemove', onChatDragMove);
    document.removeEventListener('mouseup', onChatDragEnd);
    document.removeEventListener('touchmove', onChatDragMove);
    document.removeEventListener('touchend', onChatDragEnd);
  }

  chatHead.addEventListener('mousedown', onChatDragStart);
  chatHead.addEventListener('touchstart', onChatDragStart, { passive: false });

  /* ==========================================
     FUNKSI MESEJ & EVENTS
     ========================================== */
  function addMsg(text, who) { const m = document.createElement('div'); m.className = 'rbx-msg ' + who; m.innerHTML = text.replace(/\n/g, '<br>'); body.appendChild(m); body.scrollTop = body.scrollHeight; }
  function addChips() { const wrap = document.createElement('div'); wrap.className = 'rbx-chips'; ['How to book?', 'Check-in info 📍', 'Quota limit 📌', 'Report Issue 🛠️', 'Feedback ⭐', 'Operating Hours 🕒'].forEach(label => { const c = document.createElement('button'); c.type = 'button'; c.className = 'rbx-chip'; c.textContent = label; c.onclick = () => { input.value = label; form.dispatchEvent(new Event('submit', {cancelable:true})); }; wrap.appendChild(c); }); body.appendChild(wrap); }

  let opened = false;
  function open() { panel.classList.add('open'); if (!opened) { opened = true; addMsg(GREETING, 'bot'); addChips(); } setTimeout(() => input.focus(), 50); }
  function close() { panel.classList.remove('open'); }

  fab.addEventListener('click', (e) => { if (ignoreFabClick) { e.preventDefault(); return; } if (dragStarted) { dragStarted = false; return; } panel.classList.contains('open') ? close() : open(); });
  fab.addEventListener('mousedown', onFabDragStart); fab.addEventListener('touchstart', onFabDragStart, { passive: false });
  panel.querySelector('#rbxChatClose').addEventListener('click', close);
  form.addEventListener('submit', (e) => { e.preventDefault(); const val = input.value.trim(); if (!val) return; addMsg(val, 'user'); input.value = ''; setTimeout(() => addMsg(findAnswer(val), 'bot'), 300); });
})();
