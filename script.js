/**
 * ========================================================
 * MOTOR DE RENDERIZADO EN CANVAS - TULIPANES ROJOS VIVOS
 * Animacion de florecimiento (apertura), brisa armonica
 * y clasificacion anatomica 100% precisa para moviles
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

  // Dimensiones del visor y soporte de Retina
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
  // 1. PALETAS: TULIPANES 100% ROJOS CON TALLOS VERDES
  // ========================================================
  const FLORAL_THEMES = [
    {
      id: 'red-passion',
      name: 'Tulipanes Rojos Pasion',
      flower: {
        dense: '#ffffff',
        body: '#ff0033',
        highlight: '#ff2a4b',
        shadow: '#99001b',
        glow: '#ff0033',
        shadowGlow: '#cc0029'
      },
      stem: {
        dense: '#ffffff',
        body: '#00e676',
        highlight: '#76ff03',
        shadow: '#00796b',
        glow: '#00ff88',
        shadowGlow: '#004d40'
      },
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
      id: 'red-ruby-gold',
      name: 'Tulipanes Rojo Rubi y Oro',
      flower: {
        dense: '#ffffff',
        body: '#ff1744',
        highlight: '#ff5252',
        shadow: '#b71c1c',
        glow: '#ff1744',
        shadowGlow: '#8b0000'
      },
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
      flower: {
        dense: '#ffffff',
        body: '#d50000',
        highlight: '#ff3344',
        shadow: '#7f0000',
        glow: '#ff0022',
        shadowGlow: '#590000'
      },
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
  // 2. GENERADOR DE TEXTURAS OFFSCREEN MULTICAPA
  // Desacopla tallos verdes y las 3 flores rojas
  // ========================================================
  let stemsCanvas = null;
  let flower1Canvas = null; // Flor izquierda
  let flower2Canvas = null; // Flor superior derecha
  let flower3Canvas = null; // Flor inferior derecha

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

  // Puntos de anclaje (pivotes) donde cada flor conecta a su tallo
  const PIVOT1 = { x: 55 * CELL_WIDTH, y: 54 * CELL_HEIGHT, row: 54 };
  const PIVOT2 = { x: 88 * CELL_WIDTH, y: 38 * CELL_HEIGHT, row: 38 };
  const PIVOT3 = { x: 98 * CELL_WIDTH, y: 60 * CELL_HEIGHT, row: 60 };

  // Identificador anatomico estricto
  function getCharacterLayer(lineNum, c) {
    // 1. Flor izquierda (filas 29 a 54, columnas 24 a 70)
    if (lineNum >= 29 && lineNum <= 54 && c >= 24 && c <= 70) {
      return 'flower1';
    }
    // 2. Flor superior derecha (filas 14 a 38, columnas 74 a 113)
    if (lineNum >= 14 && lineNum <= 38 && c >= 74 && c <= 113) {
      return 'flower2';
    }
    // 3. Flor inferior derecha (filas 39 a 60, respetando el tallo a la izquierda)
    if (lineNum >= 39 && lineNum <= 60) {
      let minC = 88;
      if (lineNum === 39) minC = 98;
      else if (lineNum === 40) minC = 97;
      else if (lineNum === 41) minC = 96;
      else if (lineNum === 42) minC = 95;
      else if (lineNum === 43) minC = 94;
      else if (lineNum === 44) minC = 93;
      else if (lineNum === 45) minC = 92;
      else if (lineNum >= 46 && lineNum <= 56) minC = 88;
      else if (lineNum >= 57 && lineNum <= 58) minC = 90;
      else if (lineNum === 59) minC = 92;
      else if (lineNum === 60) minC = 95;

      if (c >= minC && c <= 118) {
        return 'flower3';
      }
    }
    return 'stems';
  }

  function createLayerCanvas() {
    const c = document.createElement('canvas');
    c.width = artCols * CELL_WIDTH * 2;
    c.height = artRows * CELL_HEIGHT * 2;
    return c;
  }

  function renderAllLayers(theme) {
    if (!stemsCanvas) {
      stemsCanvas = createLayerCanvas();
      flower1Canvas = createLayerCanvas();
      flower2Canvas = createLayerCanvas();
      flower3Canvas = createLayerCanvas();
    }

    const texW = artCols * CELL_WIDTH;
    const texH = artRows * CELL_HEIGHT;

    const layers = [
      { canvas: stemsCanvas, type: 'stems' },
      { canvas: flower1Canvas, type: 'flower1' },
      { canvas: flower2Canvas, type: 'flower2' },
      { canvas: flower3Canvas, type: 'flower3' }
    ];

    layers.forEach(layer => {
      const octx = layer.canvas.getContext('2d');
      octx.setTransform(1, 0, 0, 1, 0, 0);
      octx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
      octx.scale(2, 2);
      octx.font = '700 11px "JetBrains Mono", "Fira Code", monospace';
      octx.textBaseline = 'top';
      octx.textAlign = 'left';

      for (let r = 0; r < rawLines.length; r++) {
        const lineNum = r + 1;
        const line = rawLines[r];
        const y = r * CELL_HEIGHT;

        for (let c = 0; c < line.length; c++) {
          const char = line[c];
          if (char === ' ') continue;

          const charLayer = getCharacterLayer(lineNum, c);
          const x = c * CELL_WIDTH;

          // Dibujar caracter si corresponde a esta capa
          if (layer.type === 'stems') {
            if (char === ':') {
              // Fondo etereo de baja intensidad
              octx.fillStyle = theme.bgGrid;
              octx.shadowBlur = 0;
              octx.fillText(char, x, y);
            } else if (lineNum >= 112) {
              // Suelo / Base dorada
              octx.shadowColor = theme.base.glow;
              octx.shadowBlur = 10;
              octx.fillStyle = theme.base.dense;
              octx.fillText(char, x, y);
            } else if (charLayer === 'stems') {
              // Tallo o hoja verde
              const st = theme.stem;
              if (char === '@' || char === '%' || char === '#') {
                octx.shadowColor = st.glow;
                octx.shadowBlur = 12;
                octx.fillStyle = st.body;
                octx.fillText(char, x, y);
                octx.shadowBlur = 3;
                octx.fillStyle = '#ffffff';
                octx.fillText(char, x, y);
              } else if (char === '*' || char === '+') {
                octx.shadowColor = st.glow;
                octx.shadowBlur = 8;
                octx.fillStyle = st.highlight;
                octx.fillText(char, x, y);
              } else {
                octx.shadowColor = st.shadowGlow;
                octx.shadowBlur = 4;
                octx.fillStyle = st.shadow;
                octx.fillText(char, x, y);
              }
            }
          } else if (layer.type === charLayer) {
            // Petalo de tulipan ROJO
            const fl = theme.flower;
            if (char === '@' || char === '%' || char === '#') {
              octx.shadowColor = fl.glow;
              octx.shadowBlur = 14;
              octx.fillStyle = fl.body;
              octx.fillText(char, x, y);
              octx.shadowBlur = 3;
              octx.fillStyle = '#ffffff';
              octx.fillText(char, x, y);
            } else if (char === '*' || char === '+') {
              octx.shadowColor = fl.glow;
              octx.shadowBlur = 9;
              octx.fillStyle = fl.highlight;
              octx.fillText(char, x, y);
            } else {
              octx.shadowColor = fl.shadowGlow;
              octx.shadowBlur = 5;
              octx.fillStyle = fl.shadow;
              octx.fillText(char, x, y);
            }
          }
        }
      }
    });
  }

  // ========================================================
  // 3. MOTOR DE PARTICULAS Y PETALOS FLOTANTES
  // ========================================================
  class FloatingPetal {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * viewportWidth;
      this.y = initial ? Math.random() * viewportHeight : -15;
      this.size = 2.0 + Math.random() * 3.5;
      this.speedY = 0.35 + Math.random() * 0.55;
      this.speedX = (Math.random() - 0.5) * 0.45;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.025;
      this.alpha = 0.25 + Math.random() * 0.55;
      this.color = Math.random() > 0.35 ? '#ff0033' : '#ff2a4b';
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX + (windForce * 0.045);
      this.rotation += this.rotSpeed;

      if (this.y > viewportHeight + 20 || this.x < -20 || this.x > viewportWidth + 20) {
        this.reset(false);
      }
    }

    draw(targetCtx) {
      targetCtx.save();
      targetCtx.translate(this.x * dpr, this.y * dpr);
      targetCtx.rotate(this.rotation);
      targetCtx.beginPath();
      targetCtx.ellipse(0, 0, this.size * 0.55 * dpr, this.size * 1.35 * dpr, 0, 0, Math.PI * 2);
      targetCtx.fillStyle = this.color;
      targetCtx.globalAlpha = Math.max(0, Math.min(1, this.alpha));
      targetCtx.shadowBlur = 8 * dpr;
      targetCtx.shadowColor = this.color;
      targetCtx.fill();
      targetCtx.restore();
    }
  }

  class StardustParticle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * viewportWidth;
      this.y = initial ? Math.random() * viewportHeight : viewportHeight + 15;
      this.radius = 0.8 + Math.random() * 2.0;
      this.speedY = -(0.2 + Math.random() * 0.45);
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.baseAlpha = 0.2 + Math.random() * 0.5;
      this.alpha = this.baseAlpha;
      this.pulsePhase = Math.random() * Math.PI * 2;
      this.color = Math.random() > 0.4 ? '#00ff88' : '#76ff03';
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX + (windForce * 0.03);
      this.pulsePhase += 0.03;
      this.alpha = this.baseAlpha + Math.sin(this.pulsePhase) * 0.15;

      if (this.y < -15 || this.x < -15 || this.x > viewportWidth + 15) {
        this.reset(false);
      }
    }

    draw(targetCtx) {
      targetCtx.save();
      targetCtx.beginPath();
      targetCtx.arc(this.x * dpr, this.y * dpr, this.radius * dpr, 0, Math.PI * 2);
      targetCtx.fillStyle = this.color;
      targetCtx.globalAlpha = Math.max(0, Math.min(1, this.alpha));
      targetCtx.shadowBlur = 10 * dpr;
      targetCtx.shadowColor = this.color;
      targetCtx.fill();
      targetCtx.restore();
    }
  }

  const petals = [];
  const stars = [];
  for (let i = 0; i < 22; i++) petals.push(new FloatingPetal());
  for (let i = 0; i < 28; i++) stars.push(new StardustParticle());

  // ========================================================
  // 4. CAMARA Y FISICA DE VIENTO ARMONICO
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

    // Margen holgado para centrado optimo en movil
    const marginX = viewportWidth * 0.86;
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

  // Calculo del balanceo organico por fila
  let windForce = 0;
  let windVelocity = 0;

  function calculateRowSway(r, now) {
    const totalRows = artRows;
    const normH = Math.max(0, (totalRows - 1 - r) / (totalRows - 1));
    const flex = Math.pow(normH, 1.35);

    const natural = Math.sin(now * 0.0013 + r * 0.022) * 16 * flex +
                    Math.sin(now * 0.0026 + r * 0.045) * 6 * flex;
    const interactive = windForce * flex;

    return natural + interactive;
  }

  // Animacion de apertura / florecimiento
  let isRevealed = false;
  let revealStartTime = 0;

  function triggerReveal() {
    isRevealed = true;
    revealStartTime = performance.now();
  }

  // ========================================================
  // 5. RENDERIZADO DEL ARBOL DE TULIPANES Y FLORECIMIENTO
  // ========================================================
  function drawSwayingStemsLayer(now, alpha, compositeOp, revealRatio) {
    ctx.save();
    if (compositeOp !== 'source-over') {
      ctx.globalCompositeOperation = compositeOp;
    }
    ctx.globalAlpha = alpha;

    const totalRows = artRows;
    const maxRow = Math.ceil(totalRows * revealRatio);

    for (let r = 0; r < maxRow; r++) {
      const sway = calculateRowSway(r, now);

      const sx = 0;
      const sy = r * CELL_HEIGHT * 2;
      const sw = stemsCanvas.width;
      const sh = CELL_HEIGHT * 2;

      const dx = -camera.artW / 2 + sway;
      const dy = -camera.artH / 2 + r * CELL_HEIGHT;
      const dw = camera.artW;
      const dh = CELL_HEIGHT;

      ctx.drawImage(stemsCanvas, sx, sy, sw, sh, dx, dy, dw, dh);
    }
    ctx.restore();
  }

  function drawBloomingFlower(flowerCanvas, pivot, now, alpha, compositeOp, bloomProgress, baseAngle, swayRow) {
    if (bloomProgress <= 0) return;

    ctx.save();
    if (compositeOp !== 'source-over') {
      ctx.globalCompositeOperation = compositeOp;
    }
    ctx.globalAlpha = alpha;

    // Curva de florecimiento suave (cubica inversa)
    const easeBloom = 1 - Math.pow(1 - bloomProgress, 3);
    // Respiracion viva sutil de los petalos
    const breathe = 1.0 + Math.sin(now * 0.0016) * 0.035;

    // Apertura fisica: los petalos se abren horizontalmente de 0.58x a 1.05x
    const scaleX = (0.58 + 0.42 * easeBloom) * breathe;
    const scaleY = (0.86 + 0.14 * easeBloom) * breathe;

    // Balanceo del tallo en el punto de anclaje de la flor
    const stemSway = calculateRowSway(pivot.row, now);
    const stemSwayAbove = calculateRowSway(Math.max(0, pivot.row - 6), now);
    // Inclinacion natural calculada por la pendiente de la curva del tallo
    const stemSlopeAngle = (stemSwayAbove - stemSway) / (6 * CELL_HEIGHT);
    const flowerAngle = baseAngle * easeBloom + stemSlopeAngle;

    // Ubicacion del pivote en el lienzo
    const worldPivotX = -camera.artW / 2 + pivot.x + stemSway;
    const worldPivotY = -camera.artH / 2 + pivot.y;

    ctx.translate(worldPivotX, worldPivotY);
    ctx.rotate(flowerAngle);
    ctx.scale(scaleX, scaleY);

    // Dibujar el lienzo de la flor con centro exacto en el pivote
    ctx.drawImage(flowerCanvas, -pivot.x, -pivot.y, camera.artW, camera.artH);

    ctx.restore();
  }

  // ========================================================
  // 6. BUCLE PRINCIPAL DE DIBUJO (60/120 FPS)
  // ========================================================
  function loop(now) {
    // Interpolacion de camara suave (lerp)
    camera.x += (camera.targetX - camera.x) * 0.18;
    camera.y += (camera.targetY - camera.y) * 0.18;
    camera.scale += (camera.targetScale - camera.scale) * 0.18;

    // Amortiguacion y retorno del viento
    windForce += (windVelocity - windForce * 0.08);
    windVelocity *= 0.92;

    let bloomProgress = 0;
    if (isRevealed) {
      const elapsed = (now - revealStartTime) / 2600; // 2.6s para abrirse por completo
      bloomProgress = Math.min(1, Math.max(0, elapsed));
    }

    ctx.clearRect(0, 0, mainStage.width, mainStage.height);

    // 1. Dibujar particulas flotantes de luz y petalos
    for (let i = 0; i < stars.length; i++) {
      stars[i].update();
      stars[i].draw(ctx);
    }
    for (let i = 0; i < petals.length; i++) {
      petals[i].update();
      petals[i].draw(ctx);
    }

    // 2. Renderizado de los tulipanes en Canvas
    if (isRevealed && stemsCanvas) {
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.translate(camera.x, camera.y);
      ctx.scale(camera.scale, camera.scale);

      const breathingGlow = 0.88 + Math.sin(now * 0.002) * 0.12;

      // A) Tallos y Hojas Verdes (Bloom + Primario)
      drawSwayingStemsLayer(now, 0.40 * breathingGlow, 'screen', 1.0);
      drawSwayingStemsLayer(now, 1.0, 'source-over', 1.0);

      // B) Flor 1 (Izquierda): Florece abriendose hacia la izquierda (-0.08 rad)
      drawBloomingFlower(flower1Canvas, PIVOT1, now, 0.45 * breathingGlow, 'screen', bloomProgress, -0.08, PIVOT1.row);
      drawBloomingFlower(flower1Canvas, PIVOT1, now, 1.0, 'source-over', bloomProgress, -0.08, PIVOT1.row);

      // C) Flor 2 (Superior derecha): Florece abriendose hacia arriba/derecha (+0.04 rad)
      drawBloomingFlower(flower2Canvas, PIVOT2, now, 0.45 * breathingGlow, 'screen', bloomProgress, 0.04, PIVOT2.row);
      drawBloomingFlower(flower2Canvas, PIVOT2, now, 1.0, 'source-over', bloomProgress, 0.04, PIVOT2.row);

      // D) Flor 3 (Inferior derecha): Florece abriendose hacia la derecha (+0.06 rad)
      drawBloomingFlower(flower3Canvas, PIVOT3, now, 0.45 * breathingGlow, 'screen', bloomProgress, 0.06, PIVOT3.row);
      drawBloomingFlower(flower3Canvas, PIVOT3, now, 1.0, 'source-over', bloomProgress, 0.06, PIVOT3.row);

      ctx.restore();
    }

    requestAnimationFrame(loop);
  }

  // ========================================================
  // 7. GESTOS TACTILES Y RATON (FLUIDO CON INERCIA)
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
      windVelocity += dx * 0.14; // Brisa al deslizar
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
    windVelocity += dx * 0.14;
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
  // 8. SINTETIZADOR DE AUDIO PROCEDURAL (CALIDO Y RELAJANTE)
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
  // 9. EVENTOS DE INTERFAZ Y APERTURA
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
    renderAllLayers(FLORAL_THEMES[currentThemeIndex]);
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
  renderAllLayers(FLORAL_THEMES[currentThemeIndex]);
  updateFitScale();
  requestAnimationFrame(loop);
})();
