<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { profile } from '$lib/data/profile';

  let card: HTMLDivElement;
  let bioEl: HTMLParagraphElement;
  let bioDisplayed = $state('');
  let showBioCursor = $state(true);

  onMount(() => {
    gsap.from(card, {
      opacity: 0,
      y: 10,
      duration: 0.4,
      ease: 'power2.out'
    });

    // Bio typewriter
    const fullText = profile.bio;
    let i = 0;
    const typeInterval = setInterval(() => {
      if (i < fullText.length) {
        i++;
        bioDisplayed = fullText.slice(0, i);
      } else {
        clearInterval(typeInterval);
        showBioCursor = false;
      }
    }, 15);
  });
</script>

<div class="about-container" bind:this={card}>
  <div class="about-header">
    <span class="header-line">┌── <span class="accent">whoami</span></span>
  </div>

  <div class="info-block">
    <div class="info-row">
      <span class="info-key">name</span>
      <span class="info-val">{profile.name}</span>
    </div>
    <div class="info-row">
      <span class="info-key">role</span>
      <span class="info-val accent">{profile.title}</span>
    </div>
    <div class="info-row">
      <span class="info-key">location</span>
      <span class="info-val">{profile.location}</span>
    </div>
    <div class="info-row">
      <span class="info-key">status</span>
      <span class="info-val status-active">● {profile.status}</span>
    </div>
  </div>

  <div class="divider">├──────────────────────────────</div>

  <div class="bio-block">
    <span class="bio-label">│ <span class="accent">bio</span></span>
    <p class="bio-text" bind:this={bioEl}>│ {bioDisplayed}{#if showBioCursor}<span class="cursor">_</span>{/if}</p>
  </div>

  <div class="footer-line">└──</div>

  {#if profile.links}
    <div class="links-row">
      {#if profile.links.github}
        <a href={profile.links.github} target="_blank" rel="noopener" class="link-item">[github]</a>
      {/if}
      {#if profile.links.linkedin}
        <a href={profile.links.linkedin} target="_blank" rel="noopener" class="link-item">[linkedin]</a>
      {/if}
      {#if profile.links.email}
        <a href="mailto:{profile.links.email}" class="link-item">[email]</a>
      {/if}
      {#if profile.links.resume}
        <a href={profile.links.resume} target="_blank" rel="noopener" class="link-item">[resume]</a>
      {/if}
    </div>
  {/if}
</div>

<style>
  .about-container {
    display: flex;
    flex-direction: column;
    gap: 0;
    padding: 0.5rem 0;
    width: 100%;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.78rem;
    line-height: 1.7;
  }

  .about-header {
    margin-bottom: 6px;
  }

  .header-line {
    color: rgba(0, 255, 180, 0.4);
    font-size: 0.72rem;
  }

  .accent {
    color: rgb(0, 255, 180);
  }

  .info-block {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding-left: 4px;
  }

  .info-row {
    display: flex;
    gap: 8px;
  }

  .info-key {
    color: rgba(0, 255, 180, 0.35);
    min-width: 80px;
  }

  .info-key::before {
    content: '│ ';
    color: rgba(0, 255, 180, 0.2);
  }

  .info-key::after {
    content: ':';
  }

  .info-val {
    color: rgba(255, 255, 255, 0.85);
  }

  .status-active {
    color: rgb(0, 255, 180);
    text-shadow: 0 0 8px rgba(0, 255, 180, 0.3);
  }

  .divider {
    color: rgba(0, 255, 180, 0.15);
    font-size: 0.7rem;
    margin: 6px 0;
    user-select: none;
  }

  .bio-block {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .bio-label {
    color: rgba(0, 255, 180, 0.4);
    font-size: 0.72rem;
  }

  .bio-text {
    margin: 0;
    color: rgba(0, 255, 180, 0.7);
    font-size: 0.76rem;
    line-height: 1.7;
    padding-left: 4px;
  }

  .cursor {
    color: rgb(0, 255, 180);
    animation: blink 0.6s step-end infinite;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  .footer-line {
    color: rgba(0, 255, 180, 0.15);
    font-size: 0.7rem;
    margin-top: 6px;
    user-select: none;
  }

  .links-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 10px;
  }

  .link-item {
    color: rgba(0, 255, 180, 0.5);
    text-decoration: none;
    font-size: 0.7rem;
    transition: color 0.2s, text-shadow 0.2s;
  }

  .link-item:hover {
    color: rgb(0, 255, 180);
    text-shadow: 0 0 8px rgba(0, 255, 180, 0.4);
  }
</style>
