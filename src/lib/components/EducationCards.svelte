<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { education } from '$lib/data/profile';
  import { springConfig } from '$lib/utils/animations';

  let container: HTMLDivElement;

  onMount(() => {
    const cards = container.querySelectorAll('.edu-card');
    gsap.fromTo(cards,
      { x: -40, opacity: 0, scale: 0.9 },
      { x: 0, opacity: 1, scale: 1, duration: 0.7, stagger: 0.2, ease: springConfig.bouncy }
    );

    // Animate timeline lines drawing
    const lines = container.querySelectorAll('.timeline-line');
    gsap.from(lines, {
      scaleY: 0,
      transformOrigin: 'top',
      duration: 0.8,
      stagger: 0.3,
      delay: 0.3,
      ease: springConfig.smooth
    });

    // Dot pulse entrance
    const dots = container.querySelectorAll('.timeline-dot');
    gsap.from(dots, {
      scale: 0,
      duration: 0.5,
      stagger: 0.2,
      ease: springConfig.bouncy
    });
  });
</script>

<div class="education-container" bind:this={container}>
  <div class="timeline">
    {#each education as edu, i}
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        {#if i < education.length - 1}
          <div class="timeline-line"></div>
        {/if}
        <div class="edu-card">
          <h3 class="degree">{edu.degree}</h3>
          <span class="university">{edu.university}</span>
          <span class="year">{edu.year}</span>
          <ul class="highlights">
            {#each edu.highlights as h}
              <li>{h}</li>
            {/each}
          </ul>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .education-container {
    padding: 0.5rem 0;
    width: 100%;
  }

  .timeline {
    display: flex;
    flex-direction: column;
    gap: 0;
    position: relative;
  }

  .timeline-item {
    display: flex;
    gap: 1rem;
    position: relative;
    padding-bottom: 1.25rem;
  }

  .timeline-dot {
    flex-shrink: 0;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: rgb(0, 255, 180);
    box-shadow: 0 0 10px rgba(0, 255, 180, 0.5);
    margin-top: 4px;
    position: relative;
    z-index: 1;
    animation: dot-pulse 2s ease-in-out infinite;
  }

  .timeline-line {
    position: absolute;
    left: 6px;
    top: 18px;
    bottom: 0;
    width: 2px;
    background: linear-gradient(180deg, rgba(0, 255, 180, 0.4), rgba(0, 255, 180, 0.1));
  }

  .edu-card {
    flex: 1;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(0, 255, 180, 0.15);
    border-radius: 6px;
    padding: 1rem 1.2rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
  }

  .edu-card:hover {
    border-color: rgba(0, 255, 180, 0.35);
    box-shadow: 0 0 20px rgba(0, 255, 180, 0.08);
  }

  .degree {
    margin: 0;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.95rem;
    font-weight: 700;
    color: #ffffff;
  }

  .university {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.82rem;
    color: rgb(0, 255, 180);
    font-weight: 500;
  }

  .year {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.72rem;
    color: rgba(255, 255, 255, 0.4);
  }

  .highlights {
    margin: 0.4rem 0 0 0;
    padding-left: 1rem;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .highlights li {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.76rem;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.4;
  }

  .highlights li::before {
    content: '>';
    color: rgba(0, 255, 180, 0.5);
    margin-right: 0.4rem;
  }

  @keyframes dot-pulse {
    0%, 100% { box-shadow: 0 0 10px rgba(0, 255, 180, 0.5); }
    50% { box-shadow: 0 0 20px rgba(0, 255, 180, 0.8), 0 0 30px rgba(0, 255, 180, 0.3); }
  }
</style>
