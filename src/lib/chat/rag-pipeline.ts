import { BM25Index, type Chunk, type SearchResult } from './bm25';
import { knowledgeGraph } from './knowledge-graph';
import { ThinkingStream, type ThinkingStep } from './thinking';
import { getScriptedResponse, type ChatResponse } from './engine';
import { getAIResponse, getIsReady } from './webllm';
import { profile, experience, projects, skills, education, languages, additionalDetails, interests } from '$lib/data/profile';

let bm25: BM25Index | null = null;

function buildChunks(): Chunk[] {
  const chunks: Chunk[] = [];

  chunks.push({
    id: 'bio',
    text: `${profile.name} — ${profile.title}. ${profile.bio} Based in ${profile.location}. Status: ${profile.status}.`,
    type: 'profile',
    metadata: { section: 'about' }
  });

  for (const exp of experience) {
    chunks.push({
      id: `exp-${exp.id}`,
      text: `${exp.role} at ${exp.company} (${exp.duration}, ${exp.location}). ${exp.highlights.join('. ')}. Tech: ${exp.tech.join(', ')}.`,
      type: 'experience',
      metadata: { company: exp.company, role: exp.role }
    });
  }

  for (const proj of projects) {
    chunks.push({
      id: `proj-${proj.id}`,
      text: `Project: ${proj.name}. ${proj.description} Tech: ${proj.tech.join(', ')}.`,
      type: 'project',
      metadata: { name: proj.name }
    });
  }

  for (const [category, items] of Object.entries(skills)) {
    const skillList = items.join(', ');
    chunks.push({
      id: `skill-${category.toLowerCase().replace(/[\s\/]+/g, '-')}`,
      text: `Skills in ${category}: ${skillList}.`,
      type: 'skill',
      metadata: { category }
    });
  }

  for (let i = 0; i < education.length; i++) {
    const edu = education[i];
    chunks.push({
      id: `edu-${i}`,
      text: `${edu.degree} at ${edu.university} (${edu.year}). ${edu.highlights.join('. ')}.`,
      type: 'education',
      metadata: { degree: edu.degree, university: edu.university }
    });
  }

  chunks.push({
    id: 'contact',
    text: `Contact Sowmya: Email ${profile.links.email}, LinkedIn ${profile.links.linkedin}, GitHub ${profile.links.github}. Resume: ${profile.links.resume}. Status: ${profile.status}.`,
    type: 'profile',
    metadata: { section: 'contact' }
  });

  const langList = languages.map(l => `${l.language}: ${l.level}`).join(', ');
  chunks.push({
    id: 'languages',
    text: `Language proficiency: ${langList}. Sowmya speaks English at C1 level and German at B1 (in progress). Based in Germany.`,
    type: 'profile',
    metadata: { section: 'languages' }
  });

  chunks.push({
    id: 'additional',
    text: `Additional details: ${additionalDetails.join('. ')}. Interests: ${interests.join(', ')}.`,
    type: 'profile',
    metadata: { section: 'additional' }
  });

  // Add Interaktiv sub-projects as separate chunks for better retrieval
  const hero = experience[0];
  if (hero.subProjects) {
    for (let i = 0; i < hero.subProjects.length; i++) {
      const sp = hero.subProjects[i];
      chunks.push({
        id: `exp-1-sub-${i}`,
        text: `Interaktiv project: ${sp.name}. ${sp.description} Tech: ${sp.tech.join(', ')}.`,
        type: 'experience',
        metadata: { company: hero.company, subProject: sp.name }
      });
    }
  }

  return chunks;
}

// Lookup table: chunk id -> Chunk (for graph results)
let chunkMap = new Map<string, Chunk>();

