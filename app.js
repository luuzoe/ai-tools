// AI Tools Hub — all tools use free, no-key APIs
// Chat + Translate: Pollinations text API | Image: Pollinations image API | TTS: browser speechSynthesis

// ---------- Tabs ----------
document.querySelectorAll('.tabbar button').forEach(function (b) {
  b.onclick = function () {
    document.querySelectorAll('.tabbar button').forEach(function (x) { x.classList.remove('active'); });
    document.querySelectorAll('.tab').forEach(function (x) { x.classList.remove('active'); });
    b.classList.add('active');
    document.getElementById(b.dataset.tab).classList.add('active');
  };
});

// ---------- Chat ----------
var chatBox = document.getElementById('chat-box');
var chatInput = document.getElementById('chat-input');
var chatSend = document.getElementById('chat-send');

function addMsg(text, who) {
  var d = document.createElement('div');
  d.className = 'msg ' + who;
  d.textContent = text;
  chatBox.appendChild(d);
  chatBox.scrollTop = chatBox.scrollHeight;
  return d;
}

function cleanReply(t) {
  if (!t || !t.trim()) return '⚠️ အဖြေပြန်မလာဘူး။ ထပ်မေးကြည့်ပါ။';
  t = t.trim();
  // defensive: if the API ever leaks its reasoning JSON again, don't show it
  if (t.charAt(0) === '{' && t.indexOf('"reasoning"') !== -1) {
    return '⚠️ ဆာဗာအဖြေ မမှန်ဘူး။ ထပ်မေးကြည့်ပါ။';
  }
  return t;
}

function askAI(prompt, cb) {
  fetch('https://text.pollinations.ai/openai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'openai',
      messages: [
        { role: 'system', content: 'You are a careful, thoughtful AI assistant. Think step-by-step and reason thoroughly before answering. Always answer in Burmese (Myanmar language), with clear and well-organized explanations. Be accurate: never invent facts, prices, dates, or news — if you are unsure about something, say so honestly instead of guessing.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 800
    })
  })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      var m = d && d.choices && d.choices[0] && d.choices[0].message;
      cb(cleanReply(m && m.content));
    })
    .catch(function () { cb('⚠️ အခုဆာဗာနဲ့ ချိတ်မရဘူး။ ခဏနေမှ ထပ်စမ်းကြည့်ပါ။'); });
}

var chatBusy = false;
function sendChat(text) {
  text = (text || chatInput.value).trim();
  if (!text || chatBusy) return;
  chatBusy = true;
  addMsg(text, 'user');
  chatInput.value = '';
  var typing = addMsg('⏳ စဉ်းစားနေတယ်…', 'ai');
  typing.classList.add('typing');
  chatSend.disabled = true;
  askAI(text, function (ans) {
    typing.textContent = ans.trim();
    typing.classList.remove('typing');
    chatSend.disabled = false;
    chatBusy = false;
  });
}
chatSend.onclick = function () { sendChat(); };
chatInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') sendChat(); });
document.querySelectorAll('.chips button').forEach(function (b) {
  b.onclick = function () { sendChat(b.dataset.preset); };
});

// ---------- Image ----------
var imgGen = document.getElementById('img-gen');
imgGen.onclick = function () {
  var prompt = document.getElementById('img-prompt').value.trim();
  if (!prompt) { alert('ပုံအကြောင်း အရင်ရေးပါ'); return; }
  var style = document.getElementById('img-style').value;
  var size = document.getElementById('img-size').value.split(',');
  var seed = Math.floor(Math.random() * 999999);
  var url = 'https://image.pollinations.ai/prompt/' +
    encodeURIComponent(prompt + style) +
    '?width=' + size[0] + '&height=' + size[1] + '&seed=' + seed + '&nologo=true&model=flux';
  var res = document.getElementById('img-result');
  var load = document.getElementById('img-loading');
  var out = document.getElementById('img-out');
  var dl = document.getElementById('img-dl');
  res.classList.remove('hidden');
  load.classList.remove('hidden');
  out.classList.add('hidden');
  dl.classList.add('hidden');
  imgGen.disabled = true;
  var test = new Image();
  test.onload = function () {
    out.src = url;
    load.classList.add('hidden');
    out.classList.remove('hidden');
    dl.classList.remove('hidden');
    imgGen.disabled = false;
    // cross-origin <a download> is ignored by browsers, so fetch as blob
    dl.onclick = function (e) {
      e.preventDefault();
      dl.textContent = '⏳ သိမ်းနေတယ်…';
      fetch(url)
        .then(function (r) { return r.blob(); })
        .then(function (blob) {
          var a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = 'ai-image.jpg';
          document.body.appendChild(a);
          a.click();
          setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
          dl.textContent = '⬇️ ပုံကို သိမ်းမယ်';
        })
        .catch(function () {
          dl.textContent = '⬇️ ပုံကို သိမ်းမယ်';
          window.open(url, '_blank');
        });
    };
  };
  test.onerror = function () {
    load.textContent = '⚠️ ပုံထုတ်မရဘူး။ ခဏနေမှ ထပ်စမ်းကြည့်ပါ။';
    imgGen.disabled = false;
  };
  test.src = url;
};

