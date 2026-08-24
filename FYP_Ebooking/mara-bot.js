// MARA BOT — FAQ Chatbot (moved CSS to mara-bot.css)
(function () {
  if (window.__maraBotLoaded) return;
  window.__maraBotLoaded = true;

  // ============================================
  // 🤖 SECURE GEMINI CONFIG
  // ============================================
  const GEMINI_API_KEY = 'AQ.Ab8RN6K1nTp979R9f9aiLhNlDrVLKNg31ewospCwSgRLF247_A';
  const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];
  const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
  const SUPABASE_FUNCTION_URL = `${(window.SUPABASE_URL || (typeof SUPABASE_URL !== 'undefined' ? SUPABASE_URL : 'https://doyyrhhscdpchuvpancq.supabase.co'))}/functions/v1/mara-bot`;

  // ============================================
  // FAQ DATABASE (unchanged)
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
    ctx += "7. Answer in Bahasa Melayu (BM) if user asks in Malay. Match the user's language preference.\n";
    ctx += "8. Never make up features not in the FAQ.\n";
    ctx += "9. For schedule, direct users to 'My Schedule 📅' button.\n";
    return ctx;
  }

  // ============================================
  // 🚀 CALL GEMINI (direct API with model fallback & logging)
  // ============================================
  let lastCallTime = 0;
  const MIN_CALL_INTERVAL = 1500;

  async function callGemini(userMessage) {
    const now = Date.now();
    const wait = MIN_CALL_INTERVAL - (now - lastCallTime);
    if (wait > 0) await new Promise(r => setTimeout(r, wait));
    lastCallTime = Date.now();

    try {
      const systemPrompt = buildSystemPrompt();
      let lastError = null;
      
      // Try each model in priority order
      for (const model of GEMINI_MODELS) {
        try {
          const requestBody = {
            contents: [{
              parts: [
                { text: systemPrompt },
                { text: userMessage }
              ]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 500,
              topP: 0.95
            },
            safetySettings: [
              { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
            ]
          };
          
          const response = await fetch(`${GEMINI_API_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': GEMINI_API_KEY
            },
            body: JSON.stringify(requestBody)
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const statusText = `HTTP ${response.status}: ${errorData?.error?.message || response.statusText}`;
            console.warn(`[MARA BOT] Model ${model} failed - ${statusText}`);
            lastError = new Error(statusText);
            continue;
          }

          const data = await response.json();
          const candidates = data?.candidates || [];
          if (!candidates.length || !candidates[0]?.content?.parts?.length) {
            console.warn(`[MARA BOT] Model ${model} returned empty response`);
            lastError = new Error('Empty response from API');
            continue;
          }

          const text = candidates[0].content.parts[0]?.text || '';
          if (!text.trim()) {
            console.warn(`[MARA BOT] Model ${model} returned empty text`);
            lastError = new Error('Empty text in response');
            continue;
          }

          console.log(`[MARA BOT] ✓ Response from ${model}`);
          return { text: text.trim(), provider: model };
        } catch (modelError) {
          console.warn(`[MARA BOT] Model ${model} exception:`, modelError.message);
          lastError = modelError;
          continue;
        }
      }
      
      // All models failed
      throw lastError || new Error('All models failed');
    } catch (error) {
      console.warn('[MARA BOT] Final AI error:', error.message || String(error));
      return {
        text: '⚠️ AI is currently unavailable. Please try again later.',
        provider: 'none'
      };
    }
  }

  // ============================================
  // DOM + rest of original chatbot logic (unchanged except CSS removal)
  // ============================================

  const fab = document.createElement('button');
  fab.id = 'rbxFab';
  fab.textContent = '🤖';

  const panel = document.createElement('div');
  panel.id = 'rbxChat';
  panel.innerHTML = `
    <div id="rbxChatHead">
      <div id="rbxChatHeadLeft">
        <span>🤖 MARA BOT</span>
      </div>
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

  // draggable fab and chat (unchanged)
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
  function onChatDragEnd() { if (!chatDragActive) return; chatDragActive = false; document.removeEventListener('mousemove', onChatDragMove); document.removeEventListener('mouseup', onChatDragEnd); document.removeEventListener('touchmove', onChatDragMove); document.removeEventListener('touchend', onChatDragEnd); }

  chatHead.addEventListener('mousedown', onChatDragStart);
  chatHead.addEventListener('touchstart', onChatDragStart, { passive: false });

  // messages
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
  function hideTyping() { const t = document.getElementById('rbxTyping'); if (t) t.remove(); }

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

  // schedule routing and supabase code unchanged
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