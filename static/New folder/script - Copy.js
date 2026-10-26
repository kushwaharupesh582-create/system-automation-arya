/* ============================================================
   ARYA AI — Frontend Controller
   120-144 FPS optimized
   ============================================================ */

console.log('[ARYA] Frontend initializing...');

// ============================================================
// DOM HELPERS
// ============================================================
const $ = (id) => document.getElementById(id);

// ============================================================
// THEME SYSTEM — Day/Night + Random Image + Manual Override
// ============================================================
(function initTheme() {
    const DAY_START_HOUR = 6;
    const DAY_END_HOUR = 18;
    const IMAGES_PER_THEME = 5;

    let override = localStorage.getItem('arya-theme-override') || null;
    if (override === 'null') override = null;

    const aryaImage = $('aryaImage');
    const themeToggleBtn = $('themeToggle');
    const body = document.body;

    function getNaturalMode() {
        const hour = new Date().getHours();
        return (hour >= DAY_START_HOUR && hour < DAY_END_HOUR) ? 'day' : 'night';
    }

    function getActiveMode() {
        return override || getNaturalMode();
    }

    function randomImage(mode) {
        const n = Math.floor(Math.random() * IMAGES_PER_THEME) + 1;
        const prefix = mode === 'day' ? 'arya_light' : 'arya_dark';
        return `/static/${prefix}${n}.png`;
    }

    function applyTheme(regenerateImage = true) {
        const mode = getActiveMode();

        if (mode === 'day') {
            body.classList.add('light-mode');
            body.classList.remove('dark-mode');
        } else {
            body.classList.add('dark-mode');
            body.classList.remove('light-mode');
        }

        if (themeToggleBtn) {
            themeToggleBtn.innerHTML = mode === 'day'
                ? '<i class="fas fa-moon"></i>'
                : '<i class="fas fa-sun"></i>';
        }

        if (aryaImage) {
            if (regenerateImage) {
                aryaImage.style.opacity = '0';
                setTimeout(() => {
                    aryaImage.src = randomImage(mode);
                    aryaImage.onload = () => { aryaImage.style.opacity = '1'; };
                }, 300);
            } else {
                aryaImage.src = randomImage(mode);
            }
        }
    }

    window.aryaApplyTheme = applyTheme;

    applyTheme(false);

    let lastTap = 0;
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const now = Date.now();
            if (now - lastTap < 400) {
                override = null;
                localStorage.removeItem('arya-theme-override');
                applyTheme(true);
                showToast('AUTO THEME');
                lastTap = 0;
                return;
            }
            lastTap = now;

            const current = getActiveMode();
            const next = current === 'day' ? 'night' : 'day';
            override = next;
            localStorage.setItem('arya-theme-override', next);
            applyTheme(true);
            showToast(next === 'day' ? '☀️ DAY MODE' : '🌙 NIGHT MODE');
        });
    }

    setInterval(() => {
        if (override) return;
        const natural = getNaturalMode();
        const current = body.classList.contains('light-mode') ? 'day' : 'night';
        if (natural !== current) applyTheme(true);
    }, 60000);

    console.log(`[Theme] Init — mode: ${getActiveMode()}, override: ${override || 'none'}`);
})();

