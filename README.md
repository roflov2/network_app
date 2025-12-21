# Network Explorer

A powerful, high-performance network visualization and analysis tool designed to handle large-scale datasets. Built with **React** and **Sigma.js**, it enables interactive exploration of complex relationships with smooth WebGL rendering.

🚀 **[Live Demo](https://roflov2.github.io/network_app/)**

![Network Explorer Screenshot](https://via.placeholder.com/800x450?text=Network+Explorer+Visualization)

## ✨ Features

- **High-Performance Visualization**: Renders thousands of nodes and edges smoothly using WebGL (Sigma.js).
- **Interactive Exploration**:
  - **Focus Mode**: Click any node to isolate its 2-hop neighborhood.
  - **Zoom & Pan**: Fluid navigation of large graph structures.
- **Advanced Analytics**:
  - **Community Detection**: Automatically clusters nodes using the Louvain algorithm to reveal groups.
  - **Path Finding**: Calculate and visualize the shortest path between any two nodes.
  - **Timeline View**: Filter interactions by date/time.
- **Flexible Filtering**:
  - Filter by Node Type (Person, Organization, Phone, etc.).
  - Isolate specific communities.
  - Collapse "Document" nodes to see direct entity-to-entity connections.
- **Data Import**: 
  - Upload custom CSV files (requires local backend).
  - Built-in demo data for quick testing.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 (Vite)
- **Visualization**: Sigma.js, Graphology
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

### Backend
- **Server**: FastAPI (Python)
- **Data Processing**: Pandas
- **Analysis**: NetworkX (Graph logic)

## 🚀 Getting Started locally

To use the full features (including CSV upload), run both the frontend and backend locally.

### Prerequisites
- **Node.js** (v16+)
- **Python** (v3.8+)

### 1. Clone the Repository
```bash
git clone https://github.com/roflov2/network_app.git
cd network_app
```

### 2. Start the Backend API
The backend handles CSV processing and data conversion.
```bash
cd backend
# Create virtual environment (optional but recommended)
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start server
uvicorn main:app --reload
```
API runs at: `http://localhost:8000`

### 3. Start the Frontend
```bash
# Open a new terminal
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```
Frontend runs at: `http://localhost:5173`

## 📦 Deployment

This repository is configured for automated deployment to **GitHub Pages**.

- **Frontend**: Automatically built and deployed via GitHub Actions on push to `main`.
- **Backend Service**: The static GitHub Pages demo uses pre-loaded JSON data. The `Upload CSV` feature is disabled in the static demo as it requires the Python backend. For a full production deployment, host the `backend/` on a service like Render, Railway, or AWS.

## 📝 License

MIT License - feel free to use this for your own projects!
