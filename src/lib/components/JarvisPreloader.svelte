<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { playGridTone, playTypeChar, playDeleteChar, playWordLand, playDismiss, playPulse, isMuted, toggleMute, playToggle } from '$lib/audio/sfx';

  let { onComplete }: { onComplete: () => void } = $props();

  let container: HTMLDivElement;
  let canvas: HTMLCanvasElement;
  let textEl: HTMLSpanElement;
  let dismissed = false;
  let animId: number;
  let isHovering = false;
  let cycleTimeout: ReturnType<typeof setTimeout>;
  let typeInterval: ReturnType<typeof setInterval>;

  const NEON: [number, number, number] = [0, 255, 180];

  const mainName = 'Sowmya';
  const cycleWords = ['Developer', 'Engineer', 'Creator', 'Designer', 'Sowmya'];
  let displayText = $state('');
  let currentCycleIdx = 0;
  let isCycling = false;
  let introComplete = false;

  let mouse = { x: 0, y: 0 };
  let audioUnlocked = $state(false);
  let sfxMuted = $state(isMuted());

  function handleSfxToggle(e: MouseEvent) {
    e.stopPropagation();
    if (!audioUnlocked) {
      // First click: always enable sound
      audioUnlocked = true;
      if (isMuted()) toggleMute(); // ensure unmuted
      sfxMuted = false;
      playToggle();
    } else {
      sfxMuted = toggleMute();
      if (!sfxMuted) playToggle();
    }
  }

  let lastMouseX = 0;
  let lastMouseY = 0;

  function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;
  }

  function onMouseDown(e: MouseEvent) {
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    unlockAudio();
  }

  function onMouseMove(e: MouseEvent) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    // Feed mouse speed to grid tone
    if (audioUnlocked && !dismissed) {
      const dx = e.clientX - lastMouseX;
      const dy = e.clientY - lastMouseY;
      const speed = Math.sqrt(dx * dx + dy * dy);
      playGridTone(speed);
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    }

    if (!introComplete || dismissed) return;
    if (textEl) {
      const rect = textEl.getBoundingClientRect();
      const pad = 80;
      const near = (
        e.clientX > rect.left - pad &&
        e.clientX < rect.right + pad &&
        e.clientY > rect.top - pad &&
        e.clientY < rect.bottom + pad
      );

      if (near && !isHovering && !isCycling) {
        isHovering = true;
        startCycling();
      } else if (!near && isHovering) {
        isHovering = false;
      }
    }
  }

  function typeText(text: string, speed: number): Promise<void> {
    return new Promise((resolve) => {
      displayText = '';
      let i = 0;
      clearInterval(typeInterval);
      typeInterval = setInterval(() => {
        if (i < text.length) {
          displayText = text.slice(0, i + 1);
          playTypeChar();
          i++;
        } else {
          clearInterval(typeInterval);
          resolve();
        }
      }, speed);
    });
  }

  function deleteText(speed: number): Promise<void> {
    return new Promise((resolve) => {
      let text = displayText;
      clearInterval(typeInterval);
      typeInterval = setInterval(() => {
        if (text.length > 0) {
          text = text.slice(0, -1);
          displayText = text;
          playDeleteChar();
        } else {
          clearInterval(typeInterval);
          resolve();
        }
      }, speed);
    });
  }

  async function startCycling() {
    if (isCycling || dismissed) return;
    isCycling = true;
    currentCycleIdx = 0;

    while (currentCycleIdx < cycleWords.length && !dismissed) {
      const word = cycleWords[currentCycleIdx];

      await deleteText(40);
      await new Promise(r => cycleTimeout = setTimeout(r, 150));
      await typeText(word, 60);

      if (word === mainName) {
        playWordLand();
        break;
      }

      await new Promise(r => cycleTimeout = setTimeout(r, 800));
      currentCycleIdx++;
    }

    isCycling = false;
  }

  let cmdInput: HTMLInputElement;

  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    clearInterval(typeInterval);
    clearTimeout(cycleTimeout);
    playDismiss();

    const tl = gsap.timeline({ onComplete });
    tl.to('.preloader-text', { y: -30, opacity: 0, duration: 0.3, ease: 'power2.in' }, 0);
    tl.to('.cmd-bar', { y: 20, opacity: 0, duration: 0.3, ease: 'power2.in' }, 0);
    tl.to(container, { opacity: 0, duration: 0.5, ease: 'power2.in' }, 0.2);
  }

  function handleCmdFocus() { dismiss(); }
  function handleCmdClick() { dismiss(); }

  onMount(() => {
    const ctx = canvas.getContext('2d')!;
    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    mouse.x = W / 2;
    mouse.y = H / 2;

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
      // Re-scatter particles on resize
      for (const p of particles) {
        if (p.x > W) p.x = Math.random() * W;
        if (p.y > H) p.y = Math.random() * H;
      }
    }
    window.addEventListener('resize', resize);

    const COLS = 40;
    const ROWS = 25;
    const warpRadius = 200;
    const warpForce = 40;

    const grid: [number, number][][] = [];
    for (let row = 0; row <= ROWS; row++) {
      grid[row] = [];
      for (let col = 0; col <= COLS; col++) {
        grid[row][col] = [0, 0];
      }
    }

    // --- Particles ---
    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = [];
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        size: Math.random() * 2.5 + 0.5,
        alpha: Math.random() * 0.4 + 0.15
      });
    }

    // --- Scan line ---
    let scanY = -100;

    // --- Mouse trail ---
    const trail: { x: number; y: number; age: number }[] = [];
    const TRAIL_LENGTH = 25;

    // --- Pulse rings (expand from center periodically) ---
    const pulseRings: { x: number; y: number; r: number; maxR: number; alpha: number }[] = [];
    let pulseTimer = 0;

    // --- Edge glow bars ---
    let edgePhase = 0;

    // --- Frame counter ---
    let frameCount = 0;

    function draw() {
      frameCount++;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);

      const cellW = W / COLS;
      const cellH = H / ROWS;

      // Compute warped grid
      for (let row = 0; row <= ROWS; row++) {
        for (let col = 0; col <= COLS; col++) {
          const ox = col * cellW;
          const oy = row * cellH;
          const dx = ox - mouse.x;
          const dy = oy - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < warpRadius && dist > 1) {
            const force = (1 - dist / warpRadius) * warpForce;
            grid[row][col][0] = ox - (dx / dist) * force * 0.8;
            grid[row][col][1] = oy - (dy / dist) * force * 0.8;
          } else {
            grid[row][col][0] = ox;
            grid[row][col][1] = oy;
          }
        }
      }

      // Draw grid lines
      ctx.strokeStyle = `rgba(${NEON[0]}, ${NEON[1]}, ${NEON[2]}, 0.25)`;
      ctx.lineWidth = 0.8;

      for (let row = 0; row <= ROWS; row++) {
        ctx.beginPath();
        ctx.moveTo(grid[row][0][0], grid[row][0][1]);
        for (let col = 1; col <= COLS; col++) {
          ctx.lineTo(grid[row][col][0], grid[row][col][1]);
        }
        ctx.stroke();
      }

      for (let col = 0; col <= COLS; col++) {
        ctx.beginPath();
        ctx.moveTo(grid[0][col][0], grid[0][col][1]);
        for (let row = 1; row <= ROWS; row++) {
          ctx.lineTo(grid[row][col][0], grid[row][col][1]);
        }
        ctx.stroke();
      }

      // Glow dots at grid intersections near mouse
      for (let row = 0; row <= ROWS; row++) {
        for (let col = 0; col <= COLS; col++) {
          const wx = grid[row][col][0];
          const wy = grid[row][col][1];
          const dist = Math.hypot(wx - mouse.x, wy - mouse.y);
          if (dist < warpRadius) {
            const t = 1 - dist / warpRadius;
            ctx.beginPath();
            ctx.arc(wx, wy, 1 + t * 2.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${NEON[0]}, ${NEON[1]}, ${NEON[2]}, ${t * 0.9})`;
            ctx.fill();
          }
        }
      }

      // --- Mouse Trail ---
      trail.unshift({ x: mouse.x, y: mouse.y, age: 0 });
      if (trail.length > TRAIL_LENGTH) trail.pop();
      for (let i = 1; i < trail.length; i++) {
        trail[i].age++;
        const t = 1 - i / trail.length;
        ctx.beginPath();
        ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
        ctx.lineTo(trail[i].x, trail[i].y);
        ctx.strokeStyle = `rgba(${NEON[0]}, ${NEON[1]}, ${NEON[2]}, ${t * 0.3})`;
        ctx.lineWidth = t * 3;
        ctx.stroke();
      }
      // Trail head glow
      if (trail.length > 0) {
        const headGrd = ctx.createRadialGradient(trail[0].x, trail[0].y, 0, trail[0].x, trail[0].y, 15);
        headGrd.addColorStop(0, `rgba(${NEON[0]}, ${NEON[1]}, ${NEON[2]}, 0.25)`);
        headGrd.addColorStop(1, 'transparent');
        ctx.fillStyle = headGrd;
        ctx.fillRect(trail[0].x - 15, trail[0].y - 15, 30, 30);
      }

      // --- Particles ---
      for (const p of particles) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 300 && dist > 1) {
          const force = (1 - dist / 300) * 0.12;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        const glowDist = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        const glow = glowDist < 200 ? (1 - glowDist / 200) * 0.5 : 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size + glow * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${NEON[0]}, ${NEON[1]}, ${NEON[2]}, ${p.alpha + glow})`;
        ctx.fill();

        if (glow > 0.1) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size + glow * 6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${NEON[0]}, ${NEON[1]}, ${NEON[2]}, ${glow * 0.12})`;
          ctx.fill();
        }
      }

      // Connect nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const d = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${NEON[0]}, ${NEON[1]}, ${NEON[2]}, ${(1 - d / 120) * 0.12})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
        // Connect particles to mouse if close
        const dm = Math.hypot(particles[i].x - mouse.x, particles[i].y - mouse.y);
        if (dm < 180) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(${NEON[0]}, ${NEON[1]}, ${NEON[2]}, ${(1 - dm / 180) * 0.15})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }

      // --- Pulse Rings (from center, every ~180 frames) ---
      pulseTimer++;
      if (pulseTimer >= 180) {
        pulseTimer = 0;
        pulseRings.push({ x: W / 2, y: H / 2, r: 0, maxR: Math.max(W, H) * 0.6, alpha: 0.2 });
        playPulse();
      }
      for (let i = pulseRings.length - 1; i >= 0; i--) {
        const ring = pulseRings[i];
        ring.r += 2.5;
        ring.alpha = 0.2 * (1 - ring.r / ring.maxR);
        if (ring.alpha <= 0) {
          pulseRings.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${NEON[0]}, ${NEON[1]}, ${NEON[2]}, ${ring.alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // --- Scan Line ---
      scanY += 1.2;
      if (scanY > H + 100) scanY = -100;

      const scanGrad = ctx.createLinearGradient(0, scanY - 40, 0, scanY + 40);
      scanGrad.addColorStop(0, 'transparent');
      scanGrad.addColorStop(0.4, `rgba(${NEON[0]}, ${NEON[1]}, ${NEON[2]}, 0.025)`);
      scanGrad.addColorStop(0.5, `rgba(${NEON[0]}, ${NEON[1]}, ${NEON[2]}, 0.07)`);
      scanGrad.addColorStop(0.6, `rgba(${NEON[0]}, ${NEON[1]}, ${NEON[2]}, 0.025)`);
      scanGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 40, W, 80);

      ctx.strokeStyle = `rgba(${NEON[0]}, ${NEON[1]}, ${NEON[2]}, 0.12)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(W, scanY);
      ctx.stroke();

      ctx.strokeStyle = `rgba(${NEON[0]}, ${NEON[1]}, ${NEON[2]}, 0.35)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(30, scanY);
      ctx.moveTo(W, scanY);
      ctx.lineTo(W - 30, scanY);
      ctx.stroke();

      // --- Edge Glow Bars ---
      edgePhase += 0.015;
      const edgeLen = 200;

      // Top edge
      const topX = ((Math.sin(edgePhase) + 1) / 2) * (W - edgeLen);
      const topGrad = ctx.createLinearGradient(topX, 0, topX + edgeLen, 0);
      topGrad.addColorStop(0, 'transparent');
      topGrad.addColorStop(0.5, `rgba(${NEON[0]}, ${NEON[1]}, ${NEON[2]}, 0.4)`);
      topGrad.addColorStop(1, 'transparent');
      ctx.strokeStyle = topGrad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(topX, 0);
      ctx.lineTo(topX + edgeLen, 0);
      ctx.stroke();

      // Bottom edge
      const botX = ((Math.cos(edgePhase * 0.8) + 1) / 2) * (W - edgeLen);
      const botGrad = ctx.createLinearGradient(botX, H, botX + edgeLen, H);
      botGrad.addColorStop(0, 'transparent');
      botGrad.addColorStop(0.5, `rgba(${NEON[0]}, ${NEON[1]}, ${NEON[2]}, 0.4)`);
      botGrad.addColorStop(1, 'transparent');
      ctx.strokeStyle = botGrad;
      ctx.beginPath();
      ctx.moveTo(botX, H);
      ctx.lineTo(botX + edgeLen, H);
      ctx.stroke();

      // Left edge
      const leftY = ((Math.sin(edgePhase * 1.2 + 1) + 1) / 2) * (H - edgeLen);
      const leftGrad = ctx.createLinearGradient(0, leftY, 0, leftY + edgeLen);
      leftGrad.addColorStop(0, 'transparent');
      leftGrad.addColorStop(0.5, `rgba(${NEON[0]}, ${NEON[1]}, ${NEON[2]}, 0.3)`);
      leftGrad.addColorStop(1, 'transparent');
      ctx.strokeStyle = leftGrad;
      ctx.beginPath();
      ctx.moveTo(0, leftY);
      ctx.lineTo(0, leftY + edgeLen);
      ctx.stroke();

      // Right edge
      const rightY = ((Math.cos(edgePhase * 0.9 + 2) + 1) / 2) * (H - edgeLen);
      const rightGrad = ctx.createLinearGradient(0, rightY, 0, rightY + edgeLen);
      rightGrad.addColorStop(0, 'transparent');
      rightGrad.addColorStop(0.5, `rgba(${NEON[0]}, ${NEON[1]}, ${NEON[2]}, 0.3)`);
      rightGrad.addColorStop(1, 'transparent');
      ctx.strokeStyle = rightGrad;
      ctx.beginPath();
      ctx.moveTo(W, rightY);
      ctx.lineTo(W, rightY + edgeLen);
      ctx.stroke();

      // Mouse glow
      const grd = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 250);
      grd.addColorStop(0, `rgba(${NEON[0]}, ${NEON[1]}, ${NEON[2]}, 0.06)`);
      grd.addColorStop(0.5, `rgba(${NEON[0]}, ${NEON[1]}, ${NEON[2]}, 0.02)`);
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      // Vignette
      const vig = ctx.createRadialGradient(W / 2, H / 2, W * 0.2, W / 2, H / 2, W * 0.7);
      vig.addColorStop(0, 'transparent');
      vig.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      // --- Corner HUD ---
      ctx.font = '500 10px JetBrains Mono';
      ctx.textBaseline = 'top';

      const hudPad = 24;
      const hudColor = `rgba(${NEON[0]}, ${NEON[1]}, ${NEON[2]}, 0.55)`;

      // Top-left — stack & identity
      ctx.textAlign = 'left';
      ctx.fillStyle = hudColor;
      ctx.fillText(`ROLE: AI_ENGINEER`, hudPad, hudPad);
      ctx.fillText(`STACK: LANGCHAIN / NESTJS / NEXT.JS`, hudPad, hudPad + 16);
      ctx.fillText(`LOCATION: GERMANY`, hudPad, hudPad + 32);

      // Top-right — system stats
      ctx.textAlign = 'right';
      ctx.fillText(`PARTICLES: ${particles.length}`, W - hudPad, hudPad);
      ctx.fillText(`CURSOR: ${Math.round(mouse.x)}, ${Math.round(mouse.y)}`, W - hudPad, hudPad + 16);
      ctx.fillText(`STATUS: OPEN_TO_WORK`, W - hudPad, hudPad + 32);

      // Bottom-left — tools
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`DATA: NEO4J / REDIS / POSTGRESQL`, hudPad, H - hudPad);
      ctx.fillText(`INFRA: DOCKER / K8S / GITLAB`, hudPad, H - hudPad - 16);

      // Bottom-right — live data
      ctx.textAlign = 'right';
      const t = new Date();
      const timeStr = t.toTimeString().split(' ')[0];
      ctx.fillText(timeStr, W - hudPad, H - hudPad);
      ctx.fillText(`FPS: ${Math.round(60 + Math.sin(frameCount * 0.05) * 2)}`, W - hudPad, H - hudPad - 16);

      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';

      animId = requestAnimationFrame(draw);
    }

    draw();

    // Entrance timeline
    const tl = gsap.timeline();

    tl.fromTo(canvas, { opacity: 0 }, { opacity: 1, duration: 1, ease: 'power2.out' }, 0);

    tl.call(async () => {
      await typeText(mainName, 100);
      introComplete = true;
    }, [], 0.8);

    tl.fromTo('.type-cursor', { opacity: 0 }, { opacity: 1, duration: 0.01 }, 0.8);

    tl.fromTo('.cmd-bar', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 2);

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(typeInterval);
      clearTimeout(cycleTimeout);
      window.removeEventListener('resize', resize);
    };
  });
</script>

<svelte:window onmousemove={onMouseMove} onmousedown={onMouseDown} onkeydown={unlockAudio} ontouchstart={unlockAudio} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="preloader" bind:this={container}>
  <canvas bind:this={canvas}></canvas>

  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="sfx-toggle-wrap">
    {#if !audioUnlocked}
      <span class="sfx-hint">click for sound</span>
    {/if}
    <button class="sfx-toggle-preloader" onclick={handleSfxToggle} title={sfxMuted ? 'Enable sounds' : 'Mute sounds'}>
      {#if !audioUnlocked || sfxMuted}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M11 5L6 9H2v6h4l5 4V5z"/>
          <line x1="23" y1="9" x2="17" y2="15"/>
          <line x1="17" y1="9" x2="23" y2="15"/>
        </svg>
      {:else}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M11 5L6 9H2v6h4l5 4V5z"/>
          <path d="M15.54 8.46a5 5 0 010 7.07"/>
          <path d="M19.07 4.93a10 10 0 010 14.14"/>
        </svg>
      {/if}
    </button>
  </div>

  <div class="center-content">
    <div class="preloader-text">
      <span class="typed-text" bind:this={textEl}>{displayText}</span><span class="type-cursor">_</span>
    </div>
    <div class="subtitle">hover my name</div>
  </div>

  <div class="cmd-bar">
    <div class="cmd-wrapper" onclick={handleCmdClick}>
      <span class="cmd-prompt">&gt;</span>
      <input
        bind:this={cmdInput}
        class="cmd-input"
        type="text"
        placeholder="start conversation..."
        onfocus={handleCmdFocus}
        autocomplete="off"
        spellcheck="false"
      />
    </div>
  </div>
</div>

<style>
  .preloader {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    cursor: pointer;
  }

  .sfx-toggle-wrap {
    position: absolute;
    top: 72px;
    right: 24px;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .sfx-hint {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem;
    color: rgba(0, 255, 180, 0.7);
    letter-spacing: 0.05em;
    white-space: nowrap;
    animation: hint-pulse 2s ease-in-out infinite;
    text-shadow: 0 0 8px rgba(0, 255, 180, 0.3);
  }

  @keyframes hint-pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }

  .sfx-toggle-preloader {
    all: unset;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 6px;
    border: 1px solid rgba(0, 255, 180, 0.15);
    background: rgba(0, 0, 0, 0.4);
    color: rgba(0, 255, 180, 0.5);
    transition: color 0.2s, border-color 0.2s, background 0.2s;
    animation: btn-glow 2s ease-in-out infinite;
  }

  @keyframes btn-glow {
    0%, 100% { box-shadow: none; }
    50% { box-shadow: 0 0 12px rgba(0, 255, 180, 0.15); }
  }

  .sfx-toggle-preloader:hover {
    color: rgba(0, 255, 180, 0.9);
    border-color: rgba(0, 255, 180, 0.4);
    background: rgba(0, 255, 180, 0.08);
    animation: none;
  }

  canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .center-content {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.8rem;
    pointer-events: none;
  }

  .preloader-text {
    display: flex;
    align-items: baseline;
    min-height: 5rem;
  }

  .typed-text {
    font-family: 'Orbitron', sans-serif;
    font-size: 4.5rem;
    font-weight: 700;
    color: rgb(0, 255, 180);
    letter-spacing: 0.1em;
    text-shadow:
      0 0 20px rgba(0, 255, 180, 0.5),
      0 0 60px rgba(0, 255, 180, 0.15),
      0 0 100px rgba(0, 255, 180, 0.05);
    white-space: nowrap;
  }

  .type-cursor {
    font-family: 'Orbitron', sans-serif;
    font-size: 4.5rem;
    font-weight: 700;
    color: rgb(0, 255, 180);
    animation: blink 0.6s step-end infinite;
    text-shadow: 0 0 20px rgba(0, 255, 180, 0.6);
    opacity: 0;
    margin-left: 2px;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  @keyframes cmd-pulse {
    0%, 100% {
      border-color: rgba(0, 255, 180, 0.15);
      box-shadow: 0 0 10px rgba(0, 255, 180, 0.03);
    }
    50% {
      border-color: rgba(0, 255, 180, 0.35);
      box-shadow: 0 0 25px rgba(0, 255, 180, 0.1), 0 0 50px rgba(0, 255, 180, 0.04);
    }
  }

  .subtitle {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    color: rgba(0, 255, 180, 0.3);
    letter-spacing: 0.2em;
    text-transform: lowercase;
    animation: fade-in-sub 0.5s ease 2.5s both;
  }

  @keyframes fade-in-sub {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .cmd-bar {
    position: absolute;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 3;
    opacity: 0;
  }

  .cmd-wrapper {
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(0, 0, 0, 0.6);
    border: 1px solid rgba(0, 255, 180, 0.15);
    border-radius: 10px;
    padding: 14px 22px;
    min-width: 380px;
    cursor: text;
    transition: border-color 0.3s, box-shadow 0.3s, background 0.3s;
    animation: cmd-pulse 2.5s ease-in-out infinite;
  }

  .cmd-wrapper:hover {
    border-color: rgba(0, 255, 180, 0.3);
    box-shadow: 0 0 20px rgba(0, 255, 180, 0.08), 0 0 40px rgba(0, 255, 180, 0.03);
    background: rgba(0, 0, 0, 0.7);
  }

  .cmd-prompt {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.95rem;
    font-weight: 500;
    color: rgb(0, 255, 180);
    text-shadow: 0 0 8px rgba(0, 255, 180, 0.5);
    user-select: none;
    flex-shrink: 0;
  }

  .cmd-input {
    background: none;
    border: none;
    outline: none;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.88rem;
    color: rgba(0, 255, 180, 0.7);
    width: 100%;
    caret-color: rgb(0, 255, 180);
  }

  .cmd-input::placeholder {
    color: rgba(0, 255, 180, 0.25);
    font-style: normal;
  }

  @media (max-width: 640px) {
    .typed-text, .type-cursor {
      font-size: 2.5rem;
    }

    .preloader-text {
      min-height: 3.5rem;
    }
  }
</style>
