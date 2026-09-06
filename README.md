# Personal Gemini Journal 📓🤖

> An enterprise-grade, multi-tenant AI workspace and reflective journaling tool powered by **Google Gemini 1.5 Flash**, **Firebase Authentication**, **Cloud Firestore**, and **Node.js / React**. Built for the **Google Cloud Gen AI Academy - Hack2Skill Ideathon**.

---

## 🌟 Overview

**Personal Gemini Journal** is a secure, privacy-focused web application designed to help users capture daily reflections, summarize brainstorming logs, extract structured takeaways, and monitor their long-term emotional resilience. 

By enforcing strict multi-tenant data isolation and leveraging Gemini 1.5 Flash, the platform delivers near-instant executive summaries, sentiment analysis, and dynamic micro-coaching advice tailored to the user's emotional trajectory.

---

## ✨ Key Features

- 🔐 **Firebase Multi-Tenant Auth:** Secure Google Sign-In with Bearer ID Token verification on every backend request.
- 🛡️ **Zero-Trust Data Isolation:** Firestore security rules strictly lock document paths to `/users/{userId}/journals/{journalId}` matching `request.auth.uid == userId`.
- 🔑 **Server-Side Secret Management:** Direct integration with **Google Cloud Secret Manager** to keep API keys safe on the server with environment fallback for local dev.
- ⚡ **Real-Time Gemini AI Processing:** Uses `gemini-1.5-flash` for instant text summarization, bulleted key takeaway extraction, and emotional tone tagging.
- 📈 **AI Mood & Resilience Analytics:** Aggregates recent entries to calculate an Emotional Trajectory Score (1–10) and generate personalized micro-coaching action items.
- 🎨 **Modern Sleek UI:** Built with **React (Vite)** and **Tailwind CSS**, featuring quick prompt selectors, interactive history feed, and dynamic trajectory charts.

---

## 🏛️ System Architecture
[ Client (React + Vite) ]
│
├─► Google Sign-In (Firebase Auth) ──► Obtain Bearer ID Token
│
└─► HTTPS Requests + Bearer ID Token
│
▼
[ Backend API (Express / Node.js) ]
│
├─► Firebase Admin SDK (Token Verification Middleware)
├─► Google Cloud Secret Manager (Retrieves GEMINI_API_KEY)
│
├─► Gemini 1.5 Flash API (Structured JSON Summaries & Resilience Index)
│
└─► Cloud Firestore (/users/{userId}/journals/{journalId})
---

## 🚀 Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, Lucide Icons, Axios
- **Backend:** Node.js, Express.js, Firebase Admin SDK
- **AI Model:** Google Gemini 1.5 Flash (`@google/genai`)
- **Database & Auth:** Cloud Firestore, Firebase Authentication
- **Security & Cloud:** Google Cloud Secret Manager, Cloud Run Ready

---

## 🛠️ Quick Start & Local Setup

### Prerequisites
- Node.js (v18 or higher)
- Firebase Project with Google Auth and Cloud Firestore enabled
- Google Cloud Gemini API Key

### 1. Clone the Repository
```bash
git clone [https://github.com/bhanurupauppuluri-ux/PersonalGeminiJournal.git](https://github.com/bhanurupauppuluri-ux/PersonalGeminiJournal.git)
cd PersonalGeminiJournal
