<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { experience } from '$lib/data/profile';

  let container: HTMLDivElement;
  let activeTab = $state(0);

  const hero = experience[0];
  const timeline = experience.slice(1);
  const subProjects = hero.subProjects ?? [];

  function switchTab(index: number) {
    activeTab = index;
  }

  onMount(() => {
    gsap.from('.hero-card', {
      opacity: 0,
      y: 20,
      duration: 0.6,
      ease: 'power2.out'
    });

    gsap.from('.timeline-item', {
      opacity: 0,
      x: -20,
      duration: 0.5,
      stagger: 0.15,
      delay: 0.4,
      ease: 'elastic.out(0.5, 0.3)'
    });
  });
</script>

<div class="experience-container" bind:this={container}>
  <!-- Hero: Interaktiv -->
  <div class="hero-card">
    <div class="hero-header">
      <div class="hero-title-row">
        <h3 class="hero-role">{hero.role}</h3>
        <span class="hero-company">@ {hero.company}</span>
      </div>
      <div class="hero-meta">
        <span>{hero.duration}</span>
        <span class="meta-dot"></span>
        <span>{hero.location}</span>
      </div>
    </div>

    <!-- Sub-project tabs -->
    <div class="tab-row">
      {#each subProjects as sp, i}
        <button
          class="tab-btn"
          class:active={activeTab === i}
          onclick={() => switchTab(i)}
        >
          {sp.name.split('—')[0].trim()}
        </button>
      {/each}
    </div>

    <!-- Active sub-project detail -->
    {#key activeTab}
      <div class="sub-project-detail">
        <h4 class="sp-name">{subProjects[activeTab].name}</h4>
        <p class="sp-desc">{subProjects[activeTab].description}</p>
        <div class="tech-chips">
          {#each subProjects[activeTab].tech as t}
            <span class="tech-chip">{t}</span>
          {/each}
        </div>
      </div>
    {/key}

    <!-- Impact summary -->
    <div class="impact-block">
      <span class="impact-label">// impact</span>
      <p class="impact-text">{hero.highlights[0]}. {hero.highlights[1]}.</p>
    </div>
  </div>

  <!-- Timeline: older roles -->
  <div class="timeline">
    <div class="timeline-line"></div>
    {#each timeline as job}
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <div class="tl-header">
            <span class="tl-role">{job.role}</span>
            <span class="tl-company">@ {job.company}</span>
          </div>
          <div class="tl-meta">{job.duration} · {job.location}</div>
          <div class="tech-chips">
            {#each job.tech as t}
              <span class="tech-chip">{t}</span>
            {/each}
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .experience-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 0.5rem 0;
    width: 100%;
  }

  .hero-card {
    border: 1px solid rgba(0, 255, 180, 0.2);
    border-radius: 8px;
    padding: 1.25rem;
    background: rgba(0, 255, 180, 0.03);
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .hero-header {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .hero-title-row {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .hero-role {
    margin: 0;
    font-family: 'JetBrains Mono', monospace;
    font-size: 1.05rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }

  .hero-company {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.85rem;
    color: rgb(0, 255, 180);
    font-weight: 500;
  }

  .hero-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.35);
  }

  .meta-dot {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: rgba(0, 255, 180, 0.3);
  }

  .tab-row {
    display: flex;
    gap: 0.25rem;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .tab-row::-webkit-scrollbar {
    display: none;
  }

  .tab-btn {
    all: unset;
    cursor: pointer;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem;
    padding: 0.35rem 0.65rem;
    border-radius: 4px;
    border: 1px solid rgba(0, 255, 180, 0.1);
    color: rgba(0, 255, 180, 0.5);
    white-space: nowrap;
    transition: all 0.2s;
  }

  .tab-btn.active {
    background: rgba(0, 255, 180, 0.1);
    border-color: rgba(0, 255, 180, 0.35);
    color: rgb(0, 255, 180);
    box-shadow: 0 0 10px rgba(0, 255, 180, 0.1);
  }

  .tab-btn:hover:not(.active) {
    border-color: rgba(0, 255, 180, 0.25);
    color: rgba(0, 255, 180, 0.7);
  }

  .sub-project-detail {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem;
    border-left: 2px solid rgba(0, 255, 180, 0.2);
  }

  .sp-name {
    margin: 0;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.8rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.85);
  }

  .sp-desc {
    margin: 0;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.55);
    line-height: 1.6;
  }

  .impact-block {
    padding: 0.75rem;
    background: rgba(0, 255, 180, 0.04);
    border-radius: 4px;
    border: 1px solid rgba(0, 255, 180, 0.1);
  }

  .impact-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.6rem;
    color: rgba(0, 255, 180, 0.4);
    display: block;
    margin-bottom: 0.35rem;
  }

  .impact-text {
    margin: 0;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.75rem;
    color: rgba(0, 255, 180, 0.75);
    line-height: 1.6;
    font-style: italic;
  }

  .timeline {
    position: relative;
    padding-left: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .timeline-line {
    position: absolute;
    left: 5px;
    top: 0;
    bottom: 0;
    width: 1px;
    background: rgba(0, 255, 180, 0.12);
  }

  .timeline-item {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .timeline-dot {
    position: absolute;
    left: -1.5rem;
    top: 4px;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    border: 1.5px solid rgba(0, 255, 180, 0.4);
    background: #000;
    z-index: 1;
  }

  .timeline-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .tl-header {
    display: flex;
    align-items: baseline;
    gap: 0.4rem;
    flex-wrap: wrap;
  }

  .tl-role {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.8rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
  }

  .tl-company {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.72rem;
    color: rgba(0, 255, 180, 0.6);
  }

  .tl-meta {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem;
    color: rgba(255, 255, 255, 0.3);
  }

  .tech-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
  }

  .tech-chip {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.6rem;
    padding: 2px 8px;
    border-radius: 3px;
    background: rgba(0, 255, 180, 0.06);
    border: 1px solid rgba(0, 255, 180, 0.15);
    color: rgba(0, 255, 180, 0.6);
  }

  @media (max-width: 640px) {
    .hero-role {
      font-size: 0.92rem;
    }

    .tab-btn {
      font-size: 0.6rem;
      padding: 0.3rem 0.5rem;
    }
  }
</style>
