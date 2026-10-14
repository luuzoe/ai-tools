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

function askAI(prompt, cb) {
  var url = 'https://text.pollinations.ai/' + encodeURIComponent('မြန်မာလိုဖြေပါ။ ' + prompt) + '?model=openai';
  fetch(url)
    .then(function (r) {
      if (!r.ok) throw new Error('http ' + r.status);
      return r.text();
    })
    .then(cb)
    .catch(function () { cb('⚠️ အခုဆာဗာနဲ့ ချိတ်မရဘူး။ ခဏနေမှ ထပ်စမ်းကြည့်ပါ။'); });
}

function sendChat(text) {
  text = (text || chatInput.value).trim();
  if (!text) return;
  addMsg(text, 'user');
  chatInput.value = '';
  var typing = addMsg('⏳ စဉ်းစားနေတယ်…', 'ai');
  typing.classList.add('typing');
  chatSend.disabled = true;
  askAI(text, function (ans) {
    typing.textContent = ans.trim();
    typing.classList.remove('typing');
    chatSend.disabled = false;
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
    dl.href = url;
    load.classList.add('hidden');
    out.classList.remove('hidden');
    dl.classList.remove('hidden');
    imgGen.disabled = false;
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
  fetch('https://text.pollinations.ai/' + encodeURIComponent(instruction + src) + '?model=openai')
    .then(function (r) { return r.text(); })
    .then(function (t) { out.textContent = t.trim(); })
    .catch(function () { out.textContent = '⚠️ ချိတ်မရဘူး။ ခဏနေမှ ထပ်စမ်းပါ။'; });
};
document.getElementById('tr-copy').onclick = function () {
  var t = document.getElementById('tr-output').textContent;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(t).then(function () { alert('📋 ကူးပြီးပြီ'); });
  }
};
