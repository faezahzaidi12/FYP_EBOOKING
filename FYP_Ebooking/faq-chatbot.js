// MyTVETMARA FAQ Chatbot — Full Drag & Drop Version
(function () {
  if (window.__rbxFaqLoaded) return;
  window.__rbxFaqLoaded = true;

  const GEMINI_API_KEY = 'AQ.Ab8RN6K1nTp979R9f9aiLhNlDrVLKNg31ewospCwSgRLF247_A';
  const GEMINI_MODELS = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-2.5-flash'];

  const FAQS = [
    { q: ['how', 'book', 'room', 'reserve', 'tempah', 'cara', 'bilik'], a: "To book a room: Login → HOME → GO TO BOOKING SYSTEM → choose a building (DFK / Library / Sport) → pick a room → tap an available time slot." },
    { q: ['check', 'in', 'checkin', 'check-in info 📍', 'masuk'], a: "Pending check-ins appear on your HOME dashboard under 'PENDING CHECK-IN'. Click the yellow card to confirm your check-in." },
    { q: ['cancel', 'booking', 'batal'], a: "Bookings you don't check-in on time are auto-cancelled by the system. To cancel manually, open the booking from your dashboard." },
    { q: ['login', 'log in', 'sign in', 'masuk akaun'], a: "Use your registered email and password on the LOG IN page. If you don't have an account, click SIGN UP." },
    { q: ['register', 'sign up', 'signup', 'account', 'daftar'], a: "Click SIGN UP on the login page and fill in your name, email and password. You'll receive a confirmation email." },
    { q: ['password', 'forgot', 'reset', 'lupa kata laluan'], a: "Password reset isn't in-app yet — please contact the admin to reset your password." },
    { q: ['facility', 'facilities', 'sport', 'library', 'dfk', 'available', 'kemudahan'], a: "Available facilities: DFK Building (Rooms 1–10), Library (Century 21st, Literasi 1 & 2), and Sports (Badminton, Field, Ping Pong, Takraw, Volleyball)." },
    { q: ['time', 'slot', 'hour', 'when', 'open', 'masa'], a: "Time slots are shown on each room's timetable. Green/white = available, red = booked. Tap any available slot to book." },
    { q: ['maintenance', 'report', 'issue', 'broken', 'rosak', 'projector', 'aircond', 'light', 'lampu', 'kerusi', 'report issue 🛠️'], a: "🛠️ Found a broken item? You can submit a report using the 'Maintenance Report' form on your check-in page." },
    { q: ['feedback', 'rating', 'star', 'review', 'komen', 'bintang', 'feedback ⭐'], a: "⭐ We value your feedback! Rate your classroom experience (1-5 stars) after your check-in session." },
    { q: ['quota', 'limit', 'max', 'maximum', 'berapa', 'had', 'banyak', 'quota limit 📌'], a: "📌 Booking Quota: Students can have up to 3 active bookings at a time (maximum 12 hours per week)." },
    { q: ['pending', 'approval', 'lulus', 'approve', 'status', 'admin'], a: "⏳ Pending bookings require admin approval. Approval usually takes 1-2 hours during office hours." },
    { q: ['late', 'lewat', 'grace', 'minit', 'terlepas', 'auto cancel', 'autocancel'], a: "⏰ Grace Period: You have 15 minutes to check in after your booking time starts. After 15 minutes, your booking will be automatically cancelled!" },
    { q: ['advance', 'early', 'awal', 'days', 'hari', 'bila', 'future'], a: "📅 Advance Booking: You can book facilities up to 7 days in advance." },
    { q: ['operation', 'operating', 'hours', 'waktu', 'operasi', 'weekend', 'sabtu', 'jumaat', 'buka', 'tutup', 'operating hours 🕒'], a: "🕒 Operating Hours: Sunday–Thursday (8:00 AM – 5:00 PM). Facilities are closed on Weekends & Public Holidays." },
    { q: ['admin', 'contact', 'help', 'support', 'bantuan'], a: "For issues not answered here, please contact your TVET MARA administrator." },
    { q: ['who', 'what', 'mytvetmara', 'about', 'apa itu'], a: "MyTVETMARA e-Booking is the official room & facility booking system for TVET MARA students and staff." },
    { q: ['free', 'kosong', 'available', 'kelas mana', 'bilik mana', 'harini', 'ada kosong'], a: "🟢 Untuk semak bilik/kelas yang FREE & KOSONG: Pergi ke menu HOME → GO TO BOOKING SYSTEM → Pilih Bangunan (DFK / Library / Sport). Slot berwarna HIJAU/PUTIH bermaksud bilik tersebut KOSONG & boleh ditempah segera!" }
  ];

  const GREETING = "Hi! 👋 I'm MARA BOT. I can answer FAQ instantly or use AI for anything else. How can I help?";
  
  function findAnswer(text) {
    const t = text.toLowerCase();
    if (t.split(' ').length > 4 || t.includes('boleh ke') || t.includes('adakah') || t.includes('kenapa') || t.includes('macam mana')) {
      return { answer: null, score: 0 };
    }
    let best = null, bestScore = 0;
    for (const f of FAQS) {
      const score = f.q.reduce((s, k) => s + (t.includes(k.toLowerCase()) ? 1 : 0), 0);
      if (score > bestScore) { bestScore = score; best = f; }
    }
    return { answer: bestScore >= 2 ? best.a : null, score: bestScore };
  }

  // ============================================
  // 🧠 GEMINI SYSTEM PROMPT (Dah diubah jadi lebih mesra)
  // ============================================
  function buildSystemPrompt() {
    let ctx = "You are MARA BOT, the official assistant for MyTVETMARA e-Booking system (TVET MARA room & facility booking).\n\n";
    ctx += "=== OFFICIAL FAQ KNOWLEDGE BASE ===\n";
    FAQS.forEach((f, i) => { ctx += `FAQ ${i + 1} (${f.q.join(', ')}): ${f.a}\n`; });
    ctx += "=== RULES ===\n";
    ctx += "1. If the user asks a general question (like science, history, casual chat, etc.), answer it nicely first.\n";
    ctx += "2. After answering the general question, politely remind them that your main focus is to help with MyTVETMARA room and facility bookings, check-ins, or schedules.\n";
    ctx += "3. If they ask about bookings or system features, use the FAQ knowledge base directly.\n";
    ctx += "4. Keep total response under 6 sentences. Use Bahasa Melayu if the user asks in Malay.\n";
    return ctx;
  }

  let lastCallTime = 0;
  const MIN_CALL_INTERVAL = 1500;

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
            generationConfig: { temperature: 0.3, maxOutputTokens: 2048, topP: 0.8 }
          })
        });
        if (!response.ok) continue;
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) continue;
        return { text: text, provider: model };
      } catch (e) { continue; }
    }
    return { text: "⚠️ AI service currently unavailable.", provider: 'none' };
  }

  const css = `
#rbxFab { position: fixed; bottom: 20px; right: 20px; z-index: 9998; width: 60px; height: 60px; border-radius: 50%; background: #0096B4; color: #fff; border: none; box-shadow: 0 4px 15px rgba(0, 150, 180, 0.4); font-size: 30px; display: flex; align-items: center; justify-content: center; cursor: grab; animation: rbxPulse 2s infinite; user-select: none; touch-action: none; }
#rbxFab:active { cursor: grabbing; }
@keyframes rbxPulse { 0% { box-shadow: 0 0 0 0 rgba(0, 150, 180, 0.7); } 70% { box-shadow: 0 0 0 15px rgba(0, 150, 180, 0); } 100% { box-shadow: 0 0 0 0 rgba(0, 150, 180, 0); } }
#rbxChat { position: fixed; bottom: 95px; right: 20px; z-index: 9999; width: 340px; max-width: calc(100vw - 32px); height: 480px; max-height: calc(100vh - 140px); background: #fff; border: 5px solid #393B3D; box-shadow: 10px 10px 0 rgba(0, 0, 0, .5); display: none; flex-direction: column; font-family: 'Poppins', sans-serif; }
#rbxChat.open { display: flex; }
#rbxChatHead { background: #393B3D; color: #FFC800; padding: 10px 14px; border-bottom: 4px solid #00A2FF; font-family: 'Bungee', cursive; font-size: 15px; display: flex; justify-content: space-between; align-items: center; cursor: grab; user-select: none; touch-action: none; flex-shrink: 0; }
#rbxChatHead:active { cursor: grabbing; }
#rbxChatClose { background: transparent; border: 0; color: #fff; font-size: 22px; cursor: pointer; font-family: 'Bungee', cursive; }
#rbxChatBody { flex: 1; overflow-y: auto; padding: 12px; background: #f5f5f5; }
.rbx-msg { margin-bottom: 10px; padding: 10px 12px; border: 3px solid #393B3D; box-shadow: 3px 3px 0 rgba(0, 0, 0, .2); font-size: 13px; line-height: 1.5; word-wrap: break-word; }
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
      <span>🤖 MARA BOT</span>
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

  // ============================================
  // 🖱️ DRAG & DROP LOGIC (FAB & CHAT WINDOW)
  // ============================================
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

   function getSupabaseClient() {
    // Semak pelbagai variasi nama pembolehubah Supabase yang biasa digunakan
    if (window.supabase && typeof window.supabase.auth === 'object') return window.supabase;
    if (window.supabaseClient && typeof window.supabaseClient.auth === 'object') return window.supabaseClient;
    if (window.sb && typeof window.sb.auth === 'object') return window.sb;
    
    // Jika supabase diisytiharkan di dalam objek global lain
    if (window.SUPABASE_CLIENT && typeof window.SUPABASE_CLIENT.auth === 'object') return window.SUPABASE_CLIENT;

    return null;
  }

  async function fetchScheduleFromDatabase(className) {
    showTyping();
    try {
      const supabase = getSupabaseClient();
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
