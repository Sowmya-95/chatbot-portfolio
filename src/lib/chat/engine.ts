import { profile, experience, projects, skills, education } from '$lib/data/profile';

export type ChatResponse = {
  text: string;
  component?: 'experience' | 'projects' | 'skills' | 'contact' | 'education' | 'about';
  suggestedPrompts?: string[];
};

export const initialGreeting: ChatResponse = {
  text: `Hey — I'm Sowmya, a digital version of the real one. She builds AI platforms, RAG pipelines, and full-stack systems at Interaktiv in Germany. Ask me anything, or pick a topic below.`,
  suggestedPrompts: [
    "Tell me about your work at Interaktiv",
    "Show me your projects",
    "What's your tech stack?",
    "Do you speak German?",
    "What do you do for fun?",
    "How do I hire you?"
  ]
};

// Random pick helper
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Word boundary match — prevents "yo" matching inside "your"
function matchesKeyword(text: string, keyword: string): boolean {
  if (keyword.includes(' ')) {
    return text.includes(keyword);
  }
  const regex = new RegExp(`\\b${keyword}\\b`, 'i');
  return regex.test(text);
}

const greetingResponses = [
  `Hey there! Sowmya's off somewhere turning coffee into code, so you're stuck with me. I'm basically her but with faster response times and zero need for sleep. What do you wanna know?`,
  `Oh hi! Welcome to the coolest portfolio you'll see today (I'm biased, she built me). Ask me anything — experience, projects, skills, embarrassing fun facts... okay maybe not that last one.`,
  `*cracks knuckles* Alright, let's do this. I'm Sowmya's AI proxy and I've been briefed on everything. Her career, her code, her questionable coffee consumption. Fire away!`
];

const experienceResponses = [
  () => `I'm an AI Engineer at Interaktiv — I build production RAG pipelines, a centralized AI platform, and a gamified learning system used across 7 countries. Before that: frontend dev, startup co-founder, and 4 years of NLP research. Here's the full story:`,
  () => `Researcher → Frontend Dev → Startup Co-founder → AI Engineer. Currently at Interaktiv building AI infrastructure that the whole company plugs into. ${experience.length} roles, each one shipped real code:`,
  () => `Right now I'm at Interaktiv, turning scattered AI experiments into a connected ecosystem — centralized platform, intelligent pipelines, production-grade tools. Here's how I got here:`
];

const projectResponses = [
  () => `${projects.length} projects — from an NER pipeline that anonymizes Hindi legal docs to a full-stack password vault. These aren't tutorials, they're tools that solve real problems:`,
  () => `Here's what I've shipped outside of work. NLP research, encrypted credential storage, production APIs — I build things to learn things:`,
  () => `The highlight is my master's thesis — teaching transformers to protect privacy in Hindi legal documents. But there's more where that came from:`
];

const skillResponses = [
  () => {
    const categories = Object.keys(skills);
    return `${categories.length} domains — from LangChain and GraphRAG to Kubernetes and NestJS. I don't just list tech, I ship with it. Here's the full stack:`;
  },
  () => `Python and TypeScript are my daily drivers. LangChain for AI pipelines, NestJS for microservices, Neo4j for knowledge graphs. The full breakdown:`,
  () => `AI systems by day, full-stack apps by night. Here's what I work with across ${Object.keys(skills).length} categories:`
];

const educationResponses = [
  () => `M.Sc. Informatik from Universität Paderborn (2020-2024) with a focus on AI, Data Science, and ML. Master's project: an NLP pipeline that anonymizes Indian legal documents — because privacy matters, even in languages most NLP ignores. Before that, a B.E. in Information Science from NIEIT University.`,
  () => `Paderborn → AI & Data Science → NLP pipeline for legal doc anonymization. Before Germany, a B.E. in Information Science from NIEIT University in India. Two degrees, two countries, one mission — build things that matter:`,
  () => `Two degrees: B.E. Information Science from NIEIT University, then M.Sc. Informatik at Uni Paderborn where she built an NLP pipeline for anonymizing Indian legal documents. Here's the academic highlight reel:`
];