// ============================================================
// CLOCK
// ============================================================
function updateClock() {
    const c = $('clock');
    if (!c) return;
    const now = new Date();
    c.textContent = now.toLocaleTimeString('en-IN', {
        hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
}
setInterval(updateClock, 1000);
updateClock();

// ============================================================
// TOAST
// ============================================================
let toastTimeout = null;
function showToast(text, duration = 1800) {
    const toast = $('toast');
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('show'), duration);
}

// ============================================================
// ACTIVITY LOG
// ============================================================
function addActivity(text) {
    const activityList = $('activityList');
    if (!activityList) return;
    const now = new Date();
    const time = now.toLocaleTimeString('en-IN', { hour12: true, hour: '2-digit', minute: '2-digit' });
    const item = document.createElement('div');
    item.className = 'activity-item';
    item.innerHTML = `<span class="time">${time}</span><span class="text">${text}</span>`;
    activityList.prepend(item);
    if (activityList.children.length > 20) {
        activityList.removeChild(activityList.lastChild);
    }
}

// ============================================================
// TIME-BASED GREETING
// ============================================================
function updateGreeting() {
    const hour = new Date().getHours();
    let greet, sub;
    if (hour >= 5 && hour < 12) { greet = 'Good morning'; sub = 'Fresh start, fresh ideas'; }
    else if (hour >= 12 && hour < 17) { greet = 'Good afternoon'; sub = 'What can I do for you?'; }
    else if (hour >= 17 && hour < 22) { greet = 'Good evening'; sub = 'Ready when you are'; }
    else { greet = 'Working late'; sub = "I'm here with you"; }
    const g = $('greetingText');
    const s = $('greetingSub');
    if (g) g.textContent = greet;
    if (s) s.textContent = sub;
}
updateGreeting();
setInterval(updateGreeting, 60000);

// ============================================================
// PARTICLE CANVAS (120 FPS)
// ============================================================
(function initParticles() {
    const canvas = $('particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    let particles = [];
    let dpr = window.devicePixelRatio || 1;
    let lastFrame = 0;
    const FRAME_INTERVAL = 1000 / 120;

    function resize() {
        dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
    }
    resize();
    window.addEventListener('resize', resize);

    const W = () => window.innerWidth;
    const H = () => window.innerHeight;

    for (let i = 0; i < 40; i++) {
        particles.push({
            x: Math.random() * W(),
            y: Math.random() * H(),
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            size: Math.random() * 1.5 + 0.5
        });
    }

    function draw(now) {
        requestAnimationFrame(draw);
        if (now - lastFrame < FRAME_INTERVAL) return;
        lastFrame = now;

        ctx.clearRect(0, 0, W(), H());
        const isLight = document.body.classList.contains('light-mode');
        const particleColor = isLight ? 'rgba(212, 160, 23, 0.7)' : 'rgba(34, 211, 238, 0.6)';
        const lineColor = isLight ? '212, 160, 23' : '34, 211, 238';

        ctx.fillStyle = particleColor;
        ctx.shadowColor = particleColor;
        ctx.shadowBlur = 6;

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > W()) p.vx *= -1;
            if (p.y < 0 || p.y > H()) p.vy *= -1;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.shadowBlur = 0;
        for (let i = 0; i < particles.length; i++) {
            const a = particles[i];
            for (let j = i + 1; j < particles.length; j++) {
                const b = particles[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const dist2 = dx * dx + dy * dy;
                if (dist2 < 14400) {
                    const alpha = 0.15 * (1 - Math.sqrt(dist2) / 120);
                    ctx.strokeStyle = `rgba(${lineColor}, ${alpha})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }
        }
    }
    requestAnimationFrame(draw);
})();

// ============================================================
// SPARKLINE CLASS
// ============================================================
class Sparkline {
    constructor(canvasId, maxPoints = 30) {
        this.canvas = $(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d', { alpha: true });
        this.data = [];
        this.maxPoints = maxPoints;
        this._pendingDraw = false;
    }
    push(value) {
        this.data.push(value);
        if (this.data.length > this.maxPoints) this.data.shift();
        if (!this._pendingDraw) {
            this._pendingDraw = true;
            requestAnimationFrame(() => {
                this._pendingDraw = false;
                this.draw();
            });
        }
    }
    draw() {
        if (!this.canvas || !this.ctx) return;
        const isLight = document.body.classList.contains('light-mode');
        const color = isLight ? '#d4a017' : '#22d3ee';
        const w = this.canvas.width;
        const h = this.canvas.height;
        this.ctx.clearRect(0, 0, w, h);
        if (this.data.length < 2) return;

        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 1.5;
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 4;

        const stepX = w / (this.maxPoints - 1);
        this.data.forEach((v, i) => {
            const x = i * stepX;
            const y = h - (v / 100) * h;
            if (i === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
        });
        this.ctx.stroke();

        this.ctx.lineTo(w, h);
        this.ctx.lineTo(0, h);
        this.ctx.closePath();
        const grad = this.ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, isLight ? 'rgba(212, 160, 23, 0.3)' : 'rgba(34, 211, 238, 0.25)');
        grad.addColorStop(1, isLight ? 'rgba(212, 160, 23, 0)' : 'rgba(34, 211, 238, 0)');
        this.ctx.fillStyle = grad;
        this.ctx.fill();
    }
}

const cpuSpark = new Sparkline('cpuSpark');
const ramSpark = new Sparkline('ramSpark');
const batterySpark = new Sparkline('batterySpark');

// ============================================================
// STATE INDICATOR
// ============================================================
const avatarWrap = $('avatarWrap');
const voiceWave = $('voiceWave');
const stateText = $('stateText');

function setState(state) {
    if (!avatarWrap) return;
    avatarWrap.classList.remove('speaking', 'listening');
    if (voiceWave) voiceWave.classList.remove('active');

    if (state === 'speaking') {
        avatarWrap.classList.add('speaking');
        if (voiceWave) voiceWave.classList.add('active');
        if (stateText) stateText.textContent = 'Speaking';
    } else if (state === 'listening') {
        avatarWrap.classList.add('listening');
        if (voiceWave) voiceWave.classList.add('active');
        if (stateText) stateText.textContent = 'Listening';
    } else {
        if (stateText) stateText.textContent = 'Ready';
    }
}

// ============================================================
// CHAT — Core
// ============================================================
const messages = $('chatMessages');
const typingRow = $('typingRow');
const userInput = $('userInput');
const sendBtn = $('sendBtn');
const micBtn = $('micBtn');
const chatDock = $('chatDock');
const mainGrid = $('mainGrid');

const conversationHistory = [];

// ---------- ADD MESSAGE ----------
function addMessage(text, sender, useTypewriter = false) {
    if (!messages) return;
    const div = document.createElement('div');
    div.className = `msg ${sender}`;
    const author = sender === 'arya' ? 'ARYA' : 'YOU';
    const safeText = text
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>');

    div.innerHTML = `
        <div class="msg-bubble">
            <span class="msg-author">${author}</span>
            <span class="msg-text">${safeText}</span>
        </div>
    `;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;

    pushHistory(sender === 'user' ? 'user' : 'arya', text);

    // Save user messages to active chat
    if (sender === 'user' && window.ARYA_CHAT) {
        window.ARYA_CHAT.addMessage('user', text);
    }
}

function showTyping(show) {
    if (!typingRow) return;
    typingRow.style.display = show ? 'flex' : 'none';
    if (show && messages) messages.scrollTop = messages.scrollHeight;
}

/* ============================================================
   FINALIZE REPLY — markdown + highlight + copy + TTS + save
   ============================================================ */
function finalizeReply(textEl, fullReply) {
    if (!fullReply) return;

    // Markdown
    if (window.marked) {
        try {
            textEl.innerHTML = marked.parse(fullReply);
        } catch (e) {
            console.warn('[Markdown] Parse error:', e);
            textEl.textContent = fullReply;
        }
    } else {
        textEl.textContent = fullReply;
    }

    // Highlight + copy buttons
    if (window.hljs) {
        textEl.querySelectorAll('pre code').forEach((block) => {
            try { hljs.highlightElement(block); } catch (e) {}
        });
        textEl.querySelectorAll('pre').forEach((pre) => {
            const codeEl = pre.querySelector('code');
            if (!codeEl) return;

            let lang = 'code';
            if (codeEl.className) {
                const m = codeEl.className.match(/language-(\w+)/);
                if (m) lang = m[1];
            }
            pre.setAttribute('data-lang', lang);

            const btn = document.createElement('button');
            btn.className = 'copy-code-btn';
            btn.textContent = 'COPY';
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                try {
                    await navigator.clipboard.writeText(codeEl.innerText);
                    btn.textContent = 'COPIED!';
                    btn.classList.add('copied');
                    setTimeout(() => {
                        btn.textContent = 'COPY';
                        btn.classList.remove('copied');
                    }, 1500);
                } catch (err) {}
            });
            pre.appendChild(btn);
        });
    }

    // TTS speaker button
    if (typeof attachSpeakButton === 'function') {
        attachSpeakButton(textEl, fullReply);
    }

    // Save to active chat (sidebar)
    if (window.ARYA_CHAT) {
        window.ARYA_CHAT.addMessage('assistant', fullReply);
    }

    pushHistory('arya', fullReply);
}

/* ============================================================
   STREAMING MESSAGE
   ============================================================ */
async function streamMessage(text) {
    if (!messages) return;

    const div = document.createElement('div');
    div.className = 'msg arya';
    div.innerHTML = `
        <div class="msg-bubble">
            <span class="msg-author">ARYA</span>
            <span class="msg-text"></span>
        </div>
    `;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    const textEl = div.querySelector('.msg-text');
    let fullReply = '';

    try {
        const res = await fetch('/chat/stream', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });

        if (!res.ok || !res.body) throw new Error('No stream');

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const events = buffer.split('\n\n');
            buffer = events.pop() || '';

            for (const evt of events) {
                const lines = evt.split('\n');
                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;
                    let payload = line.slice(6);

                    if (payload === '[DONE]') {
                        finalizeReply(textEl, fullReply);
                        return;
                    }

                    payload = payload.replace(/\\n/g, '\n');

                    if (payload.startsWith('[ERROR]') || payload.startsWith('[STREAM ERROR]')) {
                        payload = '⚠️ Connection issue. Please try again.';
                    }

                    fullReply += payload;
                    textEl.textContent = fullReply;
                    messages.scrollTop = messages.scrollHeight;
                    await new Promise(r => setTimeout(r, window.ARYA_STREAM_DELAY ?? 40));
                }
            }
        }
    } catch (e) {
        console.error('[Stream] Error:', e);
        if (!fullReply) {
            textEl.textContent = 'Connection error. Please try again.';
        }
    }
}

/* ============================================================
   FILE UPLOAD
   ============================================================ */
window.ARYA_ATTACHED_FILE = null;

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const map = {
        pdf: 'fa-file-pdf', docx: 'fa-file-word', doc: 'fa-file-word',
        txt: 'fa-file-lines', md: 'fa-file-lines', csv: 'fa-file-csv',
        json: 'fa-file-code', py: 'fa-file-code', js: 'fa-file-code',
        html: 'fa-file-code', css: 'fa-file-code',
    };
    return map[ext] || 'fa-file';
}

function showFilePreview(file) {
    const preview = $('filePreview');
    const nameEl = $('filePreviewName');
    const sizeEl = $('filePreviewSize');
    const iconEl = $('filePreviewIcon');

    if (!preview || !file) return;

    nameEl.textContent = file.name;
    sizeEl.textContent = formatFileSize(file.size);
    iconEl.className = 'fas ' + getFileIcon(file.name);

    preview.classList.add('show');
}

function clearAttachedFile() {
    window.ARYA_ATTACHED_FILE = null;
    const preview = $('filePreview');
    if (preview) preview.classList.remove('show');
    const fileInput = $('fileInput');
    if (fileInput) fileInput.value = '';
}

async function uploadFile(file, message) {
    if (!messages) return;

    const div = document.createElement('div');
    div.className = 'msg arya';
    div.innerHTML = `
        <div class="msg-bubble">
            <span class="msg-author">ARYA</span>
            <span class="msg-text"></span>
        </div>
    `;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    const textEl = div.querySelector('.msg-text');
    let fullReply = '';

    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('message', message);

        const res = await fetch('/chat/upload', {
            method: 'POST',
            body: formData
        });

        if (!res.ok || !res.body) throw new Error('Upload failed');

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const events = buffer.split('\n\n');
            buffer = events.pop() || '';

            for (const evt of events) {
                const lines = evt.split('\n');
                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;
                    let payload = line.slice(6);

                    if (payload === '[DONE]') {
                        finalizeReply(textEl, fullReply);
                        return;
                    }

                    payload = payload.replace(/\\n/g, '\n');

                    if (payload.startsWith('[ERROR]') || payload.startsWith('[STREAM ERROR]')) {
                        payload = '⚠️ Connection issue. Please try again.';
                    }

                    fullReply += payload;
                    textEl.textContent = fullReply;
                    messages.scrollTop = messages.scrollHeight;
                    await new Promise(r => setTimeout(r, window.ARYA_STREAM_DELAY ?? 40));
                }
            }
        }
    } catch (e) {
        console.error('[Upload] Error:', e);
        if (!fullReply) {
            textEl.textContent = '⚠️ File upload failed. Please try again.';
        }
    }
}

// Wire up attach button
(function initFileUpload() {
    const attachBtn = $('attachBtn');
    const fileInput = $('fileInput');
    const previewRemove = $('filePreviewRemove');

    if (attachBtn && fileInput) {
        attachBtn.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const MAX_SIZE = 10 * 1024 * 1024;
            if (file.size > MAX_SIZE) {
                showToast('FILE TOO LARGE (10MB MAX)');
                fileInput.value = '';
                return;
            }

            window.ARYA_ATTACHED_FILE = file;
            showFilePreview(file);
        });
    }

    if (previewRemove) {
        previewRemove.addEventListener('click', clearAttachedFile);
    }
})();

// ============================================================
// SEND MESSAGE
// ============================================================
async function sendMessage() {
    if (!userInput) return;
    const text = userInput.value.trim();
    const attachedFile = window.ARYA_ATTACHED_FILE;

    if (!text && !attachedFile) return;

    userInput.value = '';
    const displayText = text || `[File: ${attachedFile ? attachedFile.name : 'attachment'}]`;
    addMessage(displayText, 'user');
    addActivity(`You: ${displayText.substring(0, 35)}${displayText.length > 35 ? '…' : ''}`);
    setState('speaking');

    try {
        if (attachedFile) {
            await uploadFile(attachedFile, text || 'Summarize this file.');
            clearAttachedFile();
        } else {
            await streamMessage(text);
        }
        addActivity(`ARYA replied`);
    } catch (e) {
        console.error('[ARYA] Chat error:', e);
        addMessage('Connection error. Please try again.', 'arya');
        addActivity('Error: connection failed');
    } finally {
        setTimeout(() => setState('idle'), 2500);
    }
}

if (sendBtn) sendBtn.addEventListener('click', sendMessage);
if (userInput) {
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
}

// ============================================================
// VOICE INPUT
// ============================================================
let recognition = null;
let isListening = false;

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SR();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
        isListening = true;
        if (micBtn) {
            micBtn.classList.add('listening');
            micBtn.innerHTML = '<i class="fas fa-stop"></i>';
        }
        setState('listening');
    };

    recognition.onresult = (e) => {
        let transcript = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
            transcript += e.results[i][0].transcript;
        }
        if (userInput) userInput.value = transcript;
        if (e.results[0].isFinal) {
            addActivity(`Voice: ${transcript.substring(0, 30)}`);
            sendMessage();
        }
    };

    recognition.onend = () => {
        isListening = false;
        if (micBtn) {
            micBtn.classList.remove('listening');
            micBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        }
        if (!typingRow || typingRow.style.display === 'none') setState('idle');
    };

    recognition.onerror = (e) => {
        console.warn('[ARYA] Voice error:', e.error);
        if (e.error !== 'no-speech') showToast('MIC ERROR');
    };
}

if (micBtn) {
    micBtn.addEventListener('click', () => {
        if (!recognition) { showToast('VOICE NOT SUPPORTED'); return; }
        if (isListening) recognition.stop();
        else { try { recognition.start(); } catch (e) { console.warn(e); } }
    });
}

// ============================================================
// QUICK ACTIONS
// ============================================================
const quickActions = [
    { label: 'Screenshot', cmd: 'screenshot', icon: 'fa-camera' },
    { label: 'System', cmd: 'system status', icon: 'fa-chart-line' },
    { label: 'Mute', cmd: 'mute', icon: 'fa-volume-mute' },
    { label: 'Vol Up', cmd: 'volume up', icon: 'fa-volume-up' },
    { label: 'Vol Down', cmd: 'volume down', icon: 'fa-volume-down' },
    { label: 'Lock PC', cmd: 'lock pc', icon: 'fa-lock' }
];

function buildQuickActions() {
    const grid = $('quickGrid');
    if (!grid) return;
    grid.innerHTML = '';
    quickActions.forEach(item => {
        const card = document.createElement('div');
        card.className = 'quick-card';
        card.innerHTML = `<i class="fas ${item.icon}"></i><span>${item.label}</span>`;
        card.addEventListener('click', () => {
            if (userInput) userInput.value = item.cmd;
            sendMessage();
        });
        grid.appendChild(card);
    });
}
buildQuickActions();

// ============================================================
// SYSTEM STATUS
// ============================================================
async function updateStatus() {
    try {
        const res = await fetch('/system_status');
        if (!res.ok) throw new Error('bad status');
        const data = await res.json();

        const battery = data.battery ?? 0;
        const bv = $('batteryValue'), bf = $('batteryFill');
        if (bv) bv.textContent = Math.round(battery) + '%';
        if (bf) bf.style.width = Math.min(100, Math.max(0, battery)) + '%';
        batterySpark.push(battery);

        const cpu = data.cpu ?? 0;
        const cv = $('cpuValue'), cf = $('cpuFill');
        if (cv) cv.textContent = Math.round(cpu) + '%';
        if (cf) cf.style.width = Math.min(100, Math.max(0, cpu)) + '%';
        cpuSpark.push(cpu);

        const ram = data.ram ?? 0;
        const rv = $('ramValue'), rf = $('ramFill');
        if (rv) rv.textContent = Math.round(ram) + '%';
        if (rf) rf.style.width = Math.min(100, Math.max(0, ram)) + '%';
        ramSpark.push(ram);

        const online = data.online !== false;
        const dot = $('statusDot'), label = $('statusLabel');
        if (dot) dot.classList.toggle('offline', !online);
        if (label) label.textContent = online ? 'ONLINE' : 'OFFLINE';

        if (data.brain) {
            const bp = $('brainProvider'), bm = $('brainModel');
            if (bp) bp.textContent = data.brain.provider || '—';
            if (bm) bm.textContent = (data.brain.model || '—').substring(0, 22);
        }
    } catch (e) {
        const dot = $('statusDot'), label = $('statusLabel');
        if (dot) dot.classList.add('offline');
        if (label) label.textContent = 'OFFLINE';
    }
}

setInterval(updateStatus, 5000);
updateStatus();

// ============================================================
// FULLSCREEN
// ============================================================
const fullscreenBtn = $('fullscreenBtn');
if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
        } else {
            document.exitFullscreen();
            fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
        }
    });
}

document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && fullscreenBtn) {
        fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
    }
});

// ============================================================
// CHAT AUTO-MINIMIZE — DISABLED (chat is locked always visible)
// ============================================================
// Feature disabled per user request: chat should stay expanded.
// (function initChatAutoMinimize() { ... })();

// ============================================================
// CHAT EXPANSION ON HOVER — DISABLED (chat is locked always visible)
// ============================================================
// Feature disabled per user request: chat should stay expanded.
// (function initChatExpansion() { ... })();

// ============================================================
// HISTORY SIDEBAR
// ============================================================
const historySidebar = $('historySidebar');
const historyItems = $('historyItems');
const historyBtn = $('historyBtn');
const closeHistory = $('closeHistory');

function pushHistory(role, text) {
    conversationHistory.push({ role, text, time: new Date() });
    renderHistory();
}

function renderHistory() {
    if (!historyItems) return;
    historyItems.innerHTML = '';
    conversationHistory.slice().reverse().forEach(h => {
        const el = document.createElement('div');
        el.className = `history-message ${h.role === 'user' ? 'user' : ''}`;
        el.innerHTML = `
            <span class="hm-role">${h.role === 'user' ? 'YOU' : 'ARYA'}</span>
            <div class="hm-text">${h.text.replace(/</g, '&lt;').replace(/\n/g, '<br>')}</div>
        `;
        historyItems.appendChild(el);
    });
}

if (historyBtn) {
    historyBtn.addEventListener('click', () => historySidebar.classList.toggle('show'));
}
if (closeHistory) {
    closeHistory.addEventListener('click', () => historySidebar.classList.remove('show'));
}

// ============================================================
// COMMAND PALETTE
// ============================================================
const cmdPalette = $('cmdPalette');
const cmdInput = $('cmdInput');
const cmdList = $('cmdList');
const commandBtn = $('commandBtn');

const COMMANDS = [
    { name: 'Screenshot', cmd: 'screenshot', icon: 'fa-camera' },
    { name: 'System Status', cmd: 'system status', icon: 'fa-chart-line' },
    { name: 'Lock PC', cmd: 'lock pc', icon: 'fa-lock' },
    { name: 'Shutdown', cmd: 'shutdown', icon: 'fa-power-off' },
    { name: 'Restart', cmd: 'restart', icon: 'fa-rotate' },
    { name: 'Volume Up', cmd: 'volume up', icon: 'fa-volume-up' },
    { name: 'Volume Down', cmd: 'volume down', icon: 'fa-volume-down' },
    { name: 'Mute', cmd: 'mute', icon: 'fa-volume-mute' },
    { name: 'Brightness Up', cmd: 'brightness up', icon: 'fa-sun' },
    { name: 'Brightness Down', cmd: 'brightness down', icon: 'fa-moon' },
    { name: 'Open YouTube', cmd: 'open youtube', icon: 'fa-youtube' },
    { name: 'Open Google', cmd: 'open google', icon: 'fa-google' },
    { name: 'Weather', cmd: 'weather', icon: 'fa-cloud-sun' },
    { name: 'Close YouTube Tab', cmd: 'close youtube tab', icon: 'fa-xmark' },
    { name: 'List Tabs', cmd: 'list tabs', icon: 'fa-list' },
    { name: 'Clear Memory', cmd: 'clear memory', icon: 'fa-broom' }
];

let selectedIndex = 0;
let filteredCommands = [...COMMANDS];

function renderCommands() {
    if (!cmdList) return;
    cmdList.innerHTML = '';
    if (filteredCommands.length === 0) {
        cmdList.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:12px;">No commands found</div>';
        return;
    }
    filteredCommands.forEach((c, i) => {
        const el = document.createElement('div');
        el.className = `cmd-item ${i === selectedIndex ? 'selected' : ''}`;
        el.innerHTML = `
            <i class="fas ${c.icon}"></i>
            <span class="cmd-name">${c.name}</span>
        `;
        el.addEventListener('click', () => runCommand(c));
        cmdList.appendChild(el);
    });
}

function runCommand(c) {
    if (cmdPalette) cmdPalette.classList.remove('show');
    if (userInput) userInput.value = c.cmd;
    sendMessage();
    if (cmdInput) cmdInput.value = '';
    selectedIndex = 0;
    filteredCommands = [...COMMANDS];
}

function openPalette() {
    if (!cmdPalette) return;
    cmdPalette.classList.add('show');
    if (cmdInput) cmdInput.value = '';
    selectedIndex = 0;
    filteredCommands = [...COMMANDS];
    renderCommands();
    setTimeout(() => cmdInput && cmdInput.focus(), 100);
}

function closePalette() { if (cmdPalette) cmdPalette.classList.remove('show'); }

if (commandBtn) commandBtn.addEventListener('click', openPalette);

if (cmdInput) {
    cmdInput.addEventListener('input', () => {
        const q = cmdInput.value.toLowerCase();
        filteredCommands = COMMANDS.filter(c =>
            c.name.toLowerCase().includes(q) || c.cmd.toLowerCase().includes(q)
        );
        selectedIndex = 0;
        renderCommands();
    });

    cmdInput.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, filteredCommands.length - 1);
            renderCommands();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, 0);
            renderCommands();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredCommands[selectedIndex]) runCommand(filteredCommands[selectedIndex]);
        } else if (e.key === 'Escape') closePalette();
    });
}

if (cmdPalette) {
    cmdPalette.addEventListener('click', (e) => {
        if (e.target === cmdPalette) closePalette();
    });
}

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        if (cmdPalette && cmdPalette.classList.contains('show')) closePalette();
        else openPalette();
    }
});

// ============================================================
// WAKE INDICATOR
// ============================================================
const wakeIndicator = $('wakeIndicator');
function setWakeActive(active) {
    if (wakeIndicator) wakeIndicator.classList.toggle('active', active);
}

function checkWakeWord(text) {
    const lower = text.toLowerCase();
    if (lower.includes('arya') || lower.includes('nova')) {
        setWakeActive(true);
        setTimeout(() => setWakeActive(false), 2000);
    }
}

if (userInput) {
    userInput.addEventListener('input', () => checkWakeWord(userInput.value));
}

// ============================================================
// EASTER EGG
// ============================================================
let easterCount = 0;
if (userInput) {
    userInput.addEventListener('input', () => {
        if (userInput.value.toLowerCase().trim() === 'arya') {
            easterCount++;
            if (easterCount >= 3) {
                showToast('✦ HELLO BESTIE ✦', 3000);
                document.body.style.animation = 'glowAll 2s ease';
                setTimeout(() => document.body.style.animation = '', 2000);
                easterCount = 0;
            }
        } else {
            easterCount = 0;
        }
    });
}

const glowStyle = document.createElement('style');
glowStyle.textContent = `
    @keyframes glowAll {
        0%, 100% { filter: brightness(1); }
        50% { filter: brightness(1.3) hue-rotate(20deg); }
    }
`;
document.head.appendChild(glowStyle);

// ============================================================
// WELCOME / INIT
// ============================================================
window.addEventListener('load', () => {
    setTimeout(() => {
        const ls = $('loadingScreen');
        if (ls) ls.classList.add('hidden');
    }, 1600);

    setTimeout(() => {
        addActivity('ARYA is online and ready');
        showToast('SYSTEM READY');
    }, 2200);
});

// ============================================================
// SETTINGS PANEL
// ============================================================
(function initSettingsPanel() {
    const settingsBtn = $('settingsBtn');
    const panel = $('settingsPanel');
    const overlay = $('settingsOverlay');
    const closeBtn = $('settingsClose');

    if (!settingsBtn || !panel || !overlay) return;

    function openPanel() {
        panel.classList.add('show');
        overlay.classList.add('show');
        updateInfo();
    }

    function closePanel() {
        panel.classList.remove('show');
        overlay.classList.remove('show');
    }

    settingsBtn.addEventListener('click', openPanel);
    if (closeBtn) closeBtn.addEventListener('click', closePanel);
    overlay.addEventListener('click', closePanel);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && panel.classList.contains('show')) closePanel();
    });

    // Theme options
    const themeOptions = panel.querySelectorAll('[data-setting="theme"] .settings-option');
    themeOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            const value = opt.dataset.value;
            themeOptions.forEach(o => o.classList.remove('active'));
            opt.classList.add('active');

            if (value === 'auto') {
                localStorage.removeItem('arya-theme-override');
                if (window.aryaApplyTheme) window.aryaApplyTheme(true);
                showToast('THEME: AUTO');
            } else {
                const mode = value === 'day' ? 'day' : 'night';
                localStorage.setItem('arya-theme-override', mode);
                if (window.aryaApplyTheme) window.aryaApplyTheme(true);
                showToast(value === 'day' ? '☀️ DAY MODE' : '🌙 NIGHT MODE');
            }
        });
    });

    // Speed slider
    const speedSlider = $('speedSlider');
    const speedValue = $('speedValue');
    if (speedSlider) {
        const savedSpeed = localStorage.getItem('arya-speed-delay');
        if (savedSpeed !== null) {
            speedSlider.value = savedSpeed;
            if (speedValue) speedValue.textContent = savedSpeed + 'ms';
        }

        speedSlider.addEventListener('input', () => {
            const val = speedSlider.value;
            if (speedValue) speedValue.textContent = val + 'ms';
        });

        speedSlider.addEventListener('change', () => {
            const val = speedSlider.value;
            localStorage.setItem('arya-speed-delay', val);
            window.ARYA_STREAM_DELAY = parseInt(val, 10);
            showToast(`SPEED: ${val}ms`);
        });

        window.ARYA_STREAM_DELAY = parseInt(speedSlider.value, 10);
    }

    // Clear memory
    const clearBtn = $('clearMemoryBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', async () => {
            if (!confirm('Clear conversation memory?')) return;
            try {
                await fetch('/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: 'clear memory' })
                });
                if (Array.isArray(conversationHistory)) conversationHistory.length = 0;
                renderHistory();
                if (window.ARYA_CHAT && window.ARYA_CHAT.clearActiveChat) {
                    window.ARYA_CHAT.clearActiveChat();
                }
                showToast('MEMORY CLEARED');
            } catch (e) {
                showToast('FAILED TO CLEAR');
            }
        });
    }

    // Export chat
    const exportBtn = $('exportChatBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            try {
                const activeChat = window.ARYA_CHAT && window.ARYA_CHAT.getActiveChat
                    ? window.ARYA_CHAT.getActiveChat()
                    : null;
                const data = {
                    exported_at: new Date().toISOString(),
                    messages: activeChat ? activeChat.messages : conversationHistory
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
                a.href = url;
                a.download = `arya_chat_${stamp}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                showToast('CHAT EXPORTED');
            } catch (e) {
                showToast('EXPORT FAILED');
            }
        });
    }

    async function updateInfo() {
        try {
            const res = await fetch('/system_status');
            const data = await res.json();
            if (data.brain) {
                const prov = $('settingsProvider');
                const mod = $('settingsModel');
                if (prov) prov.textContent = data.brain.provider || '—';
                if (mod) mod.textContent = (data.brain.model || '—').substring(0, 24);
            }
        } catch (e) {}
    }

    function loadSavedSettings() {
        const savedTheme = localStorage.getItem('arya-theme-override');
        themeOptions.forEach(opt => {
            if (savedTheme === null && opt.dataset.value === 'auto') {
                opt.classList.add('active');
            } else if (savedTheme && opt.dataset.value === savedTheme) {
                opt.classList.add('active');
            }
        });
    }

    loadSavedSettings();
})();

// ============================================================
// TEXT-TO-SPEECH
// ============================================================
let _currentSpeakingBtn = null;
let _currentSpeakingUtterance = null;

function isTTSAvailable() {
    return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

function pickVoice() {
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    const preferredNames = [
        'Microsoft Swara Online (Natural)',
        'Microsoft Aria Online (Natural)',
        'Microsoft Neerja Online (Natural)',
        'Microsoft Heera Online (Natural)',
        'Microsoft Swara', 'Microsoft Heera', 'Microsoft Zira', 'Microsoft Hazel',
        'Google हिन्दी', 'Google Hindi',
        'Google UK English Female', 'Google US English',
        'Samantha', 'Karen', 'Tessa', 'Moira',
    ];

    for (const pref of preferredNames) {
        const v = voices.find(v => v.name && v.name.includes(pref));
        if (v) return v;
    }

    const female = voices.find(v => /female|woman|girl|zira|swara|heera|aria|neerja/i.test(v.name));
    return female || voices[0];
}

function stripMarkdownForSpeech(text) {
    if (!text) return '';
    return text
        .replace(/```[\s\S]*?```/g, ' code block ')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/__([^_]+)__/g, '$1')
        .replace(/_([^_]+)_/g, '$1')
        .replace(/^#{1,6}\s+/gm, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
        .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
        .replace(/[\u{2600}-\u{26FF}]/gu, '')
        .replace(/[\u{2700}-\u{27BF}]/gu, '')
        .replace(/^\s*[-*+]\s+/gm, '')
        .replace(/^\s*\d+\.\s+/gm, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function stopSpeaking() {
    if (!isTTSAvailable()) return;
    window.speechSynthesis.cancel();
    if (_currentSpeakingBtn) {
        _currentSpeakingBtn.classList.remove('speaking');
        _currentSpeakingBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        _currentSpeakingBtn = null;
    }
    _currentSpeakingUtterance = null;
}

function speakText(text, btnEl) {
    if (!isTTSAvailable()) { showToast('TTS NOT SUPPORTED'); return; }

    if (_currentSpeakingBtn === btnEl && window.speechSynthesis.speaking) {
        stopSpeaking();
        return;
    }

    stopSpeaking();

    const cleanText = stripMarkdownForSpeech(text);
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voice = pickVoice();
    if (voice) utterance.voice = voice;
    utterance.rate = 2.0;
    utterance.pitch = 1.05;
    utterance.volume = 1.0;
    utterance.lang = voice ? voice.lang : 'en-IN';

    utterance.onstart = () => {
        if (btnEl) {
            btnEl.classList.add('speaking');
            btnEl.innerHTML = '<i class="fas fa-stop"></i>';
        }
        _currentSpeakingBtn = btnEl;
    };

    utterance.onend = () => {
        if (btnEl) {
            btnEl.classList.remove('speaking');
            btnEl.innerHTML = '<i class="fas fa-volume-up"></i>';
        }
        if (_currentSpeakingBtn === btnEl) _currentSpeakingBtn = null;
        _currentSpeakingUtterance = null;
    };

    utterance.onerror = () => {
        if (btnEl) {
            btnEl.classList.remove('speaking');
            btnEl.innerHTML = '<i class="fas fa-volume-up"></i>';
        }
        _currentSpeakingBtn = null;
    };

    _currentSpeakingUtterance = utterance;
    window.speechSynthesis.speak(utterance);
}

function attachSpeakButton(textEl, rawText) {
    if (!textEl) return;
    if (textEl.parentElement.querySelector('.speak-btn')) return;

    const btn = document.createElement('button');
    btn.className = 'speak-btn';
    btn.title = 'Read aloud';
    btn.innerHTML = '<i class="fas fa-volume-up"></i>';

    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        speakText(rawText, btn);
    });

    textEl.parentElement.appendChild(btn);
}

if (isTTSAvailable()) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {};
}

// ============================================================
// MULTI-CHAT SIDEBAR
// ============================================================
(function initChatSidebar() {
    const sidebar = $('chatSidebar');
    const overlay = $('chatSidebarOverlay');
    const toggleBtn = $('sidebarToggle');
    const closeBtn = $('sidebarClose');
    const newChatBtn = $('newChatBtn');
    const chatList = $('chatList');
    const searchInput = $('chatSearchInput');
    const chatCount = $('chatCount');

    if (!sidebar || !chatList) return;

    const STORAGE_KEY = 'arya-chats';
    const ACTIVE_KEY = 'arya-active-chat';
    let allChats = [];
    let activeChatId = null;
    let searchQuery = '';

    // ----------------------------------------------------------
    // LOAD CHATS — localStorage first, backend fallback
    // ----------------------------------------------------------
    async function loadChats() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            allChats = raw ? JSON.parse(raw) : [];
        } catch (e) { allChats = []; }
        activeChatId = localStorage.getItem(ACTIVE_KEY) || null;

        if (allChats.length === 0) {
            try {
                const res = await fetch('/chat/history');
                if (res.ok) {
                    const data = await res.json();
                    if (data.chats && data.chats.length > 0) {
                        allChats = data.chats;
                        activeChatId = data.active_chat_id || allChats[0].id;
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(allChats));
                        localStorage.setItem(ACTIVE_KEY, activeChatId);
                        console.log('[Chats] Restored from backend:', allChats.length);
                    }
                }
            } catch (e) {
                console.warn('[Chats] Backend load failed:', e);
            }
        }

        if (allChats.length === 0) {
            createNewChat(false);
        } else if (!activeChatId || !allChats.find(c => c.id === activeChatId)) {
            activeChatId = allChats[0].id;
            localStorage.setItem(ACTIVE_KEY, activeChatId);
        }
    }

    // ----------------------------------------------------------
    // SAVE CHATS — localStorage + backend sync
    // ----------------------------------------------------------
    function saveChats() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(allChats));
            if (activeChatId) localStorage.setItem(ACTIVE_KEY, activeChatId);

            fetch('/chat/history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chats: allChats,
                    active_chat_id: activeChatId,
                }),
            }).catch((err) => console.warn('[Chats] Backend sync failed:', err));
        } catch (e) {
            console.warn('[Sidebar] Failed to save chats:', e);
        }
    }

    function generateId() {
        return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    }

    function createNewChat(switchTo = true) {
        const newChat = {
            id: generateId(),
            title: 'New Chat',
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        allChats.unshift(newChat);
        if (switchTo) {
            activeChatId = newChat.id;
            localStorage.setItem(ACTIVE_KEY, newChat.id);
        }
        saveChats();
        renderChatList();
        if (switchTo) clearChatUI();
        return newChat;
    }

    function switchChat(chatId) {
        const chat = allChats.find(c => c.id === chatId);
        if (!chat) return;

        activeChatId = chatId;
        localStorage.setItem(ACTIVE_KEY, chatId);
        renderChatList();
        loadChatIntoUI(chat);
    }

    function deleteChat(chatId) {
        const idx = allChats.findIndex(c => c.id === chatId);
        if (idx === -1) return;

        const chat = allChats[idx];
        if (!confirm(`Delete "${chat.title}"?`)) return;

        allChats.splice(idx, 1);
        if (activeChatId === chatId) {
            if (allChats.length > 0) {
                activeChatId = allChats[0].id;
                localStorage.setItem(ACTIVE_KEY, activeChatId);
                loadChatIntoUI(allChats[0]);
            } else {
                createNewChat(true);
                return;
            }
        }
        saveChats();
        renderChatList();
    }

    function renameChat(chatId) {
        const chat = allChats.find(c => c.id === chatId);
        if (!chat) return;
        const newTitle = prompt('Rename chat:', chat.title);
        if (!newTitle || !newTitle.trim()) return;
        chat.title = newTitle.trim().substring(0, 60);
        chat.updatedAt = Date.now();
        saveChats();
        renderChatList();
    }

    function renderChatList() {
        chatList.innerHTML = '';

        let filtered = allChats;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = allChats.filter(c => c.title.toLowerCase().includes(q));
        }

        if (filtered.length === 0) {
            chatList.innerHTML = `
                <div class="chat-list-empty">
                    <i class="fas fa-comments"></i>
                    ${searchQuery ? 'No chats match your search' : 'No chats yet. Click "New Chat" to start!'}
                </div>
            `;
        } else {
            filtered.forEach(chat => {
                const item = document.createElement('div');
                item.className = 'chat-item' + (chat.id === activeChatId ? ' active' : '');
                item.dataset.chatId = chat.id;

                const date = new Date(chat.updatedAt);
                const dateStr = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

                item.innerHTML = `
                    <div class="chat-item-icon"><i class="fas fa-comment"></i></div>
                    <div class="chat-item-body">
                        <div class="chat-item-title">${escapeHtml(chat.title)}</div>
                        <div class="chat-item-meta">${dateStr} · ${chat.messages.length} msgs</div>
                    </div>
                    <button class="chat-item-delete" title="Delete"><i class="fas fa-trash"></i></button>
                `;

                item.addEventListener('click', (e) => {
                    if (e.target.closest('.chat-item-delete')) return;
                    switchChat(chat.id);
                    closeSidebar();
                });

                item.addEventListener('dblclick', (e) => {
                    if (e.target.closest('.chat-item-delete')) return;
                    renameChat(chat.id);
                });

                const delBtn = item.querySelector('.chat-item-delete');
                delBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteChat(chat.id);
                });

                chatList.appendChild(item);
            });
        }

        if (chatCount) {
            chatCount.textContent = `${allChats.length} chat${allChats.length === 1 ? '' : 's'}`;
        }
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function clearChatUI() {
        if (!messages) return;
        messages.innerHTML = `
            <div class="msg arya">
                <div class="msg-bubble">
                    <span class="msg-author">ARYA</span>
                    <span class="msg-text">Hey! I'm ARYA. Ask me anything, or say "Arya" to wake me up.</span>
                </div>
            </div>
        `;
    }

    function loadChatIntoUI(chat) {
        if (!messages) return;
        messages.innerHTML = '';

        if (chat.messages.length === 0) {
            clearChatUI();
            return;
        }

        chat.messages.forEach(msg => {
            const div = document.createElement('div');
            div.className = `msg ${msg.role === 'user' ? 'user' : 'arya'}`;
            const author = msg.role === 'user' ? 'YOU' : 'ARYA';

            let contentHtml;
            if (msg.role === 'user') {
                contentHtml = escapeHtml(msg.content).replace(/\n/g, '<br>');
            } else {
                if (window.marked) {
                    try {
                        contentHtml = marked.parse(msg.content);
                    } catch (e) {
                        contentHtml = escapeHtml(msg.content).replace(/\n/g, '<br>');
                    }
                } else {
                    contentHtml = escapeHtml(msg.content).replace(/\n/g, '<br>');
                }
            }

            div.innerHTML = `
                <div class="msg-bubble">
                    <span class="msg-author">${author}</span>
                    <span class="msg-text">${contentHtml}</span>
                </div>
            `;
            messages.appendChild(div);
        });

        if (window.hljs) {
            messages.querySelectorAll('pre code').forEach((block) => {
                try { hljs.highlightElement(block); } catch (e) {}
            });
        }

        messages.scrollTop = messages.scrollHeight;
    }

    function openSidebar() {
        sidebar.classList.add('show');
        if (overlay) overlay.classList.add('show');
    }

    function closeSidebar() {
        sidebar.classList.remove('show');
        if (overlay) overlay.classList.remove('show');
    }

    if (toggleBtn) toggleBtn.addEventListener('click', openSidebar);
    if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
    if (overlay) overlay.addEventListener('click', closeSidebar);

    if (newChatBtn) {
        newChatBtn.addEventListener('click', () => {
            createNewChat(true);
            closeSidebar();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            searchQuery = searchInput.value.trim();
            renderChatList();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('show')) closeSidebar();
    });

    window.ARYA_CHAT = {
        getActiveChat: () => allChats.find(c => c.id === activeChatId),
        addMessage: (role, content) => {
            const chat = allChats.find(c => c.id === activeChatId);
            if (!chat) return;
            chat.messages.push({ role, content, time: Date.now() });
            chat.updatedAt = Date.now();

            if (chat.title === 'New Chat' && role === 'user' && content) {
                chat.title = content.substring(0, 40).trim() + (content.length > 40 ? '…' : '');
            }

            saveChats();
            renderChatList();
        },
        clearActiveChat: () => {
            const chat = allChats.find(c => c.id === activeChatId);
            if (chat) {
                chat.messages = [];
                chat.updatedAt = Date.now();
                saveChats();
                renderChatList();
            }
        },
    };

    // Init — async load
    (async () => {
        await loadChats();
        renderChatList();
        console.log('[Sidebar] Initialized with', allChats.length, 'chats');
    })();
})();

