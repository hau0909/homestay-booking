# 🏡 Homestay Booking System

A full-stack homestay booking web application built with **Next.js** and **Supabase**, designed with clean architecture, scalability, and real-world workflows in mind.

---

## 📖 Project Overview

The **Homestay Booking System** allows users to browse homestays, view rooms, make bookings, and manage reservations.
The system supports multiple roles such as **Guest**, **Customer**, **Host**, and **Admin**.

This project follows a **Frontend-centric + Backend-as-a-Service (BaaS)** architecture, where Supabase handles authentication, database, and security.

---

## 🚀 Tech Stack

### Frontend (Web)

* **Framework:** Next.js (App Router)
* **Language:** TypeScript
* **UI:** Tailwind CSS / ShadCN UI
* **State Management:** React Hooks

### Backend (BaaS)

* **Supabase**

  * Authentication
  * PostgreSQL Database
  * Row Level Security (RLS)
  * Storage (images, documents)

---

## ✨ Core Features

* Authentication & Authorization
* Role-based access control (Customer / Host / Admin)
* Browse homestays & room listings
* Booking & reservation management
* Host dashboard (manage homestays & rooms)
* Admin management
* Secure data access using RLS policies

---

## ⚙️ Environment Variables

This project uses environment variables to store sensitive configuration.

### 📌 Naming Rules

* Client-side variables **must** start with `NEXT_PUBLIC_`
* Never commit real keys to Git
* Use `.env.local` for local development

---

### 🔐 Required Environment Variables

Create a file named **`.env.local`** in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

#### Explanation

* `NEXT_PUBLIC_SUPABASE_URL`
  → Supabase project URL

* `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  → Public anonymous key for client-side access

⚠️ These keys are safe **only if Row Level Security (RLS) is enabled**.

---

## ▶️ Getting Started

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npm run dev
```

Open your browser at:

```
http://localhost:3000
```

---

## 🔒 Security Guidelines

* Enable **Row Level Security (RLS)** on all tables
* Enforce business rules via RLS policies
* Never expose `service_role` key to the client
* Validate permissions based on user role

---

## 🌿 Git Workflow & Commit Rules (IMPORTANT)

**Golden rule:** Never push code directly to `main` or `dev`.

### 1️⃣ Start a New Feature

```bash
git checkout dev
git pull origin dev
```

---

### 2️⃣ Create a Feature Branch

```bash
git checkout -b feature/feature-name
```

Examples:

* `feature/auth-login`
* `feature/booking-flow`
* `feature/admin-dashboard`

---

### 3️⃣ Commit Frequently

```bash
git add .
git commit -m "feat(booking): implement booking flow"
```

Follow **Conventional Commits**:

* `feat`: new feature
* `fix`: bug fix
* `refactor`: refactoring
* `docs`: documentation
* `chore`: tooling / config

---

### 4️⃣ Push Branch

```bash
git push origin feature/feature-name
```

---

### 5️⃣ Create Pull Request (PR)

1. Create PR on GitHub
2. Base branch: `dev`
3. Add clear description & screenshots (if UI)
4. Merge only after review approval

---

## 📌 Development Notes

* Supabase replaces traditional backend API
* Service functions live in `services/`
* UI logic stays in components & hooks
* Types are centralized in `types/`

---

## 📄 License

This project is for academic and learning purposes.

---
