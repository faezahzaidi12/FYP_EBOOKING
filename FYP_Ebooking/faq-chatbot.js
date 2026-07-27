// MyTVETMARA FAQ Chatbot — Roblox themed (Integrated with Feedback & Maintenance)
(function () {
  if (window.__rbxFaqLoaded) return;
  window.__rbxFaqLoaded = true;

  const FAQS = [
    {
      q: ['how', 'book', 'room', 'reserve', 'tempah', 'cara'],
      a: "To book a room: Login → HOME → GO TO BOOKING SYSTEM → choose a building (DFK / Library / Sport) → pick a room → tap an available time slot."
    },
    {
      q: ['check', 'in', 'checkin'],
      a: "Pending check-ins appear on your HOME dashboard under 'PENDING CHECK-IN'. Click the yellow card to confirm your check-in."
    },
    {
      q: ['cancel', 'booking', 'batal'],
      a: "Bookings you don't check-in on time are auto-cancelled by the system. To cancel manually, open the booking from your dashboard."
    },
    {
      q: ['login', 'log in', 'sign in'],
      a: "Use your registered email and password on the LOG IN page. If you don't have an account, click SIGN UP."
    },
    {
      q: ['register', 'sign up', 'signup', 'account'],
      a: "Click SIGN UP on the login page and fill in your name, email and password. You'll receive a confirmation email."
    },
    {
      q: ['password', 'forgot', 'reset'],
      a: "Password reset isn't in-app yet — please contact the admin to reset your password."
    },
    {
      q: ['facility', 'facilities', 'sport', 'library', 'dfk', 'available'],
      a: "Available facilities: DFK Building (Rooms 1–10), Library (Century 21st, Literasi 1 & 2), and Sports (Badminton, Field, Ping Pong, Takraw, Volleyball)."
    },
    {
      q: ['time', 'slot', 'hour', 'when', 'open'],
      a: "Time slots are shown on each room's timetable. Green/white = available, red = booked. Tap any available slot to book."
    },
    /* --- BARU: FAQ Maintenance --- */
    {
      q: ['maintenance', 'report', 'issue', 'broken', 'rosak', 'projector', 'aircond', 'light', 'lampu', 'kerusi'],
      a: "🛠️ Found a broken item? You can submit a report using the 'Maintenance Report' form on your check-in page."
    },
    /* --- BARU: FAQ Feedback --- */
    {
      q: ['feedback', 'rating', 'star', 'review', 'komen', 'bintang'],
      a: "⭐ We value your feedback! Rate your classroom experience (1-5 stars) after your check-in session."
    },
    {
      q: ['admin', 'contact', 'help', 'support'],
      a: "For issues not answered here, please contact your TVET MARA administrator."
    },
    {
      q: ['who', 'what', 'mytvetmara', 'about'],
      a: "MyTVETMARA e-Booking is the official room & facility booking system for TVET MARA students and staff."
    }
  ];

  const GREETING = "Hi! 👋 I'm the TVET helper. Ask me about booking, check-in, facilities, reporting issues, or feedback.";
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

  // Styles
  const css = `
  /* ==========================================
   1. FLOATING BUTTON (#rbxFab)
   ========================================== */
#rbxFab {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9998;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--roblox-blue, #00A2FF);
  color: #fff;
  border: 4px solid #393B3D;
  box-shadow: 6px 6px 0 #393B3D;
  font-size: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-family: 'Bungee', cursive;
  transition: transform .12s ease, box-shadow .12s ease;
}

#rbxFab:hover {
  transform: translate(-2px, -2px);
  box-shadow: 8px 8px 0 #393B3D;
}

#rbxFab:active {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0 #393B3D;
}

/* ==========================================
   2. MAIN CHAT PANEL (#rbxChat)
   ========================================== */
#rbxChat {
  position: fixed;
  bottom: 100px;
  right: 20px;
  z-index: 9999;
  width: 340px;
  max-width: calc(100vw - 32px);
  height: 480px;
  max-height: calc(100vh - 140px);
  background: #fff;
  border: 5px solid #393B3D;
  box-shadow: 10px 10px 0 rgba(0, 0, 0, .5);
  display: none;
  flex-direction: column;
  font-family: 'Poppins', sans-serif;
}

#rbxChat.open {
  display: flex;
}

/* ==========================================
   3. CHAT HEADER
   ========================================== */
#rbxChatHead {
  background: #393B3D;
  color: #fff;
  padding: 12px 14px;
  border-bottom: 4px solid var(--roblox-blue, #00A2FF);
  font-family: 'Bungee', cursive;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

#rbxChatHead button {
  background: transparent;
  border: 0;
  color: #fff;
  font-size: 22px;
  cursor: pointer;
  line-height: 1;
}

/* ==========================================
   4. CHAT BODY & MESSAGES
   ========================================== */
#rbxChatBody {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  background: #f5f5f5;
}

.rbx-msg {
  margin-bottom: 10px;
  padding: 10px 12px;
  border: 3px solid #393B3D;
  max-width: 85%;
  font-size: 13px;
  line-height: 1.4;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, .2);
  word-wrap: break-word;
}

.rbx-msg.bot {
  background: #fff;
  color: #000;
}

.rbx-msg.user {
  background: var(--roblox-blue, #00A2FF);
  color: #fff;
  margin-left: auto;
}

/* ==========================================
   5. CHAT FORM & INPUTS
   ========================================== */
#rbxChatForm {
  display: flex;
  border-top: 4px solid #393B3D;
  background: #fff;
}

#rbxChatInput {
  flex: 1;
  border: 0;
  padding: 12px;
  font-family: 'Poppins', sans-serif;
  font-size: 13px;
  outline: none;
}

#rbxChatSend {
  border: 0;
  background: var(--roblox-green, #00E223);
  color: #fff;
  font-family: 'Bungee', cursive;
  padding: 0 16px;
  cursor: pointer;
  font-size: 13px;
}

#rbxChatSend:hover {
  filter: brightness(1.08);
}

/* ==========================================
   6. QUICK CHIPS
   ========================================== */
.rbx-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.rbx-chip {
  background: #fff;
  border: 2px solid #393B3D;
  padding: 5px 9px;
  font-size: 11px;
  cursor: pointer;
  font-family: 'Bungee', cursive;
  box-shadow: 2px 2px 0 #393B3D;
}

.rbx-chip:hover {
  background: #eaf7ff;
}

/* ==========================================
   7. RESPONSIVE DESIGN (MOBILE)
   ========================================== */
@media (max-width: 575.98px) {
  #rbxFab {
    width: 56px;
    height: 56px;
    font-size: 24px;
    bottom: 16px;
    right: 16px;
  }

  #rbxChat {
    right: 12px;
    left: 12px;
    width: auto;
    bottom: 84px;
    height: 70vh;
  }

  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // Build UI
  const fab = document.createElement('button');
  fab.id = 'rbxFab';
  fab.setAttribute('aria-label', 'Open FAQ chatbot');
  fab.textContent = '💬';

  const panel = document.createElement('div');
  panel.id = 'rbxChat';
  panel.innerHTML = `
    <div id="rbxChatHead">
      <span>🤖 Tvet HELPER</span>
      <button id="rbxChatClose" aria-label="Close">×</button>
    </div>
    <div id="rbxChatBody"></div>
    <form id="rbxChatForm" autocomplete="off">
      <input id="rbxChatInput" type="text" placeholder="Ask a question..." aria-label="Your question"/>
      <button id="rbxChatSend" type="submit">SEND</button>
    </form>
  `;

  document.body.appendChild(fab);
  document.body.appendChild(panel);

  const body = panel.querySelector('#rbxChatBody');
  const form = panel.querySelector('#rbxChatForm');
  const input = panel.querySelector('#rbxChatInput');

  function addMsg(text, who) {
    const m = document.createElement('div');
    m.className = 'rbx-msg ' + who;
    m.innerHTML = text.replace(/\n/g, '<br>');
    body.appendChild(m);
    body.scrollTop = body.scrollHeight;
    return m;
  }

  function addChips() {
    const wrap = document.createElement('div');
    wrap.className = 'rbx-chips';
    
    // Quick chips dipelbagaikan dengan feature baru
    const chips = ['How to book?', 'Check-in?', 'Report Issue 🛠️', 'Feedback ⭐', 'Facilities?'];
    
    chips.forEach(label => {
      const c = document.createElement('button');
      c.type = 'button';
      c.className = 'rbx-chip';
      c.textContent = label;
      c.onclick = () => { 
        input.value = label; 
        form.dispatchEvent(new Event('submit', {cancelable:true})); 
      };
      wrap.appendChild(c);
    });
    body.appendChild(wrap);
  }

  let opened = false;
  function open() {
    panel.classList.add('open');
    if (!opened) {
      opened = true;
      addMsg(GREETING, 'bot');
      addChips();
    }
    setTimeout(() => input.focus(), 50);
  }
  function close() { panel.classList.remove('open'); }

  fab.addEventListener('click', () => panel.classList.contains('open') ? close() : open());
  panel.querySelector('#rbxChatClose').addEventListener('click', close);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = input.value.trim();
    if (!val) return;
    addMsg(val, 'user');
    input.value = '';
    setTimeout(() => addMsg(findAnswer(val), 'bot'), 300);
  });
})();
