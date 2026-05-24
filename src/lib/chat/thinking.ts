// Thinking step types and stream for RAG pipeline visualization

export type ThinkingStep = {
	id: string;
	type: 'query' | 'bm25' | 'graph' | 'context' | 'generating' | 'done';
	label: string;
	detail?: string;
	children?: ThinkingStep[];
	timestamp: number;
};

let stepCounter = 0;

function generateId(): string {
	return `step_${++stepCounter}_${Date.now()}`;
}

export class ThinkingStream {
	private _steps: ThinkingStep[] = [];

	/** Optional callback fired whenever a new step is added */
	onStep?: (step: ThinkingStep) => void;

	/** Returns the current list of thinking steps (reactive-friendly — returns the array reference) */
	get steps(): ThinkingStep[] {
		return this._steps;
	}

	/** Add a top-level thinking step */
	addStep(type: ThinkingStep['type'], label: string, detail?: string): ThinkingStep {
		const step: ThinkingStep = {
			id: generateId(),
			type,
			label,
			detail,
			timestamp: Date.now()
		};
		this._steps = [...this._steps, step];
		this.onStep?.(step);
		return step;
	}

	/** Add a child step under an existing parent */
	addChild(parentId: string, type: ThinkingStep['type'], label: string, detail?: string): ThinkingStep {
		const child: ThinkingStep = {
			id: generateId(),
			type,
			label,
			detail,
			timestamp: Date.now()
		};

		const parent = this.findStep(parentId);
		if (parent) {
			parent.children = parent.children ? [...parent.children, child] : [child];
			// Trigger reactivity by creating a new array reference
			this._steps = [...this._steps];
		} else {
			// If parent not found, add as top-level step
			this._steps = [...this._steps, child];
		}

		this.onStep?.(child);
		return child;
	}

	/** Add the final "done" step with total elapsed time */
	complete(totalMs: number): void {
		this.addStep('done', `done (${totalMs}ms)`);
	}

	/** Clear all steps and reset */
	reset(): void {
		this._steps = [];
	}

	/** Find a step by id (searches top-level and children) */
	private findStep(id: string): ThinkingStep | undefined {
		for (const step of this._steps) {
			if (step.id === id) return step;
			if (step.children) {
				const child = step.children.find((c) => c.id === id);
				if (child) return child;
			}
		}
		return undefined;
	}
}
