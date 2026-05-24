<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';

  let wrapper: HTMLDivElement;

  onMount(() => {
    gsap.from(wrapper, {
      x: -40,
      opacity: 0,
      scale: 0.8,
      duration: 0.5,
      ease: 'elastic.out(0.5, 0.3)'
    });
  });
</script>

<div class="typing-wrapper" bind:this={wrapper}>
  <div class="typing-bubble">
    <span class="typing-prefix">SOWMYA &gt;</span>
    <span class="typing-dots">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </span>
  </div>
</div>

<style>
  .typing-wrapper {
    display: flex;
    justify-content: flex-start;
    padding: 0.5rem 1rem;
  }

  .typing-bubble {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 16px;
    background: rgba(0, 255, 180, 0.03);
    border: 1px solid rgba(0, 255, 180, 0.1);
    border-radius: 2px 8px 8px 8px;
    box-shadow: 0 0 15px rgba(0, 255, 180, 0.08);
    animation: glow-pulse 1.4s ease-in-out infinite;
  }

  .typing-prefix {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.6rem;
    color: rgba(0, 255, 180, 0.4);
    letter-spacing: 0.1em;
    font-weight: 500;
  }

  .typing-dots {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgb(0, 255, 180);
    animation: bounce 1.4s ease-in-out infinite;
  }

  .dot:nth-child(1) {
    animation-delay: 0s;
  }

  .dot:nth-child(2) {
    animation-delay: 0.2s;
  }

  .dot:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes glow-pulse {
    0%, 100% { box-shadow: 0 0 15px rgba(0, 255, 180, 0.08); }
    50% { box-shadow: 0 0 25px rgba(0, 255, 180, 0.2); }
  }

  @keyframes bounce {
    0%, 60%, 100% {
      transform: translateY(0);
      opacity: 0.4;
    }
    30% {
      transform: translateY(-10px);
      opacity: 1;
    }
  }
</style>
