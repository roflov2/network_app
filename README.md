# Network Explorer

A bipartite graph visualization application for exploring connections between entities (people, organizations, phones, websites, crypto wallets) through shared documents. Built with React and FastAPI.

## Features

- **Interactive Graph Visualization**: Physics-based layout using Cytoscape.js with automatic clustering of document nodes
- **Bipartite Data Model**: Entities connect through documents, revealing co-occurrence patterns
- **2-Hop Exploration**: View an entity's neighborhood and discover related entities via shared documents
- **Pathfinding**: Find and visualize shortest paths between any two entities
- **Real-time Search**: Fuzzy search across all nodes in the graph
- **Type Filtering**: Toggle visibility of entity types (Person, Organisation, Phone, Website, Crypto, Document)
- **Data Export**: Download results as CSV

## Tech Stack

**Frontend**
- React 19
- Vite
- Cytoscape.js (graph rendering)
- Axios

**Backend**
- FastAPI
- NetworkX (graph algorithms)
- Pandas

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 20+
- pip

### 1. Generate Data

The application requires synthetic data. Generate it first:

```bash
cd /path/to/network_app
pip install faker pandas networkx
python generate_data.py
```

This creates `edges.pkl` and `desc.pkl` in the `backend/` directory.

### 2. Start Backend

```bash
cd backend
pip install -r requirements.txt
python main.py
```

The API server runs at `http://localhost:8000`.

### 3. Start Frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The application runs at `http://localhost:5173`.

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/search?q={term}` | GET | Search nodes by name (min 2 characters) |
| `/neighbors/{node_id}` | GET | Get 2-hop neighborhood graph |
| `/paths?start={a}&target={b}` | GET | Find shortest paths between two nodes |

### Query Parameters

- `/neighbors/{node_id}?allowed_types=Person,Organisation` - Filter by entity types

## Project Structure

```
network_app/
├── backend/
│   ├── main.py           # FastAPI server and graph logic
│   ├── requirements.txt  # Python dependencies
│   ├── edges.pkl         # Edge data (generated)
│   └── desc.pkl          # Document descriptions (generated)
├── frontend/
│   ├── src/
│   │   ├── App.jsx       # Main application component
│   │   ├── api.js        # API client
│   │   ├── graphConfig.js # Cytoscape styling and layout
│   │   └── hooks.js      # Custom React hooks
│   ├── package.json
│   └── vite.config.js
├── generate_data.py      # Synthetic data generator
└── README.md
```

## Deployment

### Frontend (GitHub Pages)

The frontend auto-deploys to GitHub Pages on push to `main` via the workflow in `.github/workflows/deploy.yml`.

### Backend (Railway)

The backend includes a `Procfile` for Railway deployment. Set the `PORT` environment variable as needed.

## Data Model

The graph follows a bipartite structure:

- **Documents** act as hub nodes connecting entities
- **Entities** (Person, Organisation, Phone, Website, Crypto) connect only to documents
- **Edge type**: `MENTIONS` (Document -> Entity)

This model reveals which entities co-occur in the same documents, useful for network analysis and investigation workflows.

## License

MIT
