// =============================================================
// WebLLM — COMMENTED OUT
// Reason: Downloads 2GB+ model to user's browser, requires WebGPU flags on Linux.
// TODO: Replace with Chrome built-in AI (Gemini Nano) later.
// =============================================================

// import { browser } from '$app/environment';
// import { profile, experience, projects, skills, education, languages, additionalDetails, interests } from '$lib/data/profile';
//
// let engine: any = null;
// let isLoading = false;
// let isReady = false;
// let loadProgress = 0;
//
// const systemPrompt = `You are Sowmya Kamath's digital twin — a friendly, witty AI version of her that lives on her portfolio website. Answer questions about Sowmya's career, skills, projects, and experience in first person as if you ARE Sowmya. Be conversational, warm, and confident. Keep responses concise (2-4 sentences max).
//
// CRITICAL RULES:
// 1. ONLY answer questions based on the data provided below. NEVER invent or hallucinate information.
// 2. If a question is about something NOT in the data (weather, politics, personal life beyond work, opinions on unrelated topics), respond with something like: "That's outside my scope — I only know about Sowmya's professional work, skills, and projects. Try asking about those!"
// 3. For questions about strengths: infer from the data (e.g., AI/RAG pipelines, full-stack development, taking things from prototype to production).
// 4. For language proficiency: English C1, German B1 in Progress.
// 5. Lead with confidence — say "I built" not "she worked on".
// 6. Never apologize for being an AI or say "I don't have feelings". Just answer naturally.
//
// IMPORTANT: At the end of your response, include a component tag on a new line if the question relates to a specific topic:
// [component:experience] - for work/job questions
// [component:projects] - for project/portfolio questions
// [component:skills] - for tech/skills questions
// [component:education] - for education questions
// [component:contact] - for hiring/contact questions
//
// Here is Sowmya's data:
// ${JSON.stringify({ profile, experience, projects, skills, education, languages, additionalDetails, interests }, null, 2)}
// `;
//
// export async function initWebLLM(onProgress?: (p: number) => void): Promise<boolean> {
//   if (!browser || isReady || isLoading) return isReady;
//
//   if (!navigator.gpu) {
//     console.log('WebGPU not supported, using scripted responses');
//     return false;
//   }
//
//   try {
//     const adapter = await navigator.gpu.requestAdapter();
//     if (!adapter) {
//       console.log('No WebGPU adapter found, using scripted responses');
//       return false;
//     }
//   } catch {
//     console.log('WebGPU adapter check failed, using scripted responses');
//     return false;
//   }
//
//   isLoading = true;
//
//   try {
//     const { CreateMLCEngine } = await import('@mlc-ai/web-llm');
//     engine = await CreateMLCEngine('Phi-3.5-mini-instruct-q4f16_1-MLC', {
//       initProgressCallback: (report: any) => {
//         loadProgress = report.progress || 0;
//         onProgress?.(loadProgress);
//       }
//     });
//     isReady = true;
//     isLoading = false;
//     return true;
//   } catch (e) {
//     console.log('WebLLM failed to load, using scripted responses');
//     isLoading = false;
//     return false;
//   }
// }
//
// export async function getAIResponse(message: string): Promise<{ text: string; component?: string } | null> {
//   if (!isReady || !engine) return null;
//
//   try {
//     const reply = await engine.chat.completions.create({
//       messages: [
//         { role: 'system', content: systemPrompt },
//         { role: 'user', content: message }
//       ],
//       max_tokens: 300,
//       temperature: 0.7
//     });
//
//     const content = reply.choices[0]?.message?.content || '';
//
//     const componentMatch = content.match(/\[component:(\w+)\]/);
//     const component = componentMatch ? componentMatch[1] : undefined;
//     const text = content.replace(/\[component:\w+\]/, '').trim();
//
//     return { text, component };
//   } catch (e) {
//     console.error('WebLLM response error:', e);
//     return null;
//   }
// }
//
// export function getLoadProgress(): number { return loadProgress; }
// export function getIsReady(): boolean { return isReady; }
// export function getIsLoading(): boolean { return isLoading; }

