# ⚖️ QanoonSathi AI 🇵🇰
### *Pakistan's open legal intelligence layer — structured, searchable, and safe from misuse.*

> An open, structured legal dataset and AI system designed to make Pakistani law understandable, accessible, and resistant to manipulation in the age of Generative AI.

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![Hackathon](https://img.shields.io/badge/Gen%20AI%20Hackathon-Cohort%203-brightgreen)
![Organizer](https://img.shields.io/badge/HEC%20Pakistan%20%C3%97%20Pak%20Angels-Organizer-gold)
![Status](https://img.shields.io/badge/Status-Active%20Development-blue)

---

## 📌 The Problem — Legal Misinformation Is a Crisis of Access

Across Pakistan, millions of people make life-altering decisions based on second-hand legal interpretations — or worse, deliberate distortions. Complex language, inaccessible documents, and a scarcity of affordable legal counsel create a vacuum that bad actors consistently exploit.

Many people:
- Do not read legal documents because they are too difficult to understand
- Rely on second-hand interpretations that may be incorrect or biased
- Fall victim to exaggerated, false, or fabricated legal claims
- Cannot afford professional legal counsel for basic rights questions

**When people cannot read the law for themselves, the law becomes a tool of control rather than protection. QanoonSathi exists to change that.**

---

## 🎯 Core Objective

- Educate individuals on their legal rights and protections under Pakistani law
- Reduce vulnerability to scams, manipulation, and false legal claims
- Convert dense legal material into accessible, structured formats
- Build a foundation for AI-powered legal tools that prioritise accuracy and clarity
- Democratise legal knowledge across all socioeconomic backgrounds

---

## 🛠️ What We Built — Four Layers, One Mission

### 📂 Layer 1 — The Legal Dataset
Authentic Pakistani legal documents — including the **Constitution of Pakistan** and foundational legal principles from the **Federal Ministry of Law and Justice** — extracted, cleaned, and structured for AI readiness.

### 🤖 Layer 2 — The AI Chatbot
A conversational interface that answers plain-language questions about Pakistani law, grounded in verified primary sources. No hallucinations. No unsourced claims.

### 🔌 Layer 3 — The API
RESTful APIs enabling third-party platforms — educational, civic, or commercial — to integrate legal intelligence responsibly and at scale.

### 🖥️ Layer 4 — The Frontend
A clean, accessible web interface designed for everyday citizens, not lawyers. Clear, fast, and built for trust.

---

## ⚙️ Core Capabilities

| Capability | Description |
|---|---|
| **Document Ingestion** | Collects and extracts text from official Pakistani legal PDFs with high fidelity to source formatting |
| **Data Cleaning** | Removes noise, normalises formatting, and segments text into structured machine-readable units |
| **AI Q&A** | Answers plain-language legal questions grounded in the dataset — no hallucination from unsourced claims |
| **Semantic Search** | Allows users to find relevant legal provisions by meaning, not just keyword matching |
| **Claim Verification** | Checks suspicious legal claims against the structured dataset to surface inaccuracies |

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React, CSS |
| **Backend** | Node.js, TypeScript |
| **Database** | Supabase |
| **LLM** | LLaMA (via Groq — versatile and instant inference) |
| **Embeddings** | Gemini Embeddings (`text-embedding-001`, 3072 dimensions) |
| **Frontend Deployment** | Vercel |
| **Backend Deployment** | Render |
| **API Testing** | Postman |

---

## 🧠 Use Cases

- **General Public** — Understand personal rights without needing a lawyer in the room
- **Students & Researchers** — Access structured legal data for academic work
- **Civil Society Organizations** — Ground advocacy in verified legal sources
- **Legal Aid Platforms** — Power affordable legal guidance tools
- **Civic Tech Developers** — Build the next generation of access-to-justice applications
- **Journalists & Policy Analysts** — Verify government and institutional legal claims

---

## 🏗️ Project Structure

```
qanoon-sathi-ai/
├── raw_pdfs/          ← original authenticated legal documents
├── extracted_text/    ← raw text pulled from PDFs
├── cleaned_data/      ← processed, readable, structured text
├── scripts/           ← data pipeline & processing scripts
├── chatbot/           ← AI chatbot engine & prompt logic
├── api/               ← REST API endpoints
├── frontend/          ← web interface
└── README.md
```

---

## 👥 The Team — Built by Six, for Millions

| Contributor | Role |
|---|---|
| **Kainat Suhail** | Team leadership. Principal Laws Dataset — Federal Ministry of Law & Justice, Pakistan |
| **Raqeeba Yasin** | Frontend Development, Organisation Setup and backup setup |
| **Tajammal Hussain** | AI Chatbot Architecture & Development. Final Web App deployment |
| **Abdul Wahab** | AI Chatbot Architecture & Development. |
| **Nimra Naeem** | API Integration & Model training |
| **Mohammad Mohsin** | AI Chatbot Architecture & Development |

---

## 🌱 Vision — The Future We Are Building Toward

> *A Pakistan where legal knowledge is not restricted to the privileged few — where every citizen can understand their rights without needing a lawyer in the room.*
>
> *Where AI provides accurate, responsible legal guidance. Where misinformation loses its power because the truth is one search away.*

We are working toward a future where:
- Legal knowledge is not restricted to professionals or the privileged
- Individuals can confidently understand and assert their rights
- AI systems provide accurate, responsible legal guidance
- Misinformation loses its power because truth is easily and freely accessible

---

## 🤝 Contributing — This Project Is Alive and Growing

Contributions are welcome across all layers of the project. Whether you are a lawyer who can validate dataset coverage, a developer strengthening the API, a designer improving accessibility, or a researcher expanding legal document coverage, there is meaningful work to do.

**Priority contribution areas:**

- `Dataset Expansion` — Adding more statutes, ordinances, and provincial laws
- `Data Cleaning` — Improving text quality and structure
- `AI Model Improvement` — Enhancing chatbot accuracy and grounding
- `API Development` — Extending endpoint coverage and performance
- `Accessibility & UX` — Making the interface work for all literacy levels
- `Legal Validation` — Verifying dataset accuracy with domain expertise

Please open an issue or submit a pull request to get started.

---

## 🚀 Hackathon Context

This project was developed as part of the **Gen AI Hackathon Cohort 3**, organised by the **Higher Education Commission Pakistan** and **Pak Angels**.

It represents a practical application of Generative AI to one of Pakistan's most pressing civic challenges: legal misinformation and the inaccessibility of law.

---

## ⚠️ Disclaimer

This project is intended for **educational and informational purposes only**. It does not constitute legal advice, and no reliance should be placed on it as a substitute for qualified legal counsel.

For matters with legal consequences, always consult a licensed legal professional.

---

## 📜 License

This project is licensed under the **[MIT License](LICENSE)**.

---

## ✨ Final Note

**Access to law should not depend on privilege, connections, or the interpretation of others.**

When people understand the law, they are harder to deceive. This project exists to make that understanding free, open, and permanent.

---

*Developed for Gen AI Hackathon Cohort 3 — organised by Higher Education Commission Pakistan and Pak Angels.*
