<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { playExpand, playCollapse } from '$lib/audio/sfx';

	type ThinkingStep = {
		id: string;
		type: 'query' | 'bm25' | 'graph' | 'context' | 'generating' | 'done';
		label: string;
		detail?: string;
		children?: ThinkingStep[];
		timestamp: number;
	};

	let { steps = [], isComplete = false }: { steps: ThinkingStep[]; isComplete: boolean } =
		$props();

	let expanded = $state(false);
	let contentEl: HTMLDivElement | undefined = $state(undefined);
	let panelEl: HTMLDivElement | undefined = $state(undefined);

	// Calculate duration from thinking steps
	function getDuration(): string {
		if (steps.length < 2) return '';
		const doneStep = steps.find(s => s.type === 'done');
		if (doneStep) {
			// Extract ms from "done (280ms)"
			const match = doneStep.label.match(/(\d+)ms/);
			if (match) {
				const ms = parseInt(match[1]);
				return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
			}
		}
		return '';
	}

	function getPrefix(index: number, total: number): string {
		return index === total - 1 ? '└─ ' : '├─ ';
	}

	function getChildPrefix(childIndex: number, childTotal: number, parentIsLast: boolean): string {
		const indent = parentIsLast ? '   ' : '│  ';
		const connector = childIndex === childTotal - 1 ? '└─ ' : '├─ ';
		return indent + connector;
	}

	function toggle() {
		if (!expanded) {
			playExpand();
			expanded = true;
		} else {
			playCollapse();
			// Animate collapse
			if (contentEl) {
				gsap.to(contentEl, {
					height: 0,
					opacity: 0,
					duration: 0.3,
					ease: 'power2.inOut',
					onComplete: () => { expanded = false; }
				});
			} else {
				expanded = false;
			}
		}
	}

	// Animate expand
	$effect(() => {
		if (expanded && contentEl) {
			// Set initial state
			gsap.set(contentEl, { height: 0, opacity: 0 });
			// Animate to auto height
			gsap.to(contentEl, {
				height: 'auto',
				opacity: 1,
				duration: 0.4,
				ease: 'power2.out'
			});

			// Stagger in step lines
			const stepEls = contentEl.querySelectorAll('.step-line');
			gsap.fromTo(stepEls,
				{ opacity: 0, x: -8, y: 4 },
				{
					opacity: 1,
					x: 0,
					y: 0,
					duration: 0.35,
					stagger: 0.06,
					ease: 'power2.out',
					delay: 0.15
				}
			);
		}
	});

	// Entrance animation
	onMount(() => {
		if (panelEl) {
			gsap.from(panelEl, {
				opacity: 0,
				y: -6,
				duration: 0.3,
				ease: 'power2.out'
			});
		}
	});
</script>

<div class="thinking-panel" bind:this={panelEl}>
	<button class="header" onclick={toggle}>
		<span class="thought-icon">
			{#if !isComplete}
				<span class="spinner"></span>
			{:else}
				<span class="sparkle">✦</span>
			{/if}
		</span>
		<span class="header-text">
			{#if !isComplete}
				Reasoning...
			{:else}
				Reasoned for {getDuration()}
			{/if}
		</span>
		<span class="chevron" class:open={expanded}>
			<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
				<path d="M3 4.5L6 7.5L9 4.5" />
			</svg>
		</span>
	</button>

	{#if expanded}
		<div class="content" bind:this={contentEl}>
			<div class="steps">
				{#each steps as step, i (step.id)}
					<div class="step-line" class:done={step.type === 'done'}>
						<span class="tree-char">{getPrefix(i, steps.length)}</span>
						<span class="step-label">
							{#if step.type === 'query'}
								<span class="step-icon">🔍</span>
							{:else if step.type === 'bm25'}
								<span class="step-icon">📊</span>
							{:else if step.type === 'graph'}
								<span class="step-icon">🕸️</span>
							{:else if step.type === 'context'}
								<span class="step-icon">📦</span>
							{:else if step.type === 'generating'}
								<span class="step-icon">⚡</span>
							{:else if step.type === 'done'}
								<span class="step-icon">✓</span>
							{/if}
							{step.label}
						</span>
						{#if step.detail}
							<span class="step-detail">{step.detail}</span>
						{/if}
					</div>

					{#if step.children}
						{#each step.children as child, ci (child.id)}
							<div class="step-line child">
								<span class="tree-char">{getChildPrefix(ci, step.children.length, i === steps.length - 1)}</span>
								<span class="step-label child-label">{child.label}</span>
								{#if child.detail}
									<span class="step-detail">{child.detail}</span>
								{/if}
							</div>
						{/each}
					{/if}
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.thinking-panel {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.72rem;
		line-height: 1.7;
		border-left: 2px solid rgba(0, 255, 180, 0.2);
		padding-left: 0.75rem;
		max-width: 100%;
	}

	.header {
		all: unset;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: rgba(0, 255, 180, 0.55);
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.72rem;
		user-select: none;
		padding: 0.2rem 0;
		transition: color 0.2s;
	}

	.header:hover {
		color: rgba(0, 255, 180, 0.85);
	}

	.thought-icon {
		display: flex;
		align-items: center;
	}

	.spinner {
		width: 10px;
		height: 10px;
		border: 1.5px solid rgba(0, 255, 180, 0.15);
		border-top-color: rgba(0, 255, 180, 0.6);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.sparkle {
		color: rgba(0, 255, 180, 0.5);
		font-size: 0.65rem;
	}

	.header-text {
		flex: 1;
	}

	.chevron {
		display: flex;
		align-items: center;
		color: rgba(0, 255, 180, 0.3);
		transition: transform 0.3s ease;
	}

	.chevron.open {
		transform: rotate(180deg);
	}

	.content {
		overflow: hidden;
	}

	.steps {
		padding: 0.35rem 0 0.2rem 0;
		border-top: 1px solid rgba(0, 255, 180, 0.06);
		margin-top: 0.3rem;
	}

	.step-line {
		display: flex;
		align-items: baseline;
		gap: 0.2rem;
		padding: 0.05rem 0;
		opacity: 0;
	}

	.step-line.done {
		margin-top: 0.15rem;
	}

	.tree-char {
		color: rgba(0, 255, 180, 0.18);
		white-space: pre;
		flex-shrink: 0;
	}

	.step-icon {
		font-size: 0.6rem;
		margin-right: 0.25rem;
	}

	.step-label {
		color: rgba(0, 255, 180, 0.65);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.child-label {
		color: rgba(0, 255, 180, 0.45);
		font-size: 0.68rem;
	}

	.step-detail {
		color: rgba(0, 255, 180, 0.28);
		margin-left: 0.3em;
		font-size: 0.65rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.step-line.done .step-label {
		color: rgba(0, 255, 180, 0.4);
	}
</style>
