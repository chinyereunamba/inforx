# 🧠 InfoRx

**InfoRx** is a healthcare assistant that helps patients interpret prescriptions, lab results, and scan reports—especially in situations where seeing a doctor isn't possible due to cost, distance, or workload. It transforms complex medical records into clear, actionable next steps, stored securely in a personal medical vault.

---

## ✨ Features

- 🔐 **Authentication**: Email/password and Google login via Supabase.
- 📁 **Medical Vault**: Securely upload and store prescriptions, lab results, and medical documents.
- 🤖 **Interpretation Engine**: AI-powered summaries of prescriptions and results (coming soon).
- 🌐 **Dashboard**: Personalized dashboard with theme support, real-time logs, and activity tracking.
- 📡 **Realtime Sync**: Supabase Realtime updates across all vault changes.
- 📊 **Recent Activity Feed**: View logs of uploads, downloads, logins, and interactions.

---

## 📦 Tech Stack

- **Frontend**: Next.js 14, TailwindCSS, Shadcn UI
- **Backend**: Supabase (Auth, DB, Storage, Realtime)
- **State Management**: Zustand
- **AI Integration**: ElevenLabs, DeepSeek (planned)
- **Realtime Logging**: Custom Supabase log table & listener

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/inforx.git
cd inforx