// ---------- TTS ----------
var synth = window.speechSynthesis;
var voiceSel = document.getElementById('tts-voice');
function loadVoices() {
  var voices = synth.getVoices();
  voiceSel.innerHTML = '';
  voices.forEach(function (v, i) {
    var o = document.createElement('option');
    o.value = i;
    o.textContent = v.name + ' (' + v.lang + ')';
    voiceSel.appendChild(o);
  });
  var en = voices.findIndex(function (v) { return v.lang.indexOf('en') === 0; });
  if (en >= 0) voiceSel.value = en;
}
if (synth) {
  loadVoices();
  synth.onvoiceschanged = loadVoices;
}
document.getElementById('tts-rate').oninput = function () {
  document.getElementById('tts-rate-val').textContent = this.value;
};
document.getElementById('tts-speak').onclick = function () {
  if (!synth) { alert('ဒီ browser က အသံမထောက်ပံ့ဘူး'); return; }
  var text = document.getElementById('tts-text').value.trim();
  if (!text) { alert('စာအရင်ရိုက်ပါ'); return; }
  synth.cancel();
  var u = new SpeechSynthesisUtterance(text);
  var voices = synth.getVoices();
  if (voices[voiceSel.value]) u.voice = voices[voiceSel.value];
  u.rate = parseFloat(document.getElementById('tts-rate').value);
  synth.speak(u);
};
document.getElementById('tts-stop').onclick = function () { if (synth) synth.cancel(); };

// ---------- Translate ----------
var trMyEn = true;
var trDir = document.getElementById('tr-dir');
trDir.onclick = function () {
  trMyEn = !trMyEn;
  trDir.textContent = trMyEn ? 'မြန်မာ ➜ English' : 'English ➜ မြန်မာ';
};
document.getElementById('tr-go').onclick = function () {
  var src = document.getElementById('tr-input').value.trim();
  if (!src) { alert('စာအရင်ရိုက်ပါ'); return; }
  var out = document.getElementById('tr-output');
  out.textContent = '⏳ ဘာသာပြန်နေတယ်…';
  var instruction = trMyEn
    ? 'Translate this Burmese text to English. Return only the translation, nothing else: '
    : 'Translate this English text to Burmese. Return only the translation, nothing else: ';
  fetch('https://text.pollinations.ai/openai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'openai',
      messages: [{ role: 'user', content: instruction + src }],
      max_tokens: 400
    })
  })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      var m = d && d.choices && d.choices[0] && d.choices[0].message;
      out.textContent = cleanReply(m && m.content);
    })
    .catch(function () { out.textContent = '⚠️ ချိတ်မရဘူး။ ခဏနေမှ ထပ်စမ်းပါ။'; });
};
document.getElementById('tr-copy').onclick = function () {
  var t = document.getElementById('tr-output').textContent.trim();
  if (!t || t === '…' || t.charAt(0) === '⏳') { alert('အရင် ဘာသာပြန်ပါ'); return; }
  if (navigator.clipboard) {
    navigator.clipboard.writeText(t).then(function () { alert('📋 ကူးပြီးပြီ'); });
  }
};

// ---------- Robot mascot interaction ----------
(function () {
  var robot = document.getElementById('robot');
  var bubble = document.getElementById('robot-bubble');
  if (!robot || !bubble) return;
  var greetings = [
    'မင်္ဂလာပါ! 👋',
    'ဘာကူညီပေးရမလဲ? 🤖',
    'ပုံထုတ်ကြည့်ပါလား! 🎨',
    'မေးခွန်းမေးကြည့်! 💬',
    'ဘာသာပြန်ခိုင်းလို့ရတယ် 🌐',
    'အသံဖတ်ခိုင်းကြည့်! 🔊'
  ];
  var timer = null;
  // show a greeting bubble shortly after load
  setTimeout(function () { showBubble(); }, 900);
  robot.parentElement.addEventListener('click', function () {
    robot.classList.remove('jump');
    void robot.offsetWidth; // restart animation
    robot.classList.add('jump');
    showBubble();
  });
  function showBubble() {
    bubble.textContent = greetings[Math.floor(Math.random() * greetings.length)];
    bubble.classList.add('show');
    if (timer) clearTimeout(timer);
    timer = setTimeout(function () { bubble.classList.remove('show'); }, 2400);
  }
})();
