/* =============================================
   LinguaAI – script.js  (v2 – Extended Exercises)
   ============================================= */
'use strict';

/* ── STATE ── */
const state = {
  lang:        'english',
  level:       'A1',
  topic:       'Giới thiệu bản thân',
  score:       0,
  answered:    0,
  total:       0,
  exFilter:    { type: 'all', level: 'all' },
};

/* ─────────────────────────────────────────────
   NAVBAR SMOOTH SCROLL DETECTION
───────────────────────────────────────────── */
const navbar = document.querySelector('.navbar');
let lastScrollTop = 0;
let scrollTimeout;

function handleScroll() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  
  // Show navbar when scroll up
  if (scrollTop < lastScrollTop || scrollTop < 100) {
    navbar.classList.add('show');
  } else if (scrollTop > 300) {
    navbar.classList.remove('show');
  }
  
  // Add shadow on scroll
  if (scrollTop > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  
  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
}

window.addEventListener('scroll', handleScroll, { passive: true });

// Initial navbar show
function initNavbar() {
  setTimeout(() => {
    navbar.classList.add('show');
  }, 300);
}
document.addEventListener('DOMContentLoaded', initNavbar);
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNavbar);
} else {
  initNavbar();
}


/* ─────────────────────────────────────────────
   NAVIGATION
───────────────────────────────────────────── */
const pages    = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('[data-page]');

function showPage(id) {
  pages.forEach(p => p.classList.remove('active'));
  navLinks.forEach(l => l.classList.remove('active-tab'));
  const target = document.getElementById('page-' + id);
  if (target) target.classList.add('active');
  navLinks.forEach(l => { if (l.dataset.page === id) l.classList.add('active-tab'); });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Add click listeners to all nav links
navLinks.forEach(l => l.addEventListener('click', e => { 
  e.preventDefault(); 
  showPage(l.dataset.page); 
}));
/* ─────────────────────────────────────────────
   FORM INTERACTIONS & TOUCH ENHANCEMENTS
───────────────────────────────────────────── */

// Enhance form controls
document.addEventListener('DOMContentLoaded', () => {
  // Add ripple effect on button click
  document.querySelectorAll('.btn-primary-c, .btn-orange-c, .btn-outline-c, .btn-white-c, .btn-check, .btn-send').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const ripple = document.createElement('span');
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      ripple.style.position = 'absolute';
      ripple.style.borderRadius = '50%';
      ripple.style.width = '20px';
      ripple.style.height = '20px';
      ripple.style.background = 'rgba(255,255,255,0.6)';
      ripple.style.transform = 'scale(1)';
      ripple.style.animation = 'ripple 0.6s ease-out';
      ripple.style.pointerEvents = 'none';
      
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      
      setTimeout(() => ripple.remove(), 600);
    });
  });

  // Smooth focus on form elements
  document.querySelectorAll('.form-ctrl, .form-sel, .chat-textarea').forEach(input => {
    input.addEventListener('focus', function() {
      this.style.transform = 'scale(1.01)';
    });
    input.addEventListener('blur', function() {
      this.style.transform = 'scale(1)';
    });
  });

  // Add animation keyframe for ripple
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ripple {
      to {
        transform: scale(5);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
});


/* ─────────────────────────────────────────────
   SETUP PANEL
───────────────────────────────────────────── */
document.querySelectorAll('.level-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.level-chip').forEach(c => c.classList.remove('selected'));
    chip.classList.add('selected');
    state.level = chip.dataset.level;
    updateChatHeader();
  });
});
document.querySelectorAll('.topic-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.topic-chip').forEach(c => c.classList.remove('selected'));
    chip.classList.add('selected');
    state.topic = chip.dataset.topic;
    updateChatHeader();
  });
});
const langSelect = document.getElementById('lang-select');
if (langSelect) langSelect.addEventListener('change', () => {
  state.lang = langSelect.value;
  renderExercises();
  renderAudioCards();
});
function updateChatHeader() {
  const el = document.getElementById('chat-topic-display');
  if (el) el.textContent = `${state.topic} · ${state.level}`;
}
document.getElementById('start-chat-btn')?.addEventListener('click', () => {
  showPage('chatbot'); updateChatHeader(); addWelcomeMessage();
});

/* ─────────────────────────────────────────────
   CHATBOT – Smart Demo (Không cần API)
   Đủ dùng cho demo báo cáo
───────────────────────────────────────────── */
const chatMsgs  = document.getElementById('chat-msgs');
const chatInput = document.getElementById('chat-input');
const sendBtn   = document.getElementById('send-btn');
const voiceBtn  = document.getElementById('voice-btn');

let chatHistory  = [];
let welcomeAdded = false;
let turnCount    = 0;

