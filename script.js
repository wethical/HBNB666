// 滚动淡入
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('show');
  });
}, { threshold: 0.08 });

document.querySelectorAll('.version').forEach(v => io.observe(v));

// 首屏直接显示第一个版本
document.querySelector('.version').classList.add('show');

/* ================= 背景音乐（默认开启） =================
   使用 Web Audio 实时生成的黑白风格氛围音乐，无需音频文件。
   默认尝试自动播放；若浏览器拦截自动播放，则在用户首次交互时立即开启。 */

(function () {
  let ctx = null, master = null, timer = null, started = false, playing = false;

  // ---- 音符频率表 ----
  const F = n => 440 * Math.pow(2, (n - 69) / 12);

  // 氛围和弦进行（MIDI 音高，小调，冷静黑白感）
  const chords = [
    [45, 52, 57, 60],  // Am
    [41, 48, 53, 57],  // F
    [43, 50, 55, 59],  // G
    [40, 47, 52, 56],  // Em
  ];
  // 旋律音阶（A 小调五声）
  const scale = [57, 60, 62, 64, 67, 69, 72, 74];

  function initAudio() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0;
    // 轻度滤波让音色更柔和
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2400;
    master.connect(lp).connect(ctx.destination);
  }

  // ---- 长音铺底（和弦 pad）----
  function pad(notes, dur) {
    const t = ctx.currentTime;
    notes.forEach((n, i) => {
      const o = ctx.createOscillator();
      o.type = i === 0 ? 'sine' : 'triangle';
      o.frequency.value = F(n);
      // 轻微失谐制造厚度
      o.detune.value = (i % 2 ? 4 : -4);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.05, t + dur * 0.4);
      g.gain.linearRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(master);
      o.start(t); o.stop(t + dur + 0.1);
    });
  }

  // ---- 点缀旋律（随机五声音阶拨弦）----
  function pluck() {
    const n = scale[Math.floor(Math.random() * scale.length)] + 12;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = F(n);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.08, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
    o.connect(g).connect(master);
    o.start(t); o.stop(t + 1.5);
  }

  function schedule() {
    let bar = 0;
    const barDur = 4.2; // 每个小节时长（秒）
    function next() {
      pad(chords[bar % chords.length], barDur + 0.6);
      // 每小节随机弹 1~2 个旋律音
      const cnt = 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < cnt; i++) {
        setTimeout(pluck, Math.random() * barDur * 1000 * 0.8);
      }
      bar++;
      timer = setTimeout(next, barDur * 1000);
    }
    next();
  }

  function start() {
    if (!started) {
      initAudio();
      schedule();
      started = true;
    } else if (ctx.state === 'suspended') {
      ctx.resume();
    }
    // 淡入
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 1.2);
    playing = true;
    btn.classList.add('playing');
    btn.classList.remove('paused');
  }

  function stop() {
    if (!started) return;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
    playing = false;
    btn.classList.add('paused');
    btn.classList.remove('playing');
  }

  // ---- UI ----
  const btn = document.createElement('button');
  btn.className = 'music-btn';
  btn.title = '背景音乐 开/关';
  btn.innerHTML = '<span class="note">&#9835;</span>';
  document.body.appendChild(btn);

  const tip = document.createElement('div');
  tip.className = 'music-tip';
  document.body.appendChild(tip);

  let tipTimer = null;
  function showTip(text) {
    tip.textContent = text;
    tip.classList.add('show');
    clearTimeout(tipTimer);
    tipTimer = setTimeout(() => tip.classList.remove('show'), 1800);
  }

  btn.addEventListener('click', () => {
    playing ? (stop(), showTip('音乐已关闭')) : (start(), showTip('音乐已开启'));
  });

  // ---- 默认开启：先尝试自动播放，被拦截则首次交互立即播放 ----
  function autoStart() {
    showTip('背景音乐播放中 ♪');
  }
  try {
    start();
    if (ctx && ctx.state === 'suspended') {
      // 自动播放被浏览器拦截：挂起状态，等首次交互
      stop();
      const kick = () => {
        document.removeEventListener('pointerdown', kick);
        document.removeEventListener('keydown', kick);
        start();
        autoStart();
      };
      document.addEventListener('pointerdown', kick);
      document.addEventListener('keydown', kick);
    } else {
      setTimeout(autoStart, 400);
    }
  } catch (e) {
    const kick = () => {
      document.removeEventListener('pointerdown', kick);
      start();
      autoStart();
    };
    document.addEventListener('pointerdown', kick);
  }
})();