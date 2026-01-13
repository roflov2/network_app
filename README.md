# Network Explorer

A powerful, high-performance network visualization and analysis tool designed to handle large-scale datasets (2,000+ nodes). Built with **React** and **Sigma.js**, it enables interactive exploration of complex relationships between entities (people, organizations, phones, websites, cryptocurrency wallets) through shared document connections with smooth WebGL rendering.

**[Live Demo](https://roflov2.github.io/network_app/)**

## Features

### Core Visualization & Interactivity
- **High-Performance Rendering**: WebGL-based rendering via Sigma.js handles thousands of nodes smoothly
- **Focus Mode**: Click any node to isolate its 2-hop neighborhood (immediate neighbors + their neighbors)
- **Hover Effects**: Node highlighting with visual feedback (red for hovered, orange for neighbors)
- **Zoom & Pan**: Fluid navigation with smooth camera animations
- **Double-Click Zoom**: Tight zoom on nodes for detailed inspection
- **Focus History**: Previously clicked nodes marked with green borders

### Advanced Analytics
- **Community Detection**: Automatic node clustering using Louvain algorithm with visual separation
- **Centrality Analysis**: Hub (degree centrality) and Bridge (betweenness centrality) detection with avatar icons
- **Shortest Path Finder**: BFS algorithm to find all shortest paths between two nodes
- **Timeline View**: Filter interactions by date range

### Data Management & Filtering
- **Node Type Filtering**: Dynamic type recognition from CSV data with color-coded filtering
- **Document Collapse**: Transform bipartite graph to entity-only projection with weighted edges
- **Advanced Search**: Fuzzy client-side search with instant results (<10ms)
- **Data Tables**: Bi-directional selection between graph and tabular data
- **CSV Export**: Download filtered/viewed data as CSV

### Data Handling
- **CSV Upload**: Drag-and-drop or file browser upload with backend processing
- **Demo Data**: Pre-loaded test dataset for quick exploration

## Tech Stack

### Frontend
- **Framework**: React 18 (Vite)
- **Graph Visualization**: Sigma.js 3.x (WebGL-based)
- **Graph Data Structure**: Graphology 0.25.4
- **Graph Algorithms**:
  - `graphology-communities-louvain` (Community Detection)
  - `graphology-layout-forceatlas2` (Layout with Web Worker)
  - `graphology-metrics` (Betweenness, Degree Centrality)
- **Search**: Fuse.js 7.x (fuzzy client-side search)
- **Styling**: Tailwind CSS 3.4
- **Icons**: Lucide React
- **Charts**: Recharts 2.10 (timeline visualization)

### Backend
- **Framework**: FastAPI (Python)
- **Server**: Uvicorn (ASGI)
- **Data Processing**: Pandas
- **Validation**: Pydantic

### Build Tools
- Vite 5.0 (bundling)
- PostCSS + Autoprefixer (CSS processing)
- ESLint (code linting)

## Project Structure

```
network_app/
├── backend/
│   ├── main.py                 # FastAPI application with endpoints
│   ├── test_main.py            # Backend unit tests
│   └── requirements.txt        # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # Main React component
│   │   ├── main.jsx            # Entry point
│   │   ├── index.css           # Global styles
│   │   ├── utils/
│   │   │   └── graph-logic.js  # Core graph algorithms
│   │   └── components/
│   │       ├── Graph/
│   │       │   ├── InteractiveGraph.jsx  # Sigma.js renderer
│   │       │   └── GraphControls.jsx     # Graph interaction controls
│   │       ├── UI/
│   │       │   ├── UploadModal.jsx       # CSV upload interface
│   │       │   ├── DataTable.jsx         # Tabular data display
│   │       │   ├── PathTable.jsx         # Path-specific table
│   │       │   ├── TypeFilters.jsx       # Node type checkboxes
│   │       │   ├── CommunityPanel.jsx    # Community stats sidebar
│   │       │   ├── SearchOverlay.jsx     # Fuzzy search UI
│   │       │   ├── PathModal.jsx         # Path selection modal
│   │       │   ├── FloatingControls.jsx  # Action buttons
│   │       │   └── HelpModal.jsx         # User guide
│   │       └── Analytics/
│   │           └── Timeline.jsx          # Date-based filtering
│   ├── public/
│   │   └── demo-data.json      # Pre-loaded graph data
│   ├── vite.config.js          # Vite config with API proxy
│   ├── tailwind.config.js      # Tailwind theming
│   └── package.json            # Dependencies
│
├── .github/workflows/
│   └── deploy.yml              # GitHub Actions CI/CD pipeline
├── FUNCTIONAL_SPEC.md          # Detailed specification
└── README.md
```

## Data Model

### CSV Input Schema (Required Columns)

| Column | Description | Example |
|--------|-------------|---------|
| `Source` | Document ID (becomes "Document" node type) | `DOC001` |
| `Target` | Entity identifier | `John Smith` |
| `Edge_Type` | Relationship label | `MENTIONS`, `INVOLVES` |
| `Target_Type` | Entity category | `Person`, `Organisation`, `Phone` |
| `Date` | Temporal attribute | `2024-01-15` |

### Node Types

Node types are **fully flexible** - you can use any value in the `Target_Type` column. The system includes predefined colors for common types:

| Type | Color |
|------|-------|
| Document | Grey #6B7280 |
| Person | Sapphire #0F52BA |
| Phone | Tangerine #F28500 |
| Organisation | Taupe #483C32 |
| Email | Ruby #E0115F |
| Website | Purple #8B5CF6 |
| Cryptocurrency/Wallet | Tangerine #F28500 |

**Custom types** (e.g., `Vehicle`, `Location`, `Event`) are automatically assigned a consistent color from a secondary palette using a deterministic hash.

## API Endpoints

| Method | Endpoint | Purpose | Response |
|--------|----------|---------|----------|
| GET | `/` | Health check | `{"status": "ok", "version": "2.0"}` |
| POST | `/process-csv` | Convert CSV to graph JSON | `{"graph": {nodes[], edges[]}, "metadata": {...}}` |
| POST | `/load-demo` | Load demo dataset | Same as above |

## Getting Started

### Prerequisites
- **Node.js** (v16+)
- **Python** (v3.8+)

### 1. Clone the Repository
```bash
git clone https://github.com/roflov2/network_app.git
cd network_app
```

### 2. Start the Backend API
```bash
cd backend

# Create virtual environment (recommended)
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
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```
Frontend runs at: `http://localhost:5173`

The Vite dev server automatically proxies `/api/*` requests to the backend.

## Testing

### Backend Tests
```bash
cd backend
pytest test_main.py
```

**Test Coverage:**
- API health check
- Demo data loading
- Valid CSV processing
- Error handling for invalid input

## Build & Deployment

### Frontend Build
```bash
cd frontend
npm run build
```
Output: `frontend/dist/` (static files)

### GitHub Actions Workflow
- **Trigger**: Push to `main` branch or manual workflow dispatch
- **Process**: Checkout → Setup Node.js 18 → Install → Build → Deploy to GitHub Pages

### Deployment Options
- **Frontend**: Automated to GitHub Pages via GitHub Actions
- **Backend**: For production CSV upload, deploy to Railway, Render, or AWS Lambda

## Architecture

This application uses a **client-first intelligence model**:
- The lightweight Python backend handles data ingestion and transformation (CSV → JSON)
- The React frontend performs all rendering, layout computation, search, and analytical operations in the browser
- This architecture enables instant feedback and high performance even with large datasets
- The backend is stateless; uploads are processed in-memory only (no data persistence)

## License

MIT License - feel free to use this for your own projects!