/* ── Kho phản hồi theo chủ đề & cấp độ ── */
const SMART_RESPONSES = {
  'Giới thiệu bản thân': [
    { text: "Hello! I'm your IELTS Journey AI Tutor 🎓 Let's practice introductions! Can you tell me your name and where you're from?", correction: null },
    { text: "Great start! Now can you tell me what you do? Are you a student or do you work somewhere?", correction: null },
    { text: "Wonderful! I noticed a small grammar point:", correction: "❌ 'I am student' → ✅ 'I am <strong>a</strong> student' — always use article 'a' before singular nouns!" },
    { text: "Now let's talk about your hobbies! What do you enjoy doing in your free time? Try to use: 'I enjoy...', 'I love...', 'I'm interested in...'", correction: null },
    { text: "Excellent answer! Can you describe your hometown? Where are you from and what's special about it?", correction: null },
    { text: "That's a lovely description! Quick tip:", correction: "❌ 'My city have many...' → ✅ 'My city <strong>has</strong> many...' — 'city' is singular, use 'has'!" },
    { text: "You're doing great! 🌟 Let's practice talking about your daily routine. What time do you usually wake up?", correction: null },
    { text: "Perfect! Now try to describe your future plans. What do you want to do in the next 5 years? Use: 'I plan to...', 'I would like to...'", correction: null },
    { text: "Impressive! One small correction:", correction: "❌ 'I will to study abroad' → ✅ 'I <strong>plan to</strong> study abroad' — 'will' doesn't need 'to' after it!" },
    { text: "Fantastic progress! 🏆 You've completed the introduction topic. Your speaking is improving a lot! Shall we try another topic?", correction: null },
  ],
  'Mua sắm & giao dịch': [
    { text: "Welcome to shopping practice! 🛒 Imagine you're at a store. How would you ask for the price of an item?", correction: null },
    { text: "Good! Now try asking if they have a specific size: 'Do you have this in a larger/smaller size?'", correction: null },
    { text: "Nice try! Let me help:", correction: "❌ 'How much this cost?' → ✅ 'How much <strong>does</strong> this cost?' — use auxiliary 'does' in questions!" },
    { text: "Great improvement! How would you ask for a discount? Try: 'Could you give me a discount?' or 'Is there any offer?'", correction: null },
    { text: "Excellent! Now practice paying. How do you ask if they accept credit cards?", correction: null },
    { text: "Good answer! Small correction:", correction: "❌ 'Do you accept card payment?' → ✅ This is actually correct! Great job! ✅" },
    { text: "Now let's practice returning an item. Say: 'Excuse me, I'd like to return this item. It's defective.'", correction: null },
    { text: "Perfect! How would you ask about the refund policy?", correction: null },
    { text: "Well done! 🌟 You're handling shopping conversations very naturally. Keep it up!", correction: null },
  ],
  'Du lịch & chỉ đường': [
    { text: "Let's explore travel English! ✈️ How would you ask a stranger for directions to the nearest metro station?", correction: null },
    { text: "Good attempt! Try this more polite version: 'Excuse me, could you tell me how to get to...?'", correction: null },
    { text: "Almost perfect! Note this:", correction: "❌ 'Where is train station?' → ✅ 'Where is <strong>the</strong> train station?' — use 'the' for specific places!" },
    { text: "Now practice at the hotel. How would you say you have a reservation?", correction: null },
    { text: "Great! Try: 'I have a reservation under the name [your name]. I'd like to check in please.'", correction: null },
    { text: "At the airport — how do you ask where your departure gate is?", correction: null },
    { text: "Excellent phrasing! One tip:", correction: "❌ 'Where is gate for flight?' → ✅ 'Where is <strong>the</strong> gate for <strong>my</strong> flight?' — add articles!" },
    { text: "You're getting so fluent! 🌍 Try ordering food at a foreign restaurant. How do you ask for the menu?", correction: null },
    { text: "Perfect! 'Could I see the menu, please?' is very natural and polite. 🌟", correction: null },
  ],
  'Ăn uống & nhà hàng': [
    { text: "Let's practice restaurant English! 🍽️ How would you make a reservation for 2 people at 7pm?", correction: null },
    { text: "Great! Now how do you ask the waiter for their recommendation?", correction: null },
    { text: "Good phrasing! Small fix:", correction: "❌ 'What you recommend?' → ✅ '<strong>What do</strong> you recommend?' — don't forget the auxiliary 'do'!" },
    { text: "Perfect! How would you order a steak cooked medium-rare?", correction: null },
    { text: "Excellent! 'I'd like the steak, medium-rare please' sounds very natural. 🥩", correction: null },
    { text: "Now, how would you tell the waiter you have a food allergy?", correction: null },
    { text: "Very good! 'I'm allergic to [food], could you check if this dish contains any?' — perfect sentence!", correction: null },
    { text: "Finally, how do you ask for the bill?", correction: null },
    { text: "🌟 Excellent! 'Could we have the bill, please?' or 'Check, please!' both work perfectly!", correction: null },
  ],
  'Công việc & nghề nghiệp': [
    { text: "Let's practice work English! 💼 Describe your current job or dream job.", correction: null },
    { text: "Great! Now practice a job interview. Answer this: 'Tell me about yourself.'", correction: null },
    { text: "Good answer! One correction:", correction: "❌ 'I work in IT since 3 years' → ✅ 'I <strong>have worked</strong> in IT <strong>for</strong> 3 years' — use Present Perfect with 'for'!" },
    { text: "Excellent! How would you describe your strengths in an interview?", correction: null },
    { text: "Try: 'One of my greatest strengths is...' or 'I'm particularly good at...'", correction: null },
    { text: "Perfect! Now answer: 'Where do you see yourself in 5 years?'", correction: null },
    { text: "Impressive answer! 🌟 Use 'I aspire to...' or 'I aim to...' for more formal language.", correction: null },
    { text: "Great progress! How would you ask about salary in an interview politely?", correction: null },
    { text: "🏆 Excellent! 'Could you tell me about the compensation package?' sounds very professional!", correction: null },
  ],
  'Gia đình & bạn bè': [
    { text: "Let's talk about family! 👨‍👩‍👧 Can you describe your family members?", correction: null },
    { text: "Lovely! How many siblings do you have? Describe them briefly.", correction: null },
    { text: "Good description! One fix:", correction: "❌ 'My sister have long hair' → ✅ 'My sister <strong>has</strong> long hair' — singular subject needs 'has'!" },
    { text: "What do you usually do with your family on weekends?", correction: null },
    { text: "That sounds wonderful! 🌟 Now describe your best friend. What are they like?", correction: null },
    { text: "Great! Try using more descriptive words: 'outgoing', 'reliable', 'witty', 'compassionate'", correction: null },
    { text: "Excellent vocabulary! How long have you known your best friend?", correction: null },
    { text: "Perfect! Use: 'We've been friends for...' or 'I've known them since...'", correction: null },
  ],
  'Sức khỏe & y tế': [
    { text: "Let's practice health vocabulary! 🏥 How would you describe symptoms to a doctor?", correction: null },
    { text: "Good! Try: 'I've been having a headache for 2 days and I have a fever.'", correction: null },
    { text: "Perfect sentence! One small note:", correction: "❌ 'I am feeling not well' → ✅ 'I am <strong>not feeling</strong> well' — put 'not' before the main verb!" },
    { text: "How would you ask a pharmacist for medicine for a cold?", correction: null },
    { text: "'Could you recommend something for a cold, please?' — very natural! 💊", correction: null },
    { text: "Now practice making a doctor's appointment over the phone.", correction: null },
    { text: "Great! 🌟 'I'd like to make an appointment with Dr. Smith for this week if possible.'", correction: null },
  ],
  'Tin tức & thời sự': [
    { text: "Let's discuss current events! 📰 What's a recent news story you've heard about?", correction: null },
    { text: "Interesting topic! Can you give your opinion on it? Use: 'I think...', 'In my opinion...', 'I believe...'", correction: null },
    { text: "Good opinion! Try using discourse markers:", correction: "Tip: Use 'However', 'On the other hand', 'Furthermore' to make your argument stronger!" },
    { text: "Excellent! How do you think technology is changing the way we consume news?", correction: null },
    { text: "Very thoughtful answer! 🌟 One vocabulary suggestion:", correction: "Instead of 'get news', try 'consume news', 'stay informed', or 'keep up with current events' — more advanced vocabulary!" },
    { text: "Great improvement! Do you think social media is good or bad for spreading news?", correction: null },
    { text: "Brilliant argument! 🏆 Your vocabulary and sentence structure are at a great level!", correction: null },
  ],
};

/* ── Phát hiện lỗi đơn giản từ input ── */
function detectErrors(text) {
  const errors = [
    { pattern: /\bi am\s+\w+er\b/i,   wrong: 'I am taller',   right: 'I am taller ✓ (correct!)', explain: null },
    { pattern: /\bhe have\b/i,         wrong: 'he have',       right: 'he <strong>has</strong>',   explain: '"he/she/it" dùng "has" không phải "have"' },
    { pattern: /\bshe have\b/i,        wrong: 'she have',      right: 'she <strong>has</strong>',  explain: '"he/she/it" dùng "has" không phải "have"' },
    { pattern: /\bi goes\b/i,          wrong: 'I goes',        right: 'I <strong>go</strong>',     explain: 'Ngôi thứ nhất "I" không thêm -s' },
    { pattern: /\bwe was\b/i,          wrong: 'we was',        right: 'we <strong>were</strong>',  explain: '"we/they/you" dùng "were" không phải "was"' },
    { pattern: /\bthey was\b/i,        wrong: 'they was',      right: 'they <strong>were</strong>',explain: '"we/they/you" dùng "were" không phải "was"' },
    { pattern: /\bi am agree\b/i,      wrong: 'I am agree',    right: 'I <strong>agree</strong>',  explain: '"agree" là động từ, không dùng "am" trước' },
    { pattern: /\bmore better\b/i,     wrong: 'more better',   right: '<strong>better</strong>',   explain: '"better" đã là so sánh hơn, không cần "more"' },
    { pattern: /\bvery much good\b/i,  wrong: 'very much good',right: '<strong>very good</strong>',explain: 'Dùng "very good" không phải "very much good"' },
  ];

  for (const e of errors) {
    if (e.pattern.test(text) && e.explain) {
      return `❌ "${e.wrong}" → ✅ "${e.right}" — ${e.explain}`;
    }
  }
  return null;
}

