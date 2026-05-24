<script lang="ts">
	import { onMount, tick, getContext } from 'svelte';
	import { gsap } from 'gsap';
	import ChatMessage from '$lib/components/ChatMessage.svelte';
	import TypingIndicator from '$lib/components/TypingIndicator.svelte';
	import SuggestedPrompts from '$lib/components/SuggestedPrompts.svelte';
	import { initialGreeting } from '$lib/chat/engine';
	import { initWebLLM, getIsReady, getIsLoading, getLoadProgress } from '$lib/chat/webllm';
	import { initRAG, queryRAG } from '$lib/chat/rag-pipeline';
	import type { ThinkingStep } from '$lib/chat/thinking';
	import { springConfig } from '$lib/utils/animations';
	import { playKeystroke, playSend, playReceive, startThinkingHum, stopThinkingHum, isMuted, toggleMute, playToggle } from '$lib/audio/sfx';

	const showPreloader = getContext<() => void>('showPreloader');

	type Message = {
		role: 'user' | 'bot';
		text: string;
		component?: string;
		timestamp?: string;
		thinking?: ThinkingStep[];
	};

	function getTimestamp(): string {
		const now = new Date();
		return now.toTimeString().slice(0, 5);
	}

	let messages: Message[] = $state([]);
	let inputText = $state('');
	let isTyping = $state(false);
	let suggestedPrompts: string[] = $state([]);
	let chatContainer: HTMLElement;
	let inputEl: HTMLElement;
	let header: HTMLElement;
	let footer: HTMLElement;
	let aiReady = $state(false);
	let aiLoading = $state(false);
	let aiProgress = $state(0);
	let aiError = $state('');

	async function toggleAI() {
		if (aiReady) {
			// Already active — no toggle off (session persists)
			return;
		}
		if (aiLoading) return;

		aiError = '';
		aiLoading = true;
		const success = await initWebLLM((p) => {
			aiProgress = p;
		});
		if (success) {
			aiReady = true;
		} else {
			aiError = 'AI not available in this browser';
			setTimeout(() => { aiError = ''; }, 4000);
		}
		aiLoading = false;
	}
	let sfxMuted = $state(isMuted());

	async function scrollToBottom() {
		await tick();
		if (chatContainer) {
			chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: 'smooth' });
		}
	}

	async function sendMessage(text: string) {
		if (!text.trim()) return;

		playSend();
		messages = [...messages, { role: 'user', text: text.trim(), timestamp: getTimestamp() }];
		inputText = '';
		suggestedPrompts = [];
		await scrollToBottom();

		isTyping = true;
		startThinkingHum();
		await scrollToBottom();

		// Run RAG pipeline (includes its own thinking delays)
		const { response, thinking } = await queryRAG(text);

		stopThinkingHum();
		isTyping = false;
		playReceive();
		messages = [...messages, {
			role: 'bot',
			text: response.text,
			component: response.component,
			timestamp: getTimestamp(),
			thinking
		}];
		suggestedPrompts = response.suggestedPrompts || [];
		await scrollToBottom();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendMessage(inputText);
		} else if (e.key.length === 1) {
			playKeystroke();
		}
	}

	function handleSfxToggle() {
		sfxMuted = toggleMute();
		if (!sfxMuted) playToggle();
	}

	function handlePromptSelect(prompt: string) {
		sendMessage(prompt);
	}

	onMount(async () => {
		// Spring entrance for header/footer
		gsap.from(header, { y: -40, opacity: 0, duration: 0.7, ease: springConfig.bouncy });
		gsap.from(footer, { y: 40, opacity: 0, duration: 0.7, delay: 0.15, ease: springConfig.bouncy });

		// Animate background particles
		const particles = document.querySelectorAll('.bg-particle');
		particles.forEach((p) => {
			gsap.to(p, {
				x: 'random(-100, 100)',
				y: 'random(-100, 100)',
				duration: 'random(8, 15)',
				repeat: -1,
				yoyo: true,
				ease: 'sine.inOut'
			});
		});

		// Show initial greeting immediately (preloader handles the delay)
		isTyping = true;
		await new Promise((r) => setTimeout(r, 800));
		isTyping = false;

		messages = [
			{
				role: 'bot',
				text: initialGreeting.text,
				component: initialGreeting.component,
				timestamp: getTimestamp()
			}
		];
		suggestedPrompts = initialGreeting.suggestedPrompts || [];

		// Init RAG pipeline (instant — just builds index from profile data)
		initRAG();

		// AI is not auto-loaded — user can toggle it via the header button
	});
</script>

