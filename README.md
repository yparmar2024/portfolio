# Yash Parmar | Java Edition ⛏️

> **Current Version:** v1.0.0 (Gold Release)
> **Status:** Online & Open to Work
> **Live Demo:** [https://www.yparmar.vercel.app]

Welcome to **Career Mode**. This is an immersive, interactive developer portfolio styled after the **Minecraft Java Edition** interface.

Unlike traditional portfolios, this application is a fully functional **React State Engine** that simulates inventory management, crafting logic, and 3D environment rendering directly in the browser.

## 🎮 Features & Mechanics

### 1. The Crafting Engine
I built a custom recipe validation system that treats my technical skills as "Ingredients."
* **Logic:** The app checks the 2x2 grid state against a `recipes.json` lookup table in real-time.
* **Validation:** It enforces strict type-checking (e.g., you can't put a skill in a armor slot).
* **Reward:** Successfully crafting a project unlocks it in the output slot, triggering a custom "New Achievement!" toast notification.

### 2. 3D Rendering & Performance
* **Tech:** Built with **React Three Fiber (R3F)**.
* **Optimization:** The 3D player model uses a custom `useSpineTwist` hook to track mouse movement efficiently without causing re-renders on the main UI thread.
* **Assets:** All textures are optimized for web performance, ensuring fast load times even on mobile networks.

### 3. Dynamic Audio System
* **SoundContext:** A global audio manager that handles concurrent sound effects (UI clicks) and background music (`otherside.mp3`, etc.) with volume normalization and mute toggles.

---

## 🛠️ Tech Stack

* **Frontend Library:** React 18
* **Build Tool:** Vite (for O(1) HMR and optimized bundling)
* **State Management:** React Context API + Custom Hooks
* **3D Engine:** Three.js / React Three Fiber / Drei
* **Styling:** CSS Modules (Scoped styles for component isolation)

---

> *"You can not sleep now, there are bugs nearby."* — **Yash Parmar**