/* ── Chọn phản hồi thông minh ── */
function getSmartReply(userText) {
  const topic    = state.topic || 'Giới thiệu bản thân';
  const pool     = SMART_RESPONSES[topic] || SMART_RESPONSES['Giới thiệu bản thân'];
  const idx      = turnCount % pool.length;
  const response = { ...pool[idx] };

  // Phát hiện lỗi từ input người dùng
  const detected = detectErrors(userText);
  if (detected && !response.correction) {
    response.correction = detected;
  }

  // Thêm phản hồi dựa trên từ khóa
  const lower = userText.toLowerCase();
  if (lower.includes('hello') || lower.includes('hi')) {
    response.text = "Hello there! Great to meet you! 😊 " + response.text;
  } else if (lower.includes('thank')) {
    response.text = "You're very welcome! Keep up the great work! 🌟 " + response.text;
  } else if (lower.includes('sorry') || lower.includes('mistake')) {
    response.text = "No worries at all! Making mistakes is how we learn! 💪 " + response.text;
  } else if (lower.length < 10) {
    response.text = "Could you elaborate a bit more? Try to use a full sentence! " + response.text;
  }

  turnCount++;
  return response;
}

function addWelcomeMessage() {
  if (welcomeAdded) return;
  welcomeAdded = true;
  turnCount = 0;
  chatHistory = [];
  appendMsg('ai', `👋 Xin chào! Tôi là <strong>IELTS Journey AI Tutor</strong> 🎓<br>
    Chủ đề: <strong>${state.topic}</strong> — Cấp độ: <strong>${state.level}</strong><br><br>
    Let's begin! I'll guide you through the conversation and correct any mistakes. Ready? 😊`, null);
}

function appendMsg(role, text, correction = null) {
  const row = document.createElement('div');
  row.className = `msg-row ${role === 'user' ? 'user-row' : ''} fade-up`;
  const ava = `<div class="msg-ava ${role === 'ai' ? 'ai-ava' : 'usr-ava'}">${role === 'ai' ? '🤖' : '<i class="bi bi-person"></i>'}</div>`;
  const corrHTML = correction
    ? `<div class="correction-box"><i class="bi bi-pencil-square me-1"></i><strong>Sửa lỗi:</strong> ${correction}</div>`
    : '';
  const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  row.innerHTML = `${ava}
    <div class="msg-body">
      <div class="msg-bubble ${role === 'ai' ? 'ai-bubble' : 'usr-bubble'}">${text}</div>
      ${corrHTML}
      <div class="msg-time">${time}</div>
    </div>`;
  chatMsgs.appendChild(row);
  chatMsgs.scrollTop = chatMsgs.scrollHeight;
}

function showTyping() {
  const row = document.createElement('div');
  row.className = 'msg-row'; row.id = 'typing-row';
  row.innerHTML = `
    <div class="msg-ava ai-ava">🤖</div>
    <div class="msg-bubble ai-bubble">
      <div class="typing-indicator"><span></span><span></span><span></span></div>
    </div>`;
  chatMsgs.appendChild(row);
  chatMsgs.scrollTop = chatMsgs.scrollHeight;
}

function removeTyping() { document.getElementById('typing-row')?.remove(); }

function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  appendMsg('user', text);
  chatHistory.push({ role: 'user', content: text });
  chatInput.value = '';
  chatInput.style.height = 'auto';
  showTyping();

  // Delay tự nhiên 1-2 giây như AI thật
  const delay = 1000 + Math.random() * 1200;
  setTimeout(() => {
    removeTyping();
    const reply = getSmartReply(text);
    appendMsg('ai', reply.text, reply.correction);
    chatHistory.push({ role: 'assistant', content: reply.text });
  }, delay);
}

sendBtn?.addEventListener('click', sendMessage);
chatInput?.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});
chatInput?.addEventListener('input', function () {
  this.style.height = 'auto';
  this.style.height = Math.min(this.scrollHeight, 120) + 'px';
});

let isRecording = false;
voiceBtn?.addEventListener('click', () => {
  isRecording = !isRecording;
  voiceBtn.classList.toggle('recording', isRecording);
  voiceBtn.innerHTML = isRecording
    ? '<i class="bi bi-stop-circle-fill"></i>'
    : '<i class="bi bi-mic"></i>';
  if (!isRecording) chatInput.value = '[Bản ghi âm của bạn sẽ xuất hiện ở đây]';
});

