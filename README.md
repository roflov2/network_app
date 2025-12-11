# Network Explorer

A full-stack graph visualization tool for exploring connections between entities (people, organizations, phones, websites, crypto wallets) through shared documents. Built with React (Frontend) and FastAPI (Backend).

## Overview

Network Explorer is a **hybrid application**:
- **Frontend**: React + Cytoscape.js for interactive graph visualization.
- **Backend**: FastAPI (Python) for efficient graph processing, identifying 2-hop neighbors, and calculating shortest paths.

## Features

- **Interactive Graph Visualization**: Physics-based layout using Cytoscape.js
- **Bipartite Data Model**: Entities connect through documents, revealing co-occurrence patterns
- **2-Hop Exploration**: View an entity's neighborhood and discover related entities via shared documents
- **Pathfinding**: Find and visualize shortest paths between any two entities (calculated server-side)
- **Real-time Search**: Fast server-side search across all nodes
- **Type Filtering**: Toggle visibility of entity types

## Tech Stack

### Frontend
- **React 19**
- **Vite**
- **Cytoscape.js**

### Backend
- **FastAPI**
- **NetworkX**
- **Pandas**

## Project Structure

```
network_app/
├── backend/                # Python FastAPI Backend
│   ├── main.py             # API Server
│   ├── requirements.txt    # Python dependencies
│   ├── Procfile            # Railway entry point
│   └── *.pkl               # Graph data files
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── api.js          # API Client (fetches from backend)
│   │   └── ...
│   └── vite.config.js
├── railway.json            # Railway Config (Build Root)
└── README.md
```

## Deployment

### Railway (Backend)
This repository is configured for deployment on [Railway](https://railway.app/).

1.  Connect your GitHub repository to Railway.
2.  **Configuration**:
    - **Build Root**: `backend` (Defined in `railway.json`, but verify in Settings > General)
    - **Start Command**: 
      ```bash
      uvicorn main:app --host 0.0.0.0 --port $PORT
      ```
      *(Note: If deployment fails, ensure this is set in Settings > Deploy > Start Command)*

The backend will be available at `https://<your-project>.up.railway.app`.

### GitHub Pages (Frontend)
The frontend auto-deploys to GitHub Pages via GitHub Actions on every push to `main`.

1.  **Environment**: Update `frontend/src/api.js` to point to your Railway backend URL:
    ```javascript
    const API_BASE = 'https://<your-project>.up.railway.app';
    ```
2.  **Push to main**: The `deploy.yml` workflow will build and deploy the frontend.

## Local Development

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
# Running on http://localhost:8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:5173
```

## Data Model
- **Documents** (`DOC-*`) act as hub nodes.
- **Entities** (Person, Organisation, etc.) connect to documents.
- The backend identifies "shared document" connections (2-hop neighbors) efficiently using NetworkX.

## License
MIT
