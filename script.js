/**
 * ========================================================
 * MOTOR DE RENDERIZADO EN CANVAS - TULIPANES EN NEON GLOW
 * Renderizado multicolor de alta fidelidad para moviles
 * ========================================================
 */

(function () {
  'use strict';

  // Elementos del DOM
  const mainStage = document.getElementById('main-stage');
  const ctx = mainStage.getContext('2d');
  const introScreen = document.getElementById('intro-screen');
  const controlDock = document.getElementById('control-dock');
  const themeBtn = document.getElementById('theme-btn');
  const resetBtn = document.getElementById('reset-btn');
  const audioBtn = document.getElementById('audio-btn');
  const iconAudioOn = document.getElementById('icon-audio-on');
  const iconAudioOff = document.getElementById('icon-audio-off');
  const gestureHint = document.getElementById('gesture-hint');

  // Dimensiones del visor y soporte de Retina / Alta densidad de pixeles
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
  // 1. PALETAS FLORALES CON TULIPANES ROJOS Y TALLOS VERDES
  // Los tulipanes son de color rojo vivo con tallos esmeralda
  // ========================================================
  const FLORAL_THEMES = [
    {
      id: 'red-passion',
      name: 'Tulipanes Rojos Pasion',
      // Flores: Rojo Carmesi y Rubi Vibrante
      flower: {
        dense: '#ffffff',
        body: '#ff0033',
        highlight: '#ff2a4b',
        shadow: '#99001b',
        glow: '#ff0033',
        shadowGlow: '#cc0029'
      },
      // Tallos y follaje: Verde Esmeralda y Menta Lima
      stem: {
        dense: '#ffffff',
        body: '#00e676',
        highlight: '#76ff03',
        shadow: '#00796b',
        glow: '#00ff88',
        shadowGlow: '#004d40'
      },
      // Suelo / Base
      base: {
        dense: '#ffd54f',
        highlight: '#ffb300',
        shadow: '#ff8f00',
        glow: '#ffa000'
      },
      bgGrid: 'rgba(120, 160, 255, 0.12)',
      particleColors: ['#ff0033', '#ff2a4b', '#00ff88', '#76ff03']
    },
    {
      id: 'red-ruby',
      name: 'Tulipanes Rojo Rubi y Oro',
      // Flores: Rojo Escarlata brillante con reflejos calidos
      flower: {
        dense: '#ffffff',
        body: '#ff1744',
        highlight: '#ff5252',
        shadow: '#b71c1c',
        glow: '#ff1744',
        shadowGlow: '#8b0000'
      },
      // Tallos: Verde Lima Brillante
      stem: {
        dense: '#ffffff',
        body: '#64dd17',
        highlight: '#aeea00',
        shadow: '#33691e',
        glow: '#76ff03',
        shadowGlow: '#1b5e20'
      },
      base: {
        dense: '#ffb74d',
        highlight: '#ffa726',
        shadow: '#e65100',
        glow: '#ff9800'
      },
      bgGrid: 'rgba(255, 210, 120, 0.13)',
      particleColors: ['#ff1744', '#ff5252', '#76ff03', '#ffd54f']
    },
    {
      id: 'red-velvet',
      name: 'Tulipanes Rojo Terciopelo',
      // Flores: Rojo Granate y Carmesi Oscuro
      flower: {
        dense: '#ffffff',
        body: '#d50000',
        highlight: '#ff3344',
        shadow: '#7f0000',
        glow: '#ff0022',
        shadowGlow: '#590000'
      },
      // Tallos: Verde Turquesa y Jade
      stem: {
        dense: '#ffffff',
        body: '#1de9b6',
        highlight: '#64ffda',
        shadow: '#00897b',
        glow: '#1de9b6',
        shadowGlow: '#004d40'
      },
      base: {
        dense: '#ffd54f',
        highlight: '#ffb300',
        shadow: '#ff8f00',
        glow: '#ffa000'
      },
      bgGrid: 'rgba(160, 140, 255, 0.12)',
      particleColors: ['#d50000', '#ff3344', '#1de9b6', '#64ffda']
    }
  ];

  let currentThemeIndex = 0;

  // ========================================================
  // 2. GENERADOR DE TEXTURA OFFSCREEN
  // Mapeo anatomico exacto de los 3 tulipanes rojos y tallos
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

  // Deteccion de petalos de los 3 tulipanes
  function isTulipFlower(lineNum, c) {
    // 1. Tulipan izquierdo: lineas 29 a 54, cols 24 a 66
    if (lineNum >= 29 && lineNum <= 54 && c >= 24 && c <= 66) {
      return true;
    }
    // 2. Tulipan superior derecho: lineas 14 a 38, cols 74 a 113
    if (lineNum >= 14 && lineNum <= 38 && c >= 74 && c <= 113) {
      return true;
    }
    // 3. Tulipan inferior derecho: lineas 39 a 60
    if (lineNum >= 39 && lineNum <= 60) {
      if (lineNum === 39 && c >= 98) return true;
      if (lineNum === 40 && c >= 97) return true;
      if (lineNum === 41 && c >= 96) return true;
      if (lineNum === 42 && c >= 95) return true;
      if (lineNum === 43 && c >= 94) return true;
      if (lineNum === 44 && c >= 93) return true;
      if (lineNum === 45 && c >= 92) return true;
      if (lineNum >= 46 && lineNum <= 56 && c >= 88) return true;
      if (lineNum >= 57 && lineNum <= 58 && c >= 90) return true;
      if (lineNum === 59 && c >= 92) return true;
      if (lineNum === 60 && c >= 95) return true;
    }
    return false;
  }

  // Identificador anatomico de cada caracter
  function getCellStyle(r, c, char, theme) {
    if (char === ':' || char === ' ') {
      return { fill: theme.bgGrid, glow: null, blur: 0, isBg: true };
    }

    const lineNum = r + 1;

    // 1. Base / Suelo (lineas 112 a 115)
    if (lineNum >= 112) {
      if (char === '@' || char === '%' || char === '#') {
        return { fill: theme.base.dense, glow: theme.base.glow, blur: 12 };
      }
      return { fill: theme.base.highlight, glow: theme.base.glow, blur: 6 };
    }

    // 2. Petalos de los tulipanes (TODOS ROJOS)
    if (isTulipFlower(lineNum, c)) {
      const fl = theme.flower;
      if (char === '@' || char === '%' || char === '#') {
        // Cuerpo denso de los petalos con nucleo blanco brillante
        return { fill: fl.dense, bodyColor: fl.body, glow: fl.glow, blur: 14, isPetal: true };
      } else if (char === '*' || char === '+') {
        // Reflejos e iluminaciones rojas de los petalos
        return { fill: fl.highlight, glow: fl.glow, blur: 9 };
      } else {
        // Sombras y pliegues internos de los petalos en rojo vino aterciopelado
        return { fill: fl.shadow, glow: fl.shadowGlow, blur: 5 };
      }
    }

    // 3. Tallos y hojas (TODOS VERDES)
    const st = theme.stem;
    if (char === '@' || char === '%' || char === '#') {
      return { fill: st.dense, bodyColor: st.body, glow: st.glow, blur: 12, isStem: true };
    } else if (char === '*' || char === '+') {
      return { fill: st.highlight, glow: st.glow, blur: 8 };
    } else {
      return { fill: st.shadow, glow: st.shadowGlow, blur: 4 };
    }
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

    for (let r = 0; r < rawLines.length; r++) {
      const line = rawLines[r];
      const y = r * CELL_HEIGHT;

      for (let c = 0; c < line.length; c++) {
        const char = line[c];
        if (char === ' ') continue;

        const x = c * CELL_WIDTH;
        const style = getCellStyle(r, c, char, theme);

        if (style.isBg) {
          // Fondo etéreo de baja intensidad
          octx.fillStyle = style.fill;
          octx.shadowBlur = 0;
          octx.fillText(char, x, y);
        } else {
          // Elementos florales con brillo multicapa
          octx.shadowColor = style.glow;
          octx.shadowBlur = style.blur;
          octx.fillStyle = style.bodyColor || style.fill;
          octx.fillText(char, x, y);

          // Si es un carácter denso (@, %, #), aplicamos un núcleo blanco brillante
          if (style.isPetal || style.isStem) {
            octx.shadowBlur = 3;
            octx.fillStyle = '#ffffff';
            octx.fillText(char, x, y);
          }
        }
      }
    }
  }

  // ========================================================
  // 3. MOTOR DE PARTICULAS FLORALES AMBIENTALES
  // Petalos de luz y destellos esmeralda flotantes
  // ========================================================
  class FloralParticle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * viewportWidth;
      this.y = initial ? Math.random() * viewportHeight : viewportHeight + 15;
      this.radius = 0.8 + Math.random() * 2.4;
      this.speedY = -(0.2 + Math.random() * 0.5);
      this.speedX = (Math.random() - 0.5) * 0.35;
      this.baseAlpha = 0.2 + Math.random() * 0.55;
      this.alpha = this.baseAlpha;
      this.pulseRate = 0.02 + Math.random() * 0.03;
      this.pulsePhase = Math.random() * Math.PI * 2;
      this.colorIndex = Math.floor(Math.random() * 4);
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX + (windForce * 0.04);
      this.pulsePhase += this.pulseRate;
      this.alpha = this.baseAlpha + Math.sin(this.pulsePhase) * 0.18;

      if (this.y < -15 || this.x < -15 || this.x > viewportWidth + 15) {
        this.reset(false);
      }
    }

    draw(targetCtx, palette) {
      const color = palette[this.colorIndex % palette.length];
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
  for (let i = 0; i < 45; i++) {
    particles.push(new FloralParticle());
  }

  // ========================================================
  // 4. CAMARA, GESTOS Y FISICA SUAVE (LERP)
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

  // Animacion de encendido y florecimiento
  let isRevealed = false;
  let revealProgress = 0;
  let revealStartTime = 0;

  function triggerReveal() {
    isRevealed = true;
    revealStartTime = performance.now();
  }

  // ========================================================
  // 5. FISICA DEL VIENTO Y MOVIMIENTO ORGANICO DE TULIPANES
  // Oscilacion armonica natural en los tallos y petalos
  // ========================================================
  let windForce = 0;
  let windVelocity = 0;

  function drawSwayingTulips(now, alpha, compositeOp, clipRatio) {
    ctx.save();
    if (compositeOp !== 'source-over') {
      ctx.globalCompositeOperation = compositeOp;
    }
    ctx.globalAlpha = alpha;

    const totalRows = artRows;
    const maxRowToDraw = Math.ceil(totalRows * clipRatio);

    for (let r = 0; r < maxRowToDraw; r++) {
      // Progresion de altura: 0 en el suelo (r = 115), 1 en la flor mas alta (r = 0)
      const normalizedHeight = Math.max(0, (totalRows - 1 - r) / (totalRows - 1));
      // Curva fisica de flexion (los tallos se doblan progresivamente con la altura)
      const flex = Math.pow(normalizedHeight, 1.35);

      // Brisa suave natural: combinacion de dos ondas sinusoidales lentas y elegantes
      const naturalSway = Math.sin(now * 0.0013 + r * 0.022) * 16 * flex +
                          Math.sin(now * 0.0026 + r * 0.045) * 6 * flex;

      // Inercia interactiva del viento generada al tocar o deslizar
      const interactiveSway = windForce * flex;

      const totalSway = naturalSway + interactiveSway;

      // Coordenadas origen en el canvas previo (escala 2x)
      const sx = 0;
      const sy = r * CELL_HEIGHT * 2;
      const sw = offscreenCanvas.width;
      const sh = CELL_HEIGHT * 2;

      // Coordenadas destino con desplazamiento horizontal curvado por fila
      const dx = -camera.artW / 2 + totalSway;
      const dy = -camera.artH / 2 + r * CELL_HEIGHT;
      const dw = camera.artW;
      const dh = CELL_HEIGHT;

      ctx.drawImage(offscreenCanvas, sx, sy, sw, sh, dx, dy, dw, dh);
    }

    ctx.restore();
  }

  // ========================================================
  // 6. BUCLE PRINCIPAL DE DIBUJO (60/120 FPS)
  // ========================================================
  function loop(now) {
    // Interpolacion suave de la camara
    camera.x += (camera.targetX - camera.x) * 0.18;
    camera.y += (camera.targetY - camera.y) * 0.18;
    camera.scale += (camera.targetScale - camera.scale) * 0.18;

    // Amortiguacion y retorno elastico del viento
    windForce += (windVelocity - windForce * 0.08);
    windVelocity *= 0.92;

    if (isRevealed && revealProgress < 1) {
      const elapsed = (now - revealStartTime) / 2200; // 2.2 segundos de florecimiento
      revealProgress = Math.min(1, elapsed);
    }

    ctx.clearRect(0, 0, mainStage.width, mainStage.height);

    const theme = FLORAL_THEMES[currentThemeIndex];

    // 1. Particulas florales flotantes (reaccionan sutilmente a la brisa)
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw(ctx, theme.particleColors);
    }

    // 2. Renderizado del arte con oscilacion de viento en Canvas
    if (isRevealed && offscreenCanvas) {
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.translate(camera.x, camera.y);
      ctx.scale(camera.scale, camera.scale);

      const breathingGlow = 0.88 + Math.sin(now * 0.002) * 0.12;

      // Capa de Bloom Optico (con movimiento sincronizado de cada hilera)
      drawSwayingTulips(now, 0.42 * breathingGlow, 'screen', revealProgress);

      // Capa Nitida Primaria (con movimiento sincronizado de cada hilera)
      drawSwayingTulips(now, 1.0, 'source-over', revealProgress);

      // Linea de barrido luminoso durante la apertura
      if (revealProgress > 0 && revealProgress < 1) {
        const drawX = -camera.artW / 2;
        const scanY = -camera.artH / 2 + camera.artH * revealProgress;
        const scanGrad = ctx.createLinearGradient(drawX, scanY - 20, drawX, scanY + 20);
        scanGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        scanGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)');
        scanGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = scanGrad;
        ctx.fillRect(drawX, scanY - 20, camera.artW, 40);
      }

      ctx.restore();
    }

    requestAnimationFrame(loop);
  }

  // ========================================================
  // 7. GESTOS TACTILES Y EVENTOS DE RATON
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

  mainStage.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      const now = performance.now();
      if (now - lastTapTime < 300) {
        // Doble toque: restablece la vista ajustada
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
      windVelocity += dx * 0.14; // Impulso de brisa interactiva
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
    } else if (e.touches.length === 2 && touchStartDist > 0) {
      const currentDist = getDistance(e.touches[0], e.touches[1]);
      const factor = currentDist / touchStartDist;
      const newScale = Math.min(Math.max(touchStartScale * factor, camera.fitScale * 0.5), camera.fitScale * 5.0);
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
    windVelocity += dx * 0.14; // Impulso de brisa con raton
    lastX = e.clientX;
    lastY = e.clientY;
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  mainStage.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 1.15 : 0.85;
    camera.targetScale = Math.min(Math.max(camera.targetScale * zoomDelta, camera.fitScale * 0.5), camera.fitScale * 5.0);
  }, { passive: false });

  // ========================================================
  // 7. SINTETIZADOR DE AUDIO PROCEDURAL (MELODIA FLORAL)
  // ========================================================
  class FloralSoundtrack {
    constructor() {
      this.ctx = null;
      this.master = null;
      this.filter = null;
      this.isPlaying = false;
      this.isMuted = false;
      this.chordStep = 0;
      this.loopTimer = null;
      this.chimeTimer = null;

      this.progression = [
        [138.59, 207.65, 261.63, 349.23], // Db major
        [116.54, 174.61, 233.08, 277.18], // Bb minor 7
        [92.50, 138.59, 185.00, 233.08],  // Gb major 9
        [103.83, 155.56, 207.65, 261.63]  // Ab add9
      ];

      this.chimes = [523.25, 659.25, 783.99, 1046.50, 1174.66];
    }

    init() {
      if (this.ctx) return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      this.master = this.ctx.createGain();
      this.master.gain.setValueAtTime(0.001, this.ctx.currentTime);

      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(850, this.ctx.currentTime);
      this.filter.Q.setValueAtTime(1.4, this.ctx.currentTime);

      this.delay = this.ctx.createDelay();
      this.delay.delayTime.setValueAtTime(0.46, this.ctx.currentTime);
      this.delayFeedback = this.ctx.createGain();
      this.delayFeedback.gain.setValueAtTime(0.32, this.ctx.currentTime);

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
      this.scheduleChimes();
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
          osc2.frequency.setValueAtTime(freq * 1.003, now);

          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.08, now + 2.0);
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

    scheduleChimes() {
      if (!this.isPlaying) return;
      const delayTime = 3000 + Math.random() * 4000;
      this.chimeTimer = setTimeout(() => {
        if (this.ctx && !this.isMuted && this.isPlaying) {
          const note = this.chimes[Math.floor(Math.random() * this.chimes.length)];
          const now = this.ctx.currentTime;
          const chimeOsc = this.ctx.createOscillator();
          const chimeGain = this.ctx.createGain();

          chimeOsc.type = 'sine';
          chimeOsc.frequency.setValueAtTime(note, now);

          chimeGain.gain.setValueAtTime(0.001, now);
          chimeGain.gain.linearRampToValueAtTime(0.035, now + 0.1);
          chimeGain.gain.linearRampToValueAtTime(0.001, now + 3.0);

          chimeOsc.connect(chimeGain);
          chimeGain.connect(this.filter);

          chimeOsc.start(now);
          chimeOsc.stop(now + 3.2);
        }
        this.scheduleChimes();
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

  const soundtrack = new FloralSoundtrack();

  // ========================================================
  // 8. INTERACCIONES DE INTERFAZ
  // ========================================================
  function startExperience() {
    soundtrack.start();
    introScreen.classList.add('screen-hidden');
    triggerReveal();

    setTimeout(() => {
      controlDock.classList.remove('dock-hidden');
      gestureHint.classList.remove('hint-hidden');

      setTimeout(() => {
        gestureHint.classList.add('hint-hidden');
      }, 4200);
    }, 1500);
  }

  introScreen.addEventListener('click', startExperience);
  introScreen.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      startExperience();
    }
  });

  themeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    currentThemeIndex = (currentThemeIndex + 1) % FLORAL_THEMES.length;
    renderOffscreenArt(FLORAL_THEMES[currentThemeIndex]);
  });

  resetBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    camera.targetScale = camera.fitScale;
    camera.targetX = viewportWidth / 2;
    camera.targetY = viewportHeight / 2;
  });

  audioBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isNowPlaying = soundtrack.toggleMute();
    if (isNowPlaying) {
      iconAudioOn.classList.remove('hidden');
      iconAudioOff.classList.add('hidden');
    } else {
      iconAudioOn.classList.add('hidden');
      iconAudioOff.classList.remove('hidden');
    }
  });

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
  renderOffscreenArt(FLORAL_THEMES[currentThemeIndex]);
  updateFitScale();
  requestAnimationFrame(loop);
})();