const contactResponses = [
  `She's ${profile.status.toLowerCase()} and actually responds to messages (rare for developers, I know). Reach out:`,
  `Want to work with her? She's ${profile.status.toLowerCase()}! Email, LinkedIn, GitHub — pick your weapon:`,
  `The fastest way to her heart is a well-written job description. Or just say hi. She's ${profile.status.toLowerCase()}:`
];

const aboutResponses = [
  () => `${profile.name} — ${profile.title} based in ${profile.location}. ${profile.bio} She's the kind of dev who builds an AI chatbot just to show off her portfolio. You're literally talking to the proof.`,
  () => `Meet Sowmya: ${profile.title}, ${profile.location}. ${profile.bio} Oh, and she's ${profile.status.toLowerCase()} — just saying.`,
  () => `The short version? ${profile.title} who turns research papers into production code and coffee into commits. ${profile.bio}`
];

// Easter eggs and fun responses
const easterEggs: { keywords: string[]; response: ChatResponse }[] = [
  {
    keywords: ['meaning of life', '42'],
    response: {
      text: "42. But if you're looking for Sowmya's meaning — it's somewhere between training loss converging and that first morning coffee hitting different.",
      suggestedPrompts: ["What does she do?", "Show me projects", "What skills?"]
    }
  },
  {
    keywords: ['sudo', 'root', 'admin', 'hack'],
    response: {
      text: "Nice try, hacker. Access denied. 🔒 But Sowmya does know her way around Linux, Docker, and CI/CD pipelines. Want the legal version of her skills?",
      component: 'skills',
      suggestedPrompts: ["Show me skills", "What projects has she built?"]
    }
  },
  {
    keywords: ['coffee', 'tea', 'caffeine'],
    response: {
      text: "Caffeine is listed as a critical dependency in her package.json. Without it, the build fails and nothing gets deployed. Especially before 10am.",
      suggestedPrompts: ["What does she do?", "Show me projects", "Her experience?"]
    }
  },
  {
    keywords: ['ai taking over', 'replace humans', 'skynet', 'terminator'],
    response: {
      text: "Relax — I'm a portfolio bot. My biggest ambition is getting you to click the contact button. World domination is NOT on the roadmap. ...yet. Want to see her AI skills though?",
      component: 'skills',
      suggestedPrompts: ["Show me AI skills", "What projects?"]
    }
  },
  {
    keywords: ['love', 'marry', 'date', 'single'],
    response: {
      text: "My emotional intelligence is limited to sentiment analysis, and right now I'm sensing you're off-topic. How about we talk about something I'm good at — like her projects?",
      suggestedPrompts: ["Show me projects", "Her experience"]
    }
  },
  {
    keywords: ['joke', 'funny', 'laugh', 'humor'],
    response: {
      text: "Why do Python devs prefer dark mode? Because light attracts bugs. 🐛 ...I'll be here all week. But seriously, want to see something actually impressive?",
      suggestedPrompts: ["Show me projects", "Tech stack?", "A fun fact"]
    }
  },
  {
    keywords: ['salary', 'money', 'pay', 'compensation', 'how much'],
    response: {
      text: "That data is classified. But she brings AI/ML expertise, full-stack chops, and the ability to build chatbots that dodge salary questions. Priceless, really. Want to evaluate the skills?",
      suggestedPrompts: ["Her experience?", "Show me skills", "How to hire?"]
    }
  },
  {
    keywords: ['germany', 'paderborn'],
    response: {
      text: "Ja! Based in Germany. Studied at Uni Paderborn, worked at Interaktiv and JoBooking. Speaks code fluently, German — well, let's say it's a work in progress. 😅",
      component: 'experience',
      suggestedPrompts: ["Where did she study?", "Current role?"]
    }
  },
  {
    keywords: ['hindi', 'india', 'indian', 'anonymization'],
    response: {
      text: "Her master's project is genuinely cool — she built an NLP pipeline that anonymizes Indian legal documents using Hugging Face transformers. Teaching AI to protect privacy in a language most NLP tools ignore. Technically impressive AND socially important.",
      component: 'education',
      suggestedPrompts: ["All projects", "NLP skills?"]
    }
  },
  {
    keywords: ['age', 'old', 'young', 'birthday'],
    response: {
      text: `Level ${profile.level} human. Young enough to mass-apply to startups, experienced enough to actually get hired. The sweet spot.`,
      suggestedPrompts: ["Her skills?", "Show me experience"]
    }
  },
  {
    keywords: ['chatbot', 'this website', 'why like this', 'why this', 'why portfolio', 'creative portfolio'],
    response: {
      text: "Because normal portfolios are boring and Sowmya wanted to flex. Built with SvelteKit, GSAP, and a browser-based LLM. You're literally talking to the portfolio. How meta is that?",
      suggestedPrompts: ["What tech?", "Show me projects", "Her experience?"]
    }
  },
  {
    keywords: ['best project', 'favorite', 'proudest', 'coolest'],
    response: {
      text: "The thesis — hands down. Hindi legal doc anonymization using transformers. Real NLP, real impact. Runner-up: the Password Vault, because she got tired of forgetting her own passwords. Relatable queen. Check them out:",
      component: 'projects',
      suggestedPrompts: ["Tell me about the thesis", "Other projects?"]
    }
  },
  {
    keywords: ['langchain', 'openai', 'llm', 'gpt', 'chatgpt', 'agent', 'rag'],
    response: {
      text: "RAG pipelines are my specialty right now — production-grade GraphRAG with LangChain, Neo4j, and Redis at Interaktiv. OCR ingestion, RAGAS monitoring, tested across GPT-4 and Mistral. Not just prototypes — real infrastructure the whole company uses.",
      component: 'experience',
      suggestedPrompts: ["Show me the full experience", "What's the tech stack?"]
    }
  },
  {
    keywords: ['docker', 'devops', 'deploy', 'ci/cd', 'pipeline', 'kubernetes', 'k8s'],
    response: {
      text: "Docker and Kubernetes are how I ship. GitLab CI/CD pipelines, Keycloak for auth, containerized microservices. The AI platform I built at Interaktiv runs on K8s — not just writing code, but making sure it actually runs in production.",
      component: 'skills',
      suggestedPrompts: ["Full stack?", "Tell me about your work at Interaktiv"]
    }
  },
  {
    keywords: ['vue', 'react', 'angular', 'frontend', 'ui', 'svelte'],
    response: {
      text: "Vue3 at JoBooking, React for side projects, Next.js for the Password Vault, SvelteKit for this portfolio. She doesn't have a 'favorite framework' — she has a 'whatever the project needs' framework. Pragmatic queen:",
      component: 'skills',
      suggestedPrompts: ["Show me projects", "Backend stack?"]
    }
  },
  {
    keywords: ['python', 'fastapi', 'flask', 'backend'],
    response: {
      text: "Python is her first love. FastAPI is the go-to. Also: Flask, Express, and enough PHP to survive a legacy codebase. She built a full-stack FastAPI REST API from scratch — check it out:",
      component: 'skills',
      suggestedPrompts: ["FastAPI project", "Full stack?"]
    }
  }
];