/* ─────────────────────────────────────────────
   EXERCISES DATA  (50+ câu – 4 ngôn ngữ – 5 dạng bài)
   type: 'fill' | 'mc' | 'translate' | 'order' | 'match'
───────────────────────────────────────────── */
const EXERCISES = {

  /* ══════════ TIẾNG ANH ══════════ */
  english: [
    /* ── FILL IN THE BLANK ── */
    { type:'fill', level:'A1', num:1,  question:'She ______ to school every day by bus.',              answer:'goes',         hint:'Chia "go" với chủ ngữ "She" (ngôi 3 số ít)' },
    { type:'fill', level:'A1', num:2,  question:'There ______ many students in the library today.',    answer:'are',          hint:'"students" là danh từ số nhiều' },
    { type:'fill', level:'A1', num:3,  question:'I drink ______ every morning. It is hot and black.', answer:'coffee',       hint:'Đồ uống phổ biến màu đen' },
    { type:'fill', level:'A2', num:4,  question:'He ______ football every Saturday morning.',          answer:'plays',        hint:'Chia "play" ngôi 3 số ít, thì hiện tại đơn' },
    { type:'fill', level:'A2', num:5,  question:'The opposite of "expensive" is ______.',             answer:'cheap',        hint:'Nghĩa: rẻ tiền' },
    { type:'fill', level:'A2', num:6,  question:'She ______ been working here for five years.',        answer:'has',          hint:'Thì hiện tại hoàn thành: has/have + V3' },
    { type:'fill', level:'B1', num:7,  question:'By the time she arrived, we ______ dinner.',          answer:'had finished', hint:'Thì quá khứ hoàn thành' },
    { type:'fill', level:'B1', num:8,  question:'She felt very ______ after running 10 km.',           answer:'exhausted',    hint:'Nghĩa: kiệt sức' },
    { type:'fill', level:'B1', num:9,  question:'The report ______ be submitted by Friday.',           answer:'must',         hint:'Modal verb thể hiện bắt buộc' },
    { type:'fill', level:'B2', num:10, question:'If I ______ you, I would apologize immediately.',     answer:'were',         hint:'Câu điều kiện loại 2: "If I were you..."' },

    /* ── MULTIPLE CHOICE ── */
    { type:'mc', level:'A1', num:11,
      question:'Which sentence is grammatically correct?',
      options:['I am go to the market.','I am going to the market.','I going to the market.','I goes to the market.'],
      answer:1 },
    { type:'mc', level:'A1', num:12,
      question:'What does "beautiful" mean in Vietnamese?',
      options:['Xấu','Đẹp','Buồn','Vui'],
      answer:1 },
    { type:'mc', level:'A1', num:13,
      question:'What do you say when you meet someone for the first time?',
      options:['Goodbye!','Nice to meet you!','See you later!','You\'re welcome!'],
      answer:1 },
    { type:'mc', level:'A2', num:14,
      question:'Choose the correct past tense: Yesterday, I ______ a great movie.',
      options:['watch','watching','watched','have watch'],
      answer:2 },
    { type:'mc', level:'A2', num:15,
      question:'Which word means "a person who teaches"?',
      options:['Student','Doctor','Teacher','Engineer'],
      answer:2 },
    { type:'mc', level:'A2', num:16,
      question:'How do you ask for the price politely?',
      options:['Give me the price!','How much cost this?','How much does this cost?','What is price?'],
      answer:2 },
    { type:'mc', level:'B1', num:17,
      question:'She suggested ______ to the cinema that night.',
      options:['go','to go','going','goes'],
      answer:2 },
    { type:'mc', level:'B1', num:18,
      question:'Which word is a synonym of "happy"?',
      options:['Sad','Angry','Joyful','Tired'],
      answer:2 },
    { type:'mc', level:'B1', num:19,
      question:'Which phrase is most formal for requesting help?',
      options:['Help me!','Can you help?','Would you mind helping me?','Hey, help!'],
      answer:2 },
    { type:'mc', level:'B2', num:20,
      question:'The project ______ by the team before the deadline.',
      options:['completed','was completed','has complete','were completing'],
      answer:1 },

    /* ── TRANSLATE ── */
    { type:'translate', level:'A1', num:21, question:'Dịch sang tiếng Anh: "Xin chào, tên tôi là Minh."',             answer:'Hello, my name is Minh.',                             hint:'"Xin chào" = Hello, "tên tôi là" = my name is' },
    { type:'translate', level:'A1', num:22, question:'Dịch sang tiếng Anh: "Tôi đến từ Việt Nam."',                   answer:'I come from Vietnam.',                                hint:'"đến từ" = come from' },
    { type:'translate', level:'A2', num:23, question:'Dịch sang tiếng Anh: "Tôi muốn học tiếng Anh vì tôi thích du lịch."', answer:'I want to learn English because I like traveling.', hint:'"vì" = because, "thích" = like' },
    { type:'translate', level:'A2', num:24, question:'Dịch sang tiếng Anh: "Anh ấy đang nói chuyện điện thoại."',    answer:'He is talking on the phone.',                         hint:'Dùng thì hiện tại tiếp diễn: is + V-ing' },
    { type:'translate', level:'B1', num:25, question:'Dịch sang tiếng Anh: "Bạn có thể giúp tôi tìm ga tàu không?"', answer:'Could you help me find the train station?',           hint:'"Bạn có thể...không?" = Could you...?' },
    { type:'translate', level:'B1', num:26, question:'Dịch sang tiếng Anh: "Tôi đã ở đây được 3 năm rồi."',          answer:'I have been here for 3 years.',                       hint:'Dùng thì hiện tại hoàn thành' },
    { type:'translate', level:'B2', num:27, question:'Dịch sang tiếng Anh: "Nếu tôi có nhiều tiền hơn, tôi sẽ đi du lịch khắp thế giới."', answer:'If I had more money, I would travel around the world.', hint:'Câu điều kiện loại 2: If + V2, would + V' },

    /* ── WORD ORDER ── */
    { type:'order', level:'A1', num:28, question:'Sắp xếp thành câu đúng:', words:['every','I','morning','exercise'],              answer:'I exercise every morning' },
    { type:'order', level:'A2', num:29, question:'Sắp xếp thành câu đúng:', words:['working','has','she','been','here'],           answer:'she has been working here' },
    { type:'order', level:'B1', num:30, question:'Sắp xếp thành câu đúng:', words:['the','was','report','yesterday','submitted'],  answer:'the report was submitted yesterday' },
    { type:'order', level:'A1', num:31, question:'Sắp xếp thành câu đúng:', words:['name','my','is','Minh'],                       answer:'my name is Minh' },
    { type:'order', level:'A2', num:32, question:'Sắp xếp thành câu đúng:', words:['does','where','live','she'],                   answer:'where does she live' },

    /* ── MATCHING ── */
    { type:'match', level:'A1', num:33, question:'Nối từ tiếng Anh với nghĩa tiếng Việt:',
      pairs:[['Happy','Vui vẻ'],['Sad','Buồn'],['Angry','Tức giận'],['Tired','Mệt mỏi']] },
    { type:'match', level:'A2', num:34, question:'Nối động từ với nghĩa tiếng Việt:',
      pairs:[['Run','Chạy'],['Jump','Nhảy'],['Swim','Bơi'],['Fly','Bay']] },
    { type:'match', level:'B1', num:35, question:'Nối cặp từ đồng nghĩa:',
      pairs:[['Big','Large'],['Fast','Quick'],['Happy','Joyful'],['Smart','Intelligent']] },
  ],

  /* ══════════ TIẾNG NHẬT ══════════ */
  japanese: [
    /* FILL */
    { type:'fill', level:'A1', num:1, question:'わたしは がくせい ______。(Tôi là học sinh)',              answer:'です',            hint:'Trợ từ cuối câu khẳng định lịch sự' },
    { type:'fill', level:'A1', num:2, question:'______ = nghĩa tiếng Việt của "ありがとう"',              answer:'cảm ơn',          hint:'Nghĩa của ありがとう' },
    { type:'fill', level:'A2', num:3, question:'まいにち がっこう に ______ ます。(Tôi đi học mỗi ngày)', answer:'いき',            hint:'Động từ いく (đi) dạng ます' },
    { type:'fill', level:'B1', num:4, question:'もし じかん が ______ ば、えいが を みます。',              answer:'あれ',            hint:'Dạng điều kiện ～ば' },
    /* MC */
    { type:'mc', level:'A1', num:5,
      question:'"Xin chào" (buổi chiều) trong tiếng Nhật là gì?',
      options:['おはようございます','こんにちは','こんばんは','さようなら'],
      answer:1 },
    { type:'mc', level:'A1', num:6,
      question:'"Cảm ơn" trong tiếng Nhật là gì?',
      options:['すみません','ありがとう','ごめんなさい','どういたしまして'],
      answer:1 },
    { type:'mc', level:'A1', num:7,
      question:'"Năm" trong tiếng Nhật là gì?',
      options:['に (ni)','さん (san)','ご (go)','し (shi)'],
      answer:2 },
    { type:'mc', level:'A2', num:8,
      question:'Câu phủ định của "です" là gì?',
      options:['ではありません','ではない','じゃないです','Cả A và C đều đúng'],
      answer:3 },
    { type:'mc', level:'B1', num:9,
      question:'"仕事" (shigoto) có nghĩa là gì?',
      options:['Học tập','Công việc','Gia đình','Du lịch'],
      answer:1 },
    /* TRANSLATE */
    { type:'translate', level:'A1', num:10, question:'Dịch sang tiếng Nhật (romaji): "Xin chào, tên tôi là Minh."', answer:'Hajimemashite, watashi no namae wa Minh desu.', hint:'はじめまして、わたしの なまえは〜です' },
    { type:'translate', level:'A2', num:11, question:'Dịch: "Tôi thích ăn phở."',                                   answer:'Watashi wa pho o taberu no ga suki desu.',     hint:'〜が すきです = thích' },
    { type:'translate', level:'B1', num:12, question:'Dịch: "Bạn có thể nói chậm hơn không?"',                      answer:'Motto yukkuri hanashite moraemasu ka?',        hint:'もっと ゆっくり はなして もらえますか' },
    /* ORDER */
    { type:'order', level:'A1', num:13, question:'Sắp xếp câu đúng:', words:['わたしは','がくせい','です'],             answer:'わたしは がくせい です' },
    { type:'order', level:'A2', num:14, question:'Sắp xếp câu đúng:', words:['すき','は','わたし','えいが','が'],       answer:'わたし は えいが が すき' },
    /* MATCH */
    { type:'match', level:'A1', num:15, question:'Nối số tiếng Nhật với chữ số:',
      pairs:[['いち (ichi)','1'],['に (ni)','2'],['さん (san)','3'],['し/よん','4']] },
    { type:'match', level:'A2', num:16, question:'Nối từ tiếng Nhật với nghĩa:',
      pairs:[['みず (mizu)','Nước'],['パン (pan)','Bánh mì'],['たまご (tamago)','Trứng'],['にく (niku)','Thịt']] },
  ],

  /* ══════════ TIẾNG HÀN ══════════ */
  korean: [
    /* FILL */
    { type:'fill', level:'A1', num:1, question:'저는 학생______。(Tôi là học sinh)',                       answer:'이에요',    hint:'Động từ "là" sau âm cuối' },
    { type:'fill', level:'A1', num:2, question:'한국어로 "1"은 ______ 입니다。',                           answer:'일',        hint:'Số 1 trong tiếng Hàn (Hán-Hàn)' },
    { type:'fill', level:'A2', num:3, question:'저는 커피를 ______ 아요。(Tôi uống cà phê)',               answer:'마셔',      hint:'Chia động từ 마시다 thể hiện tại' },
    { type:'fill', level:'B1', num:4, question:'시간이 있으면 영화를 ______겠어요。(Nếu có thời gian)',    answer:'보',        hint:'Câu điều kiện ～(으)면' },
    /* MC */
    { type:'mc', level:'A1', num:5,
      question:'"Cảm ơn" trong tiếng Hàn là gì?',
      options:['안녕하세요','감사합니다','미안합니다','잘 부탁드립니다'],
      answer:1 },
    { type:'mc', level:'A1', num:6,
      question:'"Xin lỗi" trong tiếng Hàn là gì?',
      options:['감사합니다','안녕히 가세요','죄송합니다','반갑습니다'],
      answer:2 },
    { type:'mc', level:'A1', num:7,
      question:'"Ba" trong tiếng Hàn (Hán-Hàn) là gì?',
      options:['일 (il)','이 (i)','삼 (sam)','사 (sa)'],
      answer:2 },
    { type:'mc', level:'A2', num:8,
      question:'"학교 (hakgyo)" có nghĩa là gì?',
      options:['Nhà','Trường học','Bệnh viện','Chợ'],
      answer:1 },
    { type:'mc', level:'B1', num:9,
      question:'Dạng kính ngữ của "먹다 (ăn)" là gì?',
      options:['먹어요','먹습니다','드세요','드십니다'],
      answer:3 },
    /* TRANSLATE */
    { type:'translate', level:'A1', num:10, question:'Dịch sang tiếng Hàn (romanize): "Xin chào, rất vui được gặp bạn."', answer:'Annyeonghaseyo, bangapseumnida.',                hint:'안녕하세요, 반갑습니다' },
    { type:'translate', level:'A2', num:11, question:'Dịch: "Tôi đang học tiếng Hàn."',                                   answer:'저는 한국어를 공부하고 있어요.',                 hint:'공부하다 = học, ~고 있어요 = đang' },
    { type:'translate', level:'B1', num:12, question:'Dịch: "Hàn Quốc thật đẹp, tôi muốn quay lại."',                    answer:'한국은 정말 아름다워요. 다시 오고 싶어요.',      hint:'아름답다 = đẹp, ~고 싶다 = muốn' },
    /* ORDER */
    { type:'order', level:'A1', num:13, question:'Sắp xếp câu đúng:', words:['저는','학생','이에요'],               answer:'저는 학생 이에요' },
    { type:'order', level:'A2', num:14, question:'Sắp xếp câu đúng:', words:['한국어를','저는','있어요','공부하고'], answer:'저는 한국어를 공부하고 있어요' },
    /* MATCH */
    { type:'match', level:'A1', num:15, question:'Nối từ tiếng Hàn với nghĩa:',
      pairs:[['사랑 (sarang)','Tình yêu'],['친구 (chingu)','Bạn bè'],['가족 (gajok)','Gia đình'],['음식 (eumsik)','Đồ ăn']] },
    { type:'match', level:'A2', num:16, question:'Nối màu sắc tiếng Hàn với màu tiếng Việt:',
      pairs:[['빨간색','Đỏ'],['파란색','Xanh lam'],['노란색','Vàng'],['초록색','Xanh lá']] },
  ],

  /* ══════════ TIẾNG PHÁP ══════════ */
  french: [
    /* FILL */
    { type:'fill', level:'A1', num:1, question:'Je ______ étudiant(e). (Tôi là sinh viên)',                    answer:'suis',          hint:'"Être" (là) ngôi thứ nhất: je suis' },
    { type:'fill', level:'A1', num:2, question:'______ = "Xin chào" trong tiếng Pháp (phổ biến nhất)',        answer:'Bonjour',        hint:'Lời chào phổ biến nhất trong tiếng Pháp' },
    { type:'fill', level:'A2', num:3, question:'Nous ______ au cinéma hier. (Chúng tôi đi rạp hôm qua)',      answer:'sommes allés',   hint:'Passé composé của "aller" với "être"' },
    { type:'fill', level:'B1', num:4, question:'Si j\'avais le temps, j\'______ voyager.',                    answer:'aimerais',       hint:'Conditionnel présent' },
    /* MC */
    { type:'mc', level:'A1', num:5,
      question:'"Cảm ơn" trong tiếng Pháp là gì?',
      options:["S'il vous plaît",'Merci','Bonjour','Au revoir'],
      answer:1 },
    { type:'mc', level:'A1', num:6,
      question:'"Chat" trong tiếng Pháp có nghĩa là gì?',
      options:['Chó','Mèo','Chim','Cá'],
      answer:1 },
    { type:'mc', level:'A1', num:7,
      question:'"Mười" trong tiếng Pháp là gì?',
      options:['Cinq','Sept','Dix','Huit'],
      answer:2 },
    { type:'mc', level:'A2', num:8,
      question:'Mạo từ xác định nào đi với danh từ giống đực số ít?',
      options:['la','les','le','un'],
      answer:2 },
    { type:'mc', level:'B1', num:9,
      question:'"Elle ______ partie hier." – Chia đúng "partir" ở Passé composé:',
      options:['a','est','avait','était'],
      answer:1 },
    /* TRANSLATE */
    { type:'translate', level:'A1', num:10, question:'Dịch sang tiếng Pháp: "Xin chào, tên tôi là Minh, tôi đến từ Việt Nam."', answer:"Bonjour, je m'appelle Minh, je viens du Vietnam.", hint:"je m'appelle = tên tôi là; je viens de = tôi đến từ" },
    { type:'translate', level:'A2', num:11, question:'Dịch: "Tôi thích ăn bánh mì buổi sáng."',                                  answer:"J'aime manger du pain le matin.",                  hint:"j'aime = tôi thích; le matin = buổi sáng" },
    { type:'translate', level:'B1', num:12, question:'Dịch: "Nếu trời đẹp, chúng ta sẽ đi dã ngoại."',                          answer:"S'il fait beau, nous irons faire un pique-nique.",  hint:'Câu điều kiện loại 1: Si + présent, futur simple' },
    /* ORDER */
    { type:'order', level:'A1', num:13, question:'Sắp xếp câu đúng:', words:['je','suis','étudiant'],                       answer:'je suis étudiant' },
    { type:'order', level:'A2', num:14, question:'Sắp xếp câu đúng:', words:['Paris','j\'habite','à','maintenant'],         answer:"j'habite à Paris maintenant" },
    /* MATCH */
    { type:'match', level:'A1', num:15, question:'Nối số tiếng Pháp với chữ số:',
      pairs:[['Un','1'],['Deux','2'],['Trois','3'],['Quatre','4']] },
    { type:'match', level:'A2', num:16, question:'Nối từ tiếng Pháp với nghĩa:',
      pairs:[['Maison','Nhà'],['École','Trường'],['Voiture','Xe hơi'],['Livre','Sách']] },
  ],
};

