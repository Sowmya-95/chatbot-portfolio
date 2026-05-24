<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { skills, languages } from '$lib/data/profile';

  let container: HTMLDivElement;

  onMount(() => {
    const categories = container.querySelectorAll('.skill-category');
    categories.forEach((cat, i) => {
      gsap.fromTo(cat,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, delay: i * 0.1, ease: 'elastic.out(0.5, 0.3)' }
      );
    });

    const chips = container.querySelectorAll('.skill-chip');
    gsap.fromTo(chips,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.3, stagger: 0.02, delay: 0.3, ease: 'power2.out' }
    );
  });
</script>

<div class="skills-container" bind:this={container}>
  <div class="skills-grid">
    {#each Object.entries(skills) as [category, items]}
      <div class="skill-category">
        <h4 class="category-title">// {category}</h4>
        <div class="chip-group">
          {#each items as skill}
            <span class="skill-chip">{skill}</span>
          {/each}
        </div>
      </div>
    {/each}
  </div>

  <div class="languages-row">
    {#each languages as lang}
      <span class="lang-item">{lang.language} — {lang.level}</span>
    {/each}
  </div>
</div>

<style>
  .skills-container {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    padding: 0.5rem 0;
    width: 100%;
  }

  .skills-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;
  }

  .skill-category {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .category-title {
    margin: 0;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.75rem;
    font-weight: 700;
    color: rgb(200, 210, 225);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .chip-group {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }

  .skill-chip {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.72rem;
    padding: 4px 12px;
    border-radius: 3px;
    background: rgba(0, 255, 180, 0.08);
    border: 1px solid rgba(0, 255, 180, 0.25);
    color: rgba(255, 255, 255, 0.5);
    transition: all 0.2s;
  }

  .skill-chip:hover {
    background: rgba(0, 255, 180, 0.1);
    border-color: rgba(0, 255, 180, 0.35);
    color: rgb(0, 255, 180);
    box-shadow: 0 0 8px rgba(0, 255, 180, 0.1);
  }

  .languages-row {
    display: flex;
    gap: 1.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid rgba(0, 255, 180, 0.08);
  }

  .lang-item {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.72rem;
    color: rgba(255, 255, 255, 0.5);
  }

  @media (max-width: 640px) {
    .skills-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