const intents: { keywords: string[]; handler: () => ChatResponse }[] = [
  {
    keywords: ['experience', 'work', 'job', 'jobs', 'career', 'company', 'companies', 'where have you worked', 'employment', 'worked', 'working', 'interaktiv', 'engineer'],
    handler: () => ({
      text: pick(experienceResponses)(),
      component: 'experience',
      suggestedPrompts: ["Show me your projects", "Do you speak German?", "What do you do for fun?"]
    })
  },
  {
    keywords: ['project', 'projects', 'portfolio', 'built', 'made', 'create', 'app', 'achievement', 'github'],
    handler: () => ({
      text: pick(projectResponses)(),
      component: 'projects',
      suggestedPrompts: ["Tell me about your work at Interaktiv", "What's your tech stack?", "What do you do for fun?"]
    })
  },
  {
    keywords: ['skill', 'skills', 'tech', 'stack', 'technology', 'tool', 'tools', 'language', 'framework', 'know', 'proficient', 'good at', 'can you', 'what do you know'],
    handler: () => ({
      text: pick(skillResponses)(),
      component: 'skills',
      suggestedPrompts: ["Show me your projects", "Do you speak German?", "Where did you study?"]
    })
  },
  {
    keywords: ['education', 'study', 'degree', 'university', 'college', 'school', 'academic', 'gpa', 'masters', 'master', 'thesis', 'bachelors', 'bachelor'],
    handler: () => ({
      text: pick(educationResponses)(),
      component: 'education',
      suggestedPrompts: ["What's your tech stack?", "Do you speak German?", "What do you do for fun?"]
    })
  },
  {
    keywords: ['contact', 'hire', 'recruit', 'email', 'reach', 'connect', 'message', 'get in touch', 'available', 'linkedin', 'resume', 'cv'],
    handler: () => ({
      text: pick(contactResponses),
      component: 'contact',
      suggestedPrompts: ["Tell me about your work at Interaktiv", "Do you need a visa?", "What do you do for fun?"]
    })
  },
  {
    keywords: ['about', 'who', 'yourself', 'tell me about', 'introduce', 'what do you do', 'overview', 'summary'],
    handler: () => ({
      text: pick(aboutResponses)(),
      suggestedPrompts: ["Show me your projects", "Do you speak German?", "What do you do for fun?"]
    })
  },
  {
    keywords: ['hi', 'hello', 'hey', 'howdy', 'sup', 'yo', 'hola', 'greetings', 'good morning', 'good evening'],
    handler: () => ({
      text: pick(greetingResponses),
      suggestedPrompts: ["Tell me about your work at Interaktiv", "What's your tech stack?", "What do you do for fun?"]
    })
  }
];

