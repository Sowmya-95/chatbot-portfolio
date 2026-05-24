/** Lightweight BM25 search index — no external dependencies. */

export interface Chunk {
	id: string;
	text: string;
	type: 'experience' | 'project' | 'skill' | 'education' | 'profile';
	metadata: Record<string, any>;
}

export interface SearchResult {
	chunk: Chunk;
	score: number;
}

const STOPWORDS = new Set([
	'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be',
	'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
	'could', 'should', 'may', 'might', 'shall', 'can', 'to', 'of', 'in', 'for',
	'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before',
	'after', 'it', 'its', 'this', 'that', 'these', 'those', 'i', 'me', 'my', 'we',
	'our', 'you', 'your', 'he', 'she', 'they', 'them', 'his', 'her', 'not', 'no',
	'so', 'if', 'then', 'than', 'too', 'very', 'just', 'about', 'up', 'out', 'all'
]);

function tokenize(text: string): string[] {
	return text
		.toLowerCase()
		.split(/[^a-z0-9]+/)
		.filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

export class BM25Index {
	private chunks: Chunk[] = [];
	private docTokens: string[][] = [];
	/** term -> Map<docIndex, termFrequency> */
	private invertedIndex = new Map<string, Map<number, number>>();
	private avgDl = 0;
	private readonly k1 = 1.5;
	private readonly b = 0.75;

	addDocument(chunk: Chunk): void {
		const idx = this.chunks.length;
		this.chunks.push(chunk);

		const tokens = tokenize(chunk.text);
		this.docTokens.push(tokens);

		// Update average document length
		this.avgDl =
			(this.avgDl * (this.chunks.length - 1) + tokens.length) / this.chunks.length;

		// Build term frequencies for this document
		const tf = new Map<string, number>();
		for (const token of tokens) {
			tf.set(token, (tf.get(token) ?? 0) + 1);
		}

		// Update inverted index
		for (const [term, freq] of tf) {
			if (!this.invertedIndex.has(term)) {
				this.invertedIndex.set(term, new Map());
			}
			this.invertedIndex.get(term)!.set(idx, freq);
		}
	}

	search(query: string, topK = 5): SearchResult[] {
		const queryTokens = tokenize(query);
		if (queryTokens.length === 0 || this.chunks.length === 0) return [];

		const N = this.chunks.length;
		const scores = new Float64Array(N);

		for (const term of queryTokens) {
			const postings = this.invertedIndex.get(term);
			if (!postings) continue;

			// IDF: log((N - df + 0.5) / (df + 0.5) + 1)
			const df = postings.size;
			const idf = Math.log((N - df + 0.5) / (df + 0.5) + 1);

			for (const [docIdx, tf] of postings) {
				const dl = this.docTokens[docIdx].length;
				const tfNorm = (tf * (this.k1 + 1)) /
					(tf + this.k1 * (1 - this.b + this.b * (dl / this.avgDl)));
				scores[docIdx] += idf * tfNorm;
			}
		}

		// Collect non-zero scores and sort
		const results: SearchResult[] = [];
		for (let i = 0; i < N; i++) {
			if (scores[i] > 0) {
				results.push({ chunk: this.chunks[i], score: scores[i] });
			}
		}
		results.sort((a, b) => b.score - a.score);

		// Normalize scores to 0-1 range
		const maxScore = results[0]?.score ?? 1;
		if (maxScore > 0) {
			for (const r of results) {
				r.score = r.score / maxScore;
			}
		}

		return results.slice(0, topK);
	}
}