/* ─────────────────────────────────────────────
   EXERCISE RENDER ENGINE
───────────────────────────────────────────── */
let currentExercises = [];

function getFilteredExercises() {
  const all = EXERCISES[state.lang] || EXERCISES.english;
  const { type, level } = state.exFilter;
  return all.filter(ex =>
    (type  === 'all' || ex.type  === type) &&
    (level === 'all' || ex.level === level)
  );
}

function renderExercises() {
  const container = document.getElementById('ex-container'); if (!container) return;
  currentExercises = getFilteredExercises();
  state.total = currentExercises.length;
  state.score = state.answered = 0;
  updateScore(); updateProgressBar();
  container.innerHTML = '';

  // Update count badge
  const countEl = document.getElementById('ex-count');
  if (countEl) countEl.textContent = `${currentExercises.length} câu hỏi`;

  if (currentExercises.length === 0) {
    container.innerHTML = `<div class="empty-state"><i class="bi bi-search"></i><p>Không có bài tập nào phù hợp.<br>Hãy thử bộ lọc khác!</p></div>`;
    return;
  }

  const TYPE_META = {
    fill:      { label:'✏️ Điền từ',     cls:'tag-fill' },
    mc:        { label:'🔘 Trắc nghiệm', cls:'tag-mc' },
    translate: { label:'🌐 Dịch câu',    cls:'tag-trans' },
    order:     { label:'🔀 Sắp xếp câu', cls:'tag-order' },
    match:     { label:'🔗 Nối từ',      cls:'tag-match' },
  };
  const LEVEL_CLS = { A1:'lvl-a1', A2:'lvl-a2', B1:'lvl-b1', B2:'lvl-b2', C1:'lvl-c1' };

  currentExercises.forEach((ex, idx) => {
    const card = document.createElement('div');
    card.className = 'ex-card'; card.dataset.idx = idx;
    const meta  = TYPE_META[ex.type] || { label: ex.type, cls:'tag-mc' };
    const lvlCl = LEVEL_CLS[ex.level] || '';
    let bodyHTML = '';

    /* ── FILL ── */
    if (ex.type === 'fill') {
      const parts = ex.question.split('______');
      bodyHTML = `
        <p class="ex-question">${parts[0]}<input class="blank-input" id="blank-${idx}" placeholder="..."/>${parts[1]||''}</p>
        ${ex.hint ? `<p class="ex-hint"><i class="bi bi-lightbulb me-1"></i>${ex.hint}</p>` : ''}
        <button class="btn-check" onclick="checkFill(${idx})"><i class="bi bi-check-lg me-1"></i>Kiểm tra</button>`;
    }

    /* ── MC ── */
    if (ex.type === 'mc') {
      const opts = ex.options.map((o,i) =>
        `<button class="opt-btn" onclick="checkMC(${idx},${i})"><span class="opt-letter">${String.fromCharCode(65+i)}</span>${o}</button>`
      ).join('');
      bodyHTML = `<p class="ex-question">${ex.question}</p><div class="opts-wrap">${opts}</div>`;
    }

    /* ── TRANSLATE ── */
    if (ex.type === 'translate') {
      bodyHTML = `
        <p class="ex-question">${ex.question}</p>
        ${ex.hint ? `<p class="ex-hint"><i class="bi bi-lightbulb me-1"></i>${ex.hint}</p>` : ''}
        <textarea class="form-ctrl" id="trans-${idx}" rows="2" placeholder="Nhập bản dịch của bạn..."></textarea>
        <div class="d-flex gap-2 flex-wrap mt-2">
          <button class="btn-check" onclick="checkTranslate(${idx})"><i class="bi bi-check-lg me-1"></i>Kiểm tra</button>
          <button class="btn-hint-trans" onclick="showAnswer(${idx},${JSON.stringify(ex.answer)})"><i class="bi bi-eye me-1"></i>Xem đáp án</button>
        </div>`;
    }

    /* ── ORDER ── */
    if (ex.type === 'order') {
      const shuffled = [...ex.words].sort(() => Math.random() - 0.5);
      const pills = shuffled.map(w =>
        `<span class="word-pill" onclick="selectWord(this,'${idx}')" data-word="${w}">${w}</span>`
      ).join('');
      bodyHTML = `
        <p class="ex-question">${ex.question}</p>
        <div class="word-pool" id="pool-${idx}">${pills}</div>
        <div class="word-answer-area" id="answer-area-${idx}"><span class="placeholder-text">Nhấn vào từ bên trên để sắp xếp…</span></div>
        <div class="d-flex gap-2 flex-wrap mt-2">
          <button class="btn-check" onclick="checkOrder(${idx})"><i class="bi bi-check-lg me-1"></i>Kiểm tra</button>
          <button class="btn-hint-trans" onclick="resetOrder(${idx})"><i class="bi bi-arrow-counterclockwise me-1"></i>Đặt lại</button>
        </div>`;
    }

    /* ── MATCH ── */
    if (ex.type === 'match') {
      const right = [...ex.pairs.map(p => p[1])].sort(() => Math.random() - 0.5);
      const leftH  = ex.pairs.map(([l],i) => `<div class="match-item left-item"  data-idx="${idx}" data-side="left"  data-val="${l}"  onclick="selectMatch(this)">${l}</div>`).join('');
      const rightH = right.map(r          => `<div class="match-item right-item" data-idx="${idx}" data-side="right" data-val="${r}"  onclick="selectMatch(this)">${r}</div>`).join('');
      bodyHTML = `
        <p class="ex-question">${ex.question}</p>
        <div class="match-grid">
          <div class="match-col" id="left-col-${idx}">${leftH}</div>
          <div class="match-col" id="right-col-${idx}">${rightH}</div>
        </div>
        <button class="btn-check mt-3" onclick="checkMatch(${idx})"><i class="bi bi-check-lg me-1"></i>Kiểm tra</button>`;
    }

    card.innerHTML = `
      <div class="ex-meta">
        <span class="ex-tag ${meta.cls}">${meta.label}</span>
        <span class="ex-level-badge ${lvlCl}">${ex.level}</span>
        <span class="tag-num-lbl">Câu ${idx+1}/${currentExercises.length}</span>
      </div>
      ${bodyHTML}
      <div class="ex-feedback" id="fb-${idx}"></div>`;
    container.appendChild(card);
  });
}

