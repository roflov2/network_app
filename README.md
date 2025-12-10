# Network Explorer

A client-side graph visualization tool for exploring connections between entities (people, organizations, phones, websites, crypto wallets) through shared documents. Built with React and deployed on GitHub Pages.

## Overview

Network Explorer is a **pure frontend application** that runs entirely in your browser. All graph data is bundled as static JSON, and pathfinding algorithms run client-side using efficient JavaScript implementations. No backend server required.

## Features

- **Interactive Graph Visualization**: Physics-based layout using Cytoscape.js with intelligent document clustering
- **Bipartite Data Model**: Entities connect through documents, revealing co-occurrence patterns
- **2-Hop Exploration**: View an entity's neighborhood and discover related entities via shared documents
- **Pathfinding**: Find and visualize shortest paths between any two entities using BFS
- **Real-time Search**: Fuzzy search across all nodes with autocomplete
- **Type Filtering**: Toggle visibility of entity types (Person, Organisation, Phone, Website, Crypto, Document)
- **Smart Node Limiting**: Greedy algorithm to show most relevant connections (max 100 nodes)
- **Data Export**: Download results as CSV

## Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Cytoscape.js** - Graph rendering and layout
- **Client-side algorithms** - BFS pathfinding, 2-hop neighbor search

## Quick Start

### Prerequisites

- Node.js 20+

### Development

```bash
cd frontend
npm install
npm run dev
```

The application runs at `http://localhost:5173`.

### Building

```bash
cd frontend
npm run build
```

Output is generated in `frontend/dist/`.

## Project Structure

```
network_app/
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Main application component
│   │   ├── App.css         # Application styles
│   │   ├── api.js          # Graph algorithms (BFS, 2-hop search)
│   │   ├── graphConfig.js  # Cytoscape styling and layout
│   │   ├── hooks.js        # Custom React hooks (debounce, CSV export)
│   │   ├── staticData.json # Graph edge data (173KB)
│   │   └── main.jsx        # React entry point
│   ├── package.json
│   └── vite.config.js      # Vite configuration
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Pages deployment workflow
├── generate_data.py        # Synthetic data generator
└── README.md
```

## Deployment

The application auto-deploys to GitHub Pages on every push to `main` via GitHub Actions. The workflow:

1. Checks out code
2. Installs dependencies
3. Builds frontend (`npm run build`)
4. Deploys `frontend/dist/` to GitHub Pages

## Data Model

The graph follows a **bipartite structure**:

- **Documents** (`DOC-*` nodes) act as hub nodes connecting entities
- **Entities** (Person, Organisation, Phone, Website, Crypto) connect only to documents
- **Edge type**: `MENTIONS` (Document → Entity)

This model reveals which entities co-occur in the same documents, useful for network analysis and investigation workflows.

### Example

```
Person: "Daniel Craig"
    ↓
DOC-45 (mentions Daniel Craig)
    ↓
Organisation: "Google" (also mentioned in DOC-45)
```

When you search for "Daniel Craig" in 2-Hop mode, you'll see all documents mentioning him, and all other entities mentioned in those same documents.

## Algorithms

### 2-Hop Neighbor Search

Located in `frontend/src/api.js:48-145`

1. Find all documents (first hop) connected to the start node
2. Find all entities (second hop) connected to those documents
3. Score branches by summing global connection counts of second-hop nodes
4. Greedily select highest-scoring branches until reaching 100 nodes
5. Build Cytoscape elements and table data

### Pathfinding

Located in `frontend/src/api.js:148-224`

1. BFS from start node to target node
2. Find all shortest paths (up to 20)
3. Build subgraph containing only nodes in found paths
4. Return path details with length and route

## Generating New Data

The `generate_data.py` script creates synthetic graph data:

```bash
pip install pandas networkx
python generate_data.py
```

This generates:
- `frontend/src/staticData.json` - Edge list loaded by the frontend

The script includes realistic entity names (actors, companies, websites, crypto wallets) and creates random document connections.

## Performance

- **Bundle size**: ~200KB (including 173KB data file)
- **Load time**: <1s on modern browsers
- **Graph rendering**: Handles 100+ nodes smoothly
- **Search**: Instant fuzzy matching across all nodes

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

MIT
