# Asset Generation & Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate, fetch, and integrate high-quality, theme-agnostic visual assets for the AeroScout showcase frontend.

**Architecture:** We will use a hybrid approach mixing `baoyu-imagine` to generate high-fidelity technical renders, code-driven SVGs for abstract patterns, and conditional external fetching for mapping.

**Tech Stack:** React, Tailwind CSS, Vite, AI Image Generation (baoyu-imagine), Leaflet (Carto Light/Dark).

---

### Task 1: Agnostic Map Tiles & Component Assets

**Files:**
- Modify: `frontend/src/components/MissionMap.tsx`
- Modify: `frontend/src/components/Navbar.tsx`

- [ ] **Step 1: Update MissionMap to support light/dark basemaps**

```tsx
// Inside frontend/src/components/MissionMap.tsx
import React, { useEffect, useState } from 'react';
// ...existing imports

const TILE_DARK = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_LIGHT = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

// Inside component:
  const [mapTheme, setMapTheme] = useState(document.documentElement.getAttribute('data-theme') || 'dark');
  
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setMapTheme(document.documentElement.getAttribute('data-theme') || 'dark');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

// Update the TileLayer url based on mapTheme
  <TileLayer
    url={mapTheme === 'light' ? TILE_LIGHT : TILE_DARK}
    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  />
```

- [ ] **Step 2: Add SVG Logo Icon to Navbar**

Replace the `<img src="/assets/logo_icon.png" />` with an inline SVG that naturally respects text colors.

```tsx
// Inside frontend/src/components/Navbar.tsx
// Replace `<img src="/assets/logo_icon.png" alt="Logo" className="w-8 h-8 rounded" />` with:
<svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round">
  <path d="M22 12L12 2L2 12l10 10z"/>
  <path d="M12 2v20"/>
  <path d="M2 12h20"/>
</svg>
```

### Task 2: Generate High-Fidelity Renders via AI

**Files:**
- Script Run: `baoyu-imagine` CLI to output images into `frontend/public/assets/`

- [ ] **Step 1: Generate Flood Inference Visual**

Generate an isometric aesthetic render showing drone capabilities.
Run: `bun ~/.baoyu-skills/baoyu-imagine/scripts/main.ts --prompt "A futuristic high-tech autonomous drone flying over a highly flooded river terrain. Glowing paths overlay the river. Cyberpunk edge-computing aesthetic, 8k resolution, cinematic lighting, transparent-like clean background" --ar 16:9 --image frontend/public/assets/capability_flood.png`
*(Modify path to `main.ts` according to actual local path)*

- [ ] **Step 2: Generate LNN/Edge Compute Visual**

Run: `bun ~/.baoyu-skills/baoyu-imagine/scripts/main.ts --prompt "Abstract futuristic Liquid Neural Network nodes interconnected with glowing electrical synapses. Edge computing technology representation. Deep dark tech background mixed with bright teal and orange glows, highly detailed" --ar 16:9 --image frontend/public/assets/capability_lnn.png`

- [ ] **Step 3: Generate Real-Time Command Center Map Overlay**

Run: `bun ~/.baoyu-skills/baoyu-imagine/scripts/main.ts --prompt "A glowing topographic heat map of a mountainous region, data visualization UI elements hovering in space, futuristic HUD interface without text, abstract tech artwork" --ar 16:9 --image frontend/public/assets/capability_hud.png`

### Task 3: Integrate Generated Assets into Capabilities Page

**Files:**
- Modify: `frontend/src/pages/CapabilitiesPage.tsx`

- [ ] **Step 1: Update CapabilitiesPage.tsx to use new images**

Replace older static or empty backgrounds with the newly generated ones and use agnostic CSS variables for overlays.

```tsx
// Inside frontend/src/pages/CapabilitiesPage.tsx
// Apply agnostic classes like:
// className="mix-blend-luminosity dark:mix-blend-luminosity dark:opacity-80 opacity-60"
// <img src="/assets/capability_flood.png" className="w-full h-auto object-cover mix-blend-luminosity" />
```
*(Exact implementation depends on the current structure of CapabilitiesPage.tsx, ensuring classes work in both light and dark mode)*

### Task 4: Add Code-Driven Topological SVGs

**Files:**
- Modify: `frontend/src/pages/CommandCenter.tsx` or `frontend/src/pages/LandingPage.tsx`

- [ ] **Step 1: Insert Agnostic SVG Background**

Create an SVG background pattern using CSS that works seamlessly across dark and light modes.

```css
/* frontend/src/index.css */
.tech-grid-bg {
  background-image: linear-gradient(to right, rgb(var(--color-border) / 0.1) 1px, transparent 1px),
                    linear-gradient(to bottom, rgb(var(--color-border) / 0.1) 1px, transparent 1px);
  background-size: 40px 40px;
}
```

```tsx
// Apply `tech-grid-bg` class to the main wrappers in CommandCenter.tsx
<div className="min-h-screen bg-bg tech-grid-bg">
```
