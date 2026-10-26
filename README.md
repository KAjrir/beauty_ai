# 🌸 Beauty AI — Intelligent Beauty Assistant (Portfolio Project)

**Beauty AI** is a modern, AI-powered chat application designed as a **portfolio project** to demonstrate my skills in full-stack development, UI/UX engineering, database design, and AI integration.  
The application showcases real-time streaming chat, responsive design, subscription logic, and a scalable architecture.

🔗 **Live Demo (read-only / demo environment):** https://beautyai.live  
⚠️ *This project is intended for employers and recruiters to review my work. It is **not intended for public use** or commercial deployment.*

---

## 🎯 Purpose of This Project

Beauty AI was created to demonstrate:

- Advanced frontend engineering with **Next.js App Router**
- Real-time AI integration using **OpenAI**
- Scalable backend patterns using **Server Actions**
- Production-style payments using **Stripe Subscriptions**
- Professional UI/UX with **Tailwind CSS**
- Database modeling with **Prisma + PostgreSQL**

This is a **demonstration project**, not a product.

---

## ✨ Features (Demo Mode)

### 🤖 AI-Powered Beauty Chat
- Ask questions about skincare, makeup, acne routines, hair care, and more  
- Real-time **streaming** responses from OpenAI  
- Markdown formatting similar to ChatGPT  
- Auto-scrolling for long messages  

### 🎨 Modern & Responsive UI
- Sticky header  
- Collapsible sidebar: desktop + mobile behavior  
- Clean Tailwind-based design  
- Chat bubbles styled for **user** and **assistant**  
- Mobile-first layout with smooth animations  

### 🔐 Authentication (Demo)
- Demonstrates secure session handling  
- User avatar display  
- Designed similarly to production login systems  

### 💳 Stripe Subscription Flow (Demo)
- Subscription required for extended chat usage  
- Stripe Checkout fully implemented  
- Server-side validation of plan status  
- *Only included to demonstrate engineering ability*  

### 🛠 Planned Improvements
- Chat history  
- User beauty profile  
- Saved routines  
- Searchable conversations  
- Better domain-specific prompting  

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Styling** | Tailwind CSS, custom UI components |
| **Backend** | Server Actions |
| **AI** | OpenAI API |
| **Database** | Prisma ORM + PostgreSQL |
| **Auth** | Auth.js (Google + email/password) |
| **Payments** | Stripe Subscriptions |
| **Deployment** | Vercel |

---

## 🚀 Getting Started (For Review Only)

This project is provided for **code review and evaluation purposes**.  
If you'd like to run it locally:

### 1. Clone the Project
```bash
git clone https://github.com/KAjrir/beauty_ai.git
cd beauty_ai
```

### 2. Install dependencies
```bash
npm install
```
This also runs `prisma generate`.

### 3. Configure environment variables
Copy the example file and fill in your own keys:
```bash
cp .env.example .env
```

| Variable | Used for |
|---|---|
| `OPENAI_API_KEY` | AI chat responses |
| `AUTH_SECRET` | Auth.js session encryption (`npx auth secret`) |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google login |
| `DATABASE_URL` | PostgreSQL connection string (e.g. Neon) |
| `STRIPE_SECRET_KEY` | Stripe Checkout and subscriptions |
| `LIVE_SECRET_WEBHOOK_KEY` | Verifying Stripe webhook signatures |
| `DOMAIN_NAME` | Base URL for Stripe redirects (e.g. `http://localhost:3000`) |

### 4. Set up the database
```bash
npx prisma migrate deploy
```

### 5. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).
