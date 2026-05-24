export const profile = {
  name: "Sowmya Kamath Ramesh",
  title: "AI Engineer & Full Stack Developer",
  location: "Germany",
  level: 29,
  status: "Available for Hire",
  bio: "I turn coffee into code and research papers into production systems. Master's in ML/DL/NLP from Uni Paderborn, currently building AI platforms, RAG pipelines, and gamified learning systems at Interaktiv. I've anonymized Hindi legal docs, shipped a centralized AI platform used company-wide, and once built an entire password vault because I kept forgetting my passwords. The irony is not lost on me.",
  links: {
    github: "https://github.com/Sowmya-95",
    linkedin: "https://www.linkedin.com/in/sowmyakamath",
    email: "sowmyakamathr95@gmail.com",
    resume: "https://sowmya-95.github.io/portfolio/portfolio/ResumeH.pdf"
  }
};

export type SubProject = {
  name: string;
  description: string;
  tech: string[];
};

export const experience = [
  {
    id: 1,
    role: "AI Engineer",
    company: "Interaktiv GmbH",
    duration: "Jun 2024 - Present",
    location: "Kerpen, Germany",
    highlights: [
      "Took AI initiatives from scattered, one-off solutions to a connected ecosystem",
      "Centralized platform, intelligent pipelines, and ready-to-use tools any team can plug into",
      "Shortened the path from idea to production for new AI features"
    ],
    tech: ["LangChain", "NestJS", "Next.js", "React 19", "Neo4j", "Redis", "Kubernetes", "Docker", "Keycloak", "PostgreSQL"],
    xp: 3500,
    subProjects: [
      {
        name: "GamesOnBoard — Gamified Onboarding Platform",
        description: "Full-stack learning platform for EU Erasmus+ trainees. Microservices backend (NestJS, PostgreSQL, Redis, Keycloak), Next.js/React 19 frontend. Gamification engine with XP, levels, streaks, badges, and leaderboards. RAG-powered AI chatbot using Mistral. Supports 7 languages, two-tier admin system, full GDPR compliance.",
        tech: ["NestJS", "Next.js", "React 19", "PostgreSQL", "Redis", "Keycloak", "Mistral", "Docker", "Kubernetes", "GitLab CI/CD"]
      },
      {
        name: "RAG Pipelines & Intelligent Data Ingestion",
        description: "Production-grade GraphRAG/RAG pipelines using LangChain, Neo4j, and Redis. OCR-based ingestion converting unstructured PDFs into vectorized corpora. Tested across OpenRouter, Hugging Face, GPT-4, and Mistral. Monitored with RAGAS metrics and LangSmith observability.",
        tech: ["LangChain", "Neo4j", "Redis", "RAGAS", "LangSmith", "OCR", "GPT-4", "Mistral"]
      },
      {
        name: "KYRA — Centralized AI Platform",
        description: "Evolved from basic multi-tenant setup into Kubernetes- and Keycloak-based platform with modular AI agents and shared resources. Standardized how AI features are integrated company-wide, increasing efficiency by driving reuse across teams.",
        tech: ["Kubernetes", "Keycloak", "Neo4j", "Redis", "Docker"]
      },
      {
        name: "Prompt Management & AI Text Editor",
        description: "Next.js dashboard with RAG pipeline for PDF uploads and custom prompt creation. Powers AI features in TinyMCE — content rewriting, summarization, tone adjustment, translation, and custom prompt execution.",
        tech: ["Next.js", "RAG", "TinyMCE", "LangChain"]
      },
      {
        name: "Erasmus+ AI Chatbot",
        description: "LLM-RAG chatbot over Erasmus+ data for automated topic validation, scoring, and feedback generation. Re-architected in Xano + WeWeb for faster deployment and easier maintenance.",
        tech: ["Python", "LangChain", "Xano", "WeWeb"]
      }
    ] as SubProject[]
  },
  {
    id: 2,
    role: "Co-founder & Web Developer",
    company: "GadgetLend",
    duration: "Feb 2024 - May 2024",
    location: "Germany",
    highlights: [
      "Designed and built the landing page from scratch",
      "Integrated feedback forms with PHP backend",
      "Created marketing banners and brand materials"
    ],
    tech: ["Bootstrap", "PHP", "CSS", "JavaScript"],
    xp: 1800
  },
  {
    id: 3,
    role: "Junior Frontend Developer",
    company: "JoBooking",
    duration: "Apr 2023 - Dec 2023",
    location: "Germany",
    highlights: [
      "Built dashboard pages with Vue3 + TailwindCSS",
      "Implemented swiper playlists and booking card components",
      "Clean code in Agile/Kanban workflow"
    ],
    tech: ["Vue3", "TailwindCSS", "TypeScript", "PocketBase"],
    xp: 2800
  },
  {
    id: 4,
    role: "Data Science Researcher",
    company: "Universitat Paderborn",
    duration: "2020 - 2024",
    location: "Paderborn, Germany",
    highlights: [
      "Master's thesis: Text anonymization in Hindi legal documents",
      "NLP, Machine Learning, and Deep Learning specialization",
      "Worked with Hugging Face models and PyTorch"
    ],
    tech: ["Python", "PyTorch", "Hugging Face", "TensorFlow", "Pandas"],
    xp: 4200
  }
];