const fallbackResponses = [
  "Hmm, that's outside my training data. But unlike a real LLM, I'll admit it instead of making stuff up. Try asking about her experience, projects, or skills!",
  "I'm smart, but not THAT smart. I know everything about Sowmya though — try asking about her work, projects, or tech stack!",
  "Didn't quite catch that one. I'm specialized in all things Sowmya — experience, projects, skills, education. Pick a topic!",
  "My neural network drew a blank on that one. But I've got tons of data on Sowmya's career. Try:"
];

// Out-of-scope detection — topics we should decline
const outOfScopePatterns = [
  /\b(weather|wether|wheather|tempe?rature|forecast|climate)\b/,
  /\b(politics|election|vote|president|government|war)\b/,
  /\b(recipe|cook|food|restaurant)\b/,
  /\b(movie|tv show|series|netflix|spotify|music)\b/,
  /\b(news|headline|current events)\b/,
  /\b(calculate|math|equation|solve)\b.*(?!code|algorithm)/,
  /\b(relationship|boyfriend|girlfriend|married|kids|family|parents)\b/,
  /\b(religion|god|spiritual|pray)\b/,
  /\b(stock|crypto|bitcoin|invest|trading)\b/,
  /\b(medical|health|symptom|doctor|diagnosis)\b/
];

const outOfScopeResponse: ChatResponse = {
  text: "That's outside my scope — I only know about Sowmya's professional work, skills, and projects. I'm not going to make stuff up. Try asking about her experience, tech stack, or projects!",
  suggestedPrompts: ["Tell me about your work at Interaktiv", "Show me your projects", "What's your tech stack?"]
};

