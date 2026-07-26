# 🧠 Enterprise VLM Hallucination Intelligence Studio

<div align="center">

![VLM Hallucination Studio](https://img.shields.io/badge/VLM-Hallucination%20Studio-00f2fe?style=for-the-badge&logo=brain&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-00c7b7?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18.3-61dafb?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5.x-a78bfa?style=for-the-badge&logo=vite&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge)
![Last Commit](https://img.shields.io/github/last-commit/Amanvarma2231/vlm-hallucination-studio?style=for-the-badge&color=00f2fe)
![Code Size](https://img.shields.io/github/languages/code-size/Amanvarma2231/vlm-hallucination-studio?style=for-the-badge&color=a855f7)
![Stars](https://img.shields.io/github/stars/Amanvarma2231/vlm-hallucination-studio?style=for-the-badge&color=f59e0b)

**Production-grade, full-stack Vision-Language Model (VLM) Hallucination Extraction, Analytics, and Fine-Tuning platform.**

[🚀 Launch Studio](#quick-start) · [📖 Fine-Tuning Guide](#fine-tuning-workflow) · [🔬 Features](#-feature-modules) · [📦 Installation](#-installation)

</div>

## Table of Contents
- [🌟 Overview](#-overview)
- [🎯 Feature Modules](#-feature-modules)
- [⚡ Quick Start](#-quick-start)
- [🏗️ Architecture](#️-architecture)
- [🔬 VLM Models Supported](#-vlm-models-supported)
- [📐 Core Algorithms](#-core-algorithms)
- [📸 Screenshots](#-screenshots)
- [📦 API Endpoints](#-api-endpoints)
- [🎨 Tech Stack](#-tech-stack)
- [🔧 Fine-Tuning Workflow](#-fine-tuning-workflow)
- [🚀 Deployment](#-deployment)
- [👨‍💻 Developer](#-developer)
- [📄 License](#-license)
- [🤝 Contributing](#-contributing)
- [📋 Changelog](#-changelog)

---

## 🌟 Overview

The **VLM Hallucination Intelligence Studio** is a research and production tool for:

- **Extracting** hallucinated tokens from VLM outputs using Shannon Entropy scoring ($H(x) = -\sum p(x)\log p(x)$)
- **Visualizing** 2D spatial attention heatmaps and Visual Drift Index on uploaded images
- **Benchmarking** multiple VLMs with POPE accuracy, CHAIR_s, CHAIR_i metrics
- **Mitigating** hallucinations via DoLa Contrastive Decoding ($\text{Logits}_{DoLa} = \text{Logits}_L - \alpha \cdot \text{Logits}_M$)
- **Protecting** clinical AI outputs with Medical Safety Guard (radiology + anatomical grounding scoring)
- **Exporting** curated fine-tuning datasets in SFT / DPO / Alpaca JSONL formats

---

## 🎯 Feature Modules

| Module | Description | Key Tech |
|--------|-------------|----------|
| 🔬 **Hallucination Studio** | Token-level entropy analysis with hover inspector and grounding metrics | Shannon Entropy, Visual Drift |
| 👁️ **Attention Heatmap** | 2D canvas rendering of attention vectors; supports uploaded image backgrounds | HTML5 Canvas, WebGL |
| ⚖️ **Model Comparison** | Side-by-side VLM benchmark: Gemma-4, PaliGemma-3B, LLaVA-1.6, Qwen-VL | DoLa, POPE, CHAIR |
| 🏥 **Medical Safety Guard** | Radiology VLM hallucination detection with anatomical safety thresholds | Clinical risk levels |
| 📊 **Analytics & DB** | Full session history with search, inspect, delete, and stat cards | SQLite, FastAPI |
| 💾 **Dataset Exporter** | JSONL export in SFT, DPO preference pairs, and Alpaca format | JSONL, TRL |
| 📖 **Fine-Tuning Guide** | In-app documentation with copy-ready code snippets for LoRA fine-tuning | LoRA, QLoRA, TRL |

---

## ⚡ Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- pip, npm

### 1. Backend Setup
```bash
git clone https://github.com/Amanvarma2231/vlm-hallucination-studio.git
cd vlm-hallucination-studio

# Install Python dependencies
cd backend
pip install -r requirements.txt

# Start the backend (FastAPI on port 8000)
cd ..
python run_app.py
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# ✅ Open http://localhost:3000
```

---

## 🏗️ Architecture

```
vlm-hallucination-studio/
├── backend/
│   ├── main.py                  # FastAPI app entry + WebSocket monitor
│   ├── routes.py                # All REST API endpoints (/api/*)
│   ├── hallucination_engine.py  # Core VLM engine (entropy, DoLa, guard)
│   ├── database.py              # SQLAlchemy ORM models (SQLite)
│   ├── schemas.py               # Pydantic request/response schemas
│   ├── requirements.txt
│   └── uploads/                 # Uploaded image storage
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Root app with 8 tab routes
│   │   ├── index.css            # Full glassmorphism design system
│   │   ├── main.jsx
│   │   ├── api/client.js        # All REST API call functions
│   │   └── components/
│   │       ├── Header.jsx       # Sticky header with developer links
│   │       ├── Sidebar.jsx      # Navigation with 8 module items
│   │       ├── LandingPage.jsx  # Homepage with feature grid & stats
│   │       ├── HallucinationStudio.jsx  # Main analysis interface
│   │       ├── AttentionHeatmap.jsx     # Canvas heatmap renderer
│   │       ├── ModelComparison.jsx      # Multi-VLM benchmark
│   │       ├── MedicalGuard.jsx         # Clinical safety module
│   │       ├── AnalyticsDashboard.jsx   # DB history & analytics
│   │       ├── DatasetStudio.jsx        # JSONL exporter
│   │       └── FineTuningGuide.jsx      # In-app docs & code guide
│   └── vite.config.js           # Proxy config (API → 8000, WS)
│
└── run_app.py                   # Unified server launcher
```

---

## 🔬 VLM Models Supported

| Model | Hallucination Score (avg) | POPE Accuracy | DoLa Support |
|-------|--------------------------|---------------|--------------|
| **Gemma-4 VLM (Multimodal)** | ~31% | ~91.2% | ✅ |
| **PaliGemma-3B** | ~38% | ~87.4% | ✅ |
| **LLaVA-1.6 Vision** | ~45% | ~84.1% | ✅ |
| **Qwen-VL** | ~42% | ~85.9% | ✅ |

---

## 📐 Core Algorithms

### Shannon Entropy (Hallucination Scoring)
$$H(x) = -\sum_{i} p(x_i) \log_2 p(x_i)$$

Tokens with $H > \theta$ (threshold) are flagged as **hallucinated**.

### DoLa Contrastive Decoding
$$\text{Logits}_{DoLa} = \text{Logits}_L - \alpha \cdot \text{Logits}_M$$

Subtracts premature layer ($M$) noise from mature layer ($L$) to reduce factual errors.

### Visual Drift Index
$$V_{drift} = 1 - \frac{\langle \text{img\_embed}, \text{text\_embed} \rangle}{\|\text{img\_embed}\| \cdot \|\text{text\_embed}\|}$$

Measures cosine divergence between image and generated text embeddings.

---

## 📸 Screenshots

| Hallucination Studio | Attention Heatmap | Model Comparison |
|:---:|:---:|:---:|
| Token-level entropy analysis | 2D spatial attention visualization | Multi-VLM benchmark suite |

| Medical Safety Guard | Analytics Dashboard | Dataset Exporter |
|:---:|:---:|:---:|
| Clinical AI safety auditing | Session history & analytics | JSONL export for fine-tuning |

---

## 📦 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | System health check |
| `GET` | `/api/stats` | Dashboard statistics |
| `POST` | `/api/analyze` | Run hallucination analysis |
| `POST` | `/api/compare` | Multi-model benchmark |
| `POST` | `/api/medical-guard` | Clinical safety evaluation |
| `GET` | `/api/medical-reviews` | Medical audit history |
| `GET` | `/api/sessions` | All session records |
| `DELETE` | `/api/sessions/{id}` | Delete specific session |
| `DELETE` | `/api/clear-sessions` | Clear all records |
| `GET` | `/api/training-samples` | Extracted training pairs |
| `POST` | `/api/export-dataset` | Download JSONL dataset |
| `POST` | `/api/seed-demo` | Seed demo data |
| `WS` | `/ws/monitor` | Live WebSocket monitor |

---

## 🎨 Tech Stack

**Backend:** Python 3.10+, FastAPI, SQLAlchemy, Pydantic v2, Uvicorn, SQLite

**Frontend:** React 18, Vite 5, Lucide React, HTML5 Canvas, Vanilla CSS

**ML / AI:** Gemma-4 VLM, PaliGemma-3B, LLaVA-1.6, Qwen-VL, DoLa Decoding

**Fine-Tuning:** HuggingFace Transformers, PEFT (LoRA/QLoRA), TRL (SFT/DPO), BitsAndBytes

---

## 🔧 Fine-Tuning Workflow

1. **Run Analysis** — submit prompts in Hallucination Studio
2. **Collect Data** — hallucinated tokens auto-saved to SQLite
3. **Export JSONL** — use Dataset Exporter (SFT/DPO/Alpaca format)
4. **Fine-Tune** — use LoRA with TRL SFTTrainer or DPOTrainer
5. **Evaluate** — re-benchmark in Model Comparison tab

See the **in-app Fine-Tuning Guide** for copy-ready code snippets.

---

## 🚀 Deployment

### Option 1: Render.com (1-Click Free Full-Stack Deployment)
1. Push your repository to **GitHub**.
2. Log in to [Render.com](https://render.com) and click **New +** → **Blueprint**.
3. Connect your GitHub repository (`vlm-hallucination-studio`).
4. Render will automatically detect `render.yaml` and deploy the entire full-stack app on a free web service.

### Option 2: Vercel (Frontend) + Render / Railway (Backend)
1. **Deploy Backend**: Import `backend` folder on [Render.com](https://render.com) as a Python Web Service (`uvicorn main:app --host 0.0.0.0 --port $PORT`).
2. **Deploy Frontend**: Import `frontend` folder on [Vercel](https://vercel.com).
3. Update `frontend/vercel.json` rewrite destination with your live backend API URL.

### Option 3: Docker Container Deployment
```bash
docker build -t vlm-studio .
docker run -p 8000:8000 vlm-studio
# ✅ App accessible at http://localhost:8000
```

### Option 4: Production Unified Build
```bash
cd frontend && npm run build
cd ../backend && uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## 👨‍💻 Developer

<div align="center">

| | |
|---|---|
| **Name** | Aman Varma |
| **Role** | Python Developer & Backend Engineer |
| **LinkedIn** | [linkedin.com/in/aman-v-697771345](https://www.linkedin.com/in/aman-v-697771345) |
| **GitHub** | [github.com/Amanvarma2231](https://github.com/Amanvarma2231) |
| **Email** | [amangurauli@gmail.com](mailto:amangurauli@gmail.com) |
| **Phone** | +91 6306572504 |

</div>

---

## 📄 License

MIT License — free to use, modify, and distribute with attribution.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📋 Changelog

### v1.0.0 (2025)
- ✅ Initial release with 6 core modules
- ✅ Full-stack FastAPI + React architecture
- ✅ Shannon Entropy hallucination scoring
- ✅ DoLa Contrastive Decoding integration
- ✅ Medical Safety Guard for clinical AI
- ✅ SFT/DPO/Alpaca JSONL dataset export
- ✅ SQLite persistent session analytics

---

<div align="center">
Built with ❤️ by <strong>Aman Varma</strong> — Python Developer & Backend Engineer
<br/>
LinkedIn: <a href="https://www.linkedin.com/in/aman-v-697771345">linkedin.com/in/aman-v-697771345</a> · GitHub: <a href="https://github.com/Amanvarma2231">github.com/Amanvarma2231</a> · Email: <a href="mailto:amangurauli@gmail.com">amangurauli@gmail.com</a>
</div>
