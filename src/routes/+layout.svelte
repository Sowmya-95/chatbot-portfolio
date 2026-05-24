<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import JarvisPreloader from '$lib/components/JarvisPreloader.svelte';

	import { setContext } from 'svelte';

	let { children } = $props();
	let preloaderDone = $state(false);

	function handlePreloaderComplete() {
		preloaderDone = true;
	}

	function showPreloader() {
		preloaderDone = false;
	}

	setContext('showPreloader', showPreloader);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if !preloaderDone}
	<JarvisPreloader onComplete={handlePreloaderComplete} />
{/if}

{#if preloaderDone}
	{@render children()}
{/if}

<style>
	:global(*) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	:global(body) {
		font-family: 'Space Grotesk', sans-serif;
		background: #050510;
		color: #e0e0e0;
		min-height: 100vh;
		overflow: hidden;
	}

	:global(::-webkit-scrollbar) {
		width: 6px;
	}

	:global(::-webkit-scrollbar-track) {
		background: #0a0a1a;
	}

	:global(::-webkit-scrollbar-thumb) {
		background: #00f5ff33;
		border-radius: 3px;
	}

	:global(::selection) {
		background: #b400ff44;
		color: #fff;
	}

	:global(.ripple-effect) {
		position: absolute;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(0, 245, 255, 0.4) 0%, transparent 70%);
		pointer-events: none;
		z-index: 100;
	}
</style>