<div class="app">
	<!-- Background particles -->
	<div class="bg-grid">
		{#each Array(18) as _, i}
			<div class="bg-particle" style="left: {Math.random() * 100}%; top: {Math.random() * 100}%; animation-delay: {Math.random() * 5}s;"></div>
		{/each}
	</div>

	<!-- Header -->
	<header class="header" bind:this={header}>
		<button class="logo" onclick={showPreloader}>
			<span class="logo-bracket">[</span>
			<span class="logo-text">Sowmya</span>
			<span class="logo-bracket">]</span>
		</button>
		<div class="header-right">
			<button class="sfx-toggle" onclick={handleSfxToggle} title={sfxMuted ? 'Enable sounds' : 'Mute sounds'}>
				{#if sfxMuted}
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<path d="M11 5L6 9H2v6h4l5 4V5z"/>
						<line x1="23" y1="9" x2="17" y2="15"/>
						<line x1="17" y1="9" x2="23" y2="15"/>
					</svg>
				{:else}
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<path d="M11 5L6 9H2v6h4l5 4V5z"/>
						<path d="M15.54 8.46a5 5 0 010 7.07"/>
						<path d="M19.07 4.93a10 10 0 010 14.14"/>
					</svg>
				{/if}
			</button>
			{#if aiLoading}
				<div class="ai-status loading">
					<span class="pulse-dot"></span>
					AI loading...
				</div>
			{:else if aiError}
				<div class="ai-status error">
					<span class="pulse-dot error"></span>
					{aiError}
				</div>
			{:else if aiReady}
				<div class="ai-status ready">
					<span class="pulse-dot ready"></span>
					AI active
				</div>
			{:else}
				<button class="ai-toggle" onclick={toggleAI} title="Switch to AI mode (Chrome only)">
					<span class="pulse-dot"></span>
					Scripted mode
					<span class="ai-toggle-hint">[ enable AI ]</span>
				</button>
			{/if}
		</div>
	</header>

	<!-- Chat area -->
	<main class="chat-area" bind:this={chatContainer}>
		<div class="messages">
			<div class="session-start">
				<span class="session-line"></span>
				<span class="session-label">~ session started</span>
				<span class="session-line"></span>
			</div>
			{#each messages as message, i (i)}
				{#if message.timestamp && (i === 0 || messages[i - 1]?.timestamp !== message.timestamp)}
					<div class="timestamp-sep">
						<span class="sep-line"></span>
						<span class="sep-time">{message.timestamp}</span>
						<span class="sep-line"></span>
					</div>
				{/if}
				<ChatMessage {message} onTypewriterDone={scrollToBottom} />
			{/each}

			{#if isTyping}
				<TypingIndicator />
			{/if}
		</div>

		{#if suggestedPrompts.length > 0 && !isTyping}
			<div class="prompts-wrapper">
				<SuggestedPrompts prompts={suggestedPrompts} onSelect={handlePromptSelect} />
			</div>
		{/if}
	</main>

	<!-- Input bar -->
	<footer class="input-bar" bind:this={footer}>
		<div class="input-wrapper">
			<span class="input-prompt">visitor@sowmya:~$</span>
			<input
				bind:this={inputEl}
				bind:value={inputText}
				onkeydown={handleKeydown}
				placeholder="type a command..."
				type="text"
				autocomplete="off"
				spellcheck="false"
			/>
		</div>
	</footer>
</div>

<style>
	.app {
		height: 100vh;
		display: flex;
		flex-direction: column;
		position: relative;
		overflow: hidden;
		background: #000;
	}

	.bg-grid {
		position: fixed;
		inset: 0;
		background:
			radial-gradient(ellipse at 20% 50%, rgba(0, 255, 180, 0.03) 0%, transparent 50%),
			radial-gradient(ellipse at 80% 50%, rgba(0, 255, 180, 0.02) 0%, transparent 50%),
			radial-gradient(circle at 50% 50%, #000 0%, #000 100%);
		z-index: 0;
		pointer-events: none;
	}

	.bg-particle {
		position: absolute;
		width: 3px;
		height: 3px;
		border-radius: 50%;
		background: rgba(0, 255, 180, 0.15);
		box-shadow: 0 0 6px rgba(0, 255, 180, 0.1);
		pointer-events: none;
	}

	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid rgba(0, 255, 180, 0.1);
		backdrop-filter: blur(20px);
		background: rgba(0, 0, 0, 0.85);
		z-index: 10;
		position: relative;
	}

	.logo {
		all: unset;
		cursor: pointer;
		font-family: 'JetBrains Mono', monospace;
		font-size: 1.2rem;
		font-weight: 500;
		transition: opacity 0.2s;
	}

	.logo:hover {
		opacity: 0.7;
	}

	.logo-bracket {
		color: rgb(0, 255, 180);
	}

	.logo-text {
		color: #fff;
		letter-spacing: 0.15em;
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.sfx-toggle {
		all: unset;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border-radius: 4px;
		color: rgba(0, 255, 180, 0.4);
		transition: color 0.2s, background 0.2s;
	}

	.sfx-toggle:hover {
		color: rgba(0, 255, 180, 0.8);
		background: rgba(0, 255, 180, 0.08);
	}

	.ai-status {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.7rem;
		color: #666;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.ai-status.loading {
		color: #ffd700;
	}

	.ai-status.ready {
		color: rgb(0, 255, 180);
	}

	.ai-status.error {
		color: #ff4444;
	}

	.ai-toggle {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.7rem;
		color: #666;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: none;
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 4px;
		padding: 0.3rem 0.6rem;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.ai-toggle:hover {
		color: rgb(0, 255, 180);
		border-color: rgba(0, 255, 180, 0.3);
		background: rgba(0, 255, 180, 0.05);
	}

	.ai-toggle:hover .pulse-dot {
		background: rgb(0, 255, 180);
	}

	.ai-toggle-hint {
		color: rgba(0, 255, 180, 0.4);
		font-size: 0.6rem;
	}

	.ai-toggle:hover .ai-toggle-hint {
		color: rgba(0, 255, 180, 0.8);
	}

	.pulse-dot.error {
		background: #ff4444;
		box-shadow: 0 0 8px rgba(255, 68, 68, 0.4);
	}

	.pulse-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #666;
		display: inline-block;
		animation: pulse 2s infinite;
	}

	.pulse-dot.ready {
		background: rgb(0, 255, 180);
		box-shadow: 0 0 8px rgba(0, 255, 180, 0.4);
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.3; }
	}

	.chat-area {
		flex: 1;
		overflow-y: auto;
		padding: 1.5rem;
		position: relative;
		z-index: 1;
		scroll-behavior: smooth;
	}

	.chat-area::-webkit-scrollbar {
		width: 6px;
	}

	.chat-area::-webkit-scrollbar-track {
		background: transparent;
	}

	.chat-area::-webkit-scrollbar-thumb {
		background: rgba(0, 255, 180, 0.2);
		border-radius: 3px;
	}

	.chat-area::-webkit-scrollbar-thumb:hover {
		background: rgba(0, 255, 180, 0.35);
	}

	.messages {
		max-width: 800px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding-bottom: 1rem;
	}

	.session-start {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 0.5rem 0;
	}

	.session-label {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.6rem;
		color: rgba(0, 255, 180, 0.25);
		white-space: nowrap;
		letter-spacing: 0.05em;
	}

	.session-line {
		flex: 1;
		height: 1px;
		background: rgba(0, 255, 180, 0.06);
	}

	.timestamp-sep {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 0.4rem 0;
	}

	.sep-line {
		flex: 1;
		height: 1px;
		background: rgba(0, 255, 180, 0.06);
	}

	.sep-time {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.55rem;
		color: rgba(0, 255, 180, 0.2);
		white-space: nowrap;
		letter-spacing: 0.1em;
	}

	.prompts-wrapper {
		max-width: 800px;
		margin: 0.5rem auto 0;
	}

	.input-bar {
		padding: 1rem 1.5rem;
		border-top: 1px solid rgba(0, 255, 180, 0.1);
		backdrop-filter: blur(20px);
		background: rgba(0, 0, 0, 0.85);
		z-index: 10;
		position: relative;
	}

	.input-wrapper {
		max-width: 800px;
		margin: 0 auto;
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}

	.input-prompt {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.85rem;
		color: rgba(0, 255, 180, 0.5);
		user-select: none;
		flex-shrink: 0;
		white-space: nowrap;
	}

	.input-wrapper input {
		flex: 1;
		background: transparent;
		border: none;
		padding: 0.5rem 0;
		color: rgba(0, 255, 180, 0.9);
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.95rem;
		outline: none;
		caret-color: rgb(0, 255, 180);
		letter-spacing: 0.02em;
	}

	.input-wrapper input::placeholder {
		color: rgba(0, 255, 180, 0.35);
	}

	@media (max-width: 640px) {
		.header {
			padding: 0.75rem 1rem;
		}

		.chat-area {
			padding: 1rem;
		}

		.input-bar {
			padding: 0.75rem 1rem;
		}

		.input-prompt {
			font-size: 0.7rem;
		}

		.input-wrapper input {
			font-size: 0.82rem;
		}
	}
</style>
