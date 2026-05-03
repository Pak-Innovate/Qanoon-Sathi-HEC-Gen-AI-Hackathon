# ⚖️ QanoonSathi AI 🇵🇰

### _Pakistan's open legal intelligence layer — structured, searchable, and safe from misuse._

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

## 🛠️ What We Built — Three Layers, One Mission

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

| Capability             | Description                                                                                             |
| ---------------------- | ------------------------------------------------------------------------------------------------------- |
| **Document Ingestion** | Collects and extracts text from official Pakistani legal PDFs with high fidelity to source formatting   |
| **Data Cleaning**      | Removes noise, normalises formatting, and segments text into structured machine-readable units          |
| **AI Q&A**             | Answers plain-language legal questions grounded in the dataset — no hallucination from unsourced claims |
| **Semantic Search**    | Allows users to find relevant legal provisions by meaning, not just keyword matching                    |
| **Claim Verification** | Checks suspicious legal claims against the structured dataset to surface inaccuracies                   |

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

| Contributor          | Role                                                                |
| -------------------- | ------------------------------------------------------------------- |
| **Kainat Suhail**    | Principal Laws Dataset — Federal Ministry of Law & Justice Pakistan |
| **Raqeeba Yasin**    | Frontend Development & Organisation Setup                           |
| **Tajammal Hussain** | AI Chatbot Architecture & Development                               |
| **Abdul Wahab**      | AI Chatbot Architecture & Development                               |
| **Nimra Naeem**      | API Integration & Backend Services                                  |
| **Mohammad Mohsin**  | AI Chatbot Architecture & Development                               |

---

## 🌱 Vision — The Future We Are Building Toward

> _A Pakistan where legal knowledge is not restricted to the privileged few — where every citizen can understand their rights without needing a lawyer in the room._
>
> _Where AI provides accurate, responsible legal guidance. Where misinformation loses its power because the truth is one search away._

We are working toward a future where:

- Legal knowledge is not restricted to professionals or the privileged
- Individuals can confidently understand and assert their rights
- AI systems provide accurate, responsible legal guidance
- Misinformation loses its power because truth is easily and freely accessible

---

## 🚀 Deployment Guide

### Prerequisites

Before deploying, ensure you have the following environment variables configured:

- `GEMINI_API_KEY` — Google Generative AI API key
- `GEMINI_API_KEY_2` — Secondary Gemini API key
- `GEMINI_API_KEY_3` — Tertiary Gemini API key
- `SUPABASE_URL` — Your Supabase project URL
- `SUPABASE_ANON_KEY` — Your Supabase anonymous key
- `NODE_ENV` — Set to `production` for deployments
- `PORT` — Default is `3000` (optional, usually auto-set by platform)

See [.env.example](./.env.example) for a complete template.

### Deploying to Render

1. **Push your code to GitHub** (ensure `.env*` is in `.gitignore`)
2. **Create a new Web Service on Render**:
   - Connect your GitHub repository
   - Set the **Build Command** to: `npm install && npm run build && npm run build:server`
   - Set the **Start Command** to: `npm start`
3. **Add Environment Variables** in Render Dashboard:
   - Go to Environment → Add all keys from `.env.example`
4. **Deploy** — Render will automatically trigger builds on push

### Deploying to Vercel

**Note**: Vercel is primarily designed for serverless functions and static sites. For a full-stack Node.js application like this, Render is recommended. However, if you wish to use Vercel:

1. **Install Vercel CLI** (optional): `npm install -g vercel`
2. **Deploy**: `vercel`
3. **Configure Environment Variables** in Vercel Dashboard:
   - Project Settings → Environment Variables
   - Add all keys from `.env.example`
4. **Set Build Command** in Project Settings:
   - Build Command: `npm run build && npm run build:server`
   - Output Directory: `dist`

### Troubleshooting Deployments

**Build Fails on Render/Vercel:**

- Ensure `npm install` completes without errors locally: `npm install`
- Verify all TypeScript compiles: `npm run build:server`
- Check that `.gitignore` does NOT exclude necessary files (e.g., `src/`, `server.ts`)

**503 Service Unavailable:**

- The server failed to start. Check logs for startup errors.
- Verify `NODE_ENV=production` is set in your deployment platform.

**403 Forbidden Errors:**

- Missing or invalid API keys. Verify all environment variables are set correctly.
- Check CORS configuration if requests are coming from a different domain.

**Port Already in Use:**

- The platform should auto-assign PORT. If hardcoded, remove it from server configuration.

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

_Developed for Gen AI Hackathon Cohort 3 — organized by Higher Education Commission Pakistan and Pak Angels._
