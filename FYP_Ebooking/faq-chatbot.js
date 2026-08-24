// MyTVETMARA FAQ & Smart Room Search Bot (Strict Time Filter)
(function () {
  if (window.__rbxFaqLoaded) return;
  window.__rbxFaqLoaded = true;

  const GEMINI_API_KEY = '';
  const GEMINI_MODELS = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-2.5-flash',  'gemini-1.5-flash'];

  const SB_URL = 'https://doyyrhhscdpchuvpancq.supabase.co';
  const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRveXlyaGhzY2RwY2h1dnBhbmNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2MjkzNjksImV4cCI6MjA5NTIwNTM2OX0.liPsexqKQTnZe5UpB1DW5zpZ12I05REflxYaNbf6l8A';

  const ALL_ROOMS = [
  'dfk 1', 'dfk 2', 'dfk 3', 'dfk 4', 'dfk 5', 'dfk 6', 'dfk 7', 'dfk 8', 'dfk 9', 'dfk 10' ,
  'bk02', 'bk03', 'bk04', 'bk07', 'bk08', 'bk09',
  'literasi 1', 'literasi 2', 'century 21st',
  'field', 'badminton court', 'volleyball court', 'takraw court', 'pingpong room'
  ];

  const FAQS = [
    { q: ['how', 'book', 'room', 'reserve', 'tempah', 'cara', 'bilik'], a: "To book a room: Login → HOME → GO TO BOOKING SYSTEM → choose a building (DFK / Library / Sport) → pick a room → tap an available time slot." },
    { q: ['check', 'in', 'checkin', 'check-in info 📍', 'masuk'], a: "Pending check-ins appear on your HOME dashboard under 'PENDING CHECK-IN'. Click the yellow card to confirm your check-in." },
    { q: ['cancel', 'booking', 'batal'], a: "Bookings you don't check-in on time are auto-cancelled by the system. To cancel manually, open the booking from your dashboard." },
    { q: ['login', 'log in', 'sign in', 'masuk akaun'], a: "Use your registered email and password on the LOG IN page. If you don't have an account, click SIGN UP." },
    { q: ['register', 'sign up', 'signup', 'account', 'daftar'], a: "Click SIGN UP on the login page and fill in your name, email and password." },
    { q: ['password', 'forgot', 'reset', 'lupa kata laluan'], a: "Password reset isn't in-app yet — please contact the admin to reset your password." },
    { q: ['facility', 'facilities', 'sport', 'library', 'dfk', 'available', 'kemudahan'], a: "Available facilities: DFK Building (dfk.01–dfk.09), Library (Literasi 1, Literasi 2, Century 21st), and Sports (Field, Badminton Hall, Volleyball Court, Takraw Court, Pingpong Room)." },
    { q: ['time', 'slot', 'hour', 'when', 'open', 'masa'], a: "Time slots are shown on each room's timetable. Green/white = available, red = booked." },
    { q: ['operation', 'operating', 'hours', 'waktu', 'operasi', 'weekend', 'sabtu', 'jumaat', 'buka', 'tutup', 'operating hours 🕒'], a: "🕒 Operating Hours: Sunday–Thursday (8:00 AM – 5:00 PM). Facilities are closed on Weekends & Public Holidays." },
    { q: ['admin', 'contact', 'help', 'support', 'bantuan'], a: "For issues not answered here, please contact your TVET MARA administrator." },
    { q: ['who', 'what', 'mytvetmara', 'about', 'apa itu'], a: "MyTVETMARA e-Booking is the official room & facility booking system for TVET MARA students and staff." }
  ];

  const GREETING = "Hi! 👋 I'm CHITCHAT BOT. I can answer FAQs or search available classrooms & sports facilities . How can I help?";

  function findAnswer(text) {
    const t = text.toLowerCase();
    if (t.split(' ').length > 4 || t.includes('boleh ke') || t.includes('adakah') || t.includes('kenapa') || t.includes('macam mana') || t.includes('cari') || t.includes('kosong') || t.includes('free') || t.includes('available') || t.includes('book') || t.includes('tempah')) {
      return { answer: null, score: 0 };
    }
    let best = null, bestScore = 0;
    for (const f of FAQS) {
      const score = f.q.reduce((s, k) => s + (t.includes(k.toLowerCase()) ? 1 : 0), 0);
      if (score > bestScore) { bestScore = score; best = f; }
    }
    return { answer: bestScore >= 2 ? best.a : null, score: bestScore };
  }

  function getMalaysiaTime() {
  const now = new Date();
  const formatterDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kuala_Lumpur', year: 'numeric', month: '2-digit', day: '2-digit' });
  const formatterTime = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kuala_Lumpur', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const formatterDay = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kuala_Lumpur', weekday: 'long' }); 
  
  return {
    date: formatterDate.format(now),
    time: formatterTime.format(now),
    day: formatterDay.format(now) // Output: "Sunday", "Monday", etc.
  };
}

  let _botSupabaseClient = null;

  async function getSupabaseClient() {
    if (_botSupabaseClient) return _botSupabaseClient;
    if (window._supabase && typeof window._supabase.from === 'function') return window._supabase;
    if (window.supabaseClient && typeof window.supabaseClient.from === 'function') return window.supabaseClient;
    if (window.supabase && typeof window.supabase.from === 'function') return window.supabase;

    if (typeof window.supabase === 'undefined' || typeof window.supabase.createClient !== 'function') {
      await new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.onload = resolve;
        script.onerror = resolve;
        document.head.appendChild(script);
      });
    }

    try {
      const create = window.supabase?.createClient || (typeof supabase !== 'undefined' ? supabase.createClient : null);
      if (create) {
        _botSupabaseClient = create(SB_URL, SB_KEY);
        return _botSupabaseClient;
      }
    } catch (e) {
      console.error("Supabase auto-init error:", e);
    }
    return null;
  }

  function buildSystemPrompt() {
    const myTime = getMalaysiaTime();
    let ctx = "You are MARA BOT, official assistant for MyTVETMARA e-Booking system.\n";
    ctx += `Current Malaysia Date & Time: ${myTime.date} ${myTime.time}.\n`;
    ctx += `Current Day: ${myTime.day}.\n`;
    ctx += "Operating Hours: 08:00:00 to 17:00:00 (Sunday–Thursday). Closed outside these hours.\n\n";

    ctx += "=== LANGUAGE RULE ===\n";
    ctx += "If you are answering casually or answering FAQs, you MUST reply in a friendly, conversational mix of English and Bahasa Melayu (santai dan profesional untuk pelajar kampus).\n";
    ctx += "HOWEVER, if the user asks to find/book a room, DO NOT include any conversational text. Output ONLY the JSON block.\n";
    ctx += "IMPORTANT: If the user asks about their personal class schedule (e.g. 'kelas harini ada tak?' or 'jadual saya'), DO NOT output JSON to search rooms. Instead, politely ask them to click the 'My Schedule 📅' button on the menu to check their class timetable.\n\n";
    ctx += "=== SEARCH RULES ===\n";
    ctx += "1. REAL-TIME STRICT RULE: If the user asks for available rooms WITHOUT specifying a date and time (e.g. 'cari bilik kosong'), you MUST strictly use the Current Malaysia Date & Time above. DO NOT guess or suggest future dates.\n";
    ctx += "2. Operating Hours Rule: If the requested start_time is BEFORE 08:00:00 or AFTER 17:00:00, DO NOT search database. Instead, reply directly in text (using Malay/English) telling the user that facilities are closed at that hour.\n";
    ctx += "3. JSON STRICT OUTPUT: If time is within operating hours and you need to search, output EXACTLY AND ONLY this JSON format (no backticks, no extra words):\n";
    ctx += '{"action": "SEARCH_ROOM", "booking_date": "YYYY-MM-DD", "start_time": "HH:MM:SS"}\n\n';

    ctx += "=== FAQ KNOWLEDGE BASE ===\n";
    FAQS.forEach((f, i) => { ctx += `FAQ ${i + 1} (${f.q.join(', ')}): ${f.a}\n`; });
    return ctx;
  }

  async function handleAIActions(actionObj) {
    const supabase = await getSupabaseClient();
    if (!supabase) return "⚠️ Oops, database connection tak jumpa.";

    const { action, booking_date, start_time } = actionObj;

    // TAPISAN KETAT WAKTU OPERASI (08:00:00 HINGGA 17:00:00)
    const searchHour = parseInt(start_time.split(':')[0], 10);
    if (searchHour < 8 || searchHour >= 17) {
      return `⏰ <strong>Oops, we are closed!</strong><br>Fasiliti di TVET MARA Campus Besut hanya beroperasi dari jam <strong>8:00 AM hingga 5:00 PM</strong> (Ahad–Khamis). Boleh try search slot masa lain ya!`;
    }

    if (action === 'SEARCH_ROOM') {
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dateObj = new Date(booking_date);
      const dayName = days[dateObj.getDay()];

      // Lakukan 2 carian serentak
      const [bookingsRes, classesRes] = await Promise.all([
        supabase
          .from('bookings')
          .select('room_name')
          .eq('booking_date', booking_date)
          .lte('start_time', start_time)
          .gt('end_time', start_time),
        supabase
          .from('class_schedules')
          .select('room, time')
          .ilike('day', dayName) 
      ]);

      if (bookingsRes.error) return `⚠️ Alamak, database error (Booking): ${bookingsRes.error.message}`;
      if (classesRes.error) return `⚠️ Alamak, database error (Jadual): ${classesRes.error.message}`;

      // 1. Dapatkan bilik yang telah dibooking
      const bookedRooms = (bookingsRes.data || []).map(b => b.room_name ? b.room_name.toLowerCase() : '');
      
      // 2. Dapatkan bilik kelas yang guna pada JAM yang sama
      const classRooms = (classesRes.data || [])
        .filter(c => {
          if (!c.time) return false;
          const classHourMatch = c.time.match(/\d+/);
          if (!classHourMatch) return false;
          let classHour = parseInt(classHourMatch[0], 10);
          
          if (c.time.toLowerCase().includes('pm') && classHour !== 12) {
            classHour += 12;
          }
          return classHour === searchHour;
        })
        .map(c => c.room ? c.room.toLowerCase() : '');
      
      const allUsedRooms = [...bookedRooms, ...classRooms];
      const freeRooms = ALL_ROOMS.filter(r => !allUsedRooms.includes(r.toLowerCase()));

      // ========================================================
      // 🔥 PENAMBAHBAIKAN DEGREE LEVEL: SMART SLOT SUGGESTION
      // ========================================================
      if (freeRooms.length === 0) {
        const nextHour = searchHour + 1;
        
        // Cek kalau jam seterusnya masih dalam waktu operasi
        if (nextHour < 17) {
          // Format masa untuk jam seterusnya (contoh 10:15:00 jadi 11:15:00)
          const nextTimeStr = (nextHour < 10 ? '0' + nextHour : nextHour) + start_time.substring(start_time.indexOf(':'));
          
          // Semak database sekejap untuk jam seterusnya
          const { data: nextBookings } = await supabase
            .from('bookings')
            .select('room_name')
            .eq('booking_date', booking_date)
            .lte('start_time', nextTimeStr)
            .gt('end_time', nextTimeStr);

          const nextBookedRooms = (nextBookings || []).map(b => b.room_name ? b.room_name.toLowerCase() : '');
          
          const nextClassRooms = (classesRes.data || [])
            .filter(c => {
              if (!c.time) return false;
              const match = c.time.match(/\d+/);
              if (!match) return false;
              let cH = parseInt(match[0], 10);
              if (c.time.toLowerCase().includes('pm') && cH !== 12) cH += 12;
              return cH === nextHour;
            }).map(c => c.room ? c.room.toLowerCase() : '');

          const nextUsedRooms = [...nextBookedRooms, ...nextClassRooms];
          const nextFreeRooms = ALL_ROOMS.filter(r => !nextUsedRooms.includes(r.toLowerCase()));

          // Kalau jam seterusnya ada bilik kosong, keluarkan cadangan!
          if (nextFreeRooms.length > 0) {
            return `❌ Sorry ya, semua bilik dah full pada jam ${start_time}.<br><br>💡 <strong>TAPI CHOP!</strong> Untuk 1 jam selepas tu (<strong>${nextTimeStr}</strong>), bilik ni *available*:<br>• ${nextFreeRooms.map(r => r.toUpperCase()).join('<br>• ')}<br><br><em>Nak try slot masa ni tak? Boleh terus gi <strong>HOME → BOOKING SYSTEM</strong>.</em>`;
          }
        }
        
        // Kalau jam tu penuh, dan jam seterusnya pun penuh (atau luar waktu operasi)
        return `❌ Sorry ya, **semua bilik dah full atau ada kelas** pada ${booking_date} (${start_time}). Cuba try check slot masa yang lain okay?`;
      }
      // ========================================================

      return `🟢 <strong>Awesome! Ni bilik yang available on ${booking_date} @ ${start_time}:</strong><br>` +
             `• ${freeRooms.map(r => r.toUpperCase()).join('<br>• ')}<br><br>` +
             `📌 <em>Cepat-cepat book kat: <strong>HOME → BOOKING SYSTEM</strong></em>`;
    }

    return "⚠️ Invalid action. Sila cuba lagi.";
  }

  let lastCallTime = 0;
  const MIN_CALL_INTERVAL = 0;
  async function callGemini(userMessage) {
    if (!GEMINI_API_KEY) return { text: "⚠️ API key not configured.", provider: 'none' };
    const now = Date.now();
    const wait = MIN_CALL_INTERVAL - (now - lastCallTime);
    if (wait > 0) await new Promise(r => setTimeout(r, wait));
    lastCallTime = Date.now();

    for (let i = 0; i < GEMINI_MODELS.length; i++) {
      const model = GEMINI_MODELS[i];
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      try {
        const response = await fetch(`${url}?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: buildSystemPrompt() }] },
            contents: [{ parts: [{ text: userMessage }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 2048, topP: 0.8 }
          })
        });
        if (!response.ok) continue;
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) continue;

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const actionData = JSON.parse(jsonMatch[0]);
            if (actionData.action === 'SEARCH_ROOM') {
              const actionResult = await handleAIActions(actionData);
              return { text: actionResult, provider: model };
            }
          } catch (err) {
            console.error("JSON parse error from AI:", err);
          }
        }

        return { text: text, provider: model };
      } catch (e) { continue; }
    }
    return { text: "⚠️ AI service currently unavailable.", provider: 'none' };
  }

  // ============================================
  // 🎨 DESIGN ASAL 100% (CSS, FONTS & LAYOUT)
  // ============================================
  const css = `
#rbxFab { position: fixed; bottom: 20px; right: 20px; z-index: 9998; width: 60px; height: 60px; border-radius: 50%; background: #0096B4; color: #fff; border: none; box-shadow: 0 4px 15px rgba(0, 150, 180, 0.4); font-size: 30px; display: flex; align-items: center; justify-content: center; cursor: grab; animation: rbxPulse 2s infinite; user-select: none; touch-action: none; }
#rbxFab:active { cursor: grabbing; }
@keyframes rbxPulse { 0% { box-shadow: 0 0 0 0 rgba(0, 150, 180, 0.7); } 70% { box-shadow: 0 0 0 15px rgba(0, 150, 180, 0); } 100% { box-shadow: 0 0 0 0 rgba(0, 150, 180, 0); } }
#rbxChat { position: fixed; bottom: 95px; right: 20px; z-index: 9999; width: 340px; max-width: calc(100vw - 32px); height: 500px; max-height: calc(100vh - 140px); background: #fff; border: 5px solid #393B3D; box-shadow: 10px 10px 0 rgba(0, 0, 0, .5); display: none; flex-direction: column; font-family: 'Poppins', sans-serif; }
#rbxChat.open { display: flex; }
#rbxChatHead { background: #393B3D; color: #FFC800; padding: 10px 14px; border-bottom: 4px solid #00A2FF; font-family: 'Bungee', cursive; font-size: 15px; display: flex; justify-content: space-between; align-items: center; cursor: grab; user-select: none; touch-action: none; flex-shrink: 0; }
#rbxChatHead:active { cursor: grabbing; }
#rbxChatClose { background: transparent; border: 0; color: #fff; font-size: 22px; cursor: pointer; font-family: 'Bungee', cursive; }
#rbxChatBody { flex: 1; overflow-y: auto; padding: 12px; background: #f5f5f5; }
.rbx-msg { margin-bottom: 10px; padding: 10px 12px; border: 3px solid #393B3D; box-shadow: 3px 3px 0 rgba(0, 0, 0, .2); font-size: 12.5px; line-height: 1.4; word-wrap: break-word; overflow-x: hidden; }
.rbx-msg.bot { background: #fff; color: #000; }
.rbx-msg.user { background: #fcc500; color: #000; font-weight: bold; }
.rbx-msg.ai { background: #e8f7ff; color: #000; border-color: #0096B4; box-shadow: 3px 3px 0 rgba(0, 150, 180, 0.3); }
.rbx-ai-badge { display: inline-block; background: #0096B4; color: #fff; font-size: 9px; font-weight: bold; padding: 1px 5px; margin-bottom: 4px; font-family: 'Bungee', cursive; }
.rbx-typing { display: flex; align-items: center; gap: 4px; padding: 6px 0; }
.rbx-typing span { width: 7px; height: 7px; background: #0096B4; border-radius: 50%; animation: rbxBounce 1.4s infinite ease-in-out both; }
.rbx-typing span:nth-child(1) { animation-delay: -0.32s; }
.rbx-typing span:nth-child(2) { animation-delay: -0.16s; }
@keyframes rbxBounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
#rbxChatForm { display: flex; border-top: 4px solid #393B3D; background: #fff; flex-shrink: 0; }
#rbxChatInput { flex: 1; border: 0; padding: 12px; font-family: 'Poppins', sans-serif; font-size: 13px; outline: none; }
#rbxChatSend { border: 0; background: #00E22D; color: #fff; font-family: 'Bungee', cursive; padding: 0 16px; cursor: pointer; font-size: 13px; }
.rbx-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.rbx-chip { background: #fff; border: 2px solid #393B3D; box-shadow: 2px 2px 0 #393B3D; padding: 5px 9px; font-size: 11px; cursor: pointer; font-family: 'Bungee', cursive; text-transform: uppercase; }
.rbx-chip:hover { background: #eaf7ff; }
  `;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const fab = document.createElement('button');
  fab.id = 'rbxFab';
  fab.textContent = '🤖';

  const panel = document.createElement('div');
  panel.id = 'rbxChat';
  panel.innerHTML = `
    <div id="rbxChatHead">
      <span>🤖 CHITCHAT BOT</span>
      <button id="rbxChatClose">×</button>
    </div>
    <div id="rbxChatBody"></div>
    <form id="rbxChatForm" autocomplete="off">
      <input id="rbxChatInput" type="text" placeholder="Ask anything..." />
      <button id="rbxChatSend" type="submit">SEND</button>
    </form>
  `;

  document.body.appendChild(fab);
  document.body.appendChild(panel);

  const body = panel.querySelector('#rbxChatBody');
  const form = panel.querySelector('#rbxChatForm');
  const input = panel.querySelector('#rbxChatInput');

  function clamp(v, min, max) { return Math.min(Math.max(v, min), max); }

  let dragActive = false, dragStarted = false, startX = 0, startY = 0, origX = 0, origY = 0, ignoreFabClick = false;

  function onFabDragStart(e) {
    const p = e.type.startsWith('touch') ? e.touches[0] : e; if (!p) return;
    dragActive = true; dragStarted = false;
    startX = p.clientX; startY = p.clientY;
    const r = fab.getBoundingClientRect(); origX = r.left; origY = r.top;
    document.addEventListener('mousemove', onFabDragMove);
    document.addEventListener('mouseup', onFabDragEnd);
    document.addEventListener('touchmove', onFabDragMove, { passive: false });
    document.addEventListener('touchend', onFabDragEnd);
  }
  function onFabDragMove(e) {
    if (!dragActive) return;
    const p = e.type.startsWith('touch') ? e.touches[0] : e; if (!p) return;
    const dx = p.clientX - startX, dy = p.clientY - startY;
    if (!dragStarted && Math.abs(dx) + Math.abs(dy) > 4) dragStarted = true;
    if (!dragStarted) return;
    e.preventDefault();
    fab.style.position = 'fixed';
    fab.style.left = clamp(origX + dx, 8, window.innerWidth - fab.offsetWidth - 8) + 'px';
    fab.style.top = clamp(origY + dy, 8, window.innerHeight - fab.offsetHeight - 8) + 'px';
    fab.style.bottom = 'auto'; fab.style.right = 'auto';
  }
  function onFabDragEnd() {
    if (!dragActive) return; dragActive = false;
    if (dragStarted) { ignoreFabClick = true; setTimeout(() => { ignoreFabClick = false; }, 50); }
    document.removeEventListener('mousemove', onFabDragMove);
    document.removeEventListener('mouseup', onFabDragEnd);
    document.removeEventListener('touchmove', onFabDragMove);
    document.removeEventListener('touchend', onFabDragEnd);
  }

  let chatDragActive = false, chatStartX = 0, chatStartY = 0, chatOrigX = 0, chatOrigY = 0;
  const chatHead = panel.querySelector('#rbxChatHead');

  function onChatDragStart(e) {
    if (e.target.id === 'rbxChatClose') return;
    const p = e.type.startsWith('touch') ? e.touches[0] : e; if (!p) return;
    chatDragActive = true; chatStartX = p.clientX; chatStartY = p.clientY;
    const r = panel.getBoundingClientRect(); chatOrigX = r.left; chatOrigY = r.top;
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
    if (!chatDragActive) return; chatDragActive = false;
    document.removeEventListener('mousemove', onChatDragMove);
    document.removeEventListener('mouseup', onChatDragEnd);
    document.removeEventListener('touchmove', onChatDragMove);
    document.removeEventListener('touchend', onChatDragEnd);
  }

  fab.addEventListener('mousedown', onFabDragStart);
  fab.addEventListener('touchstart', onFabDragStart, { passive: false });
  chatHead.addEventListener('mousedown', onChatDragStart);
  chatHead.addEventListener('touchstart', onChatDragStart, { passive: false });

  function addMsg(text, who) {
    const m = document.createElement('div');
    m.className = 'rbx-msg ' + who;
    m.innerHTML = (who === 'ai' ? `<div class="rbx-ai-badge">✨ GEMINI AI</div><br>` : '') + text.replace(/\n/g, '<br>');
    body.appendChild(m);
    body.scrollTop = body.scrollHeight;
  }

  function showTyping() {
    const m = document.createElement('div');
    m.className = 'rbx-msg bot'; m.id = 'rbxTyping';
    m.innerHTML = `<div class="rbx-typing"><span></span><span></span><span></span></div>`;
    body.appendChild(m); body.scrollTop = body.scrollHeight;
  }
  function hideTyping() {
    const t = document.getElementById('rbxTyping'); if (t) t.remove();
  }

  const mainMenuChips = ['How to book?', 'Check-in info 📍', 'My Schedule 📅', 'Quota limit 📌', 'Report Issue 🛠️', 'Feedback ⭐', 'Operating Hours 🕒'];

  function addChips(labels) {
    const wrap = document.createElement('div'); wrap.className = 'rbx-chips';
    labels.forEach(label => {
      const c = document.createElement('button');
      c.type = 'button'; c.className = 'rbx-chip'; c.textContent = label;
      c.onclick = () => { input.value = label; form.dispatchEvent(new Event('submit', { cancelable: true })); };
      wrap.appendChild(c);
    });
    body.appendChild(wrap); body.scrollTop = body.scrollHeight;
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
    if (['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4'].includes(val)) {
      addMsg("Schedules for this semester are not uploaded yet. Check back later.", 'bot');
      addChips(['⬅️ Back to Menu']);
      return true;
    }
    if (val === '5A' || val === '5a') { fetchScheduleFromDatabase('5A'); return true; }
    if (val === '5B' || val === '5b') { fetchScheduleFromDatabase('5B'); return true; }
    return false;
  }

  async function fetchScheduleFromDatabase(className) {
    showTyping();
    try {
      const supabase = await getSupabaseClient();
      if (!supabase) { hideTyping(); addMsg("⚠️ Database connection not found.", 'bot'); addChips(['⬅️ Back to Menu']); return; }
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) { hideTyping(); addMsg("🔒 Please log in first.", 'bot'); addChips(['⬅️ Back to Menu']); return; }
      const { data: schedule, error } = await supabase
        .from('class_schedules').select('day, time, subject, teacher, room')
        .eq('class_name', className).order('day_order', { ascending: true }).order('time', { ascending: true });
      if (error) throw error;

      hideTyping();
      if (!schedule || schedule.length === 0) { addMsg(`No timetable for Class ${className}.`, 'bot'); addChips(['⬅️ Back to Menu']); return; }
      let txt = `📅 <strong>Class ${className} Timetable</strong><br>`;
      if (className === '5A') txt += `👨‍🏫 <strong>Penyelia:</strong> En. Ahmad Suzzali b Abdul Rahim<br>`;
      else if (className === '5B') txt += `👨‍🏫 <strong>Penyelia:</strong> En. Ruslan bin Sharuddin<br>`;
      else if (className === '1B') txt += `👨‍🏫 <strong>Penyelia:</strong> En. Abu Hanifah bin Che Abd Aziz<br>`;
      txt += `<br>`; let cur = "";

      schedule.forEach(item => {
        if (item.day !== cur) { txt += `<strong>--- ${item.day.toUpperCase()} ---</strong><br>`; cur = item.day; }
        if (item.subject === 'REHAT') { txt += `[${item.time}] 🟡 REHAT<br>`; }
        else if (item.subject === 'Perhimpunan / Bacaan Yaasin') { txt += `[${item.time}] 📢 ${item.subject}<br>`; }
        else { let d = item.subject; if (item.teacher) d += ` (${item.teacher})`; if (item.room) d += ` @ ${item.room}`; txt += `[${item.time}] ${d}<br>`; }
      });
      addMsg(txt, 'bot'); addChips(['⬅️ Back to Menu']);
    } catch (error) {
      hideTyping();
      addMsg("⚠️ Error: " + error.message, 'bot'); addChips(['⬅️ Back to Menu']);
    }
  }

  let opened = false;
  fab.addEventListener('click', (e) => {
    if (ignoreFabClick) return;
    panel.classList.toggle('open');
    if (!opened) { opened = true; addMsg(GREETING, 'bot'); addChips(mainMenuChips); }
    setTimeout(() => input.focus(), 50);
  });
  panel.querySelector('#rbxChatClose').addEventListener('click', () => panel.classList.remove('open'));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const val = input.value.trim();
    if (!val) return;
    addMsg(val, 'user');
    input.value = '';

    if (val === '⬅️ Back to Menu') { addChips(mainMenuChips); return; }
    if (handleScheduleRouting(val)) return;

    const { answer, score } = findAnswer(val);

    if (answer && score >= 2) {
      setTimeout(() => { addMsg(answer, 'bot'); addChips(['⬅️ Back to Menu']); }, 150);
    } else {
      showTyping();
      const result = await callGemini(val);
      hideTyping();
      addMsg(result.text, result.provider !== 'none' ? 'ai' : 'bot');
      addChips(['⬅️ Back to Menu']);
    }
  });
})();
