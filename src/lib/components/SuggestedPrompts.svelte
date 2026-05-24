<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { createRipple, springConfig } from '$lib/utils/animations';

  let { prompts, onSelect }: { prompts: string[]; onSelect: (prompt: string) => void } = $props();

  let container: HTMLDivElement;

  function handleMouseMove(e: MouseEvent) {
    const chip = e.currentTarget as HTMLElement;
    const rect = chip.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    chip.style.transform = `translate(${x * 0.15}px, ${y * 0.15 - 1}px)`;
  }

  function handleMouseLeave(e: MouseEvent) {
    const chip = e.currentTarget as HTMLElement;
    gsap.to(chip, { x: 0, y: 0, duration: 0.4, ease: 'elastic.out(1, 0.4)', clearProps: 'transform' });
  }

  onMount(() => {
    gsap.from(container.querySelectorAll('.chip'), {
      y: 30,
      opacity: 0,
      scale: 0.8,
      duration: 0.5,
      stagger: 0.08,
      ease: springConfig.bouncy
    });
  });
</script>

<div class="prompts-row" bind:this={container}>
  {#each prompts as prompt, i}
    <button
      class="chip"
      onclick={(e) => { createRipple(e, e.currentTarget); onSelect(prompt); }}
      onmousemove={handleMouseMove}
      onmouseleave={handleMouseLeave}
    >
      <span class="chip-arrow">&gt;</span> {prompt}
    </button>
  {/each}
</div>

<style>
  .prompts-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
  }

  .chip {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.75rem;
    padding: 8px 14px;
    border-radius: 4px;
    border: 1px solid rgba(0, 255, 180, 0.2);
    background: rgba(0, 255, 180, 0.04);
    color: rgba(0, 255, 180, 0.7);
    cursor: pointer;
    transition: background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease, color 0.25s ease;
    letter-spacing: 0.03em;
    white-space: nowrap;
    position: relative;
    overflow: hidden;
    will-change: transform;
  }

  .chip:hover {
    background: rgba(0, 255, 180, 0.1);
    border-color: rgba(0, 255, 180, 0.4);
    box-shadow: 0 0 15px rgba(0, 255, 180, 0.12);
    color: rgb(0, 255, 180);
  }

  .chip:active {
    background: rgba(0, 255, 180, 0.15);
  }

  .chip-arrow {
    color: rgba(0, 255, 180, 0.35);
  }
</style>
