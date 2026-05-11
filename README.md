# 🛰️ Annotate Studio: Extraction Node Interface

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)

> **Precision Labeling for High-Performance Datasets.**
> Annotate Studio is a professional-grade workspace designed for high-throughput extraction and labeling of satellite imagery, digital displays, and physical documents.

---

## 📸 Interface Preview

*(Since this is a preview, imagine a sleek, high-contrast dashboard with a central image canvas and a right-side navigation panel.)*

### 1. The Workspace
| Component | Description |
| :--- | :--- |
| **Central Canvas** | High-resolution image preview with precision zoom (up to 8x) and panning. |
| **Category Rail** | Quick-access multi-select labeling cards with color-coded identifiers. |
| **Control Matrix** | Navigation tools for dataset traversal (Next/Prev) and view mode toggles (Theater/Full). |
| **Metadata Panel** | Real-time tracking of dataset path, timing, and throughput metrics. |

---

## ✨ Key Features

### 🚀 High-Efficiency Workflow
- **Precision View Engine**: Seamless zooming and panning using `react-zoom-pan-pinch`.
- **Theater & Fullscreen Modes**: Maximize focus by stripping away UI chrome for concentrated labeling sessions.
- **Auto-Save Resilience**: Background persistence every 30 seconds ensures no data is lost during sessions.
- **Keyboard Shortcuts**: Native-feel navigation (Next image via quick-apply logic).

### 🏷️ Intuitive Labeling System
The studio supports 6 distinct extraction categories, each with its own visual signature:
- 📽️ **Projected Slides**: Visual presentation media (Blue)
- 🖥️ **Computer Screen**: LCD/OLED active displays (Purple)
- 🗺️ **Map**: Cartographic references (Orange)
- ⚔️ **Wargaming**: Tactical sandbox models (Emerald)
- 📝 **Whiteboard**: Marker-based surfaces (Pink)
- 📄 **Printed Paper**: Hardcopy physical documents (Indigo)

### 📊 Data Integrity & Export
- **CSV Engine**: Generates unique, timestamped extraction logs.
- **Detailed Logging**: Records node source, label confidence, session duration, and unique identifiers.
- **Timestamp Precision**: Prevents file naming collisions with ISO-standard safe strings.

---

## 🛠️ Technical Architecture

### Core Stack
- **Frontend**: React 18 (Functional Component Architecture)
- **Styling**: Tailwind CSS 4.0 (Design Tokens & Utility-First)
- **Animation**: Framer Motion (State-driven transitions)
- **Icons**: Lucide React (Pixel-perfect vector set)

### System Requirements
- **Node.js**: v18.0.0 or higher
- **Modern Browser**: Chrome, Firefox, Safari, or Edge (for Canvas/Grid support)

---

## 📥 Getting Started

1.  **Clone & Install**
    ```bash
    npm install
    ```

2.  **Launch Workspace**
    ```bash
    npm run dev
    ```

3.  **Operation**
    - Click **"Got it, Let's Begin"** in the tutorial.
    - Set your **Dataset Path** (Default: `Blip-C Empty`).
    - Select labels for each image and click **"Save & Next"**.
    - Click **"Finish & Export"** when the session is complete.

---

## 📋 Changelog (Recent Updates)

- **User Identity Revision**: Streamlined the workflow by removing redundant identity prompts in the tutorial.
- **Visual Synchronization**: Harmonized category card styling across the tutorial and main workspace.
- **Scroll Awareness**: Added a reactive scroll indicator in the tutorial to improve user onboarding.
- **Color Scheme Refinement**: Updated 'Printed Paper' to an Indigo palette to prevent visual collision with 'Map'.
- **Theater Mode**: Implemented a distraction-free viewing toggle for precision inspection.

---

*Built with ♥️ by Annotate Studio Design Group.*
