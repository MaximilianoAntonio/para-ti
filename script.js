/**
 * ========================================================
 * MOTOR DE RENDERIZADO EN CANVAS Y EXPERIENCIA INMERSIVA
 * Arte ASCII Glow de alta fidelidad para dispositivos moviles
 * ========================================================
 */

(function () {
  'use strict';

  // Elementos del DOM
  const mainStage = document.getElementById('main-stage');
  const ctx = mainStage.getContext('2d');
  const introScreen = document.getElementById('intro-screen');
  const openTrigger = document.getElementById('open-trigger');
  const controlDock = document.getElementById('control-dock');
  const themeBtn = document.getElementById('theme-btn');
  const resetBtn = document.getElementById('reset-btn');
  const audioBtn = document.getElementById('audio-btn');
  const iconAudioOn = document.getElementById('icon-audio-on');
  const iconAudioOff = document.getElementById('icon-audio-off');
  const gestureHint = document.getElementById('gesture-hint');

  // Dimensiones del lienzo
  let viewportWidth = window.innerWidth;
  let viewportHeight = window.innerHeight;
  let dpr = Math.min(window.devicePixelRatio || 1, 2.5);

  function resizeStage() {
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    mainStage.width = viewportWidth * dpr;
    mainStage.height = viewportHeight * dpr;
    mainStage.style.width = viewportWidth + 'px';
    mainStage.style.height = viewportHeight + 'px';
  }

  // ========================================================
  // 1. PALETAS DE COLOR PROFESIONALES
  // ========================================================
  const THEMES = [
    {
      id: 'neon-romance',
      name: 'Rosa y Violeta Neon',
      core: '#ffffff',
      highGlow: '#ff1475',
      highText: '#ffffff',
      midGlow: '#c752ff',
      midText: '#ff7bb5',
      lowGlow: '#7b1fa2',
      lowText: '#af40e8',
      bgGrid: 'rgba(180, 100, 240, 0.16)',
      particle1: '#ff2a85',
      particle2: '#c752ff'
    },
    {
      id: 'golden-sunset',
      name: 'Luz Dorada',
      core: '#ffffff',
      highGlow: '#ff9900',
      highText: '#ffffff',
      midGlow: '#ffaa00',
      midText: '#ffe082',
      lowGlow: '#e65100',
      lowText: '#ffb74d',
      bgGrid: 'rgba(255, 183, 77, 0.15)',
      particle1: '#f5b342',
      particle2: '#ff8800'
    },
    {
      id: 'celestial-night',
      name: 'Cielo Nocturno',
      core: '#ffffff',
      highGlow: '#00e5ff',
      highText: '#ffffff',
      midGlow: '#0091ea',
      midText: '#80d8ff',
      lowGlow: '#01579b',
      lowText: '#40c4ff',
      bgGrid: 'rgba(64, 196, 255, 0.15)',
      particle1: '#00e5ff',
      particle2: '#7c4dff'
    }
  ];

  let currentThemeIndex = 0;

  // ========================================================
  // 2. GENERADOR DE TEXTURA OFFSCREEN (ALTA FIDELIDAD)
  // Pre-renderizado ultra eficiente del arte ASCII
  // ========================================================
  let offscreenCanvas = null;
  let artCols = 119;
  let artRows = 116;
  const CELL_WIDTH = 9;
  const CELL_HEIGHT = 14;
  let rawLines = [];

  if (window.RAW_ASCII_ART) {
    rawLines = window.RAW_ASCII_ART.split('\n');
    artRows = rawLines.length;
    artCols = Math.max(...rawLines.map(l => l.length));
  }

  function renderOffscreenArt(theme) {
    const texW = artCols * CELL_WIDTH;
    const texH = artRows * CELL_HEIGHT;

    if (!offscreenCanvas) {
      offscreenCanvas = document.createElement('canvas');
    }
    offscreenCanvas.width = texW * 2;
    offscreenCanvas.height = texH * 2;

    const octx = offscreenCanvas.getContext('2d');
    octx.scale(2, 2);
    octx.clearRect(0, 0, texW, texH);

    octx.font = '700 11px "JetBrains Mono", "Fira Code", monospace';
    octx.textBaseline = 'top';
    octx.textAlign = 'left';

    // Clasificacion de caracteres para profundidad optica
    for (let r = 0; r < rawLines.length; r++) {
      const line = rawLines[r];
      const y = r * CELL_HEIGHT;

      for (let c = 0; c < line.length; c++) {
        const char = line[c];
        if (char === ' ') continue;

        const x = c * CELL_WIDTH;

        if (char === ':') {
          // Fondo etereo de baja intensidad (no compite con las siluetas)
          octx.fillStyle = theme.bgGrid;
          octx.shadowBlur = 0;
          octx.fillText(char, x, y);
        } else if (char === '@' || char === '%' || char === '#') {
          // Contornos principales y rostros: brillo de neón intenso con núcleo blanco
          octx.shadowColor = theme.highGlow;
          octx.shadowBlur = 12;
          octx.fillStyle = theme.highText;
          octx.fillText(char, x, y);

          // Refuerzo del nucleo
          octx.shadowBlur = 4;
          octx.fillText(char, x, y);
        } else if (char === '*' || char === '+') {
          // Tonos medios e iluminacion secundaria
          octx.shadowColor = theme.midGlow;
          octx.shadowBlur = 8;
          octx.fillStyle = theme.midText;
          octx.fillText(char, x, y);
        } else {
          // Gradientes de sombra (=, -)
          octx.shadowColor = theme.lowGlow;
          octx.shadowBlur = 4;
          octx.fillStyle = theme.lowText;
          octx.fillText(char, x, y);
        }
      }
    }
  }

  // ========================================================
  // 3. MOTOR DE PARTICULAS AMBIENTALES
  // ========================================================
  class AmbientParticle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * viewportWidth;
      this.y = initial ? Math.random() * viewportHeight : viewportHeight + 15;
      this.radius = 0.8 + Math.random() * 2.2;
      this.speedY = -(0.2 + Math.random() * 0.45);
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.baseAlpha = 0.15 + Math.random() * 0.5;
      this.alpha = this.baseAlpha;
      this.pulseRate = 0.02 + Math.random() * 0.03;
      this.pulsePhase = Math.random() * Math.PI * 2;
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.pulsePhase += this.pulseRate;
      this.alpha = this.baseAlpha + Math.sin(this.pulsePhase) * 0.15;

      if (this.y < -15 || this.x < -15 || this.x > viewportWidth + 15) {
        this.reset(false);
      }
    }

    draw(targetCtx, color) {
      targetCtx.save();
      targetCtx.beginPath();
      targetCtx.arc(this.x * dpr, this.y * dpr, this.radius * dpr, 0, Math.PI * 2);
      targetCtx.fillStyle = color;
      targetCtx.globalAlpha = Math.max(0, Math.min(1, this.alpha));
      targetCtx.shadowBlur = 10 * dpr;
      targetCtx.shadowColor = color;
      targetCtx.fill();
      targetCtx.restore();
    }
  }

  const particles = [];
  for (let i = 0; i < 40; i++) {
    particles.push(new AmbientParticle());
  }

  // ========================================================
  // 4. MOTOR DE CAMARA, GESTOS Y FISICA SUAVE
  // ========================================================
  const camera = {
    x: 0,
    y: 0,
    scale: 1,
    targetX: 0,
    targetY: 0,
    targetScale: 1,
    fitScale: 1,
    artW: 0,
    artH: 0
  };

  function updateFitScale() {
    camera.artW = artCols * CELL_WIDTH;
    camera.artH = artRows * CELL_HEIGHT;

    const marginX = viewportWidth * 0.92;
    const marginY = viewportHeight * 0.82;

    const scaleX = marginX / camera.artW;
    const scaleY = marginY / camera.artH;

    camera.fitScale = Math.min(scaleX, scaleY);
    camera.targetScale = camera.fitScale;
    camera.targetX = viewportWidth / 2;
    camera.targetY = viewportHeight / 2;

    camera.scale = camera.targetScale;
    camera.x = camera.targetX;
    camera.y = camera.targetY;
  }

  // Animacion de encendido y revelacion cinematografica
  let isRevealed = false;
  let revealProgress = 0; // De 0 a 1
  let revealStartTime = 0;

  function triggerReveal() {
    isRevealed = true;
    revealStartTime = performance.now();
  }

  // ========================================================
  // 5. BUCLE PRINCIPAL DE RENDERIZADO (60/120 FPS)
  // ========================================================
  function loop(now) {
    // Interpolacion de camara suave (lerp)
    camera.x += (camera.targetX - camera.x) * 0.18;
    camera.y += (camera.targetY - camera.y) * 0.18;
    camera.scale += (camera.targetScale - camera.scale) * 0.18;

    // Actualizacion de animacion de revelacion
    if (isRevealed && revealProgress < 1) {
      const elapsed = (now - revealStartTime) / 2000; // 2 segundos
      revealProgress = Math.min(1, elapsed);
    }

    ctx.clearRect(0, 0, mainStage.width, mainStage.height);

    const theme = THEMES[currentThemeIndex];

    // 1. Dibujar particulas de fondo
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw(ctx, i % 2 === 0 ? theme.particle1 : theme.particle2);
    }

    // 2. Dibujar arte ASCII si ya inicio la revelacion
    if (isRevealed && offscreenCanvas) {
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.translate(camera.x, camera.y);
      ctx.scale(camera.scale, camera.scale);

      // Centrado respecto al origen del arte
      const drawX = -camera.artW / 2;
      const drawY = -camera.artH / 2;

      // Efecto de respiracion sutil de neon
      const breathingGlow = 0.85 + Math.sin(now * 0.002) * 0.15;

      // Capa de Bloom Optico (Lighter blend)
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.45 * breathingGlow;
      ctx.drawImage(offscreenCanvas, drawX, drawY, camera.artW, camera.artH);
      ctx.restore();

      // Capa Nitida Primaria
      ctx.save();
      if (revealProgress < 1) {
        // Barrido vertical de encendido de neón
        const clipHeight = camera.artH * revealProgress;
        ctx.beginPath();
        ctx.rect(drawX, drawY, camera.artW, clipHeight);
        ctx.clip();
      }
      ctx.globalAlpha = 1.0;
      ctx.drawImage(offscreenCanvas, drawX, drawY, camera.artW, camera.artH);

      // Linea de barrido luminoso mientras se revela
      if (revealProgress > 0 && revealProgress < 1) {
        const scanY = drawY + camera.artH * revealProgress;
        const scanGrad = ctx.createLinearGradient(drawX, scanY - 15, drawX, scanY + 15);
        scanGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        scanGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)');
        scanGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = scanGrad;
        ctx.fillRect(drawX, scanY - 15, camera.artW, 30);
      }
      ctx.restore();

      ctx.restore();
    }

    requestAnimationFrame(loop);
  }

  // ========================================================
  // 6. GESTOS TACTILES Y RATON (NIVEL NATIVO FLUIDO)
  // ========================================================
  let touchStartDist = 0;
  let touchStartScale = 1;
  let isDragging = false;
  let lastX = 0;
  let lastY = 0;
  let lastTapTime = 0;

  function getDistance(t1, t2) {
    return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
  }

  function getMidpoint(t1, t2) {
    return {
      x: (t1.clientX + t2.clientX) / 2,
      y: (t1.clientY + t2.clientY) / 2
    };
  }

  mainStage.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      const now = performance.now();
      if (now - lastTapTime < 300) {
        // Doble toque: restablecer a pantalla completa
        camera.targetScale = camera.fitScale;
        camera.targetX = viewportWidth / 2;
        camera.targetY = viewportHeight / 2;
        lastTapTime = 0;
        return;
      }
      lastTapTime = now;

      isDragging = true;
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      isDragging = false;
      touchStartDist = getDistance(e.touches[0], e.touches[1]);
      touchStartScale = camera.targetScale;
    }
  }, { passive: true });

  mainStage.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - lastX;
      const dy = e.touches[0].clientY - lastY;
      camera.targetX += dx;
      camera.targetY += dy;
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
    } else if (e.touches.length === 2 && touchStartDist > 0) {
      const currentDist = getDistance(e.touches[0], e.touches[1]);
      const factor = currentDist / touchStartDist;
      const newScale = Math.min(Math.max(touchStartScale * factor, camera.fitScale * 0.6), camera.fitScale * 5.0);
      camera.targetScale = newScale;
    }
  }, { passive: true });

  mainStage.addEventListener('touchend', (e) => {
    if (e.touches.length === 0) {
      isDragging = false;
    } else if (e.touches.length === 1) {
      isDragging = true;
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
    }
  });

  // Soporte para Raton (Desktop)
  mainStage.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    camera.targetX += dx;
    camera.targetY += dy;
    lastX = e.clientX;
    lastY = e.clientY;
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  mainStage.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 1.15 : 0.85;
    camera.targetScale = Math.min(Math.max(camera.targetScale * zoomDelta, camera.fitScale * 0.6), camera.fitScale * 5.0);
  }, { passive: false });

  // ========================================================
  // 7. SINTETIZADOR DE AUDIO PROCEDURAL (SEGURO Y ROBUSTO)
  // Genera acordes aterciopelados y chimes sin fallos en movil
  // ========================================================
  class AtmosphericAudio {
    constructor() {
      this.ctx = null;
      this.master = null;
      this.filter = null;
      this.isPlaying = false;
      this.isMuted = false;
      this.chordStep = 0;
      this.loopTimer = null;
      this.chimeTimer = null;

      // Acordes mayores y septimas romanticas (Hz)
      this.progression = [
        [138.59, 207.65, 261.63, 349.23], // Db major
        [116.54, 174.61, 233.08, 277.18], // Bb minor 7
        [92.50, 138.59, 185.00, 233.08],  // Gb major 9
        [103.83, 155.56, 207.65, 261.63]  // Ab add9
      ];

      this.bells = [523.25, 659.25, 783.99, 1046.50, 1174.66];
    }

    init() {
      if (this.ctx) return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      this.master = this.ctx.createGain();
      this.master.gain.setValueAtTime(0.001, this.ctx.currentTime);

      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      this.filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

      // Stereo delay ambiental
      this.delay = this.ctx.createDelay();
      this.delay.delayTime.setValueAtTime(0.48, this.ctx.currentTime);
      this.delayFeedback = this.ctx.createGain();
      this.delayFeedback.gain.setValueAtTime(0.3, this.ctx.currentTime);

      this.filter.connect(this.master);
      this.filter.connect(this.delay);
      this.delay.connect(this.delayFeedback);
      this.delayFeedback.connect(this.delay);
      this.delay.connect(this.master);
      this.master.connect(this.ctx.destination);
    }

    start() {
      this.init();
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      this.isPlaying = true;
      const t = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(t);
      this.master.gain.linearRampToValueAtTime(0.24, t + 3.0);

      this.playChord();
      this.scheduleBells();
    }

    playChord() {
      if (!this.isPlaying || !this.ctx || this.isMuted) return;

      const chord = this.progression[this.chordStep];
      this.chordStep = (this.chordStep + 1) % this.progression.length;

      chord.forEach((freq, idx) => {
        setTimeout(() => {
          if (!this.isPlaying || !this.ctx || this.isMuted) return;
          const now = this.ctx.currentTime;
          const osc1 = this.ctx.createOscillator();
          const osc2 = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(freq, now);

          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(freq * 1.003, now); // Leve coro analogico

          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.09, now + 2.0);
          gain.gain.linearRampToValueAtTime(0.001, now + 6.2);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(this.filter);

          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 6.5);
          osc2.stop(now + 6.5);
        }, idx * 120);
      });

      this.loopTimer = setTimeout(() => {
        this.playChord();
      }, 5400);
    }

    scheduleBells() {
      if (!this.isPlaying) return;
      const delayTime = 3000 + Math.random() * 4000;
      this.chimeTimer = setTimeout(() => {
        if (this.ctx && !this.isMuted && this.isPlaying) {
          const note = this.bells[Math.floor(Math.random() * this.bells.length)];
          const now = this.ctx.currentTime;
          const bellOsc = this.ctx.createOscillator();
          const bellGain = this.ctx.createGain();

          bellOsc.type = 'sine';
          bellOsc.frequency.setValueAtTime(note, now);

          bellGain.gain.setValueAtTime(0.001, now);
          bellGain.gain.linearRampToValueAtTime(0.035, now + 0.1);
          bellGain.gain.linearRampToValueAtTime(0.001, now + 3.0);

          bellOsc.connect(bellGain);
          bellGain.connect(this.filter);

          bellOsc.start(now);
          bellOsc.stop(now + 3.2);
        }
        this.scheduleBells();
      }, delayTime);
    }

    toggleMute() {
      if (!this.ctx) return false;
      this.isMuted = !this.isMuted;
      const t = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(t);
      this.master.gain.linearRampToValueAtTime(this.isMuted ? 0.001 : 0.24, t + 0.3);
      if (!this.isMuted) {
        this.playChord();
      }
      return !this.isMuted;
    }
  }

  const audioEngine = new AtmosphericAudio();

  // ========================================================
  // 8. INTERACCIONES Y EVENTOS DE INTERFAZ
  // ========================================================
  function startExperience() {
    // 1. Audio
    audioEngine.start();

    // 2. Transicion de pantalla
    introScreen.classList.add('screen-hidden');

    // 3. Iniciar revelacion cinemática en Canvas
    triggerReveal();

    // 4. Mostrar controles con delay refinado
    setTimeout(() => {
      controlDock.classList.remove('dock-hidden');
      gestureHint.classList.remove('hint-hidden');

      setTimeout(() => {
        gestureHint.classList.add('hint-hidden');
      }, 4200);
    }, 1500);
  }

  openTrigger.addEventListener('click', startExperience);
  openTrigger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      startExperience();
    }
  });

  // Selector de Temas
  themeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    currentThemeIndex = (currentThemeIndex + 1) % THEMES.length;
    renderOffscreenArt(THEMES[currentThemeIndex]);
  });

  // Boton de Centrado
  resetBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    camera.targetScale = camera.fitScale;
    camera.targetX = viewportWidth / 2;
    camera.targetY = viewportHeight / 2;
  });

  // Boton de Audio
  audioBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isNowPlaying = audioEngine.toggleMute();
    if (isNowPlaying) {
      iconAudioOn.classList.remove('hidden');
      iconAudioOff.classList.add('hidden');
    } else {
      iconAudioOn.classList.add('hidden');
      iconAudioOff.classList.remove('hidden');
    }
  });

  // Redimensionado de pantalla y rotacion
  window.addEventListener('resize', () => {
    resizeStage();
    updateFitScale();
  });
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      resizeStage();
      updateFitScale();
    }, 250);
  });

  // Inicializacion
  resizeStage();
  renderOffscreenArt(THEMES[currentThemeIndex]);
  updateFitScale();
  requestAnimationFrame(loop);
})();
