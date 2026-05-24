<script>
	import { page } from '$app/state';
</script>

<div class="error-container">
	<div class="glitch-code">{page.status}</div>
	<p class="error-message">
		{#if page.status === 404}
			Route not found. Nothing here but void.
		{:else}
			Something broke. Even machines glitch sometimes.
		{/if}
	</p>
	<a href="/" class="home-link">&#8592; Back to SOWMYA</a>
</div>

<style>
	.error-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
		font-family: 'JetBrains Mono', monospace;
		background: #050510;
		color: rgb(0, 255, 180);
		text-align: center;
		gap: 1rem;
	}

	.glitch-code {
		font-size: 6rem;
		font-weight: bold;
		text-shadow: 0 0 20px rgba(0, 255, 180, 0.5);
	}

	.error-message {
		font-size: 1.1rem;
		color: #e0e0e0;
		opacity: 0.7;
	}

	.home-link {
		margin-top: 1rem;
		color: rgb(0, 255, 180);
		text-decoration: none;
		border: 1px solid rgba(0, 255, 180, 0.3);
		padding: 0.5rem 1.5rem;
		border-radius: 4px;
		transition: all 0.3s ease;
	}

	.home-link:hover {
		background: rgba(0, 255, 180, 0.1);
		border-color: rgb(0, 255, 180);
	}
</style>