/* ── CHECK FILL ── */
window.checkFill = function(idx) {
  const ex  = currentExercises[idx];
  const val = document.getElementById('blank-'+idx)?.value.trim().toLowerCase();
  const ok  = val === ex.answer.toLowerCase();
  showFeedback(idx, ok, ex.answer); markCard(idx, ok);
};

/* ── CHECK MC ── */
window.checkMC = function(idx, chosen) {
  const ex   = currentExercises[idx];
  const card = document.querySelector(`[data-idx="${idx}"]`);
  card.querySelectorAll('.opt-btn').forEach((b,i) => {
    b.disabled = true;
    if (i === ex.answer) b.classList.add('correct');
    else if (i === chosen) b.classList.add('wrong');
  });
  showFeedback(idx, chosen === ex.answer, ex.options[ex.answer]);
  markCard(idx, chosen === ex.answer);
};

/* ── CHECK TRANSLATE ── */
window.checkTranslate = function(idx) {
  const ex  = currentExercises[idx];
  const val = document.getElementById('trans-'+idx)?.value.trim();
  const ok  = val.length > 4;
  showFeedback(idx, ok, ex.answer); markCard(idx, ok);
};
window.showAnswer = function(idx, answer) {
  const ta = document.getElementById('trans-'+idx); if (ta) ta.value = answer;
};

/* ── ORDER ── */
const orderSelected = {};
window.selectWord = function(el, idx) {
  if (el.classList.contains('used')) return;
  el.classList.add('used');
  if (!orderSelected[idx]) orderSelected[idx] = [];
  orderSelected[idx].push(el.dataset.word);
  const area = document.getElementById('answer-area-'+idx);
  area.innerHTML = orderSelected[idx].map(w => `<span class="word-pill placed">${w}</span>`).join(' ');
};
window.resetOrder = function(idx) {
  orderSelected[idx] = [];
  document.getElementById('pool-'+idx)?.querySelectorAll('.word-pill').forEach(w => w.classList.remove('used'));
  const area = document.getElementById('answer-area-'+idx);
  if (area) area.innerHTML = `<span class="placeholder-text">Nhấn vào từ bên trên để sắp xếp…</span>`;
};
window.checkOrder = function(idx) {
  const ex  = currentExercises[idx];
  const ans = (orderSelected[idx]||[]).join(' ').trim().toLowerCase();
  const ok  = ans === ex.answer.toLowerCase();
  showFeedback(idx, ok, ex.answer); markCard(idx, ok);
};

