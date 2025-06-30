
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

- **Frontend**: Next.js 13, TailwindCSS, Shadcn UI
- **Backend**: Supabase (Auth, DB, Storage, Realtime)
- **State Management**: Zustand
- **AI Integration**: ElevenLabs, Openrouter
- **Realtime Logging**: Custom Supabase log table & listener

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/chinyereunamba/inforx.git
cd inforx
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file with the following:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Locally
```bash
npm run dev
```

---

## 🗂 Project Structure

```
/app
  /api         → Route handlers (auth, vault, etc.)
  /dashboard   → Protected user interface
  /auth        → Sign in/up pages
/components    → Reusable components
/lib           → Zustand stores, utils
/utils         → Supabase client, helpers
/styles        → Global styles
```

---

## 🛡 Security

- All uploads are private and scoped to the current user.
- Supabase RLS policies enforce secure access.
- Logs are stored and associated with users for transparency.

---

## 📅 Coming Soon

- AI medical summary generator
- Voice support via ElevenLabs
- Appointment reminders
- Emergency support instructions

---

## 🧪 Dev Notes

To test authentication and vault uploads locally, make sure you're connected to the internet and Supabase is properly set up.

---

## 🙌 Acknowledgments

- [Supabase](https://supabase.com)
- [TailwindCSS](https://tailwindcss.com)
- [ElevenLabs](https://elevenlabs.io)
- [Openrouter](https://openrouter.ai/)

---

## 🧑‍⚕️ Built for the Bolt Hackathon
InfoRx was created to help bridge the gap between complex medical information and patient understanding—especially in underserved areas.
