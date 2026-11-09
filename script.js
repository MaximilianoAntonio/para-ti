/**
 * ========================================================
 * ARTE ASCII GLOW - MOTOR INTERACTIVO Y MÚSICA PROCEDURAL
 * Optimizado para dispositivos móviles y GitHub Pages
 * ========================================================
 */

(function () {
  'use strict';

  // Elementos DOM
  const introScreen = document.getElementById('intro-screen');
  const openBtn = document.getElementById('open-btn');
  const viewport = document.getElementById('viewport');
  const artContainer = document.getElementById('art-container');
  const asciiArt = document.getElementById('ascii-art');
  const controls = document.getElementById('controls');
  const resetBtn = document.getElementById('reset-btn');
  const audioBtn = document.getElementById('audio-btn');
  const iconSoundOn = document.getElementById('icon-sound-on');
  const iconSoundOff = document.getElementById('icon-sound-off');
  const hintToast = document.getElementById('hint-toast');
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');

  // Carga del arte desde art.js
  if (window.RAW_ASCII_ART) {
    asciiArt.textContent = window.RAW_ASCII_ART;
  }

  // ========================================================
  // 1. MOTOR DE AUDIO PROCEDURAL (Web Audio API)
  // Romántico, atmosférico y 100% sintetizado en tiempo real
  // ========================================================
  class AmbientSoundtrack {
    constructor() {
      this.ctx = null;
      this.masterGain = null;
      this.isPlaying = false;
      this.isMuted = false;
      this.timer = null;
      this.chimeTimer = null;

      // Progresión de acordes románticos (frecuencias en Hz)
      // D♭maj7 -> B♭m7 -> G♭maj9 -> A♭sus4
      this.chordProgressions = [
        [138.59, 174.61, 207.65, 261.63, 349.23], // Db3, F3, Ab3, C4, F4
        [116.54, 174.61, 207.65, 277.18, 349.23], // Bb2, F3, Ab3, Db4, F4
        [92.50, 138.59, 174.61, 233.08, 277.18],  // Gb2, Db3, F3, Bb3, Db4
        [103.83, 155.56, 207.65, 233.08, 311.13]  // Ab2, Eb3, Ab3, Bb3, Eb4
      ];
      this.currentChordIdx = 0;

      // Notas brillantes pentatónicas para destellos celestiales (chimes)
      this.celestialNotes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
    }

    init() {
      if (this.ctx) return;
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContextClass();

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);

      // Filtro pasa-bajos cálido para sonido aterciopelado
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(950, this.ctx.currentTime);
      this.filter.Q.setValueAtTime(1.2, this.ctx.currentTime);

      // Efecto Delay ambiental (eco suave)
      this.delay = this.ctx.createDelay();
      this.delay.delayTime.setValueAtTime(0.5, this.ctx.currentTime);

      this.delayFeedback = this.ctx.createGain();
      this.delayFeedback.gain.setValueAtTime(0.35, this.ctx.currentTime);

      // Enrutamiento de efectos
      this.filter.connect(this.masterGain);
      this.filter.connect(this.delay);
      this.delay.connect(this.delayFeedback);
      this.delayFeedback.connect(this.delay);
      this.delay.connect(this.masterGain);

      this.masterGain.connect(this.ctx.destination);
    }

    start() {
      this.init();
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      this.isPlaying = true;
      // Fade in maestro
      this.masterGain.gain.linearRampToValueAtTime(0.28, this.ctx.currentTime + 3.0);

      this.playNextChord();
      this.scheduleCelestialChimes();
    }

    playVoice(freq, duration = 6.0) {
      if (!this.ctx || this.isMuted) return;

      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const voiceGain = this.ctx.createGain();

      // Oscilador 1: Onda sinusoidal pura
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, now);

      // Oscilador 2: Triángulo con leve desafinación para sensación de coro cálido
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 1.002, now);

      // Envolvente suave (ADSR)
      voiceGain.gain.setValueAtTime(0.0001, now);
      voiceGain.gain.exponentialRampToValueAtTime(0.12, now + 2.2);
      voiceGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc1.connect(voiceGain);
      osc2.connect(voiceGain);
      voiceGain.connect(this.filter);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration + 0.2);
      osc2.stop(now + duration + 0.2);
    }

    playNextChord() {
      if (!this.isPlaying) return;

      const chord = this.chordProgressions[this.currentChordIdx];
      this.currentChordIdx = (this.currentChordIdx + 1) % this.chordProgressions.length;

      // Tocar cada nota del acorde con ligeros desplazamientos humanos
      chord.forEach((noteFreq, i) => {
        setTimeout(() => {
          this.playVoice(noteFreq, 6.5);
        }, i * 140);
      });

      // Transición al siguiente acorde cada 5.2 segundos
      this.timer = setTimeout(() => {
        this.playNextChord();
      }, 5200);
    }

    scheduleCelestialChimes() {
      if (!this.isPlaying) return;

      const randomInterval = 2500 + Math.random() * 3500;
      this.chimeTimer = setTimeout(() => {
        if (this.ctx && !this.isMuted && this.isPlaying) {
          const note = this.celestialNotes[Math.floor(Math.random() * this.celestialNotes.length)];
          const now = this.ctx.currentTime;
          const chimeOsc = this.ctx.createOscillator();
          const chimeGain = this.ctx.createGain();

          chimeOsc.type = 'sine';
          chimeOsc.frequency.setValueAtTime(note, now);

          chimeGain.gain.setValueAtTime(0.0001, now);
          chimeGain.gain.exponentialRampToValueAtTime(0.05, now + 0.08);
          chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);

          chimeOsc.connect(chimeGain);
          chimeGain.connect(this.filter);

          chimeOsc.start(now);
          chimeOsc.stop(now + 3.2);
        }
        this.scheduleCelestialChimes();
      }, randomInterval);
    }

    toggleMute() {
      if (!this.ctx) return false;
      this.isMuted = !this.isMuted;
      const targetGain = this.isMuted ? 0.0001 : 0.28;
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 0.4);
      return !this.isMuted;
    }
  }

  const soundtrack = new AmbientSoundtrack();

  // ========================================================
  // 2. CANVAS DE PARTÍCULAS INTERACTIVAS
  // Destellos suaves en movimiento constante
  // ========================================================
  let width, height;
  const particles = [];
  const PARTICLE_COUNT = 45;

  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 10;
      this.radius = 1 + Math.random() * 2.2;
      this.speedY = -(0.25 + Math.random() * 0.65);
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.baseAlpha = 0.2 + Math.random() * 0.65;
      this.alpha = this.baseAlpha;
      this.pulseSpeed = 0.015 + Math.random() * 0.03;
      this.color = Math.random() > 0.4 ? '#ff529c' : '#c752ff';
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.alpha = this.baseAlpha + Math.sin(Date.now() * this.pulseSpeed * 0.05) * 0.2;

      if (this.y < -10 || this.x < -10 || this.x > width + 10) {
        this.reset(false);
      }
    }

    draw() {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = Math.max(0, Math.min(1, this.alpha));
      ctx.shadowBlur = 12;
      ctx.shadowColor = this.color;
      ctx.fill();
      ctx.restore();
    }
  }

  function initParticles() {
    resizeCanvas();
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }
  }

  function renderParticles() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
    requestAnimationFrame(renderParticles);
  }

  window.addEventListener('resize', resizeCanvas);
  initParticles();
  renderParticles();

  // ========================================================
  // 3. MOTOR DE GESTOS TÁCTILES & AUTO-ESCALADO RESPONSIVO
  // Pinch-to-zoom, arrastrar (pan), doble toque para centrar
  // ========================================================
  let baseScale = 1;
  let userScale = 1;
  let panX = 0;
  let panY = 0;

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let startPanX = 0;
  let startPanY = 0;

  let initialPinchDistance = 0;
  let startUserScale = 1;
  let lastTapTime = 0;

  function calculateBaseScale() {
    // Calculamos el tamaño relativo para que quepa en el 92% de la pantalla
    const rect = asciiArt.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    // Medidas base del contenedor pre sin escala
    const contentW = asciiArt.scrollWidth;
    const contentH = asciiArt.scrollHeight;

    const availableW = window.innerWidth * 0.94;
    const availableH = window.innerHeight * 0.88;

    const scaleX = availableW / contentW;
    const scaleY = availableH / contentH;

    // Escala ideal para que se aprecie completo sin recortarse
    baseScale = Math.min(scaleX, scaleY);
    updateTransform();
  }

  function updateTransform(smooth = false) {
    if (smooth) {
      artContainer.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
      setTimeout(() => {
        artContainer.style.transition = 'none';
      }, 400);
    }
    const currentTotalScale = baseScale * userScale;
    artContainer.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${currentTotalScale})`;
  }

  function resetView(smooth = true) {
    userScale = 1;
    panX = 0;
    panY = 0;
    updateTransform(smooth);
  }

  // Medir distancia entre 2 dedos
  function getPinchDistance(e) {
    const t1 = e.touches[0];
    const t2 = e.touches[1];
    return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
  }

  // Eventos táctiles (Touch Events)
  viewport.addEventListener('touchstart', function (e) {
    if (e.touches.length === 1) {
      // Detección de doble toque para resetear
      const currentTime = Date.now();
      if (currentTime - lastTapTime < 300) {
        resetView(true);
        lastTapTime = 0;
        return;
      }
      lastTapTime = currentTime;

      // Iniciar Pan
      isDragging = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startPanX = panX;
      startPanY = panY;
    } else if (e.touches.length === 2) {
      // Iniciar Pinch-to-zoom
      isDragging = false;
      initialPinchDistance = getPinchDistance(e);
      startUserScale = userScale;
    }
  }, { passive: true });

  viewport.addEventListener('touchmove', function (e) {
    if (e.touches.length === 1 && isDragging) {
      const deltaX = e.touches[0].clientX - startX;
      const deltaY = e.touches[0].clientY - startY;
      panX = startPanX + deltaX;
      panY = startPanY + deltaY;
      updateTransform(false);
    } else if (e.touches.length === 2 && initialPinchDistance > 0) {
      const currentDist = getPinchDistance(e);
      const ratio = currentDist / initialPinchDistance;
      // Límites de zoom entre 0.8x y 4.5x
      userScale = Math.min(Math.max(startUserScale * ratio, 0.8), 4.5);
      updateTransform(false);
    }
  }, { passive: true });

  viewport.addEventListener('touchend', function (e) {
    if (e.touches.length === 0) {
      isDragging = false;
      initialPinchDistance = 0;
    } else if (e.touches.length === 1) {
      isDragging = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startPanX = panX;
      startPanY = panY;
      initialPinchDistance = 0;
    }
  });

  // Soporte para mouse en PC / Laptop
  viewport.addEventListener('mousedown', function (e) {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    startPanX = panX;
    startPanY = panY;
  });

  window.addEventListener('mousemove', function (e) {
    if (!isDragging) return;
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    panX = startPanX + deltaX;
    panY = startPanY + deltaY;
    updateTransform(false);
  });

  window.addEventListener('mouseup', function () {
    isDragging = false;
  });

  // Zoom con rueda de ratón (Mouse wheel)
  viewport.addEventListener('wheel', function (e) {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.88;
    userScale = Math.min(Math.max(userScale * zoomFactor, 0.8), 4.5);
    updateTransform(false);
  }, { passive: false });

  // Botón para resetear vista
  resetBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    resetView(true);
  });

  // Botón de control de sonido
  audioBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    const isNowPlaying = soundtrack.toggleMute();
    if (isNowPlaying) {
      iconSoundOn.classList.remove('hidden');
      iconSoundOff.classList.add('hidden');
    } else {
      iconSoundOn.classList.add('hidden');
      iconSoundOff.classList.remove('hidden');
    }
  });

  // Reajuste en cambios de tamaño o giro de pantalla móvil
  window.addEventListener('resize', () => {
    calculateBaseScale();
  });
  window.addEventListener('orientationchange', () => {
    setTimeout(calculateBaseScale, 300);
  });

  // ========================================================
  // 4. SECUENCIA DE APERTURA (TOCA PARA ABRIR)
  // ========================================================
  function openExperience() {
    // 1. Iniciar audio procedural
    soundtrack.start();

    // 2. Transición suave de salida para la pantalla de bienvenida
    introScreen.classList.add('fade-out');

    // 3. Mostrar viewport y encender tubo de neón
    viewport.classList.remove('viewport-hidden');
    calculateBaseScale();

    // Aplicar parpadeo realista de encendido de neón
    asciiArt.classList.add('neon-flicker');

    // 4. Mostrar controles y toast guía
    setTimeout(() => {
      controls.classList.remove('controls-hidden');
      hintToast.classList.remove('toast-hidden');

      // Ocultar sugerencia suavemente tras 4.5 segundos
      setTimeout(() => {
        hintToast.classList.add('toast-hidden');
      }, 4500);
    }, 1200);
  }

  // Disparar apertura al hacer click o tap en la tarjeta
  openBtn.addEventListener('click', openExperience);
  openBtn.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      openExperience();
    }
  });

  // Pre-cálculo inicial de escala
  setTimeout(calculateBaseScale, 100);
})();
