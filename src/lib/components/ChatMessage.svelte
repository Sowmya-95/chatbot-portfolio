<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import ExperienceCards from './ExperienceCards.svelte';
  import ProjectCards from './ProjectCards.svelte';
  import SkillBars from './SkillBars.svelte';
  import ContactCard from './ContactCard.svelte';
  import EducationCards from './EducationCards.svelte';
  import AboutCard from './AboutCard.svelte';
  import ThinkingPanel from './ThinkingPanel.svelte';
  import type { ThinkingStep } from '$lib/chat/thinking';
  import { playScan } from '$lib/audio/sfx';

  let { message, onTypewriterDone }: {
    message: {
      role: 'user' | 'bot';
      text: string;
      component?: string;
      thinking?: ThinkingStep[];
    };
    onTypewriterDone?: () => void;
  } = $props();

  let row: HTMLDivElement;
  let scanContainer: HTMLDivElement;
  let scanLine: HTMLDivElement;
  let glitchLayer: HTMLDivElement;
  let showComponent = $state(false);
  let scanComplete = $state(false);

  const componentMap: Record<string, any> = {
    experience: ExperienceCards,
    projects: ProjectCards,
    skills: SkillBars,
    contact: ContactCard,
    education: EducationCards,
    about: AboutCard
  };

  const GLITCH_CHARS = '!@#$%^&*_+-=|;:<>?/~01▓▒░█▄▀';

  function generateGlitchText(length: number): string {
    return Array.from({ length }, () =>
      GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
    ).join('');
  }

  onMount(() => {
    if (message.role === 'bot') {
      // Bot: scan-line reveal
      const containerH = scanContainer.offsetHeight;

      // Start with text invisible (clipped) and scan line at top
      gsap.set(scanContainer, { clipPath: 'inset(0 0 100% 0)' });
      gsap.set(scanLine, { top: 0, opacity: 1 });

      // Glitch layer: show scrambled text that resolves
      let glitchInterval: ReturnType<typeof setInterval>;
      const startGlitch = () => {
        glitchLayer.style.display = 'block';
        glitchInterval = setInterval(() => {
          glitchLayer.textContent = generateGlitchText(message.text.length);
        }, 40);
      };
      const stopGlitch = () => {
        clearInterval(glitchInterval);
        glitchLayer.style.display = 'none';
      };

      // Fade in the row
      gsap.fromTo(row, { opacity: 0 }, { opacity: 1, duration: 0.15 });

      // Start glitch
      startGlitch();

      // Animate the scan
      const duration = Math.min(0.6 + containerH / 400, 1.4);
      playScan(duration);

      gsap.to(scanContainer, {
        clipPath: 'inset(0 0 0% 0)',
        duration,
        ease: 'power1.inOut',
      });

      gsap.to(scanLine, {
        top: containerH,
        duration,
        ease: 'power1.inOut',
        onComplete: () => {
          // Scan done
          gsap.to(scanLine, { opacity: 0, duration: 0.2 });
          stopGlitch();
          scanComplete = true;
          showComponent = true;
          onTypewriterDone?.();
        }
      });

      // Fade out glitch as scan progresses
      gsap.to(glitchLayer, {
        opacity: 0,
        duration: duration * 0.8,
        delay: duration * 0.3,
        ease: 'power2.in'
      });

    } else {
      // User: appear instantly with a subtle flash
      scanComplete = true;
      showComponent = true;
      gsap.fromTo(row,
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.25, ease: 'power2.out' }
      );
    }
  });
</script>

<div
  class="message-row {message.role}"
  bind:this={row}
  style={message.role === 'bot' ? 'opacity: 0;' : ''}
