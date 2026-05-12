# 🏷️ AnnotatePro: Precision Labeling Workspace

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)

![AnnotatePro Dashboard](public/screenshot.png)

> **Precision Labeling for High-Performance Datasets.**
> AnnotatePro is a professional-grade workspace designed for high-throughput data extraction and labeling. While the interface is optimized for specific technical categories by default, the labeling schema is fully flexible and can be adapted to any domain—including digital displays, or physical documents.

---

## 📸 Interface Preview

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

### 📊 Insight & Analytics
- **Intelligence Dashboard**: Real-time visualization of labeling performance, category distribution, and time-per-image metrics.
- **Expanded Workspace**: Optimized analytics layout (6xl width) providing maximum screen real estate for deep data inspection.
- **Efficiency Feedback**: Instant calculation of labeling throughput (labels per minute) and dataset coverage.

### ⌨️ Keyboard Shortcuts
Maximize efficiency with dedicated keyboard mappings:
- `1-6`: Toggle corresponding label categories
- `0`: Mark as **No Label** and proceed
- `Enter`: **Apply Extraction** and move to next node
- `Space`: Toggle **Timer** (Start/Pause)
- `Arrow Left/Right`: Navigate through dataset
- `Shift + A`: Toggle **Analytics Dashboard**
- `T`: Toggle **Theater Mode** (Zero-UI inspection)
- `Z / X`: Zoom In / Out

---

## 🛠️ Technical Architecture

### Core Stack
- **Frontend**: React 18 (Functional Component Architecture)
- **Styling**: Tailwind CSS 4.0 (Design Tokens & Utility-First)
- **Animation**: Framer Motion (State-driven transitions)
- **Data Visualization**: Recharts (High-performance charting)
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
    - Revisit instructions anytime via the **Integrated Tutorial (i)** icon in the header.
    - Set your **Dataset Path**.
    - Select labels for each image and click **"Save & Next"**.
    - Click **"Finish & Export"** when the session is complete.

---

## 📋 Changelog (Recent Updates)

- **Integrated Tutorial System**: Added a persistent 'i' icon in the header for anytime-access to onboarding instructions.
- **Smart Timer Management**: The session timer now automatically pauses when the tutorial is open and resumes when closed, ensuring timing accuracy.
- **Expanded Analytics View**: Removed sidebars in the analytics view to provide a 50% increase in usable space for data visualization.
- **Dataset Feedback**: Enhanced the timer interface with a 'Disconnected' state and clear UX indicators when no image dataset is linked.
- **Precision View Engine**: Smooth 8x zoom/pan integration for high-detail labeling tasks.
- **Theater Mode**: Implemented a distraction-free viewing toggle for precision inspection.

---

*Built with ♥️ by the AnnotatePro Team.*