export const projects = [
  {
    id: 1,
    name: "Hindi Legal Doc Anonymization",
    description: "NER pipeline that detects and anonymizes personally identifiable information in Hindi legal documents using Hugging Face transformers. Built for a language most NLP tools ignore — technically challenging and socially important.",
    tech: ["Python", "PyTorch", "Hugging Face", "NLP", "Google Colab"],
    link: "https://github.com/Sowmya-95/masterThesis"
  },
  {
    id: 2,
    name: "Voice Chatbot",
    description: "Voice-powered AI chatbot with a Python backend and TypeScript frontend. Speak to it, it speaks back — because typing is so last decade.",
    tech: ["Python", "TypeScript", "MCP"],
    link: "https://github.com/Sowmya-95/voice-chatbot"
  },
  {
    id: 3,
    name: "Password Vault",
    description: "End-to-end encrypted credential manager with AES encryption and bcrypt hashing. Full-stack Next.js app with PostgreSQL storage. Built it because sticky notes are not a security strategy.",
    tech: ["Next.js", "Drizzle ORM", "PostgreSQL", "bcrypt", "AES", "ShadCN UI"],
    link: "https://github.com/Sowmya-95/password-vault"
  },
  {
    id: 4,
    name: "FastAPI Fullstack",
    description: "Production-ready REST API with OAuth2 auth, automated testing, Docker containerization, and CI/CD pipeline. The complete backend template — from dev to deployment.",
    tech: ["FastAPI", "PostgreSQL", "SQLAlchemy", "Docker", "OAuth2", "GitHub Actions"],
    link: "https://github.com/Sowmya-95/pythonAPIDev"
  },
  {
    id: 5,
    name: "React v19 Projects",
    description: "Collection of hands-on projects exploring React 19 features: meme generator, travel journal, AI recipe assistant powered by Hugging Face LLMs.",
    tech: ["React v19", "Hugging Face LLMs", "Vite"],
    link: "https://github.com/Sowmya-95/React"
  },
  {
    id: 6,
    name: "Amazon Clone",
    description: "JavaScript clone with DOM manipulation, async programming, OOP patterns, and a full test suite. Built to master core JS before reaching for frameworks.",
    tech: ["JavaScript ES6+", "HTML5", "CSS3", "Async/Await", "Testing"],
    link: "https://github.com/Sowmya-95/javascript-amazon-website"
  },
  {
    id: 7,
    name: "GadgetLend",
    description: "Marketing site for a gadget lending startup. Co-founded, designed, and shipped — from brand identity to responsive pages.",
    tech: ["Bootstrap", "PHP", "JavaScript", "Adobe Express", "Canva"],
    link: "https://www.gadgetlend.de"
  }
];

export const skills: Record<string, string[]> = {
  "AI & Generative Systems": [
    "LangChain", "LangGraph", "RAG/GraphRAG", "Prompt Engineering",
    "RAGAS", "LangSmith", "Langfuse", "Generative AI", "LLM-based Assistants"
  ],
  "Data Analytics & Modeling": [
    "Machine Learning", "NLP", "Vector Search", "Data Pipelines",
    "Data Ingestion", "OCR", "Deep Learning"
  ],
  "Programming & Frameworks": [
    "Python", "TypeScript", "JavaScript", "FastAPI", "Flask",
    "NestJS", "React 19", "Next.js", "Angular", "Vue.js",
    "TailwindCSS", "HTML/CSS"
  ],
  "Databases & Storage": [
    "PostgreSQL", "Redis", "Neo4j", "MySQL",
    "ChromaDB", "Qdrant", "FalkorDB", "SQL/NoSQL"
  ],
  "DevOps & Infrastructure": [
    "Docker", "Kubernetes", "GitLab CI/CD", "Keycloak", "Linux"
  ],
  "Research & Collaboration": [
    "Scientific Writing", "Conference Presentations",
    "Applied Research", "Interdisciplinary Teamwork"
  ]
};

export const languages = [
  { language: "English", level: "C1" },
  { language: "German", level: "B1 in Progress" }
];

export const education = [
  {
    degree: "M.Sc. Informatik",
    university: "Universität Paderborn",
    year: "2020 - 2024",
    highlights: [
      "Focus: Artificial Intelligence, Data Science, Machine Learning",
      "Master's Project: Anonymization of Indian Legal Documents (NLP Pipeline)"
    ]
  },
  {
    degree: "B.E. Information Science",
    university: "NIEIT University",
    year: "2012 - 2016",
    highlights: []
  }
];

export const additionalDetails = [
  "German Driving Licence",
  "EU Work Visa / Blue Card Eligible",
  "Open to Relocation within Germany"
];

export const interests = [
  "Padel", "Badminton", "Travelling", "Cross-Cultural Learning", "AI Ethics & Research"
];