/* ── MATCH ── */
const matchState = {};
window.selectMatch = function(el) {
  const idx  = el.dataset.idx;
  const side = el.dataset.side;
  const val  = el.dataset.val;
  if (el.classList.contains('matched')) return;
  if (!matchState[idx]) matchState[idx] = { left:null, right:null, pairs:[] };
  const ms = matchState[idx];
  document.querySelectorAll(`.match-item[data-idx="${idx}"][data-side="${side}"]`).forEach(e => e.classList.remove('selected'));
  el.classList.add('selected');
  ms[side] = val;
  if (ms.left && ms.right) {
    ms.pairs.push([ms.left, ms.right]);
    document.querySelectorAll(`.match-item[data-idx="${idx}"][data-val="${ms.left}"][data-side="left"]`).forEach(e => { e.classList.remove('selected'); e.classList.add('matched'); e.style.pointerEvents='none'; });
    document.querySelectorAll(`.match-item[data-idx="${idx}"][data-val="${ms.right}"][data-side="right"]`).forEach(e => { e.classList.remove('selected'); e.classList.add('matched'); e.style.pointerEvents='none'; });
    ms.left = null; ms.right = null;
  }
};
window.checkMatch = function(idx) {
  const ex = currentExercises[idx];
  const ms = matchState[idx];
  if (!ms || ms.pairs.length === 0) { showFeedback(idx, false, 'Hãy nối ít nhất một cặp!'); return; }
  const correct = ex.pairs.every(([l,r]) => ms.pairs.some(([pl,pr]) => pl===l && pr===r));
  if (correct) { showFeedback(idx, true, ''); markCard(idx, true); }
  else {
    const wrong = ex.pairs.filter(([l,r]) => !ms.pairs.some(([pl,pr]) => pl===l && pr===r));
    showFeedback(idx, false, wrong.map(([l,r]) => `${l} → ${r}`).join(' | ')); markCard(idx, false);
  }
};

/* ── FEEDBACK & SCORE ── */
function showFeedback(idx, correct, answer) {
  const fb = document.getElementById('fb-'+idx); if (!fb) return;
  fb.className = `ex-feedback show ${correct ? 'fb-correct' : 'fb-wrong'}`;
  fb.innerHTML = correct
    ? `<i class="bi bi-check-circle-fill me-1"></i> Chính xác! Rất tốt! 🎉`
    : `<i class="bi bi-x-circle-fill me-1"></i> Chưa đúng. Đáp án: <strong>${answer}</strong>`;
}
function markCard(idx, correct) {
  const card = document.querySelector(`[data-idx="${idx}"]`);
  if (!card || card.classList.contains('answered') || card.classList.contains('wrong-ans')) return;
  card.classList.add(correct ? 'answered' : 'wrong-ans');
  if (correct) state.score++;
  state.answered++;
  updateScore(); updateProgressBar();
  if (state.answered === state.total) setTimeout(showCompletionBanner, 300);
}
function updateScore() {
  const el = document.getElementById('score-display'); if (el) el.textContent = `${state.score} / ${state.total}`;
}
function updateProgressBar() {
  const pct = state.total > 0 ? (state.answered / state.total) * 100 : 0;
  const bar = document.getElementById('ex-progress'); if (bar) bar.style.width = pct + '%';
  const lbl = document.getElementById('progress-lbl'); if (lbl) lbl.textContent = `${state.answered}/${state.total} đã hoàn thành`;
}
function showCompletionBanner() {
  const container = document.getElementById('ex-container');
  const pct = Math.round((state.score / state.total) * 100);
  const emoji = pct >= 80 ? '🏆' : pct >= 50 ? '👍' : '📚';
  const msg   = pct >= 80 ? 'Xuất sắc! Bạn đã thành thạo rồi!' : pct >= 50 ? 'Tốt lắm! Tiếp tục luyện tập nhé!' : 'Đừng nản! Ôn tập thêm nhé!';
  const banner = document.createElement('div');
  banner.className = 'completion-banner fade-up';
  banner.innerHTML = `
    <div style="font-size:3rem">${emoji}</div>
    <h4 style="font-weight:800;margin:0.5rem 0">Hoàn thành bài tập!</h4>
    <p style="color:var(--muted)">${msg}</p>
    <div style="font-size:2rem;font-weight:800;background:linear-gradient(135deg,var(--accent1),var(--accent2));-webkit-background-clip:text;-webkit-text-fill-color:transparent">${pct}%</div>
    <p style="color:var(--muted);font-size:0.85rem">${state.score}/${state.total} câu đúng</p>
    <button class="btn-check mt-2" onclick="resetExercises()"><i class="bi bi-arrow-repeat me-1"></i>Làm lại</button>`;
  container.appendChild(banner);
}
window.resetExercises = function() { renderExercises(); };

/* ─────────────────────────────────────────────
   EXERCISE FILTERS
───────────────────────────────────────────── */
document.querySelectorAll('.ex-lang-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.ex-lang-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    state.lang = btn.dataset.lang; renderExercises();
  });
});
document.querySelectorAll('.ex-type-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.ex-type-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    state.exFilter.type = btn.dataset.type; renderExercises();
  });
});
document.querySelectorAll('.ex-level-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.ex-level-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    state.exFilter.level = btn.dataset.level; renderExercises();
  });
});

/* ─────────────────────────────────────────────
   PRONUNCIATION
───────────────────────────────────────────── */
const AUDIO_DATA = {
  english: [
    { phrase:'How are you doing?',            phonetic:'/haʊ ɑːr juː ˈduːɪŋ/',              translation:'Bạn khỏe không?',                         diff:'easy',   level:'A1' },
    { phrase:'Nice to meet you.',             phonetic:'/naɪs tə miːt juː/',                 translation:'Rất vui được gặp bạn.',                   diff:'easy',   level:'A1' },
    { phrase:'What time is it?',              phonetic:'/wɒt taɪm ɪz ɪt/',                  translation:'Bây giờ là mấy giờ?',                     diff:'easy',   level:'A1' },
    { phrase:'Could you repeat that?',        phonetic:'/kʊd juː rɪˈpiːt ðæt/',             translation:'Bạn có thể nhắc lại không?',              diff:'medium', level:'A2' },
    { phrase:'I appreciate your help.',       phonetic:'/aɪ əˈpriːʃieɪt jɔːr help/',        translation:'Tôi đánh giá cao sự giúp đỡ của bạn.',    diff:'medium', level:'B1' },
    { phrase:"That's a sophisticated idea.",  phonetic:'/ðæts ə səˈfɪstɪkeɪtɪd aɪˈdɪə/',   translation:'Đó là một ý tưởng tinh vi.',               diff:'hard',   level:'B2' },
    { phrase:'Nevertheless, I persevere.',    phonetic:'/ˌnevəðəˈles aɪ ˌpɜːsɪˈvɪər/',     translation:'Tuy nhiên, tôi kiên trì.',                 diff:'hard',   level:'B2' },
  ],
  japanese: [
    { phrase:'よろしくお願いします',           phonetic:'Yoroshiku onegai shimasu',           translation:'Rất vui được làm quen / Mong bạn giúp đỡ', diff:'medium', level:'A1' },
    { phrase:'ありがとうございます',           phonetic:'Arigatō gozaimasu',                 translation:'Cảm ơn bạn rất nhiều',                    diff:'easy',   level:'A1' },
    { phrase:'すみません、どこですか？',       phonetic:'Sumimasen, doko desu ka?',           translation:'Xin lỗi, nơi đó ở đâu?',                  diff:'medium', level:'A2' },
    { phrase:'もう一度言ってください。',        phonetic:'Mō ichido itte kudasai.',            translation:'Vui lòng nói lại một lần nữa.',            diff:'hard',   level:'B1' },
  ],
  korean: [
    { phrase:'안녕하세요',                    phonetic:'Annyeonghaseyo',                     translation:'Xin chào (trang trọng)',                   diff:'easy',   level:'A1' },
    { phrase:'감사합니다',                    phonetic:'Gamsahamnida',                       translation:'Cảm ơn bạn',                              diff:'easy',   level:'A1' },
    { phrase:'한국어를 공부하고 있어요',        phonetic:'Hangugeo-reul gongbuha-go isseoyo', translation:'Tôi đang học tiếng Hàn',                   diff:'hard',   level:'B1' },
    { phrase:'다시 한번 말씀해 주시겠어요?',   phonetic:'Dasi hanbeon malsseum-hae jusigeseoyo?', translation:'Bạn có thể nói lại không?',           diff:'hard',   level:'B1' },
  ],
  french: [
    { phrase:'Enchanté de vous rencontrer.',             phonetic:'/ɑ̃ʃɑ̃te də vu ʁɑ̃kɔ̃tʁe/',  translation:'Rất vui được gặp bạn.',                diff:'medium', level:'A1' },
    { phrase:"Pourriez-vous répéter, s'il vous plaît?", phonetic:'/puʁje vu ʁepete/',          translation:'Bạn có thể nhắc lại không?',            diff:'hard',   level:'A2' },
    { phrase:'Je voudrais réserver une table.',          phonetic:'/ʒə vudʁɛ ʁezɛʁve yn tabl/', translation:'Tôi muốn đặt một bàn.',                diff:'medium', level:'A2' },
  ],
};