>
  {#if message.role === 'bot'}
    {#if message.thinking && message.thinking.length > 0}
      <div class="thinking-slot">
        <ThinkingPanel steps={message.thinking} isComplete={scanComplete} />
      </div>
    {/if}

    <div class="scan-wrapper">
      <!-- Glitch layer: scrambled text underneath -->
      <div class="glitch-layer" bind:this={glitchLayer}></div>

      <!-- Scan line beam -->
      <div class="scan-line" bind:this={scanLine}>
        <div class="scan-glow"></div>
      </div>

      <!-- Actual message content revealed by clip-path -->
      <div class="bubble bot" bind:this={scanContainer}>
        <span class="role-tag">sowmya &gt;</span>
        <p class="message-text">{message.text}</p>
      </div>
    </div>
  {:else}
    <div class="bubble user">
      <span class="role-tag">you &gt;</span>
      <p class="message-text">{message.text}</p>
    </div>
  {/if}

  {#if showComponent && message.component && componentMap[message.component]}
    <div class="component-slot">
      <svelte:component this={componentMap[message.component]} />
    </div>
  {/if}
</div>

<style>
  .message-row {
    display: flex;
    flex-direction: column;
    padding: 0.25rem 0;
    gap: 0.5rem;
    max-width: 100%;
  }

  .message-row.user {
    align-items: flex-end;
  }

  .message-row.bot {
    align-items: flex-start;
  }

  /* === Scan Wrapper === */
  .scan-wrapper {
    position: relative;
    max-width: 85%;
    width: 100%;
  }

  /* === Glitch Layer === */
  .glitch-layer {
    position: absolute;
    inset: 0;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.95rem;
    line-height: 1.7;
    color: rgba(0, 255, 180, 0.12);
    overflow: hidden;
    word-break: break-all;
    padding: 10px 0;
    pointer-events: none;
    z-index: 0;
    white-space: pre-wrap;
    display: none;
  }

  /* === Scan Line === */
  .scan-line {
    position: absolute;
    left: 0;
    right: 0;
    height: 2px;
    z-index: 3;
    pointer-events: none;
    opacity: 0;
  }

  .scan-glow {
    position: absolute;
    inset: 0;
    background: rgb(0, 255, 180);
    box-shadow:
      0 0 8px rgba(0, 255, 180, 0.8),
      0 0 20px rgba(0, 255, 180, 0.4),
      0 0 40px rgba(0, 255, 180, 0.15),
      0 -8px 20px rgba(0, 255, 180, 0.1),
      0 8px 20px rgba(0, 255, 180, 0.1);
  }

  .scan-glow::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: -20px;
    height: 22px;
    background: linear-gradient(to top, rgba(0, 255, 180, 0.06), transparent);
    pointer-events: none;
  }

  .scan-glow::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: -20px;
    height: 22px;
    background: linear-gradient(to bottom, rgba(0, 255, 180, 0.06), transparent);
    pointer-events: none;
  }

  /* === Bubbles === */
  .bubble {
    max-width: 85%;
    padding: 10px 14px;
    word-break: break-word;
    position: relative;
    z-index: 1;
  }

  .bubble.user {
    background: rgba(0, 255, 180, 0.06);
    border: 1px solid rgba(0, 255, 180, 0.15);
    border-radius: 6px 6px 2px 6px;
  }

  .bubble.bot {
    background: transparent;
    border: none;
    padding: 10px 0;
    max-width: 100%;
  }

  /* === Text === */
  .message-text {
    margin: 0;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.95rem;
    line-height: 1.7;
  }

  .bubble.bot .message-text {
    color: rgba(0, 255, 180, 0.85);
  }

  .bubble.user .message-text {
    color: rgba(255, 255, 255, 0.88);
  }

  /* === Role Tag === */
  .role-tag {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    margin-bottom: 3px;
    display: block;
  }

  .bubble.bot .role-tag {
    color: rgba(0, 255, 180, 0.35);
  }

  .bubble.user .role-tag {
    color: rgba(255, 255, 255, 0.3);
  }

  /* === Thinking Slot === */
  .thinking-slot {
    width: 100%;
    max-width: 85%;
    margin-bottom: 0.4rem;
  }

  /* === Component Slot === */
  .component-slot {
    width: 100%;
    max-width: 100%;
    overflow: hidden;
  }
</style>
