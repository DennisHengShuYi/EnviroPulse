<<<<<<< HEAD
# UMDT (Urban Monitoring Dashboard Terminal)

UMDT is a high-performance, real-time environmental monitoring dashboard designed for urban centers. It provides live data visualization of Air Quality Index (AQI), Heat Index, and various pollutants across multiple districts.

## 🚀 Getting Started

This project consists of two main components that need to be running simultaneously:
1.  **Frontend**: A React application built with Vite and Three.js for 3D visualizations.
2.  **Backend**: A Node.js/Express simulation engine that generates live sensor data.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm (comes with Node.js)

### Installation

1.  Clone the repository or navigate to the project directory.
2.  Install the dependencies for the entire project:
    ```bash
    npm install
    ```

### Running the Project

To see the full dashboard with live data, you need to open **two separate terminal windows**.

#### Terminal 1: Backend Simulation Engine
This runs the Express server that provides the API endpoints for the dashboard.
```bash
npm run server
```
The server will start on `http://localhost:3001`.

#### Terminal 2: Frontend Dashboard
This runs the Vite development server for the React UI.
```bash
npm run dev
```
The dashboard will be available at the URL provided in the terminal (usually `http://localhost:5173`).

---

## 🏙️ Features
- **3D Digital Twin**: High-fidelity 3D urban model with real-world building extrusions via MapLibre GL JS.
- **Atmospheric Simulations**: 60FPS Canvas-based wind vectors and Gaussian pollution plumes drifting from industrial sources (Klang Port, etc.).
- **AI Predictive Engine**: Technical environmental forecasting using the **ilmu-glm-5.1** model for 48-hour risk analysis.
- **Visibility Intelligence**: "Ghost Mode" building transparency and "Cyber-Beacon" location tracking for dense urban monitoring.
- **Nationwide Coverage**: IDW Interpolated air quality mapping for 20+ Malaysian districts.

## 🚀 How To Run

To launch the nationwide digital twin, follow these steps:

### 1. Configure Environment
Create a `.env` file in the root directory and add your Ilmu.ai API key:
```env
ANTHROPIC_API_KEY=your_key_here
```

### 2. Launch Backend (Terminal A)
This handles the real-time sensor simulation, IDW math, and AI prediction routing.
```bash
npm run server
```

### 3. Launch Dashboard (Terminal B)
This starts the 3D geospatial interface.
```bash
npm run dev
```

## 🛠 Tech Stack
- **Engine**: React 19 + Vite
- **Geospatial**: MapLibre GL JS (3D), Leaflet (2D)
- **Intelligence**: ilmu.ai (ilmu-glm-5.1)
- **Simulation**: HTML5 Canvas (Atmospheric Particles)
- **Charts**: Recharts
=======
# EnviroPulse
>>>>>>> 9373789ffb45c353007b5e164e74b95ec948e87f
