/** Mini knowledge graph built from profile data — no external dependencies. */

import { profile, experience, projects, skills, education, languages, additionalDetails, interests } from '$lib/data/profile';

export interface GraphNode {
	id: string;
	type: 'person' | 'company' | 'skill' | 'project' | 'role' | 'education' | 'language' | 'interest' | 'detail';
	label: string;
	data?: any;
}

export interface GraphEdge {
	from: string;
	to: string;
	relation: string;
}

export class KnowledgeGraph {
	nodes = new Map<string, GraphNode>();
	edges: GraphEdge[] = [];

	private addNode(node: GraphNode): void {
		this.nodes.set(node.id, node);
	}

	private addEdge(from: string, to: string, relation: string): void {
		this.edges.push({ from, to, relation });
	}

	/** BFS traversal from a start node, returning all nodes within maxHops. */
	traverse(startNodeId: string, maxHops = 2): GraphNode[] {
		if (!this.nodes.has(startNodeId)) return [];

		const visited = new Set<string>([startNodeId]);
		let frontier = [startNodeId];

		for (let hop = 0; hop < maxHops && frontier.length > 0; hop++) {
			const nextFrontier: string[] = [];
			for (const nodeId of frontier) {
				for (const edge of this.edges) {
					const neighbor =
						edge.from === nodeId ? edge.to :
						edge.to === nodeId ? edge.from :
						null;
					if (neighbor && !visited.has(neighbor)) {
						visited.add(neighbor);
						nextFrontier.push(neighbor);
					}
				}
			}
			frontier = nextFrontier;
		}

		return [...visited]
			.map((id) => this.nodes.get(id)!)
			.filter(Boolean);
	}

	/** Simple text match across node labels and IDs. */
	findNodes(query: string): GraphNode[] {
		const q = query.toLowerCase();
		return [...this.nodes.values()].filter(
			(n) =>
				n.label.toLowerCase().includes(q) ||
				n.id.toLowerCase().includes(q)
		);
	}

	/** Get immediate neighbors of a node with their relation labels. */
	getRelated(nodeId: string): { node: GraphNode; relation: string }[] {
		const results: { node: GraphNode; relation: string }[] = [];

		for (const edge of this.edges) {
			let neighborId: string | null = null;
			let relation = edge.relation;

			if (edge.from === nodeId) {
				neighborId = edge.to;
			} else if (edge.to === nodeId) {
				neighborId = edge.from;
				// Reverse the relation label for readability
				relation = `${relation} (inverse)`;
			}

			if (neighborId) {
				const node = this.nodes.get(neighborId);
				if (node) results.push({ node, relation });
			}
		}

		return results;
	}

	/** Build a KnowledgeGraph from the profile data module. */
	static buildFromProfile(): KnowledgeGraph {
		const graph = new KnowledgeGraph();
		const personId = 'person:sowmya';

		// --- Person node ---
		graph.addNode({
			id: personId,
			type: 'person',
			label: profile.name,
			data: { title: profile.title, location: profile.location, bio: profile.bio }
		});

		// --- Helper to generate a stable skill node ID ---
		const skillId = (name: string) =>
			`skill:${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

		// Track which skills already have nodes
		const addedSkills = new Set<string>();

		const ensureSkillNode = (name: string) => {
			const id = skillId(name);
			if (!addedSkills.has(id)) {
				addedSkills.add(id);
				graph.addNode({ id, type: 'skill', label: name });
			}
			return id;
		};

		// --- Skills (from skills map) ---
		for (const [category, items] of Object.entries(skills)) {
			for (const skill of items) {
				const sid = ensureSkillNode(skill);
				graph.addEdge(personId, sid, 'has_skill');
			}
		}

		// --- Experience ---
		for (const exp of experience) {
			const companyId = `company:${exp.company.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
			const roleId = `role:exp-${exp.id}`;

			graph.addNode({
				id: companyId,
				type: 'company',
				label: exp.company,
				data: { location: exp.location }
			});

			graph.addNode({
				id: roleId,
				type: 'role',
				label: exp.role,
				data: { duration: exp.duration, highlights: exp.highlights, xp: exp.xp }
			});

			graph.addEdge(personId, companyId, 'worked_at');
			graph.addEdge(personId, roleId, 'has_role');
			graph.addEdge(roleId, companyId, 'role_at');

			for (const t of exp.tech) {
				const sid = ensureSkillNode(t);
				graph.addEdge(roleId, sid, 'used_skill');
			}
		}

		// --- Projects ---
		for (const proj of projects) {
			const projId = `project:${proj.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

			graph.addNode({
				id: projId,
				type: 'project',
				label: proj.name,
				data: { description: proj.description, link: proj.link }
			});

			graph.addEdge(personId, projId, 'built');

			for (const t of proj.tech) {
				const sid = ensureSkillNode(t);
				graph.addEdge(projId, sid, 'built_with');
			}
		}

		// --- Education ---
		for (const edu of education) {
			const eduId = `education:${edu.university.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

			graph.addNode({
				id: eduId,
				type: 'education',
				label: `${edu.degree} @ ${edu.university}`,
				data: { degree: edu.degree, year: edu.year, highlights: edu.highlights }
			});

			graph.addEdge(personId, eduId, 'studied_at');
		}

		// --- Languages ---
		for (const lang of languages) {
			const langId = `language:${lang.language.toLowerCase()}`;
			graph.addNode({
				id: langId,
				type: 'language',
				label: `${lang.language} (${lang.level})`,
				data: { level: lang.level }
			});
			graph.addEdge(personId, langId, 'speaks');
		}

		// --- Interests ---
		for (const interest of interests) {
			const intId = `interest:${interest.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
			graph.addNode({
				id: intId,
				type: 'interest',
				label: interest
			});
			graph.addEdge(personId, intId, 'enjoys');
		}

		// --- Additional Details ---
		for (const detail of additionalDetails) {
			const detId = `detail:${detail.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
			graph.addNode({
				id: detId,
				type: 'detail',
				label: detail
			});
			graph.addEdge(personId, detId, 'has_detail');
		}

		return graph;
	}
}

/** Singleton instance ready to use across the app. */
export const knowledgeGraph = KnowledgeGraph.buildFromProfile();
