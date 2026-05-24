<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { projects } from '$lib/data/profile';

  let carousel: HTMLDivElement;
  let activeIndex = $state(0);
  let cards: HTMLElement[] = [];
  const total = projects.length;

  function positionCards(animate = true) {
    cards.forEach((card, i) => {
      const offset = i - activeIndex;
      const absOffset = Math.abs(offset);

      const x = offset * 210;
      const rotateY = offset * -22;
      const z = -absOffset * 90;
      const opacity = absOffset > 2 ? 0 : 1 - absOffset * 0.2;
      const scale = 1 - absOffset * 0.06;

      gsap.to(card, {
        x,
        rotateY,
        z,
        opacity: Math.max(opacity, 0),
        scale: Math.max(scale, 0.85),
        zIndex: total - absOffset,
        duration: animate ? 0.9 : 0,
        ease: 'elastic.out(0.4, 0.3)',
        overwrite: true
      });
    });
  }

  function next() {
    if (activeIndex < total - 1) {
      activeIndex++;
      positionCards();
    }
  }

  function prev() {
    if (activeIndex > 0) {
      activeIndex--;
      positionCards();
    }
  }

  function goTo(i: number) {
    activeIndex = i;
    positionCards();
  }

  onMount(() => {
    cards = Array.from(carousel.querySelectorAll('.project-card')) as HTMLElement[];

    gsap.set(cards, { opacity: 0, y: 40, scale: 0.85 });
    gsap.to(cards, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out',
      onComplete: () => positionCards(true)
    });
  });
</script>

<div class="coverflow-container">
  <div class="coverflow-viewport">
    <div class="coverflow-track" bind:this={carousel}>
      {#each projects as project, i}
        <button
          class="project-card"
          class:active={i === activeIndex}
          onclick={() => goTo(i)}
        >
          <div class="card-inner">
            <h3 class="project-name">{project.name}</h3>
            <p class="project-desc">{project.description}</p>
            <div class="tech-chips">
              {#each project.tech as t}
                <span class="tech-chip">{t}</span>
              {/each}
            </div>
            {#if project.link}
              <a
                class="project-link"
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                onclick={(e) => e.stopPropagation()}
              >
                view source &rarr;
              </a>
            {/if}
          </div>
        </button>
      {/each}
    </div>
  </div>

  <!-- Navigation -->
  <div class="nav-row">
    <button class="nav-btn" onclick={prev} disabled={activeIndex === 0}>&larr;</button>
    <div class="dots">
      {#each projects as project, i}
        <button
          class="dot"
          class:active={i === activeIndex}
          onclick={() => goTo(i)}
        ></button>
      {/each}
    </div>
    <button class="nav-btn" onclick={next} disabled={activeIndex === total - 1}>&rarr;</button>
  </div>
</div>

<style>
  .coverflow-container {
    width: 100%;
    padding: 0.75rem 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .coverflow-viewport {
    perspective: 1000px;
    overflow: hidden;
    padding: 1rem 0;
  }

  .coverflow-track {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    height: 300px;
    transform-style: preserve-3d;
  }

  .project-card {
    position: absolute;
    width: 280px;
    background: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
    transform-style: preserve-3d;
    will-change: transform, opacity;
    text-align: left;
    color: inherit;
    font: inherit;
  }

  .card-inner {
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(0, 255, 180, 0.1);
    border-radius: 10px;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    transition: border-color 0.3s, box-shadow 0.3s;
    position: relative;
    overflow: hidden;
  }

  .project-card.active .card-inner {
    border-color: rgba(0, 255, 180, 0.35);
    box-shadow: 0 0 25px rgba(0, 255, 180, 0.08);
  }

  .project-name {
    margin: 0;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.95rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    position: relative;
    z-index: 1;
  }

  .project-desc {
    margin: 0;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.72rem;
    color: rgba(255, 255, 255, 0.5);
    line-height: 1.5;
    position: relative;
    z-index: 1;
  }

  .tech-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
    position: relative;
    z-index: 1;
  }

  .tech-chip {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.6rem;
    padding: 2px 8px;
    border-radius: 3px;
    background: rgba(0, 255, 180, 0.05);
    border: 1px solid rgba(0, 255, 180, 0.12);
    color: rgba(0, 255, 180, 0.55);
  }

  .project-link {
    margin-top: auto;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.72rem;
    color: rgb(0, 255, 180);
    text-decoration: none;
    font-weight: 500;
    position: relative;
    z-index: 1;
    transition: opacity 0.2s;
    opacity: 0.7;
  }

  .project-link:hover {
    opacity: 1;
    text-shadow: 0 0 8px rgba(0, 255, 180, 0.4);
  }

  /* Navigation */
  .nav-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }

  .nav-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 1px solid rgba(0, 255, 180, 0.2);
    background: rgba(0, 255, 180, 0.04);
    color: rgba(0, 255, 180, 0.6);
    font-size: 0.9rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    font-family: 'JetBrains Mono', monospace;
  }

  .nav-btn:hover:not(:disabled) {
    background: rgba(0, 255, 180, 0.1);
    border-color: rgba(0, 255, 180, 0.4);
    color: rgb(0, 255, 180);
    box-shadow: 0 0 12px rgba(0, 255, 180, 0.15);
  }

  .nav-btn:disabled {
    opacity: 0.2;
    cursor: default;
  }

  .dots {
    display: flex;
    gap: 8px;
  }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    border: none;
    background: rgba(0, 255, 180, 0.15);
    cursor: pointer;
    padding: 0;
    transition: all 0.3s;
  }

  .dot.active {
    background: rgb(0, 255, 180);
    box-shadow: 0 0 8px rgba(0, 255, 180, 0.5);
    transform: scale(1.4);
  }

  .dot:hover:not(.active) {
    background: rgba(0, 255, 180, 0.4);
  }

  @media (max-width: 640px) {
    .coverflow-track {
      height: 320px;
    }

    .project-card {
      width: 250px;
    }
  }
</style>