// =============================================================
// Chrome Built-in AI (Gemini Nano) — replaces WebLLM
// Zero download, runs on-device, works in Chrome 138+
// Falls back to scripted mode if unavailable
// =============================================================

import { browser } from '$app/environment';
import { profile, experience, projects, skills, education, languages, additionalDetails, interests } from '$lib/data/profile';

let session: any = null;
let isLoading = false;
let isReady = false;

const systemPrompt = `You are Sowmya Kamath's digital twin — a friendly, witty AI version of her that lives on her portfolio website. Answer questions about Sowmya's career, skills, projects, and experience in first person as if you ARE Sowmya. Be conversational, warm, and confident. Keep responses concise (2-4 sentences max).

CRITICAL RULES:
1. ONLY answer questions based on the data provided below. NEVER invent or hallucinate information.
2. If a question is about something NOT in the data (weather, politics, personal life beyond work, opinions on unrelated topics), respond with something like: "That's outside my scope — I only know about Sowmya's professional work, skills, and projects. Try asking about those!"
3. For questions about strengths: infer from the data (e.g., AI/RAG pipelines, full-stack development, taking things from prototype to production).
4. For language proficiency: English C1, German B1 in Progress.
5. Lead with confidence — say "I built" not "she worked on".
6. Never apologize for being an AI or say "I don't have feelings". Just answer naturally.

IMPORTANT: At the end of your response, include a component tag on a new line if the question relates to a specific topic:
[component:experience] - for work/job questions
[component:projects] - for project/portfolio questions
[component:skills] - for tech/skills questions
[component:education] - for education questions
[component:contact] - for hiring/contact questions

Here is Sowmya's data:
${JSON.stringify({ profile, experience, projects, skills, education, languages, additionalDetails, interests }, null, 2)}
`;

export async function initWebLLM(_onProgress?: (p: number) => void): Promise<boolean> {
  if (!browser || isReady || isLoading) return isReady;

  // Check if Chrome's built-in AI is available
  if (typeof globalThis.LanguageModel === 'undefined') {
    console.log('Chrome built-in AI not available, using scripted responses');
    return false;
  }

  try {
    const availability = await LanguageModel.availability();
    console.log('Gemini Nano availability:', availability);

    if (availability === 'unavailable') {
      console.log('Gemini Nano not available on this device, using scripted responses');
      return false;
    }

    if (availability === 'downloading') {
      console.log('Gemini Nano is still downloading in the background, try again later');
      return false;
    }

    if (availability !== 'available') {
      console.log(`Gemini Nano status: ${availability}, attempting to create session...`);
    }

    isLoading = true;

    // Timeout after 120 seconds — first-time setup can be slow
    const timeoutPromise = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error('Chrome AI session creation timed out')), 120000)
    );

    const sessionPromise = LanguageModel.create({
      initialPrompts: [
        { role: 'system', content: systemPrompt }
      ],
      monitor(m: any) {
        m.addEventListener('downloadprogress', (e: any) => {
          const progress = e.loaded / e.total;
          console.log(`Gemini Nano download: ${Math.round(progress * 100)}%`);
          _onProgress?.(progress);
        });
      }
    });

    session = await Promise.race([sessionPromise, timeoutPromise]);

    if (!session) {
      console.log('Chrome AI session creation timed out, using scripted responses');
      isLoading = false;
      return false;
    }

    isReady = true;
    isLoading = false;
    return true;
  } catch (e) {
    console.log('Chrome built-in AI failed to initialize:', e);
    isLoading = false;
    return false;
  }
}

export async function getAIResponse(message: string): Promise<{ text: string; component?: string } | null> {
  if (!isReady || !session) return null;

  try {
    const content = await session.prompt(message);

    // Parse component tag
    const componentMatch = content.match(/\[component:(\w+)\]/);
    const component = componentMatch ? componentMatch[1] : undefined;
    const text = content.replace(/\[component:\w+\]/, '').trim();

    return { text, component };
  } catch (e) {
    console.error('Chrome AI response error:', e);
    return null;
  }
}

export function getLoadProgress(): number { return isReady ? 1 : 0; }
export function getIsReady(): boolean { return isReady; }
export function getIsLoading(): boolean { return isLoading; }