function renderAudioCards() {
  const container = document.getElementById('audio-container'); if (!container) return;
  const items = AUDIO_DATA[state.lang] || AUDIO_DATA.english;
  container.innerHTML = '';
  items.forEach((item, i) => {
    const bars = Array.from({length:18}, () => {
      const h = 6 + Math.random() * 18, d = (0.6 + Math.random() * 0.6).toFixed(2);
      return `<div class="bar" style="--h:${h}px;--d:${d}s;height:${4+Math.random()*4}px"></div>`;
    }).join('');
    const diffClass = { easy:'diff-easy', medium:'diff-medium', hard:'diff-hard' }[item.diff];
    const diffLabel = { easy:'Dễ', medium:'Trung bình', hard:'Khó' }[item.diff];
    container.innerHTML += `
      <div class="audio-card">
        <div class="d-flex justify-content-between align-items-start mb-1">
          <div class="audio-lang-tag">${state.lang.toUpperCase()} · ${item.level}</div>
          <span class="diff-badge ${diffClass}">${diffLabel}</span>
        </div>
        <div class="audio-phrase">${item.phrase}</div>
        <div class="audio-phonetic">${item.phonetic}</div>
        <div class="waveform" id="waveform-${i}">${bars}</div>
        <div class="d-flex align-items-center gap-3">
          <button class="btn-play" id="play-${i}" onclick="togglePlay(${i})"><i class="bi bi-play-fill"></i></button>
          <div class="audio-translation">🇻🇳 ${item.translation}</div>
        </div>
      </div>`;
  });
}

const playingTimers = {};
window.togglePlay = function(i) {
  const btn = document.getElementById('play-'+i), wf = document.getElementById('waveform-'+i);
  const isPlaying = btn.classList.contains('active');
  document.querySelectorAll('.btn-play.active').forEach(b => { b.classList.remove('active'); b.innerHTML='<i class="bi bi-play-fill"></i>'; });
  document.querySelectorAll('.waveform.playing').forEach(w => w.classList.remove('playing'));
  Object.values(playingTimers).forEach(clearTimeout);
  if (!isPlaying) {
    btn.classList.add('active'); btn.innerHTML='<i class="bi bi-pause-fill"></i>'; wf.classList.add('playing');
    const items = AUDIO_DATA[state.lang] || AUDIO_DATA.english;
    if (window.speechSynthesis) {
      const utt = new SpeechSynthesisUtterance(items[i].phrase);
      utt.lang = { english:'en-US', japanese:'ja-JP', korean:'ko-KR', french:'fr-FR' }[state.lang] || 'en-US';
      utt.rate = 0.85;
      utt.onend = () => { btn.classList.remove('active'); btn.innerHTML='<i class="bi bi-play-fill"></i>'; wf.classList.remove('playing'); };
      speechSynthesis.speak(utt);
    } else {
      playingTimers[i] = setTimeout(() => { btn.classList.remove('active'); btn.innerHTML='<i class="bi bi-play-fill"></i>'; wf.classList.remove('playing'); }, 2500);
    }
  } else { speechSynthesis?.cancel(); }
};

document.querySelectorAll('.lang-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.lang-tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active'); state.lang = btn.dataset.lang; renderAudioCards();
  });
});

/* ── EVALUATION ── */
function animateRatings() {
  document.querySelectorAll('.rating-fill[data-pct]').forEach(bar => {
    setTimeout(() => { bar.style.width = bar.dataset.pct + '%'; }, 200);
  });
}

/* ─────────────────────────────────────────────
   INIT
───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  showPage('home');
  renderExercises();
  renderAudioCards();
  animateRatings();
});

/* =========================
   HERO SLIDER
========================= */
const heroSlides = document.querySelectorAll('.hero-slide');
const heroDots   = document.querySelectorAll('.dot');
let currentHeroSlide = 0;
let heroTimer;
let isAnimating = false;

// Khởi tạo: chỉ slide đầu hiện, còn lại ẩn bên phải
function initSlider() {
  heroSlides.forEach((slide, i) => {
    slide.style.transition = 'none';
    if (i === 0) {
      slide.style.transform = 'translateX(0%)';
      slide.classList.add('active');
      slide.style.visibility = 'visible';
    } else {
      slide.style.transform = 'translateX(100%)';
      slide.style.visibility = 'hidden';
    }
  });
}

function goToSlide(index) {
  if (isAnimating || heroSlides.length < 2) return;

  const prev = currentHeroSlide;
  const next = ((index % heroSlides.length) + heroSlides.length) % heroSlides.length;
  if (next === prev) return;

  isAnimating = true;

  // Slide mới: đặt sẵn bên phải, hiện lên
  heroSlides[next].style.transition = 'none';
  heroSlides[next].style.transform = 'translateX(100%)';
  heroSlides[next].style.visibility = 'visible';
  heroSlides[next].classList.add('active');

  // Sau 1 frame: bật transition rồi trượt
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // Slide mới trượt vào từ phải
      heroSlides[next].style.transition = 'transform 0.5s ease-in-out';
      heroSlides[next].style.transform = 'translateX(0%)';

      // Slide cũ trượt ra bên trái
      heroSlides[prev].style.transition = 'transform 0.5s ease-in-out';
      heroSlides[prev].style.transform = 'translateX(-100%)';

      // Cập nhật dots
      if (heroDots[prev]) heroDots[prev].classList.remove('active');
      if (heroDots[next]) heroDots[next].classList.add('active');
    });
  });

  // Dọn dẹp sau animation
  setTimeout(() => {
    heroSlides[prev].classList.remove('active');
    heroSlides[prev].style.transition = 'none';
    heroSlides[prev].style.transform = 'translateX(100%)'; // reset về bên phải
    heroSlides[prev].style.visibility = 'hidden';
    heroSlides[next].style.transition = 'none';

    currentHeroSlide = next;
    isAnimating = false;
  }, 520);
}

function changeSlide(dir) {
  goToSlide(currentHeroSlide + dir);
}

function resetTimer() {
  clearInterval(heroTimer);
  heroTimer = setInterval(() => goToSlide(currentHeroSlide + 1), 3000);
}

// Khởi động
if (heroSlides.length > 0) {
  initSlider();
  heroTimer = setInterval(() => goToSlide(currentHeroSlide + 1), 3000);
}