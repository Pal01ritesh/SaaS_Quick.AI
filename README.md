# SaaS Quick AI 🧠✨

> 🚀 **Live App:** [https://saa-s-quick-ai.vercel.app/](https://saa-s-quick-ai.vercel.app/)

A modern SaaS-based AI image editing application built with **React**, **Node.js**, **Clerk**, and **Cloudinary**. This tool allows users to quickly:

- 🔥 Remove backgrounds from images
- 🧼 Erase unwanted objects using AI (prompt-based)
- 🔐 Manage user access and plans (Free vs Premium)
- ☁️ Upload and store media on Cloudinary
- 📊 View and manage personal AI creations

---

## ✨ Features

- **Authentication** via Clerk (Email, Google)
- **Free & Premium Plan Support** using Clerk roles
- **Image Background Removal** using Cloudinary AI
- **Object Removal** (Prompt-based) using Cloudinary `gen_remove`
- **Dashboard UI** with saved user creations
- **REST API Backend** with Express.js
- **PostgreSQL Database** for storing creations
- **Toast Notifications** for quick feedback
- Fully **responsive** and **modern UI**

---

## 🧱 Tech Stack

| Frontend       | Backend           | Other Services      |
|----------------|-------------------|----------------------|
| React.js       | Node.js + Express | Clerk (Auth)         |
| Tailwind CSS   | PostgreSQL (sql.js)| Cloudinary (Media)  |
| Axios / Toast  | JWT (Bearer Token)| Vercel (Hosting)    |

---

## 🚀 Getting Started

### 🖥️ Prerequisites

- Node.js ≥ 18
- PostgreSQL (or use a hosted DB like Supabase)
- Cloudinary Account
- Clerk Account

### 📦 Installation

```bash
git clone https://github.com/your-username/saa-s-quick-ai.git
cd saa-s-quick-ai
npm install
