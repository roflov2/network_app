# Network Graph Explorer

A modern, high-performance bipartite graph visualization application built with React and FastAPI.

## 🚀 Features

- **Interactive Graph**: Physics-based layout (Cytoscape.js) ensuring clear separation of document clusters.
- **Bipartite Data Model**: Entities (People, Organizations, Phones) are connected via Documents.
- **Pathfinding**: Visualize shortest paths between any two entities.
- **Search**: Real-time fuzzy search for nodes.
- **AI Analysis**: (Optional) LLM integration for analyzing node neighborhoods.

## 🛠️ Stack

- **Frontend**: React 18, Vite, Cytoscape.js
- **Backend**: FastAPI, NetworkX, Pandas
- **Data**: Synthetic realistic data (Faker)

## 📦 quick Start

### 1. Data Generation
First, generate the dataset. The app needs `edges.pkl` and `desc.pkl` in the `backend/` directory.

```bash
# Generate data in root
python generate_data.py

# Move to backend
mv edges.pkl backend/
mv desc.pkl backend/
```

### 2. Start Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
```
*Server runs at http://0.0.0.0:8000*

### 3. Start Frontend
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```
*App runs at http://localhost:5173*

## 📁 Project Structure

```
├── backend/            # FastAPI server & Graph logic
├── frontend/           # React application
├── generate_data.py    # Data generator script
└── README.md           # This file
```
