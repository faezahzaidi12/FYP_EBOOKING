// MyTVETMARA FAQ Chatbot — Gemini AI (Tanpa Resize)
(function () {
  if (window.__rbxFaqLoaded) return;
  window.__rbxFaqLoaded = true;

  // ============================================
  // 🤖 GEMINI CONFIG
  // ============================================
  const GEMINI_API_KEY = 'AIzaSy_PASTE_KEY_ANDA_DISINI';
  const GEMINI_MODELS = [
    'gemini-1.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash-8b'
  ];

  function getApiKey() {
    return localStorage.getItem('rbx_gemini_key') || GEMINI_API_KEY;
  }

  // ============================================
  // FAQ DATABASE
  // ============================================
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

  const GREETING = "Hi! 👋 I'm MARA BOT. I can answer FAQ instantly or use AI for anything else. How can I help?";
  const FALLBACK = "Sorry, I don't have an answer for that. Try: book, check-in, schedule, facility, report issue.";

  // ============================================
  // 🔍 FAQ MATCHING
  // ============================================
  function findAnswer(text) {
    const t = text.toLowerCase();
    let best = null, bestScore = 0;
    for (const f of FAQS) {
      const score = f.q.reduce((s, k) => s + (t.includes(k) ? 1 : 0), 0);
      if (score > bestScore) { bestScore = score; best = f; }
    }
    return { answer: best ? best.a : null, score: bestScore };
  }

  // ============================================
  // 🧠 GEMINI SYSTEM PROMPT
  // ============================================
  function buildSystemPrompt() {
    let ctx = "You are MARA BOT, the official assistant for MyTVETMARA e-Booking system (TVET MARA room & facility booking for Malaysian students).\n\n";
    ctx += "=== OFFICIAL FAQ KNOWLEDGE BASE ===\n";
    FAQS.forEach((f, i) => {
      ctx += `FAQ ${i + 1} (keywords: ${f.q.join(', ')}):\nAnswer: ${f.a}\n\n`;
    });
    ctx += "=== RULES ===\n";
    ctx += "1. Use FAQ as primary reference. You may elaborate slightly.\n";
    ctx += "2. DO NOT contradict the FAQ answers.\n";
    ctx += "3. Keep answers under 6 sentences — CONCISE and COMPLETE.\n";
    ctx += "4. Finish your sentences — never cut off mid-sentence.\n";
    ctx += "5. Use emojis sparingly.\n";
    ctx += "6. If unrelated to MyTVETMARA, politely redirect to booking topics.\n";
    ctx += "7. Answer in Bahasa Melayu if user asks in Malay.\n";
    ctx += "8. Never make up features not in the FAQ.\n";
    ctx += "9. For schedule, direct users to 'My Schedule 📅' button.\n";
    return ctx;
  }

  // ============================================
  // 🚀 CALL GEMINI
  // ============================================
  let lastCallTime = 0;
  const MIN_CALL_INTERVAL = 1500;

  async function callGemini(userMessage) {
    const apiKey = getApiKey();
    if (!apiKey) return { text: "⚠️ Gemini AI not configured. Click ⚙️ to set API key.", provider: 'none' };

    const now = Date.now();
    const wait = MIN_CALL_INTERVAL - (now - lastCallTime);
    if (wait > 0) await new Promise(r => setTimeout(r, wait));
    lastCallTime = Date.now();

    for (let i = 0; i < GEMINI_MODELS.length; i++) {
      const model = GEMINI_MODELS[i];
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      try {
        const response = await fetch(`${url}?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: buildSystemPrompt() }] },
            contents: [{ parts: [{ text: userMessage }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 2048, topP: 0.8 }
          })
        });
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData?.error?.message || `HTTP ${response.status}`;
          if (errMsg.includes('quota') || errMsg.includes('rate') || errMsg.includes('429') || errMsg.includes('not found') || response.status === 404) continue;
          throw new Error(errMsg);
        }
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error('Empty response');
        let finalText = text;
        if (data?.candidates?.[0]?.finishReason === 'MAX_TOKENS') finalText += '\n\n_... (jawapan dipotong)_';
        if (i > 0) finalText += `\n\n_🤖 ${model}_`;
        return { text: finalText, provider: model };
      } catch (error) {
        if (i === GEMINI_MODELS.length - 1) return { text: `⚠️ AI unavailable: ${error.message}`, provider: 'none' };
        continue;
      }
    }
    return { text: "⚠️ All AI models unavailable. Try again later.", provider: 'none' };
  }

  // ============================================
  // 💅 CSS
  // ============================================
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
  width: 340px; max-width: calc(100vw - 32px);
  height: 480px; max-height: calc(100vh - 140px);
  background: #fff; border: 5px solid #393B3D;
  box-shadow: 10px 10px 0 rgba(0, 0, 0, .5);
  display: none; flex-direction: column; font-family: 'Poppins', sans-serif;
}
#rbxChat.open { display: flex; }
#rbxChatHead { 
  background: #393B3D; color: #FFC800; padding: 10px 14px; 
  border-bottom: 4px solid #00A2FF;
  font-family: 'Bungee', cursive; font-size: 15px;
  display: flex; justify-content: space-between; align-items: center;
  cursor: move; user-select: none; touch-action: none;
  flex-shrink: 0;
}
#rbxChatHeadLeft { display: flex; align-items: center; gap: 6px; }
#rbxSettingsBtn { 
  background: transparent; border: 0; color: #FFC800; font-size: 18px; 
  cursor: pointer; line-height: 1; transition: transform 0.2s;
}
#rbxSettingsBtn:hover { transform: rotate(90deg); }
#rbxChatClose { 
  background: transparent; border: 0; color: #fff; font-size: 22px; 
  cursor: pointer; line-height: 1; font-family: 'Bungee', cursive;
}
#rbxSettings {
  display: none; padding: 10px 12px; background: #1a1a2e; 
  border-bottom: 4px solid #0096B4; color: #fff; font-size: 12px;
  flex-shrink: 0;
}
#rbxSettings.open { display: block; }
#rbxSettings label { display: block; margin-bottom: 3px; font-weight: bold; color: #FFC800; font-family: 'Bungee', cursive; font-size: 10px; }
#rbxSettings input[type="text"] {
  width: 100%; padding: 7px; border: 2px solid #0096B4; 
  background: #0f0f23; color: #0f0; font-family: monospace; font-size: 11px;
  box-sizing: border-box;
}
#rbxSettingsSave {
  margin-top: 6px; padding: 5px 12px; background: #00E22D; color: #fff;
  border: 0; font-family: 'Bungee', cursive; font-size: 11px; cursor: pointer;
}
#rbxSettingsStatus { margin-top: 3px; font-size: 10px; color: #aaa; }
#rbxChatBody { flex: 1; overflow-y: auto; padding: 12px; background: #f5f5f5; min-height: 0; }
.rbx-msg { 
  margin-bottom: 10px; padding: 10px 12px; 
  border: 3px solid #393B3D; box-shadow: 3px 3px 0 rgba(0, 0, 0, .2);
  font-size: 13px; line-height: 1.5; word-wrap: break-word;
}
.rbx-msg.bot { background: #fff; color: #000; }
.rbx-msg.user { background: #fcc500; color: #000; font-weight: bold; }
.rbx-msg.ai { 
  background: #e8f7ff; color: #000; border-color: #0096B4; 
  box-shadow: 3px 3px 0 rgba(0, 150, 180, 0.3);
}
.rbx-ai-badge {
  display: inline-block; background: #0096B4; color: #fff; 
  font-size: 9px; font-weight: bold; padding: 1px 5px; 
  margin-bottom: 4px; font-family: 'Bungee', cursive;
}
.rbx-typing { display: flex; align-items: center; gap: 4px; padding: 6px 0; }
.rbx-typing span {
  width: 7px; height: 7px; background: #0096B4; border-radius: 50%;
  animation: rbxBounce 1.4s infinite ease-in-out both;
}
.rbx-typing span:nth-child(1) { animation-delay: -0.32s; }
.rbx-typing span:nth-child(2) { animation-delay: -0.16s; }
@keyframes rbxBounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}
#rbxChatForm { display: flex; border-top: 4px solid #393B3D; background: #fff; flex-shrink: 0; }
#rbxChatInput { flex: 1; border: 0; padding: 12px; font-family: 'Poppins', sans-serif; font-size: 13px; outline: none; }
#rbxChatSend { 
  border: 0; background: #00E22D; color: #fff; 
  font-family: 'Bungee', cursive; padding: 0 16px; cursor: pointer; font-size: 13px; 
}
.rbx-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.rbx-chip { 
  background: #fff; border: 2px solid #393B3D; box-shadow: 2px 2px 0 #393B3D;
  padding: 5px 9px; font-size: 11px; cursor: pointer; 
  font-family: 'Bungee', cursive; text-transform: uppercase;
  transition: background 0.2s;
}
.rbx-chip:hover { background: #eaf7ff; }
@media (max-width: 575.98px) {
  #rbxFab { width: 54px; height: 54px; font-size: 26px; bottom: 16px; right: 16px; }
  #rbxChat { right: 12px; left: 12px; width: auto; bottom: 80px; height: 70vh; }
}
  `;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // ============================================
  // 🔨 BUILD DOM
  // ============================================
  const fab = document.createElement('button');
  fab.id = 'rbxFab';
  fab.textContent = '🤖';

  const panel = document.createElement('div');
  panel.id = 'rbxChat';
  panel.innerHTML = `
    <div id="rbxChatHead">
      <div id="rbxChatHeadLeft">
        <button id="rbxSettingsBtn" title="AI Settings">⚙️</button>
        <span>🤖 MARA BOT</span>
      </div>
      <button id="rbxChatClose">×</button>
    </div>
    <div id="rbxSettings">
      <label>GEMINI API KEY</label>
      <input type="text" id="rbxApiKeyInput" placeholder="AIzaSy..." autocomplete="off" />
      <button id="rbxSettingsSave">SAVE</button>
      <div id="rbxSettingsStatus"></div>
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
  const settingsPanel = panel.querySelector('#rbxSettings');
  const apiKeyInput = panel.querySelector('#rbxApiKeyInput');
  const settingsSave = panel.querySelector('#rbxSettingsSave');
  const settingsStatus = panel.querySelector('#rbxSettingsStatus');

  const savedKey = localStorage.getItem('rbx_gemini_key');
  if (savedKey) apiKeyInput.value = savedKey;
  else if (GEMINI_API_KEY && GEMINI_API_KEY !== 'AIzaSy_PASTE_KEY_ANDA_DISINI') apiKeyInput.value = GEMINI_API_KEY;

  // ============================================
  // ⚙️ SETTINGS
  // ============================================
  panel.querySelector('#rbxSettingsBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    settingsPanel.classList.toggle('open');
  });

  settingsSave.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    if (key) {
      localStorage.setItem('rbx_gemini_key', key);
      settingsStatus.textContent = '✅ Key saved! Gemini AI active.';
      settingsStatus.style.color = '#00E22D';
    } else {
      localStorage.removeItem('rbx_gemini_key');
      settingsStatus.textContent = '🗑️ Key removed.';
      settingsStatus.style.color = '#ff6b6b';
    }
    setTimeout(() => { settingsStatus.textContent = ''; }, 3000);
  });

  // ============================================
  // 🖱️ DRAGGABLE FAB
  // ============================================
  function clamp(v, min, max) { return Math.min(Math.max(v, min), max); }

  let dragActive = false, dragStarted = false, startX = 0, startY = 0, origX = 0, origY = 0, ignoreFabClick = false;

  function onFabDragStart(e) {
    const p = e.type.startsWith('touch') ? e.touches[0] : e; if (!p) return;
    e.preventDefault(); dragActive = true; dragStarted = false;
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
    e.preventDefault();
    const dx = p.clientX - startX, dy = p.clientY - startY;
    if (!dragStarted && Math.abs(dx) + Math.abs(dy) > 6) dragStarted = true;
    if (!dragStarted) return;
    fab.style.position = 'fixed';
    fab.style.left = clamp(origX + dx, 8, window.innerWidth - fab.offsetWidth - 8) + 'px';
    fab.style.top = clamp(origY + dy, 8, window.innerHeight - fab.offsetHeight - 8) + 'px';
    fab.style.bottom = 'auto'; fab.style.right = 'auto';
  }
  function onFabDragEnd() {
    if (!dragActive) return; dragActive = false;
    if (dragStarted) { ignoreFabClick = true; setTimeout(() => { ignoreFabClick = false; }, 0); }
    document.removeEventListener('mousemove', onFabDragMove);
    document.removeEventListener('mouseup', onFabDragEnd);
    document.removeEventListener('touchmove', onFabDragMove);
    document.removeEventListener('touchend', onFabDragEnd);
  }

  // ============================================
  // 🖱️ DRAGGABLE CHAT HEADER
  // ============================================
  let chatDragActive = false, chatStartX = 0, chatStartY = 0, chatOrigX = 0, chatOrigY = 0;
  const chatHead = panel.querySelector('#rbxChatHead');

  function onChatDragStart(e) {
    if (e.target.id === 'rbxChatClose' || e.target.id === 'rbxSettingsBtn') return;
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

  chatHead.addEventListener('mousedown', onChatDragStart);
  chatHead.addEventListener('touchstart', onChatDragStart, { passive: false });

  // ============================================
  // 💬 MESSAGES
  // ============================================
  function addMsg(text, who) {
    const m = document.createElement('div');
    m.className = 'rbx-msg ' + who;
    if (who === 'ai') {
      m.innerHTML = `<div class="rbx-ai-badge">✨ GEMINI AI</div>` + text.replace(/\n/g, '<br>');
    } else {
      m.innerHTML = text.replace(/\n/g, '<br>');
    }
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

  // ============================================
  // 🏷️ CHIPS
  // ============================================
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

  // ============================================
  // 📅 SCHEDULE ROUTING
  // ============================================
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

  // ============================================
  // 🗄️ SUPABASE
  // ============================================
  function getSupabaseClient() {
    if (window.supabase && typeof window.supabase.from === 'function') return window.supabase;
    if (window.supabaseClient && typeof window.supabaseClient.from === 'function') return window.supabaseClient;
    if (window.sb && typeof window.sb.from === 'function') return window.sb;
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
      hideTyping(); console.error("Schedule error:", error);
      addMsg("⚠️ Error: " + error.message, 'bot'); addChips(['⬅️ Back to Menu']);
    }
  }

  // ============================================
  // 🚪 OPEN / CLOSE
  // ============================================
  let opened = false;
  function openChat() {
    panel.classList.add('open');
    if (!opened) { opened = true; addMsg(GREETING, 'bot'); addChips(mainMenuChips); }
    setTimeout(() => input.focus(), 50);
  }
  function closeChat() { panel.classList.remove('open'); }

  fab.addEventListener('click', (e) => {
    if (ignoreFabClick) { e.preventDefault(); return; }
    if (dragStarted) { dragStarted = false; return; }
    panel.classList.contains('open') ? closeChat() : openChat();
  });
  fab.addEventListener('mousedown', onFabDragStart);
  fab.addEventListener('touchstart', onFabDragStart, { passive: false });
  panel.querySelector('#rbxChatClose').addEventListener('click', closeChat);

  // ============================================
  // 📨 FORM SUBMIT
  // ============================================
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
      const apiKey = getApiKey();
      if (!apiKey) {
        setTimeout(() => {
          addMsg(answer || FALLBACK, 'bot');
          addMsg("💡 <em>For AI answers, click ⚙️ to add Gemini API key.</em>", 'bot');
          addChips(['⬅️ Back to Menu']);
        }, 150);
        return;
      }
      showTyping();
      const result = await callGemini(val);
      hideTyping();
      addMsg(result.text, result.provider !== 'none' ? 'ai' : 'bot');
      addChips(['⬅️ Back to Menu']);
    }
  });
})();
