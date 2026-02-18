# Yash Parmar | Career Edition ⛏️

> **Current Version:** v1.0.1
> **Status:** Online & Open to Work
> **Live Demo:** [https://yparmar.vercel.app]

Welcome to **Career Mode**. This is an immersive, interactive developer portfolio styled after the **Minecraft Java Edition** interface.

Unlike traditional portfolios, this application is a fully functional **React State Engine** that simulates inventory management, crafting logic, and 3D environment rendering directly in the browser.

## 🎮 Features & Mechanics

### 1. The Crafting Engine
I built a custom recipe validation system that treats my technical skills as "Ingredients."
* **Logic:** The app checks the 2x2 grid state against a `recipes.json` lookup table in real-time.
* **Validation:** Enforces strict type-checking (e.g., preventing skills in armor slots).
* **Reward:** Successfully crafting a project triggers a custom "Achievement Get!" toast notification and unlocks project metadata.

### 2. CareerOS Terminal (CLI)
A custom-built Command Line Interface providing a "developer-first" navigation experience.
* **Shell Logic:** Built a tree-traversal engine to support standard commands (`ls`, `cd`, `pwd`, `cat`).
* **Immersion:** Includes a simulated boot sequence and system logs to showcase backend/infrastructure interests.

### 3. 3D Rendering & Performance
* **Tech:** Built with **React Three Fiber (R3F)** and **Three.js**.
* **Optimization:** The 3D player model uses a custom `useSpineTwist` hook to track mouse movement efficiently without causing re-renders on the main UI thread.
* **Assets:** Optimized textures and geometries ensure fast load times and smooth FPS across devices.

### 4. Dynamic Audio System
* **SoundContext:** A global audio manager handling concurrent SFX (UI clicks) and background music (`otherside.mp3`) with volume normalization and mute toggles.

---

## 🛠️ Tech Stack

* **Frontend:** React 18, Vite
* **3D Engine:** Three.js / React Three Fiber / Drei
* **State Management:** React Context API + Custom Hooks
* **Styling:** CSS Modules (Scoped isolation)
* **DevOps:** GitHub Actions (Build Automation) & Vercel (Edge Deployment)

---

> *"You cannot sleep now, there are bugs nearby."* — **Yash Parmar**