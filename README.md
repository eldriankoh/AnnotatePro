# Annotate Studio - Extraction Node Interface

A professional-grade satellite imagery and document annotation workspace built for high-throughput labeling tasks.

## Key Features

- **Intuitive Multi-Label Canvas**: Specialized high-contrast workspace for visual data extraction.
- **Precision Zoom & Pan**: Powered by `react-zoom-pan-pinch` for detailed inspection of high-resolution assets.
- **Workflow Automation**:
  - **Editable Project Context**: Dynamically update dataset directory paths to maintain metadata accuracy.
  - **Auto-Save**: Integrated background persistence every 30 seconds.
  - **Progress Tracking**: Real-time visualization of throughput and completion status.
  - **Quick Apply**: Fast-path keyboard navigation (Enter key simulation) for high-speed labeling.
- **Reliable Data Export**:
  - Unique-timestamped CSV generation (prevents file name collisions).
  - Categorized annotation logs including annotator identity.
- **Design Excellence**:
  - Clean, minimal "Studio" aesthetic following Apple-inspired design principles.
  - Responsive, distraction-free interface.

## Tech Stack

- **React 18** + **Vite**
- **Tailwind CSS 4** for modular styling.
- **Framer Motion** for state-driven transitions and feedback.
- **Lucide React** for consistent iconography.

## Installation & Setup

To run this application locally, follow these steps:

### Prerequisites
- **Node.js**: Ensure you have Node.js installed (LTS version recommended).
- **npm**: Generally comes bundled with Node.js.

### Steps

1. **Install Dependencies**:
   Open your terminal in the project root and run:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   Start the local dev server:
   ```bash
   npm run dev
   ```

3. **Access the App**:
   The application will be available at `http://localhost:3000` (or the port specified in your console).

## Documentation of Changes

- **Interface Optimization**: Removed the Icon Rail sidebar for increased canvas real estate.
- **Bias Mitigation**: Sanitized node titles to prevent annotator bias during extraction sessions.
- **Export Enhancement**: Implemented unique file naming logic using user-provided identity and ISO-safe timestamps.
- **Interaction Refinement**: Added subtle visual feedback and highlighted state for multi-label selection.