export function initRAG(): void {
  const chunks = buildChunks();
  bm25 = new BM25Index();
  chunkMap = new Map();
  for (const chunk of chunks) {
    bm25.addDocument(chunk);
    chunkMap.set(chunk.id, chunk);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function inferComponent(results: SearchResult[]): ChatResponse['component'] {
  if (results.length === 0) return undefined;

  const sourceScores: Record<string, number> = {};
  for (const r of results) {
    const src = r.chunk.type;
    sourceScores[src] = (sourceScores[src] || 0) + r.score;
  }

  const topSource = Object.entries(sourceScores).sort((a, b) => b[1] - a[1])[0]?.[0];

  const componentMap: Record<string, ChatResponse['component']> = {
    experience: 'experience',
    project: 'projects',
    skill: 'skills',
    education: 'education',
    profile: undefined
  };

  return componentMap[topSource];
}

function getSuggestedPrompts(component?: ChatResponse['component']): string[] {
  switch (component) {
    case 'experience':
      return ['Show me your projects', 'Do you speak German?', 'What do you do for fun?'];
    case 'projects':
      return ['Tell me about your work at Interaktiv', 'Do you speak German?', 'What do you do for fun?'];
    case 'skills':
      return ['Show me your projects', 'Do you speak German?', 'Where did you study?'];
    case 'education':
      return ['What\'s your tech stack?', 'Do you speak German?', 'What do you do for fun?'];
    case 'contact':
      return ['Do you need a visa?', 'Do you speak German?', 'What do you do for fun?'];
    default:
      return ['Tell me about your work at Interaktiv', 'Show me your projects', 'Do you speak German?', 'What do you do for fun?'];
  }
}

export async function queryRAG(userMessage: string): Promise<{ response: ChatResponse; thinking: ThinkingStep[] }> {
  const startTime = Date.now();
  const thinking = new ThinkingStream();

  if (!bm25) initRAG();

  // Step 1: Parse query
  thinking.addStep('query', `query: "${userMessage}"`);
  await delay(30);

  // Step 2: BM25 search
  const bm25Step = thinking.addStep('bm25', 'searching bm25 index...');
  await delay(40);

  const bm25Results = bm25!.search(userMessage, 8);

  if (bm25Results.length > 0) {
    for (const r of bm25Results.slice(0, 3)) {
      thinking.addChild(bm25Step.id, 'bm25', `${r.chunk.id} [${r.score.toFixed(2)}]`);
    }
    if (bm25Results.length > 3) {
      thinking.addChild(bm25Step.id, 'bm25', `+${bm25Results.length - 3} more`);
    }
  } else {
    thinking.addChild(bm25Step.id, 'bm25', 'no matches');
  }
  await delay(25);

  // Step 3: Knowledge graph traversal
  const graphStep = thinking.addStep('graph', 'traversing knowledge graph...');
  await delay(35);

  // Find matching nodes in the graph
  const queryWords = userMessage.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const matchedNodes = new Set<string>();

  // Concept aliases — map common query terms to graph node IDs
  const conceptAliases: Record<string, string[]> = {
    'tech': ['person:sowmya'],
    'stack': ['person:sowmya'],
    'skill': ['person:sowmya'],
    'skills': ['person:sowmya'],
    'experience': ['person:sowmya'],
    'work': ['person:sowmya'],
    'project': ['person:sowmya'],
    'projects': ['person:sowmya'],
    'education': ['person:sowmya'],
    'study': ['person:sowmya'],
    'interaktiv': ['company:interaktiv-gmbh'],
    'jobooking': ['company:jobooking'],
    'gadgetlend': ['company:gadgetlend'],
  };

  for (const word of queryWords) {
    // Check aliases first
    const aliases = conceptAliases[word];
    if (aliases) {
      for (const id of aliases) matchedNodes.add(id);
    }
    // Then do label/id search
    const found = knowledgeGraph.findNodes(word);
    for (const node of found) {
      matchedNodes.add(node.id);
    }
  }

  // Traverse from matched nodes, collect reachable chunk-like node ids with hop distance
  const graphScores = new Map<string, number>();
  const graphPaths: string[] = [];

  for (const nodeId of matchedNodes) {
    const node = knowledgeGraph.nodes.get(nodeId);
    if (!node) continue;

    const reachable = knowledgeGraph.traverse(nodeId, 2);
    for (const reachedNode of reachable) {
      // Skip the starting node itself
      if (reachedNode.id === nodeId) continue;
      const related = knowledgeGraph.getRelated(nodeId);
      const directRelation = related.find(r => r.node.id === reachedNode.id);
      const hopScore = directRelation ? 0.8 : 0.4; // direct neighbor vs 2-hop
      const current = graphScores.get(reachedNode.id) || 0;
      graphScores.set(reachedNode.id, Math.max(current, hopScore));
    }

    if (node) {
      const neighbors = knowledgeGraph.getRelated(nodeId);
      if (neighbors.length > 0) {
        const path = neighbors.slice(0, 2).map(n =>
          `${node.label} ──${n.relation}──→ ${n.node.label}`
        ).join(', ');
        graphPaths.push(path);
      }
    }
  }

  if (matchedNodes.size > 0) {
    for (const path of graphPaths.slice(0, 3)) {
      thinking.addChild(graphStep.id, 'graph', path);
    }
    thinking.addChild(graphStep.id, 'graph', `${graphScores.size} nodes reachable`);
  } else {
    thinking.addChild(graphStep.id, 'graph', 'no graph matches');
  }
  await delay(20);

  // Step 4: Merge BM25 + graph results
  const merged = new Map<string, SearchResult>();

  for (const r of bm25Results) {
    merged.set(r.chunk.id, { chunk: r.chunk, score: r.score });
  }

  // Boost BM25 results that also appear in graph, or add graph-only results
  for (const [nodeId, graphScore] of graphScores) {
    // Try to map graph node ID to chunk ID
    // Graph nodes use ids like "skill:langchain", chunks use "skill-ai---ml"
    // Direct match attempt:
    const chunk = chunkMap.get(nodeId);
    if (chunk) {
      const existing = merged.get(nodeId);
      if (existing) {
        existing.score += graphScore * 0.3;
      } else {
        merged.set(nodeId, { chunk, score: graphScore * 0.3 });
      }
    }
  }

  const rankedResults = Array.from(merged.values()).sort((a, b) => b.score - a.score);
  const topResults = rankedResults.slice(0, 6);

  const contextSize = topResults.reduce((acc, r) => acc + r.chunk.text.length, 0);
  const contextKb = (contextSize / 1024).toFixed(1);
  thinking.addStep('context', `${topResults.length} chunks retrieved (${contextKb}kb)`);
  await delay(25);

  // Step 5: Generate response
  const component = inferComponent(topResults);
  let response: ChatResponse;

  if (getIsReady()) {
    thinking.addStep('generating', 'generating with llm...');
    await delay(20);

    const contextText = topResults.map((r) => r.chunk.text).join('\n\n');
    const augmentedMessage = `Context:\n${contextText}\n\nQuestion: ${userMessage}`;

    const aiResult = await getAIResponse(augmentedMessage);

    if (aiResult) {
      response = {
        text: aiResult.text,
        component: (aiResult.component as ChatResponse['component']) || component,
        suggestedPrompts: getSuggestedPrompts(component)
      };
    } else {
      response = getScriptedResponse(userMessage);
    }
  } else {
    thinking.addStep('generating', 'scripted response');
    await delay(20);

    response = getScriptedResponse(userMessage);

    if (!response.component && component) {
      response.component = component;
    }
  }

  if (!response.suggestedPrompts) {
    response.suggestedPrompts = getSuggestedPrompts(component);
  }

  const totalMs = Date.now() - startTime;
  thinking.complete(totalMs);

  return { response, thinking: thinking.steps };
}
