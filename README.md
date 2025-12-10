# Network Explorer

A bipartite graph visualization application for exploring connections between entities (people, organizations, phones, websites, crypto wallets) through shared documents. Built with React and deployed on GitHub Pages.

## Features

- **Interactive Graph Visualization**: Physics-based layout using Cytoscape.js with automatic clustering of document nodes
- **Bipartite Data Model**: Entities connect through documents, revealing co-occurrence patterns
- **2-Hop Exploration**: View an entity's neighborhood and discover related entities via shared documents
- **Pathfinding**: Find and visualize shortest paths between any two entities
- **Real-time Search**: Fuzzy search across all nodes in the graph
- **Type Filtering**: Toggle visibility of entity types (Person, Organisation, Phone, Website, Crypto, Document)
- **Data Export**: Download results as CSV

## Tech Stack

- React 19
- Vite
- Cytoscape.js (graph rendering)

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

## Project Structure

```
network_app/
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Main application component
│   │   ├── api.js          # Graph data and algorithms
│   │   ├── graphConfig.js  # Cytoscape styling and layout
│   │   ├── hooks.js        # Custom React hooks
│   │   └── staticData.json # Graph edge data
│   ├── package.json
│   └── vite.config.js
├── generate_data.py        # Synthetic data generator
└── README.md
```

## Deployment

The frontend auto-deploys to GitHub Pages on push to `main` via the workflow in `.github/workflows/deploy.yml`.

## Data Model

The graph follows a bipartite structure:

- **Documents** act as hub nodes connecting entities
- **Entities** (Person, Organisation, Phone, Website, Crypto) connect only to documents
- **Edge type**: `MENTIONS` (Document -> Entity)

This model reveals which entities co-occur in the same documents, useful for network analysis and investigation workflows.

## License

MIT