// ============================================================
// VIRTUAL KEYBOARD — Jarvis Style
//   - Toggle button (bottom-right)
//   - Drag via top handle
//   - Resize via 4 corners
//   - Save/load position & size (localStorage)
//   - Caps/Shift state
//   - Auto-focus into chat input
// ============================================================
(function initVirtualKeyboard() {
    const vkContainer   = $('vkContainer');
    const vkToggleBtn   = $('vkToggleBtn');
    const vkDragHandle  = $('vkDragHandle');
    const vkMinimizeBtn = $('vkMinimizeBtn');
    const vkCloseBtn    = $('vkCloseBtn');
    const vkBody        = $('vkBody');

    if (!vkContainer || !vkToggleBtn) {
        console.warn('[VK] Elements not found');
        return;
    }

    const userInputEl = $('userInput');

    const STORAGE_POS  = 'arya-vk-position';
    const STORAGE_SIZE = 'arya-vk-size';
    const STORAGE_VIS  = 'arya-vk-visible';

    let isCapsOn  = false;
    let isShiftOn = false;

    function savePosition(left, top) {
        try { localStorage.setItem(STORAGE_POS, JSON.stringify({ left, top })); } catch (e) {}
    }

    function saveSize(width, height) {
        try { localStorage.setItem(STORAGE_SIZE, JSON.stringify({ width, height })); } catch (e) {}
    }

    function loadPosition() {
        try {
            const raw = localStorage.getItem(STORAGE_POS);
            return raw ? JSON.parse(raw) : null;
        } catch (e) { return null; }
    }

    function loadSize() {
        try {
            const raw = localStorage.getItem(STORAGE_SIZE);
            return raw ? JSON.parse(raw) : null;
        } catch (e) { return null; }
    }

    function applySavedLayout() {
        vkContainer.style.transform = '';
        vkContainer.style.left = '';
        vkContainer.style.top = '';
        vkContainer.style.right = '';
        vkContainer.style.bottom = '';

        const pos = loadPosition();
        if (pos && typeof pos.left === 'number' && typeof pos.top === 'number') {
            vkContainer.style.left = pos.left + 'px';
            vkContainer.style.top = pos.top + 'px';
            vkContainer.style.bottom = 'auto';
            vkContainer.style.transform = 'none';
        }

        const size = loadSize();
        if (size && typeof size.width === 'number' && typeof size.height === 'number') {
            vkContainer.style.width = size.width + 'px';
            vkContainer.style.height = size.height + 'px';
        }
    }

    applySavedLayout();

    function updateToggleState(visible) {
        if (visible) {
            vkContainer.classList.remove('vk-hidden');
            vkToggleBtn.classList.add('active');
        } else {
            vkContainer.classList.add('vk-hidden');
            vkToggleBtn.classList.remove('active');
        }
    }

    const savedVis = localStorage.getItem(STORAGE_VIS);
    updateToggleState(savedVis !== 'false');

    vkToggleBtn.addEventListener('click', () => {
        const isHidden = vkContainer.classList.contains('vk-hidden');
        const nowVisible = isHidden;
        updateToggleState(nowVisible);
        try { localStorage.setItem(STORAGE_VIS, nowVisible ? 'true' : 'false'); } catch (e) {}
    });

    if (vkMinimizeBtn) {
        vkMinimizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            updateToggleState(false);
            try { localStorage.setItem(STORAGE_VIS, 'false'); } catch (err) {}
        });
    }

    if (vkCloseBtn) {
        vkCloseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            updateToggleState(false);
            try { localStorage.setItem(STORAGE_VIS, 'false'); } catch (err) {}
        });
    }

    // ---- Drag via handle ----
    let dragging = false;
    let dragStartX = 0, dragStartY = 0;
    let dragStartLeft = 0, dragStartTop = 0;

    if (vkDragHandle) {
        vkDragHandle.addEventListener('mousedown', (e) => {
            if (e.target.closest('.vk-ctrl-btn')) return;

            dragging = true;
            const rect = vkContainer.getBoundingClientRect();

            vkContainer.style.left = rect.left + 'px';
            vkContainer.style.top = rect.top + 'px';
            vkContainer.style.bottom = 'auto';
            vkContainer.style.transform = 'none';

            dragStartX = e.clientX;
            dragStartY = e.clientY;
            dragStartLeft = rect.left;
            dragStartTop = rect.top;

            document.body.style.cursor = 'grabbing';
            vkDragHandle.style.cursor = 'grabbing';
            e.preventDefault();
        });
    }

    document.addEventListener('mousemove', (e) => {
        if (!dragging) return;

        const dx = e.clientX - dragStartX;
        const dy = e.clientY - dragStartY;

        let newLeft = dragStartLeft + dx;
        let newTop = dragStartTop + dy;

        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const w = vkContainer.offsetWidth;
        const h = vkContainer.offsetHeight;

        newLeft = Math.max(0, Math.min(vw - w, newLeft));
        newTop = Math.max(0, Math.min(vh - h, newTop));

        vkContainer.style.left = newLeft + 'px';
        vkContainer.style.top = newTop + 'px';
    });

    document.addEventListener('mouseup', () => {
        if (dragging) {
            dragging = false;
            document.body.style.cursor = '';
            if (vkDragHandle) vkDragHandle.style.cursor = 'move';

            const rect = vkContainer.getBoundingClientRect();
            savePosition(rect.left, rect.top);
        }
    });

    // ---- Resize via 4 corners ----
    const resizeHandles = vkContainer.querySelectorAll('.vk-resize-handle');

    let resizing = false;
    let resizeDir = null;
    let resizeStartX = 0, resizeStartY = 0;
    let resizeStartLeft = 0, resizeStartTop = 0;
    let resizeStartWidth = 0, resizeStartHeight = 0;

    const MIN_WIDTH = 400;
    const MIN_HEIGHT = 180;

    resizeHandles.forEach(handle => {
        handle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();

            resizing = true;
            resizeDir = handle.dataset.corner;

            const rect = vkContainer.getBoundingClientRect();

            vkContainer.style.left = rect.left + 'px';
            vkContainer.style.top = rect.top + 'px';
            vkContainer.style.bottom = 'auto';
            vkContainer.style.transform = 'none';

            resizeStartX = e.clientX;
            resizeStartY = e.clientY;
            resizeStartLeft = rect.left;
            resizeStartTop = rect.top;
            resizeStartWidth = rect.width;
            resizeStartHeight = rect.height;
        });
    });

    document.addEventListener('mousemove', (e) => {
        if (!resizing) return;

        const dx = e.clientX - resizeStartX;
        const dy = e.clientY - resizeStartY;

        let newLeft = resizeStartLeft;
        let newTop = resizeStartTop;
        let newWidth = resizeStartWidth;
        let newHeight = resizeStartHeight;

        if (resizeDir === 'br') {
            newWidth  = Math.max(MIN_WIDTH,  resizeStartWidth  + dx);
            newHeight = Math.max(MIN_HEIGHT, resizeStartHeight + dy);
        }
        else if (resizeDir === 'bl') {
            newWidth  = Math.max(MIN_WIDTH,  resizeStartWidth  - dx);
            newHeight = Math.max(MIN_HEIGHT, resizeStartHeight + dy);
            newLeft   = resizeStartLeft + (resizeStartWidth - newWidth);
        }
        else if (resizeDir === 'tr') {
            newWidth  = Math.max(MIN_WIDTH,  resizeStartWidth  + dx);
            newHeight = Math.max(MIN_HEIGHT, resizeStartHeight - dy);
            newTop    = resizeStartTop + (resizeStartHeight - newHeight);
        }
        else if (resizeDir === 'tl') {
            newWidth  = Math.max(MIN_WIDTH,  resizeStartWidth  - dx);
            newHeight = Math.max(MIN_HEIGHT, resizeStartHeight - dy);
            newLeft   = resizeStartLeft + (resizeStartWidth - newWidth);
            newTop    = resizeStartTop + (resizeStartHeight - newHeight);
        }

        newLeft = Math.max(0, newLeft);
        newTop  = Math.max(0, newTop);

        vkContainer.style.left = newLeft + 'px';
        vkContainer.style.top = newTop + 'px';
        vkContainer.style.width = newWidth + 'px';
        vkContainer.style.height = newHeight + 'px';
    });

    document.addEventListener('mouseup', () => {
        if (resizing) {
            resizing = false;
            resizeDir = null;

            const rect = vkContainer.getBoundingClientRect();
            savePosition(rect.left, rect.top);
            saveSize(rect.width, rect.height);
        }
    });

    // ---- Key press handling ----
    if (vkBody) {
        vkBody.addEventListener('click', (e) => {
            const keyBtn = e.target.closest('.vk-key');
            if (!keyBtn) return;

            e.preventDefault();
            const key = keyBtn.dataset.key;
            if (!key) return;

            keyBtn.classList.add('vk-pressed');
            setTimeout(() => keyBtn.classList.remove('vk-pressed'), 200);

            handleKeyPress(key, keyBtn);
        });
    }

    function handleKeyPress(key, keyBtn) {
        if (!userInputEl) return;

        if (key === 'Backspace') {
            userInputEl.value = userInputEl.value.slice(0, -1);
        }
        else if (key === 'Enter') {
            if (typeof sendMessage === 'function') sendMessage();
        }
        else if (key === 'Tab') {
            userInputEl.value += '    ';
        }
        else if (key === 'CapsLock') {
            isCapsOn = !isCapsOn;
            keyBtn.classList.toggle('vk-active', isCapsOn);
            updateLetterCase();
            return;
        }
        else if (key === 'Shift' || key === 'ShiftRight') {
            isShiftOn = !isShiftOn;
            const shiftBtns = vkBody.querySelectorAll('[data-key="Shift"], [data-key="ShiftRight"]');
            shiftBtns.forEach(b => b.classList.toggle('vk-active', isShiftOn));
            updateLetterCase();
            return;
        }
        else if (key === ' ') {
            userInputEl.value += ' ';
        }
        else {
            let char = key;
            if (char.length === 1 && /[a-z]/i.test(char)) {
                const shouldUpper = isCapsOn || isShiftOn;
                char = shouldUpper ? char.toUpperCase() : char.toLowerCase();
            }
            userInputEl.value += char;

            if (isShiftOn && !isCapsOn) {
                isShiftOn = false;
                const shiftBtns = vkBody.querySelectorAll('[data-key="Shift"], [data-key="ShiftRight"]');
                shiftBtns.forEach(b => b.classList.remove('vk-active'));
                updateLetterCase();
            }
        }

        userInputEl.focus();
        try {
            userInputEl.setSelectionRange(userInputEl.value.length, userInputEl.value.length);
        } catch (e) {}
    }

    function updateLetterCase() {
        if (!vkBody) return;
        const shouldUpper = isCapsOn || isShiftOn;

        vkBody.querySelectorAll('.vk-key').forEach(btn => {
            const key = btn.dataset.key;
            if (!key) return;
            if (key.length === 1 && /[a-z]/i.test(key)) {
                btn.textContent = shouldUpper ? key.toUpperCase() : key.toLowerCase();
            }
        });
    }

    updateLetterCase();

    if (vkBody) {
        vkBody.addEventListener('mousedown', (e) => {
            if (e.target.closest('.vk-key')) {
                e.stopPropagation();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !vkContainer.classList.contains('vk-hidden')) {
            if (document.activeElement !== userInputEl) {
                updateToggleState(false);
                try { localStorage.setItem(STORAGE_VIS, 'false'); } catch (err) {}
            }
        }
        if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            const isHidden = vkContainer.classList.contains('vk-hidden');
            updateToggleState(isHidden);
            try { localStorage.setItem(STORAGE_VIS, isHidden ? 'true' : 'false'); } catch (err) {}
        }
    });

    if (vkDragHandle) {
        vkDragHandle.addEventListener('dblclick', (e) => {
            if (e.target.closest('.vk-ctrl-btn')) return;
            try {
                localStorage.removeItem(STORAGE_POS);
                localStorage.removeItem(STORAGE_SIZE);
            } catch (err) {}
            vkContainer.style.left = '';
            vkContainer.style.top = '';
            vkContainer.style.width = '';
            vkContainer.style.height = '';
            vkContainer.style.bottom = '80px';
            vkContainer.style.transform = 'translateX(-50%)';
            showToast('KEYBOARD RESET');
        });
    }

    console.log('[VK] Virtual keyboard initialized ✅');
})();

console.log('[ARYA] Frontend initialized ✅');