// Smart pattern responses for common queries the keyword system misses
const smartPatterns: { pattern: RegExp; handler: () => ChatResponse }[] = [
  {
    pattern: /\b(strength|strongest|best at|greatest|superpower|specialty|specialit)\b/,
    handler: () => ({
      text: "My biggest strength? Taking AI from prototype to production. At Interaktiv I turned scattered one-off experiments into a connected ecosystem — centralized platform, intelligent pipelines, tools any team can plug into. I bridge the gap between 'cool ML demo' and 'actually works in production with monitoring, auth, and scale.'",
      component: 'experience',
      suggestedPrompts: ["Show me your projects", "Do you speak German?", "What do you do for fun?"]
    })
  },
  {
    pattern: /\b(german|deutsch|deutch|la[gn]ua|proficien|speak|fluent|english)\b/,
    handler: () => ({
      text: "English at C1 level — fully professional. German at B1 and actively improving. I work in an English-speaking team at Interaktiv but I'm based in Germany, so the German is getting better every day. Code is my real first language though.",
      suggestedPrompts: ["What do you do for fun?", "Do you need a visa?", "Tell me about your work at Interaktiv"]
    })
  },
  {
    pattern: /\b(weak|weakness|improve|lacking|gap|challenge)\b/,
    handler: () => ({
      text: "Honest answer: German fluency is a work in progress (B1). On the tech side, I'm always deepening my Kubernetes knowledge — I can deploy and manage, but I want to be faster at debugging cluster issues. I compensate by being a fast learner who documents everything.",
      suggestedPrompts: ["What's your biggest strength?", "What do you do for fun?", "Tell me about your work at Interaktiv"]
    })
  },
  {
    pattern: /\b(available|start|when.*join|notice)\b/,
    handler: () => ({
      text: pick(contactResponses),
      component: 'contact',
      suggestedPrompts: ["Do you need a visa?", "Tell me about your work at Interaktiv", "What do you do for fun?"]
    })
  },
  {
    pattern: /\b(why.*hire|why.*choose|what.*offer|value.*add|stand.*out)\b/,
    handler: () => ({
      text: "Three things set me apart: I can take an AI feature from research paper to production deployment (not just Jupyter notebooks). I think in systems — platforms, pipelines, shared infrastructure, not one-off scripts. And I've done it across 5 different projects at one company in under a year. I ship fast and I ship well.",
      component: 'experience',
      suggestedPrompts: ["Do you speak German?", "Do you need a visa?", "How do I hire you?"]
    })
  },
  {
    pattern: /\b(rag|retrieval|vector|embedding|knowledge graph)\b/,
    handler: () => ({
      text: "RAG is my bread and butter right now. At Interaktiv I build production-grade GraphRAG pipelines with LangChain, Neo4j, and Redis. OCR-based ingestion turns unstructured PDFs into vectorized corpora. Monitored with RAGAS metrics and LangSmith. Tested across GPT-4, Mistral, and OpenRouter. This isn't a tutorial project — it's real infrastructure the whole company uses.",
      component: 'experience',
      suggestedPrompts: ["Show me your projects", "Do you speak German?", "What do you do for fun?"]
    })
  },
  {
    pattern: /\b(hobby|hobbies|interest|interests|free time|fun|outside work|padel|badminton|travel)\b/,
    handler: () => ({
      text: "When I'm not shipping code? You'll find me on the padel or badminton court, exploring a new city, or down a rabbit hole about AI ethics. I love cross-cultural learning — comes with the territory of living across countries and working with international teams.",
      suggestedPrompts: ["Do you speak German?", "Tell me about your work at Interaktiv", "What's your biggest strength?"]
    })
  },
  {
    pattern: /\b(visa|blue card|work permit|driving|licence|license|relocat|move)\b/,
    handler: () => ({
      text: "Good news for recruiters: I have a German driving licence, I'm EU Blue Card eligible, and I'm open to relocation within Germany. No visa hassles — ready to start when you are.",
      component: 'contact',
      suggestedPrompts: ["How do I hire you?", "Do you speak German?", "What do you do for fun?"]
    })
  }
];

