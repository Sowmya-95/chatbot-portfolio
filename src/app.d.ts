// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	// Chrome Built-in AI — Prompt API (Gemini Nano)
	interface LanguageModelSession {
		prompt(input: string, options?: { signal?: AbortSignal }): Promise<string>;
		promptStreaming(input: string, options?: { signal?: AbortSignal }): ReadableStream<string>;
		destroy(): void;
	}

	const LanguageModel: {
		availability(options?: Record<string, unknown>): Promise<'unavailable' | 'downloadable' | 'downloading' | 'available'>;
		create(options?: {
			initialPrompts?: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
		}): Promise<LanguageModelSession>;
	};
}

export {};
