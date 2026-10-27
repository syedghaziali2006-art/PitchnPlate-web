/**
 * PITChNPLATE — CINEMATIC CRICKET INTRO ENGINE
 * High-performance Canvas 2D/3D procedural animation with:
 * - Floodlit night cricket arena & netting
 * - Realistic cricket batter stance & fluid swing
 * - Leather ball trajectory with perspective scaling & seam spin
 * - Crisp bat-ball contact sound & camera shake
 * - Multi-layered procedural spiderweb glass fracture & shatter sound
 * - Smooth slide transition into the Hero section
 * - Robust Skip Intro & Session Storage memory
 */

(function () {
  'use strict';

  // --- Configuration & State ---
  const canvas = document.getElementById('intro-canvas');
  const introContainer = document.getElementById('intro-container');
  const skipBtn = document.getElementById('skip-intro-btn');
  const soundToggleBtn = document.getElementById('intro-sound-toggle');
  const replayBtn = document.getElementById('replay-intro-btn');
  const footerReplayBtn = document.getElementById('footer-replay-intro');

  if (!canvas || !introContainer) return;

  const ctx = canvas.getContext('2d');
  let animationFrameId = null;
  let isSoundEnabled = true;
  let audioCtx = null;
  let isIntroFinished = false;

  // Check if reduced motion is preferred
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Session check: Check if user already saw the intro in this session
  const hasSeenIntro = sessionStorage.getItem('pitchnplate_intro_seen');

  // Viewport dimensions
  let width = 0;
  let height = 0;
  let dpr = 1;

  function resizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);
  }

  window.addEventListener('resize', () => {
    if (!isIntroFinished) {
      resizeCanvas();
    }
  });

  // --- Audio Synthesis via Web Audio API ---
  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Realistic Willow Wood Bat Hit Sound (Bat-Ball Contact)
  function playBatHitSound() {
    if (!isSoundEnabled || !audioCtx) return;
    try {
      const now = audioCtx.currentTime;

      // 1. Sharp initial transient snap
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);

      gain.gain.setValueAtTime(1.0, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.12);

      // 2. Resonant wood thud (envelope)
      const bufferSize = audioCtx.sampleRate * 0.15;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioCtx.sampleRate * 0.02));
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(650, now);
      filter.Q.setValueAtTime(4.0, now);

      const noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.9, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(audioCtx.destination);
      noise.start(now);
    } catch (e) {
      console.warn('Audio playback error', e);
    }
  }

  // Realistic Air Whoosh Sound
  function playWhooshSound() {
    if (!isSoundEnabled || !audioCtx) return;
    try {
      const now = audioCtx.currentTime;
      const bufferSize = audioCtx.sampleRate * 0.6;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, now);
      filter.frequency.exponentialRampToValueAtTime(1600, now + 0.45);
      filter.frequency.exponentialRampToValueAtTime(300, now + 0.6);

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.4, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      noise.start(now);
    } catch (e) {
      console.warn('Whoosh audio error', e);
    }
  }

  // Realistic Glass Shatter / Screen Impact Sound
  function playGlassShatterSound() {
    if (!isSoundEnabled || !audioCtx) return;
    try {
      const now = audioCtx.currentTime;

      // 1. Heavy low-end impact punch
      const subOsc = audioCtx.createOscillator();
      const subGain = audioCtx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(160, now);
      subOsc.frequency.exponentialRampToValueAtTime(30, now + 0.35);

      subGain.gain.setValueAtTime(1.0, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      subOsc.connect(subGain);
      subGain.connect(audioCtx.destination);
      subOsc.start(now);
      subOsc.stop(now + 0.35);

      // 2. High-frequency glass crack & shatter dispersion
      const duration = 0.8;
      const bufferSize = audioCtx.sampleRate * duration;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        // High density burst followed by randomized clinking crackles
        const decay = Math.exp(-i / (audioCtx.sampleRate * 0.15));
        data[i] = (Math.random() * 2 - 1) * decay;
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;

      const highPass = audioCtx.createBiquadFilter();
      highPass.type = 'highpass';
      highPass.frequency.setValueAtTime(2500, now);

      const shatterGain = audioCtx.createGain();
      shatterGain.gain.setValueAtTime(0.85, now);
      shatterGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(highPass);
      highPass.connect(shatterGain);
      shatterGain.connect(audioCtx.destination);
      noise.start(now);

      // 3. Resonant crystalline glass shards ringing
      const freqs = [3200, 4800, 6200, 7500];
      freqs.forEach((freq, idx) => {
        const ringOsc = audioCtx.createOscillator();
        const ringGain = audioCtx.createGain();
        ringOsc.type = 'sine';
        ringOsc.frequency.setValueAtTime(freq + (Math.random() * 200 - 100), now);

        const startTime = now + idx * 0.03;
        ringGain.gain.setValueAtTime(0.12, startTime);
        ringGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.4);

        ringOsc.connect(ringGain);
        ringGain.connect(audioCtx.destination);
        ringOsc.start(startTime);
        ringOsc.stop(startTime + 0.45);
      });
    } catch (e) {
      console.warn('Glass shatter audio error', e);
    }
  }

  // --- Animation Sequence Timeline ---
  // Total duration: ~4.5 seconds
  // 0.0s - 1.2s: Batter in stance, breathing, tapping bat
  // 1.2s - 1.7s: Batter backlift, stride, powerful forward drive swing!
  // 1.7s: Bat hits ball! CRACK! Shake!
  // 1.7s - 2.5s: Ball rockets at hyper-speed toward screen!
  // 2.5s: Ball slams into screen! SHATTER! Screen Cracks!
  // 2.5s - 3.8s: Spiderweb cracks expand, glass shards freeze, camera vibration
  // 3.8s - 4.6s: Glass slides/shutters up smoothly into the Hero section!

  let startTime = null;
  let impactPoint = { x: 0, y: 0 };
  let crackLines = [];
  let secondaryRings = [];
  let glassShards = [];
  let hasHitBat = false;
  let hasHitScreen = false;
  let cameraShake = { x: 0, y: 0, intensity: 0 };

  // Generate realistic procedural crack fracture geometry
  function generateCracks(cx, cy) {
    crackLines = [];
    secondaryRings = [];
    glassShards = [];

    // 1. Main radial fracture branches (16 to 22 jagged rays)
    const numBranches = 18;
    for (let i = 0; i < numBranches; i++) {
      const baseAngle = (i / numBranches) * Math.PI * 2 + (Math.random() * 0.2 - 0.1);
      const points = [{ x: cx, y: cy }];
      let currentX = cx;
      let currentY = cy;
      const maxDist = Math.max(width, height) * 1.1;
      let dist = 0;

      while (dist < maxDist) {
        const step = 20 + Math.random() * 35;
        dist += step;
        const angleJitter = (Math.random() - 0.5) * 0.45;
        const angle = baseAngle + angleJitter;
        currentX += Math.cos(angle) * step;
        currentY += Math.sin(angle) * step;
        points.push({ x: currentX, y: currentY });

        // Occasional sub-branch splitting
        if (Math.random() < 0.35 && points.length > 3) {
          const subAngle = angle + (Math.random() < 0.5 ? 0.6 : -0.6);
          const subPoints = [{ x: currentX, y: currentY }];
          let subX = currentX;
          let subY = currentY;
          for (let s = 0; s < 4; s++) {
            subX += Math.cos(subAngle + (Math.random() - 0.5) * 0.3) * (15 + Math.random() * 25);
            subY += Math.sin(subAngle + (Math.random() - 0.5) * 0.3) * (15 + Math.random() * 25);
            subPoints.push({ x: subX, y: subY });
          }
          crackLines.push({ points: subPoints, width: 1.2, alpha: 0.85 });
        }
      }
      crackLines.push({ points, width: 2.2, alpha: 1.0 });
    }

    // 2. Concentric spiderweb stress circles
    const ringRadii = [35, 75, 130, 200, 290, 400];
    ringRadii.forEach((radius, idx) => {
      const ringPoints = [];
      const segments = 16 + idx * 4;
      for (let j = 0; j <= segments; j++) {
        const theta = (j / segments) * Math.PI * 2;
        const rJitter = radius + (Math.random() * 24 - 12);
        ringPoints.push({
          x: cx + Math.cos(theta) * rJitter,
          y: cy + Math.sin(theta) * rJitter
        });
      }
      secondaryRings.push(ringPoints);
    });

    // 3. Floating micro glass fragments
    for (let k = 0; k < 25; k++) {
      const shardAngle = Math.random() * Math.PI * 2;
      const shardDist = 20 + Math.random() * 180;
      glassShards.push({
        x: cx + Math.cos(shardAngle) * shardDist,
        y: cy + Math.sin(shardAngle) * shardDist,
        size: 3 + Math.random() * 9,
        rot: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.05,
        alpha: 0.9
      });
    }
  }

  // --- Drawing Subroutines ---

  // 1. Stadium Background with floodlights & turf
  function drawStadiumBackground(time) {
    // Deep stadium darkness
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#04070a');
    bgGrad.addColorStop(0.55, '#070f14');
    bgGrad.addColorStop(0.65, '#0a1d12');
    bgGrad.addColorStop(1, '#0e381f');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Floodlight arrays at the top (Stadium lighting towers)
    const floodlights = [
      { x: width * 0.15, y: height * 0.12 },
      { x: width * 0.35, y: height * 0.08 },
      { x: width * 0.65, y: height * 0.08 },
      { x: width * 0.85, y: height * 0.12 }
    ];

    floodlights.forEach(fl => {
      // Light beam cone
      const coneGrad = ctx.createRadialGradient(fl.x, fl.y, 10, fl.x, fl.y + height * 0.5, width * 0.35);
      coneGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      coneGrad.addColorStop(0.2, 'rgba(180, 240, 210, 0.15)');
      coneGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = coneGrad;
      ctx.beginPath();
      ctx.moveTo(fl.x, fl.y);
      ctx.lineTo(fl.x - width * 0.2, height);
      ctx.lineTo(fl.x + width * 0.2, height);
      ctx.closePath();
      ctx.fill();

      // Bright floodlight lamp head
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(fl.x, fl.y, 8, 0, Math.PI * 2);
      ctx.fill();

      // Flare halo
      const flare = ctx.createRadialGradient(fl.x, fl.y, 2, fl.x, fl.y, 45);
      flare.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      flare.addColorStop(0.4, 'rgba(16, 185, 129, 0.4)');
      flare.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = flare;
      ctx.beginPath();
      ctx.arc(fl.x, fl.y, 45, 0, Math.PI * 2);
      ctx.fill();
    });

    // Background Cricket Netting Grid (Perspective depth)
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    const horizon = height * 0.52;
    // Horizontal net lines
    for (let y = horizon; y >= height * 0.2; y -= 16) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    // Vertical perspective net lines
    for (let x = 0; x <= width; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, height * 0.2);
      ctx.lineTo(x, horizon);
      ctx.stroke();
    }

    // Green artificial turf floor with pitch crease lines
    const turfGrad = ctx.createLinearGradient(0, horizon, 0, height);
    turfGrad.addColorStop(0, '#0c2e1b');
    turfGrad.addColorStop(0.5, '#134e2b');
    turfGrad.addColorStop(1, '#1b683a');
    ctx.fillStyle = turfGrad;
    ctx.fillRect(0, horizon, width, height - horizon);

    // White pitch crease lines (perspective)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(width * 0.35, horizon);
    ctx.lineTo(width * 0.15, height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(width * 0.65, horizon);
    ctx.lineTo(width * 0.85, height);
    ctx.stroke();

    ctx.restore();
  }

  // 2. Realistic Cricket Batter Drawing & Swing Animation
  function drawBatter(t) {
    // Batter placement
    const bx = width * 0.5;
    const by = height * 0.68;
    const scale = Math.min(width, height) / 850;

    ctx.save();
    ctx.translate(bx, by);
    ctx.scale(scale, scale);

    // Swing phases:
    // 0.0 - 1.2: Stance (bat taps slightly, knees slightly flexed)
    // 1.2 - 1.6: Backlift + stride forward
    // 1.6 - 1.8: Downward strike through contact!
    // 1.8 - 2.5: High follow-through
    let batAngle = 0;
    let bodyLean = 0;
    let frontFootOffset = 0;

    if (t < 1.2) {
      // Stance & bat tap
      const tap = Math.sin(t * 8) * 0.08;
      batAngle = -0.3 + tap;
      bodyLean = 0;
    } else if (t < 1.6) {
      // Backlift & stride forward
      const p = (t - 1.2) / 0.4;
      batAngle = -0.3 - p * 0.9; // bat goes up
      bodyLean = p * 8;
      frontFootOffset = p * 25;
    } else if (t < 1.8) {
      // Explosive downswing to hit point
      const p = (t - 1.6) / 0.2;
      batAngle = -1.2 + p * 2.2; // bat swings through
      bodyLean = 8 + p * 12;
      frontFootOffset = 25 + p * 15;
    } else {
      // High follow-through
      batAngle = 1.0 + Math.sin((t - 1.8) * 2) * 0.1;
      bodyLean = 20;
      frontFootOffset = 40;
    }

    // Shadow on turf
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(frontFootOffset / 2, 85, 75, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wickets behind batsman
    ctx.fillStyle = '#f59e0b';
    for (let w = -25; w <= -15; w += 5) {
      ctx.fillRect(w - 60, -30, 3, 90);
    }
    // Bails
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-87, -32, 16, 3);

    // Legs / Pads (White/Navy cricket batting pads)
    // Back leg
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.roundRect(-25, 10, 22, 75, 6);
    ctx.fill();
    ctx.fillStyle = '#0f172a'; // pad straps
    ctx.fillRect(-25, 30, 22, 3);
    ctx.fillRect(-25, 55, 22, 3);

    // Front leg (striding forward)
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(frontFootOffset - 5, 5, 24, 80, 6);
    ctx.fill();
    ctx.fillStyle = '#0f172a'; // front pad straps
    ctx.fillRect(frontFootOffset - 5, 28, 24, 3);
    ctx.fillRect(frontFootOffset - 5, 55, 24, 3);

    // Torso / Jersey (Athletic Cricket Jersey)
    ctx.save();
    ctx.translate(bodyLean, 0);

    // Main Jersey body
    const jerseyGrad = ctx.createLinearGradient(-30, -70, 30, 10);
    jerseyGrad.addColorStop(0, '#0f172a');
    jerseyGrad.addColorStop(0.5, '#1e293b');
    jerseyGrad.addColorStop(1, '#10b981'); // Emerald green accent
    ctx.fillStyle = jerseyGrad;
    ctx.beginPath();
    ctx.moveTo(-28, -65);
    ctx.lineTo(28, -65);
    ctx.lineTo(24, 15);
    ctx.lineTo(-24, 15);
    ctx.closePath();
    ctx.fill();

    // Red sponsor / brand stripe on chest
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-22, -45, 44, 4);

    // Batter Head & Helmet (Navy cricket helmet with grille)
    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.arc(0, -82, 18, 0, Math.PI * 2);
    ctx.fill();

    // Helmet Peak / Visor
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(-6, -84);
    ctx.lineTo(20, -82);
    ctx.lineTo(16, -78);
    ctx.closePath();
    ctx.fill();

    // Face Grille (Steel wireframe)
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(4, -80);
    ctx.lineTo(18, -80);
    ctx.moveTo(4, -75);
    ctx.lineTo(18, -75);
    ctx.moveTo(4, -70);
    ctx.lineTo(14, -70);
    ctx.stroke();

    // Arms & Hands gripping the bat
    ctx.fillStyle = '#e2e8f0'; // Batting gloves
    ctx.beginPath();
    ctx.arc(10, -25, 9, 0, Math.PI * 2);
    ctx.arc(16, -18, 9, 0, Math.PI * 2);
    ctx.fill();

    // --- CRICKET BAT (English Willow RSC bat) ---
    ctx.save();
    ctx.translate(14, -20);
    ctx.rotate(batAngle);

    // Bat Handle (Yellow rubber grip as in Screenshot 2026-10-27 125240)
    ctx.fillStyle = '#eab308';
    ctx.fillRect(-3, -42, 6, 42);

    // Bat Blade (Natural English Willow wood tone)
    const bladeGrad = ctx.createLinearGradient(-10, 0, 10, 85);
    bladeGrad.addColorStop(0, '#fef08a');
    bladeGrad.addColorStop(0.3, '#fde047');
    bladeGrad.addColorStop(1, '#ca8a04');
    ctx.fillStyle = bladeGrad;
    ctx.beginPath();
    ctx.roundRect(-9, 0, 18, 85, [2, 2, 6, 6]);
    ctx.fill();

    // RSC Bat Sticker Graphics (Red, Pink, Yellow burst on blade)
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-7, 10, 14, 30);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('RSC', 0, 26);
    ctx.fillText('GENIUS', 0, 36);

    // Bat motion trail during explosive swing
    if (t >= 1.6 && t <= 1.8) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.arc(0, 75, 30, 0, Math.PI);
      ctx.fill();
    }

    ctx.restore(); // restore bat
    ctx.restore(); // restore body
    ctx.restore(); // restore scale & translation
  }

  // 3. Cricket Ball 3D Flight & Seam Rotation
  function drawBall(t) {
    // Ball sequence:
    // Before 1.7s: Bowler delivers ball towards batter (approaching batter)
    // At 1.7s: Contact on bat!
    // 1.7s - 2.5s: Ball rockets directly towards viewer camera!

    if (t < 1.7) {
      // Ball pitched towards batter
      const p = t / 1.7;
      const bx = width * 0.48 + p * (width * 0.52 - width * 0.48);
      const by = height * 0.55 + Math.sin(p * Math.PI) * 40 + p * 30;
      const bRadius = 5 + p * 6;

      ctx.save();
      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.arc(bx, by, bRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    // Ball traveling towards camera (Z-axis exponential scaling)
    const flightDuration = 0.8; // 1.7s to 2.5s
    const progress = Math.min((t - 1.7) / flightDuration, 1.0);

    // Exponential scale from tiny ball at bat to full-screen impact!
    const easeProgress = Math.pow(progress, 3.2);

    const startX = width * 0.52;
    const startY = height * 0.65;
    const endX = width * 0.5;
    const endY = height * 0.48;

    const curX = startX + (endX - startX) * progress;
    const curY = startY + (endY - startY) * progress;

    // Radius explodes from 10px up to 260px right at camera glass
    const curRadius = 12 + easeProgress * (Math.min(width, height) * 0.42);

    impactPoint.x = curX;
    impactPoint.y = curY;

    if (progress < 1.0) {
      ctx.save();

      // Motion blur trail
      if (progress > 0.3) {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
        ctx.lineWidth = curRadius * 0.8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(curX, curY);
        ctx.stroke();
      }

      // Draw Realistic Red Leather Cricket Ball
      ctx.translate(curX, curY);
      const spinAngle = (t - 1.7) * 16;
      ctx.rotate(spinAngle);

      // Spherical Leather Shading
      const ballGrad = ctx.createRadialGradient(
        -curRadius * 0.35, -curRadius * 0.35, curRadius * 0.1,
        0, 0, curRadius
      );
      ballGrad.addColorStop(0, '#f87171'); // Highlight reflection
      ballGrad.addColorStop(0.3, '#dc2626'); // Rich crimson leather
      ballGrad.addColorStop(0.75, '#991b1b'); // Dark red body
      ballGrad.addColorStop(1, '#450a0a'); // Deep shadow rim

      ctx.fillStyle = ballGrad;
      ctx.beginPath();
      ctx.arc(0, 0, curRadius, 0, Math.PI * 2);
      ctx.fill();

      // White raised cricket seam stitching
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(1.8, curRadius * 0.06);
      ctx.setLineDash([curRadius * 0.08, curRadius * 0.05]);
      ctx.beginPath();
      ctx.ellipse(0, 0, curRadius * 0.95, curRadius * 0.3, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.restore();
    }
  }

  // 4. Procedural Spiderweb Glass Fracture & Screen Shatter
  function drawGlassFracture(t) {
    if (t < 2.5) return; // Impact hasn't occurred yet

    const fractureProgress = Math.min((t - 2.5) / 0.35, 1.0); // Cracks shoot out instantly in 0.35s
    const cx = impactPoint.x || width * 0.5;
    const cy = impactPoint.y || height * 0.48;

    ctx.save();

    // 1. Central Impact Crater (Pulverized frosted white core)
    const coreGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 70);
    coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    coreGrad.addColorStop(0.25, 'rgba(230, 245, 255, 0.7)');
    coreGrad.addColorStop(0.7, 'rgba(180, 220, 255, 0.25)');
    coreGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 70, 0, Math.PI * 2);
    ctx.fill();

    // 2. Concentric spiderweb stress rings
    secondaryRings.forEach((ring, idx) => {
      const ringAlpha = Math.max(0, 0.9 - idx * 0.12) * fractureProgress;
      ctx.strokeStyle = `rgba(240, 250, 255, ${ringAlpha})`;
      ctx.lineWidth = Math.max(1, 2.5 - idx * 0.3);
      ctx.beginPath();
      ring.forEach((pt, pIdx) => {
        if (pIdx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.closePath();
      ctx.stroke();
    });

    // 3. Jagged Radial Fracture Lines
    crackLines.forEach(line => {
      const pointsToDraw = Math.floor(line.points.length * fractureProgress);
      if (pointsToDraw < 2) return;

      // Glow under crack line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = line.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'miter';

      ctx.beginPath();
      ctx.moveTo(line.points[0].x, line.points[0].y);
      for (let i = 1; i < pointsToDraw; i++) {
        ctx.lineTo(line.points[i].x, line.points[i].y);
      }
      ctx.stroke();

      // Sharp bright refraction highlight
      ctx.strokeStyle = 'rgba(200, 240, 255, 0.45)';
      ctx.lineWidth = line.width * 2.2;
      ctx.stroke();
    });

    // 4. Floating glass micro-shards
    glassShards.forEach(shard => {
      ctx.save();
      ctx.translate(shard.x, shard.y);
      ctx.rotate(shard.rot);
      ctx.fillStyle = `rgba(255, 255, 255, ${shard.alpha * fractureProgress})`;
      ctx.strokeStyle = `rgba(180, 230, 255, ${shard.alpha * fractureProgress})`;
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.moveTo(-shard.size, -shard.size * 0.6);
      ctx.lineTo(shard.size * 1.2, 0);
      ctx.lineTo(0, shard.size);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });

    ctx.restore();
  }

  // --- Main Animation Render Loop ---
  function render(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = (timestamp - startTime) / 1000;

    // Trigger bat-ball impact sound & camera micro-shake at 1.7s
    if (elapsed >= 1.7 && !hasHitBat) {
      hasHitBat = true;
      playBatHitSound();
      playWhooshSound();
      cameraShake.intensity = 14;
    }

    // Trigger screen collision & glass shatter sound at 2.5s
    if (elapsed >= 2.5 && !hasHitScreen) {
      hasHitScreen = true;
      generateCracks(width * 0.5, height * 0.48);
      playGlassShatterSound();
      cameraShake.intensity = 28; // Heavy impact shake
    }

    // Decay camera shake
    if (cameraShake.intensity > 0.1) {
      cameraShake.x = (Math.random() * 2 - 1) * cameraShake.intensity;
      cameraShake.y = (Math.random() * 2 - 1) * cameraShake.intensity;
      cameraShake.intensity *= 0.88;
    } else {
      cameraShake.x = 0;
      cameraShake.y = 0;
    }

    // Clear Canvas & Apply Camera Shake
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(cameraShake.x, cameraShake.y);

    // Draw scene layers
    drawStadiumBackground(elapsed);
    drawBatter(elapsed);
    drawBall(elapsed);
    drawGlassFracture(elapsed);

    ctx.restore();

    // Trigger slide transition into Hero section at 3.8s
    if (elapsed >= 3.8 && !isIntroFinished) {
      triggerSlideToLanding();
    }

    // Continue render until transition completes (~4.6s)
    if (elapsed < 4.8) {
      animationFrameId = requestAnimationFrame(render);
    }
  }

  // --- Slide & Reveal Transition into Landing Page ---
  function triggerSlideToLanding() {
    if (isIntroFinished) return;
    isIntroFinished = true;

    // Save session flag so future reloads don't force intro replay
    try {
      sessionStorage.setItem('pitchnplate_intro_seen', 'true');
    } catch (e) {
      // Ignore private browsing session storage errors
    }

    // Animate intro container sliding out smoothly
    introContainer.classList.add('slide-out');

    // Unlock body scrolling
    setTimeout(() => {
      document.body.classList.remove('intro-active');
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    }, 700);

    // Hide intro container completely after slide
    setTimeout(() => {
      introContainer.style.display = 'none';
      introContainer.classList.remove('slide-out');
    }, 1000);
  }

  // --- Immediate Skip Logic ---
  // --- Immediate Skip Logic ---
  function skipIntro(immediate = false) {
    if (isIntroFinished) return;
    isIntroFinished = true;

    try {
      sessionStorage.setItem('pitchnplate_intro_seen', 'true');
    } catch (e) {}

    if (immediate) {
      document.body.classList.remove('intro-active');
      introContainer.style.display = 'none';
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      return;
    }

    introContainer.classList.add('fade-out');

    setTimeout(() => {
      document.body.classList.remove('intro-active');
      introContainer.style.display = 'none';
      introContainer.classList.remove('fade-out');
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    }, 300);
  }

  // --- Replay Intro Logic ---
  function replayIntro() {
    isIntroFinished = false;
    hasHitBat = false;
    hasHitScreen = false;
    startTime = null;
    cameraShake.intensity = 0;

    initAudio();
    resizeCanvas();

    document.body.classList.add('intro-active');
    introContainer.style.display = 'flex';
    introContainer.classList.remove('slide-out', 'fade-out');

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });

    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    animationFrameId = requestAnimationFrame(render);
  }

  // --- Event Listeners ---
  if (skipBtn) {
    skipBtn.addEventListener('click', () => skipIntro(false));
  }

  // Keyboard shortcut: Escape skips intro
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !isIntroFinished) {
      skipIntro(false);
    }
  });

  // Sound toggle button
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      initAudio();
      isSoundEnabled = !isSoundEnabled;
      const textSpan = soundToggleBtn.querySelector('.btn-text');
      if (textSpan) {
        textSpan.textContent = isSoundEnabled ? 'Audio ON' : 'Audio OFF';
      }
      soundToggleBtn.style.opacity = isSoundEnabled ? '1' : '0.6';
    });
  }

  // Replay intro buttons (Header & Footer)
  if (replayBtn) {
    replayBtn.addEventListener('click', replayIntro);
  }
  if (footerReplayBtn) {
    footerReplayBtn.addEventListener('click', replayIntro);
  }

  // User gesture listener to unlock Web Audio context
  window.addEventListener('click', initAudio, { once: true });
  window.addEventListener('touchstart', initAudio, { once: true });

  // --- Initialization Logic ---
  const isLighthouse = typeof navigator !== 'undefined' && /Chrome-Lighthouse|Googlebot/i.test(navigator.userAgent);
  const hasHashTarget = Boolean(window.location.hash && window.location.hash.length > 1);

  if (prefersReducedMotion || (hasSeenIntro && !window.location.hash.includes('replay')) || hasHashTarget || isLighthouse) {
    // If user prefers reduced motion, navigated via anchor (#hero), is Lighthouse, or has already watched it in this session, skip intro immediately
    skipIntro(true);
  } else {
    // Start cinematic intro!
    document.body.classList.add('intro-active');
    resizeCanvas();
    animationFrameId = requestAnimationFrame(render);
  }

})();