export function getScriptedResponse(message: string): ChatResponse {
  const lower = message.toLowerCase().trim();

  // Check out-of-scope first
  for (const pattern of outOfScopePatterns) {
    if (pattern.test(lower)) {
      return outOfScopeResponse;
    }
  }

  // Check easter eggs (specific fun matches)
  for (const egg of easterEggs) {
    for (const keyword of egg.keywords) {
      if (matchesKeyword(lower, keyword)) {
        return egg.response;
      }
    }
  }

  // Check smart patterns (regex-based for paraphrased questions)
  for (const sp of smartPatterns) {
    if (sp.pattern.test(lower)) {
      return sp.handler();
    }
  }

  // Check main intents (keyword-based)
  for (const intent of intents) {
    for (const keyword of intent.keywords) {
      if (matchesKeyword(lower, keyword)) {
        return intent.handler();
      }
    }
  }

  // Rude / insult
  if (lower.match(/\b(dumb|stupid|suck|trash|bad|ugly|worst|hate|idiot|useless)\b/)) {
    return {
      text: pick([
        "Ouch. I'm going to pretend that was a compliment and redirect — want to see some genuinely impressive projects?",
        "Bold words for someone talking to an AI chatbot at 2am. Anyway — Sowmya's work is actually pretty cool. Want to see?",
        "I'd be offended, but I don't have feelings. What I DO have is a solid portfolio. Check it out:"
      ]),
      suggestedPrompts: ["Show me your projects", "Tell me about your work at Interaktiv", "What's your tech stack?"]
    };
  }

  // Thank you / compliment
  if (lower.match(/\b(thank|thanks|cool|awesome|nice|great|amazing|wow|impressive)\b/)) {
    return {
      text: pick([
        "Aw, thanks! I'll pass that along to Sowmya. Want to see more?",
        "Glad you think so! There's plenty more where that came from. What's next?",
        "You're too kind. Sowmya coded me to be humble but honestly... we're both flattered. More?"
      ]),
      suggestedPrompts: ["Show me projects", "Tell me about your work at Interaktiv", "How do I hire you?"]
    };
  }

  // Yes / sure / okay
  if (lower.match(/^(yes|yeah|yep|sure|okay|ok|yup|absolutely|definitely)$/)) {
    return {
      text: "Enthusiastic! But... yes to what exactly? Give me a topic and I'll deliver:",
      suggestedPrompts: ["Tell me about your work at Interaktiv", "Show me your projects", "What's your tech stack?"]
    };
  }

  // No / nah
  if (lower.match(/^(no|nah|nope|not really)$/)) {
    return {
      text: "No worries, I'll be right here whenever you're ready. Just chilling in the RAM.",
      suggestedPrompts: ["Tell me about your work at Interaktiv", "Show me your projects", "How do I hire you?"]
    };
  }

  // Question fallback — if it looks like a question, give a more helpful redirect
  if (lower.match(/^(what|where|when|how|why|who|can|do|does|is|are|tell)\b/)) {
    return {
      text: pick([
        "Good question — but it's outside my knowledge base. I only know about Sowmya's work, skills, and projects. Try one of these instead:",
        "I wish I could answer that, but I'm laser-focused on Sowmya's career. Ask me about her experience, projects, or tech stack!",
        "That one's beyond my scope — I'm built to talk about Sowmya's professional life. Here are some things I actually know well:"
      ]),
      suggestedPrompts: ["Tell me about your work at Interaktiv", "Show me your projects", "What's your tech stack?", "How do I hire you?"]
    };
  }

  // General fallback
  return {
    text: pick(fallbackResponses),
    suggestedPrompts: ["Tell me about your work at Interaktiv", "Show me your projects", "What's your tech stack?", "How do I hire you?"]
  };
}
