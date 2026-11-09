/**
 * ========================================================
 * MOTOR DE RENDERIZADO EN CANVAS - TULIPANES ROJOS VIVOS
 * Animacion de apertura botanica, fisica armonica de balanceo
 * y atlas de glifos de alta definicion para moviles
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
  const letterBtn = document.getElementById('letter-btn');
  const letterSheet = document.getElementById('letter-sheet');
  const sheetBackdrop = document.getElementById('sheet-backdrop');
  const closeSheetBtn = document.getElementById('close-sheet-btn');

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
        body: '#ff0038',
        highlight: '#ff2a4b',
        shadow: '#8a0018',
        glow: '#ff0033',
        shadowGlow: '#660012'
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
      particleColors: ['#ff0038', '#ff2a4b', '#00ff88', '#76ff03']
    },
    {
      id: 'red-ruby-gold',
      name: 'Tulipanes Rojo Rubi Imperial',
      flower: {
        dense: '#ffffff',
        body: '#ff1744',
        highlight: '#ff5252',
        shadow: '#9b0000',
        glow: '#ff1744',
        shadowGlow: '#7a0000'
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
        shadow: '#700000',
        glow: '#ff0022',
        shadowGlow: '#4d0000'
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
  // 2. PARSEO ANATOMICO DEL ARTE ASCII Y EXTRACCION DE DATOS
  // ========================================================
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

  // Identificador anatomico estricto y preciso al caracter
  function getCharacterRole(lineNum, c) {
    // 1. Flor izquierda (filas 29 a 54)
    if (lineNum >= 29 && lineNum <= 54) {
      let maxC = 70;
      if (lineNum === 51) maxC = 71;
      if (lineNum === 53) maxC = 66;
      if (lineNum === 54) maxC = 63;
      if (c >= 24 && c <= maxC) {
        return { type: 'flower', id: 1, centerC: 48, baseR: 53, topR: 28 };
      }
    }
    // 2. Flor superior derecha (filas 14 a 38)
    if (lineNum >= 14 && lineNum <= 38 && c >= 74 && c <= 113) {
      return { type: 'flower', id: 2, centerC: 94, baseR: 37, topR: 13 };
    }
    // 3. Flor inferior derecha (filas 39 a 61)
    if (lineNum >= 39 && lineNum <= 61) {
      let minC = 90, maxC = 118;
      if (lineNum === 39) { minC = 99; maxC = 115; }
      else if (lineNum === 40) { minC = 98; maxC = 116; }
      else if (lineNum === 41) { minC = 97; maxC = 117; }
      else if (lineNum === 42) { minC = 96; maxC = 117; }
      else if (lineNum === 43) { minC = 95; maxC = 117; }
      else if (lineNum === 44) { minC = 94; maxC = 117; }
      else if (lineNum === 45) { minC = 93; maxC = 117; }
      else if (lineNum === 46) { minC = 92; maxC = 117; }
      else if (lineNum <= 49) { minC = 91; maxC = 117; }
      else if (lineNum <= 51) { minC = 90; maxC = 117; }
      else if (lineNum <= 54) { minC = 89; maxC = 116; }
      else if (lineNum === 55) { minC = 90; maxC = 115; }
      else if (lineNum === 56) { minC = 91; maxC = 114; }
      else if (lineNum === 57) { minC = 92; maxC = 113; }
      else if (lineNum === 58) { minC = 93; maxC = 112; }
      else if (lineNum === 59) { minC = 94; maxC = 110; }
      else if (lineNum === 60) { minC = 97; maxC = 109; }
      else if (lineNum === 61) { minC = 98; maxC = 101; }
      if (c >= minC && c <= maxC) {
        return { type: 'flower', id: 3, centerC: 104, baseR: 60, topR: 38 };
      }
    }
    if (lineNum >= 112) return { type: 'base' };
    return { type: 'stem' };
  }

  // Arreglo de los 2,099 caracteres de flores rojas interactivos
  const flowerCharacters = [];
  for (let r = 0; r < rawLines.length; r++) {
    const line = rawLines[r];
    const lineNum = r + 1;
    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === ' ' || char === ':') continue;
      const role = getCharacterRole(lineNum, c);
      if (role.type === 'flower') {
        let tier = 3;
        if (char === '@' || char === '%') tier = 0; // denso
        else if (char === '#') tier = 1; // cuerpo
        else if (char === '*' || char === '+') tier = 2; // realce
        flowerCharacters.push({
          char,
          r,
          c,
          flowerId: role.id,
          centerC: role.centerC,
          baseR: role.baseR,
          topR: role.topR,
          tier
        });
      }
    }
  }

  // ========================================================
  // 3. ATLAS DE GLIFOS Y TEXTURAS OFFSCREEN EN ALTA DEFINICION
  // ========================================================
  const GLYPH_CHARS = ['@', '%', '#', '*', '+', '-', '='];
  const GLYPH_INDEX = { '@': 0, '%': 1, '#': 2, '*': 3, '+': 4, '-': 5, '=': 6 };
  const TILE_SIZE = 32;

  let glyphAtlasCanvas = null;
  let stemsCanvas = null;
  let bgCanvas = null;

  function buildGlyphAtlas(theme) {
    if (!glyphAtlasCanvas) {
      glyphAtlasCanvas = document.createElement('canvas');
      glyphAtlasCanvas.width = GLYPH_CHARS.length * TILE_SIZE * 2;
      glyphAtlasCanvas.height = 4 * TILE_SIZE * 2;
    }
    const actx = glyphAtlasCanvas.getContext('2d');
    actx.setTransform(1, 0, 0, 1, 0, 0);
    actx.clearRect(0, 0, glyphAtlasCanvas.width, glyphAtlasCanvas.height);
    actx.scale(2, 2);
    actx.font = '700 11px "JetBrains Mono", "Fira Code", monospace';
    actx.textAlign = 'center';
    actx.textBaseline = 'middle';

    const fl = theme.flower;
    const tierStyles = [
      { fill: fl.dense, glow: fl.glow, blur: 14, isCore: true },
      { fill: fl.body, glow: fl.glow, blur: 10, isCore: false },
      { fill: fl.highlight, glow: fl.highlight, blur: 8, isCore: false },
      { fill: fl.shadow, glow: fl.shadowGlow, blur: 5, isCore: false }
    ];

    for (let tier = 0; tier < 4; tier++) {
      const style = tierStyles[tier];
      for (let g = 0; g < GLYPH_CHARS.length; g++) {
        const char = GLYPH_CHARS[g];
        const cx = g * TILE_SIZE + TILE_SIZE / 2;
        const cy = tier * TILE_SIZE + TILE_SIZE / 2;

        actx.save();
        actx.shadowColor = style.glow;
        actx.shadowBlur = style.blur;
        actx.fillStyle = style.fill;
        actx.fillText(char, cx, cy);

        if (style.isCore) {
          actx.shadowBlur = 3;
          actx.fillStyle = '#ffffff';
          actx.fillText(char, cx, cy);
        }
        actx.restore();
      }
    }
  }

  function renderStaticBuffers(theme) {
    if (!stemsCanvas) {
      stemsCanvas = document.createElement('canvas');
      stemsCanvas.width = artCols * CELL_WIDTH * 2;
      stemsCanvas.height = artRows * CELL_HEIGHT * 2;

      bgCanvas = document.createElement('canvas');
      bgCanvas.width = artCols * CELL_WIDTH * 2;
      bgCanvas.height = artRows * CELL_HEIGHT * 2;
    }

    // A. Fondo etereo de matriz de dos puntos (colons)
    const bctx = bgCanvas.getContext('2d');
    bctx.setTransform(1, 0, 0, 1, 0, 0);
    bctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    bctx.scale(2, 2);
    bctx.font = '700 11px "JetBrains Mono", "Fira Code", monospace';
    bctx.textAlign = 'left';
    bctx.textBaseline = 'top';
    bctx.fillStyle = theme.bgGrid;

    for (let r = 0; r < rawLines.length; r++) {
      const line = rawLines[r];
      const y = r * CELL_HEIGHT;
      for (let c = 0; c < line.length; c++) {
        if (line[c] === ':') {
          bctx.fillText(':', c * CELL_WIDTH, y);
        }
      }
    }

    // B. Tallos verdes, hojas y suelo dorado
    const sctx = stemsCanvas.getContext('2d');
    sctx.setTransform(1, 0, 0, 1, 0, 0);
    sctx.clearRect(0, 0, stemsCanvas.width, stemsCanvas.height);
    sctx.scale(2, 2);
    sctx.font = '700 11px "JetBrains Mono", "Fira Code", monospace';
    sctx.textAlign = 'left';
    sctx.textBaseline = 'top';

    const st = theme.stem;
    const bs = theme.base;

    for (let r = 0; r < rawLines.length; r++) {
      const lineNum = r + 1;
      const line = rawLines[r];
      const y = r * CELL_HEIGHT;

      for (let c = 0; c < line.length; c++) {
        const char = line[c];
        if (char === ' ' || char === ':') continue;

        const role = getCharacterRole(lineNum, c);
        if (role.type === 'flower') continue; // Las flores se dibujan en vivo

        const x = c * CELL_WIDTH;

        if (role.type === 'base') {
          sctx.shadowColor = bs.glow;
          sctx.shadowBlur = 10;
          sctx.fillStyle = bs.dense;
          sctx.fillText(char, x, y);
        } else if (role.type === 'stem') {
          if (char === '@' || char === '%' || char === '#') {
            sctx.shadowColor = st.glow;
            sctx.shadowBlur = 12;
            sctx.fillStyle = st.body;
            sctx.fillText(char, x, y);
            sctx.shadowBlur = 3;
            sctx.fillStyle = '#ffffff';
            sctx.fillText(char, x, y);
          } else if (char === '*' || char === '+') {
            sctx.shadowColor = st.glow;
            sctx.shadowBlur = 8;
            sctx.fillStyle = st.highlight;
            sctx.fillText(char, x, y);
          } else {
            sctx.shadowColor = st.shadowGlow;
            sctx.shadowBlur = 4;
            sctx.fillStyle = st.shadow;
            sctx.fillText(char, x, y);
          }
        }
      }
    }
  }

  function applyTheme(theme) {
    buildGlyphAtlas(theme);
    renderStaticBuffers(theme);
  }

  // ========================================================
  // 4. PARTICULAS AMBIENTALES Y ESTELA DE CHISPAS
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
      this.color = Math.random() > 0.35 ? '#ff0038' : '#ff2a4b';
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

  class SparkleParticle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * 1.8;
      this.vy = (Math.random() - 0.5) * 1.8 - 0.4;
      this.size = 1.0 + Math.random() * 2.2;
      this.alpha = 1.0;
      this.decay = 0.024 + Math.random() * 0.028;
      this.color = Math.random() > 0.45 ? '#ffd54f' : '#ff2a4b';
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= this.decay;
    }

    draw(targetCtx) {
      if (this.alpha <= 0) return;
      targetCtx.save();
      targetCtx.beginPath();
      targetCtx.arc(this.x * dpr, this.y * dpr, this.size * dpr, 0, Math.PI * 2);
      targetCtx.fillStyle = this.color;
      targetCtx.globalAlpha = Math.max(0, this.alpha);
      targetCtx.shadowBlur = 12 * dpr;
      targetCtx.shadowColor = this.color;
      targetCtx.fill();
      targetCtx.restore();
    }
  }

  const petals = [];
  const stars = [];
  const sparkles = [];

  function spawnSparkles(x, y, count = 2) {
    for (let i = 0; i < count; i++) {
      if (sparkles.length < 80) {
        sparkles.push(new SparkleParticle(x, y));
      }
    }
  }

  for (let i = 0; i < 22; i++) petals.push(new FloatingPetal());
  for (let i = 0; i < 28; i++) stars.push(new StardustParticle());

  // ========================================================
  // 5. CAMARA Y FISICA BOTANICA CONTINUA (CANTILEVER BEAM)
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

    const marginX = viewportWidth * 0.88;
    const marginY = viewportHeight * 0.84;

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

  let windForce = 0;
  let windVelocity = 0;

  // Deformacion suave y continua del tallo:
  // La base (r >= 112) tiene deflexion exactamente 0.
  // El vertice superior se inclina con una curvatura cuadratica continua
  function calculateStemSway(r, now) {
    const normH = Math.max(0, Math.min(1, (112 - r) / 112));
    const flex = Math.pow(normH, 1.85);

    const wave1 = Math.sin(now * 0.0011 + r * 0.018) * 13 * flex;
    const wave2 = Math.sin(now * 0.0022 + r * 0.034) * 4.5 * flex;
    const interactive = windForce * flex;

    return wave1 + wave2 + interactive;
  }

  let isRevealed = false;
  let revealStartTime = 0;

  function triggerReveal() {
    isRevealed = true;
    revealStartTime = performance.now();
  }

  // ========================================================
  // 6. RENDERIZADO DINAMICO DE TALLOS Y FLORECIMIENTO
  // ========================================================
  function drawSwayingStems(now, alpha, compositeOp) {
    ctx.save();
    if (compositeOp !== 'source-over') {
      ctx.globalCompositeOperation = compositeOp;
    }
    ctx.globalAlpha = alpha;

    for (let r = 0; r < artRows; r++) {
      const sway = calculateStemSway(r, now);

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

  function drawBloomingFlowers(now, alpha, compositeOp, bloomProgress) {
    ctx.save();
    if (compositeOp !== 'source-over') {
      ctx.globalCompositeOperation = compositeOp;
    }
    ctx.globalAlpha = alpha;

    // Curva de apertura suave (ease-out cubico)
    const easeBloom = 1 - Math.pow(1 - bloomProgress, 3);
    const budFactor = 1 - easeBloom;

    for (let i = 0; i < flowerCharacters.length; i++) {
      const p = flowerCharacters[i];
      const gIndex = GLYPH_INDEX[p.char];
      if (gIndex === undefined) continue;

      // Altura normalizada dentro del capullo (0 en la base, 1 en la punta del petalo)
      const hNorm = (p.baseR - p.r) / (p.baseR - p.topR);
      const deltaC = p.c - p.centerC;

      // 1. Apertura natural de los petalos:
      // En fase de capullo cerrado (budFactor > 0), los petalos superiores se cierran hacia el centro.
      // Al florecer (budFactor -> 0), se abren hacia afuera lateralmente.
      const bloomOffsetX = -deltaC * CELL_WIDTH * budFactor * 0.52 * Math.pow(hNorm, 1.15);
      const bloomOffsetY = (p.baseR - p.r) * CELL_HEIGHT * budFactor * 0.12;

      // 2. Respiracion organica continua de los petalos abiertos
      const breathePhase = now * 0.0016 + p.flowerId * 1.4;
      const breatheAmp = Math.sin(breathePhase);
      const breatheX = deltaC * CELL_WIDTH * breatheAmp * 0.035 * hNorm;
      const breatheY = - (p.baseR - p.r) * CELL_HEIGHT * breatheAmp * 0.012;

      // 3. Balanceo armonico unificado con la columna del tallo
      const stemSway = calculateStemSway(p.r, now);

      // Posicion final sin deformacion tipografica de la fuente
      const finalX = -camera.artW / 2 + p.c * CELL_WIDTH + stemSway + bloomOffsetX + breatheX;
      const finalY = -camera.artH / 2 + p.r * CELL_HEIGHT + bloomOffsetY + breatheY;

      // Blit de alto rendimiento desde el atlas de glifos pre-renderizado
      const sx = gIndex * TILE_SIZE * 2;
      const sy = p.tier * TILE_SIZE * 2;
      const sw = TILE_SIZE * 2;
      const sh = TILE_SIZE * 2;

      const dx = finalX + (CELL_WIDTH / 2) - (TILE_SIZE / 2);
      const dy = finalY + (CELL_HEIGHT / 2) - (TILE_SIZE / 2);
      const dw = TILE_SIZE;
      const dh = TILE_SIZE;

      ctx.drawImage(glyphAtlasCanvas, sx, sy, sw, sh, dx, dy, dw, dh);
    }

    ctx.restore();
  }

  // ========================================================
  // 7. BUCLE PRINCIPAL DE DIBUJO (60/120 FPS FLUIDO)
  // ========================================================
  function loop(now) {
    camera.x += (camera.targetX - camera.x) * 0.18;
    camera.y += (camera.targetY - camera.y) * 0.18;
    camera.scale += (camera.targetScale - camera.scale) * 0.18;

    windForce += (windVelocity - windForce * 0.08);
    windVelocity *= 0.92;

    let bloomProgress = 0;
    if (isRevealed) {
      const elapsed = (now - revealStartTime) / 2800; // 2.8s para apertura botanica completa
      bloomProgress = Math.min(1, Math.max(0, elapsed));
    }

    ctx.clearRect(0, 0, mainStage.width, mainStage.height);

    // 1. Particulas ambientales y estela tactil
    for (let i = 0; i < stars.length; i++) {
      stars[i].update();
      stars[i].draw(ctx);
    }
    for (let i = 0; i < petals.length; i++) {
      petals[i].update();
      petals[i].draw(ctx);
    }
    for (let i = sparkles.length - 1; i >= 0; i--) {
      sparkles[i].update();
      if (sparkles[i].alpha <= 0) {
        sparkles.splice(i, 1);
      } else {
        sparkles[i].draw(ctx);
      }
    }

    // 2. Renderizado del ramo de tulipanes en Canvas
    if (isRevealed && stemsCanvas) {
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.translate(camera.x, camera.y);
      ctx.scale(camera.scale, camera.scale);

      const breathingGlow = 0.88 + Math.sin(now * 0.002) * 0.12;

      // A. Matriz serena de fondo (estatica)
      if (bgCanvas) {
        ctx.drawImage(bgCanvas, 0, 0, bgCanvas.width, bgCanvas.height, -camera.artW / 2, -camera.artH / 2, camera.artW, camera.artH);
      }

      // B. Tallos y follaje verde (Pase Bloom + Pase Primario)
      drawSwayingStems(now, 0.35 * breathingGlow, 'screen');
      drawSwayingStems(now, 1.0, 'source-over');

      // C. Flores rojas vivas abriendose (Pase Bloom + Pase Primario)
      const flowerAlpha = Math.min(1, bloomProgress * 1.5);
      drawBloomingFlowers(now, 0.40 * breathingGlow * flowerAlpha, 'screen', bloomProgress);
      drawBloomingFlowers(now, 1.0 * flowerAlpha, 'source-over', bloomProgress);

      ctx.restore();
    }

    requestAnimationFrame(loop);
  }

  // ========================================================
  // 8. GESTOS TACTILES Y RATON (FLUIDO CON INERCIA)
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
      spawnSparkles(lastX, lastY, 4);
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
      windVelocity += dx * 0.14;
      spawnSparkles(e.touches[0].clientX, e.touches[0].clientY, 2);
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
    spawnSparkles(e.clientX, e.clientY, 4);
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    camera.targetX += dx;
    camera.targetY += dy;
    windVelocity += dx * 0.14;
    spawnSparkles(e.clientX, e.clientY, 2);
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
  // 9. SINTETIZADOR DE AUDIO PROCEDURAL (CALIDO Y RELAJANTE)
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
  // 10. EVENTOS DE INTERFAZ Y APERTURA
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

  // ========================================================
  // 11. CONTROLADOR DE LA CARTA DEDICATORIA (BOTTOM-SHEET)
  // Despliegue nativo y gesto de deslizar hacia abajo
  // ========================================================
  function openLetterSheet() {
    sheetBackdrop.classList.remove('sheet-backdrop-hidden');
    letterSheet.classList.remove('sheet-hidden');
    letterSheet.style.transform = '';
  }

  function closeLetterSheet() {
    sheetBackdrop.classList.add('sheet-backdrop-hidden');
    letterSheet.classList.add('sheet-hidden');
    letterSheet.style.transform = '';
  }

  letterBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openLetterSheet();
  });

  closeSheetBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeLetterSheet();
  });

  sheetBackdrop.addEventListener('click', () => {
    closeLetterSheet();
  });

  let sheetStartY = 0;
  let isDraggingSheet = false;

  letterSheet.addEventListener('touchstart', (e) => {
    sheetStartY = e.touches[0].clientY;
    isDraggingSheet = true;
    letterSheet.style.transition = 'none';
  }, { passive: true });

  letterSheet.addEventListener('touchmove', (e) => {
    if (!isDraggingSheet) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - sheetStartY;
    if (deltaY > 0) {
      letterSheet.style.transform = `translateY(${deltaY}px)`;
    }
  }, { passive: true });

  letterSheet.addEventListener('touchend', (e) => {
    if (!isDraggingSheet) return;
    isDraggingSheet = false;
    letterSheet.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
    const touchY = e.changedTouches[0].clientY;
    const deltaY = touchY - sheetStartY;

    if (deltaY > 75) {
      closeLetterSheet();
    } else {
      letterSheet.style.transform = 'translateY(0)';
    }
  });

  themeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    currentThemeIndex = (currentThemeIndex + 1) % FLORAL_THEMES.length;
    applyTheme(FLORAL_THEMES[currentThemeIndex]);
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
  applyTheme(FLORAL_THEMES[currentThemeIndex]);
  updateFitScale();
  requestAnimationFrame(loop);
})();
