from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import networkx as nx
import pandas as pd
import pickle
from typing import List, Optional
from pydantic import BaseModel
import os

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables to store data
G = None
df = None
df_desc = None
node_types = {}
global_counts = {}
desc_lookup = {}

# Constants
MAX_NODES = 100
DOC_EDGE_TYPES = {'APPEARS_IN', 'MENTIONED_IN', 'CONTAINED_IN', 'FOUND_IN'}
REV_DOC_EDGE_TYPES = {'CONTAINS', 'MENTIONS', 'HAS'}

@app.on_event("startup")
async def startup_event():
    global G, df, df_desc, node_types, global_counts, desc_lookup
    
    print("Loading data...")
    try:
        df = pd.read_pickle('edges.pkl')
        df_desc = pd.read_pickle('desc.pkl')
        
        G = nx.from_pandas_edgelist(df, 'Source', 'Target', edge_attr='Edge_Type')
        
        node_types = dict(zip(df['Target'], df['Target_Type']))
        # Update node types for nodes not in target column (sources that are documents)
        node_types.update({n: 'Document' for n in G.nodes() if n not in node_types})
        nx.set_node_attributes(G, {n: {'type': node_types[n]} for n in G.nodes()})
        
        documents = (set(df.loc[df['Edge_Type'].isin(DOC_EDGE_TYPES), 'Target']) |
                     set(df.loc[df['Edge_Type'].isin(REV_DOC_EDGE_TYPES), 'Source']) |
                     {n for n in G.nodes() if isinstance(n, str) and n.startswith(('REF-', 'DOC-'))})
        
        global_counts = {n: sum(1 for nb in G.neighbors(n) if nb in documents) if n not in documents else 0 for n in G.nodes()}
        desc_lookup = dict(zip(df_desc['Reference Number'], df_desc['Description']))
        
        print("Data loaded successfully.")
    except Exception as e:
        print(f"Error loading data: {e}")

@app.get("/")
def read_root():
    return {"message": "Network Explorer API"}

@app.get("/search")
def search_nodes(q: str):
    if not q or len(q) < 2:
        return []
    term_lower = q.lower()
    all_nodes = sorted(map(str, G.nodes()))
    return [{'label': n, 'value': n} for n in all_nodes if term_lower in n.lower()][:50]

# === HELPER FUNCTIONS ===
def get_2hop_limited(start, allowed, max_nodes=MAX_NODES):
    if start not in G:
        return set()
    
    # First hop
    first_hop = [n for n in G.neighbors(start) if node_types.get(n) in allowed]
    
    branch_data = {}
    for fh in first_hop:
        # Second hop
        second_hop = {n for n in G.neighbors(fh) if n != start and node_types.get(n) in allowed}
        # Score based on global counts (importance)
        score = sum(global_counts.get(n, 0) for n in second_hop)
        branch_data[fh] = (second_hop, score)
        
    selected = {start}
    
    # Greedy selection based on branch score
    for fh in sorted(branch_data, key=lambda x: branch_data[x][1], reverse=True):
        if len(selected) >= max_nodes:
            break
            
        second_hop = branch_data[fh][0] - selected
        
        # If adding entire branch fits
        if len(selected) + 1 + len(second_hop) <= max_nodes:
            selected.add(fh)
            selected.update(second_hop)
        # If only partial branch fits
        elif len(selected) + 2 <= max_nodes:
            selected.add(fh)
            remaining_slots = max_nodes - len(selected)
            # Prioritize high-degree nodes in second hop
            top_second_hop = sorted(second_hop, key=lambda n: global_counts.get(n, 0), reverse=True)[:remaining_slots]
            selected.update(top_second_hop)
            
    return selected

@app.get("/neighbors/{node_id}")
def get_neighbors(node_id: str, allowed_types: Optional[str] = None):
    if node_id not in G:
        raise HTTPException(status_code=404, detail="Node not found")
    
    allowed = set(allowed_types.split(',')) if allowed_types else set(node_types.values())
    
    selected_nodes = get_2hop_limited(node_id, allowed)
    sub = G.subgraph(selected_nodes)
    
    elements = []
    # Nodes
    for n in sub.nodes():
        elements.append({
            'data': {
                'id': str(n),
                'label': f"{n}\n[{global_counts.get(n, 0)}]" if global_counts.get(n) else str(n),
                'type': node_types.get(n, 'Document'),
                'count': global_counts.get(n, 0)
            }
        })
    
    # Edges
    seen_edges = set()
    for u, v in sub.edges():
        edge_id = f"{u}-{v}"
        rev_edge_id = f"{v}-{u}"
        if edge_id not in seen_edges and rev_edge_id not in seen_edges:
            elements.append({
                'data': {
                    'source': str(u),
                    'target': str(v),
                    'id': edge_id
                }
            })
            seen_edges.add(edge_id)
        
    # Table Data (Edge List)
    edge_table = sorted([
        {
            'Source': str(u), 
            'Source_Count': global_counts.get(u, 0), 
            'Target': str(v),
            'Target_Count': global_counts.get(v, 0), 
            'Edge_Type': G[u][v].get('Edge_Type', 'CONNECTED'),
            'Source_Type': node_types.get(u, 'Document'), 
            'Target_Type': node_types.get(v, 'Document')
        }
        for u, v in sub.edges()
    ], key=lambda x: x['Target_Count'], reverse=True)

    return {"elements": elements, "table_data": edge_table}

@app.get("/paths")
def get_shortest_paths(start: str, target: str):
    if start not in G or target not in G:
        raise HTTPException(status_code=404, detail="Node not found")
        
    try:
        paths = list(nx.all_shortest_paths(G, start, target))
        # Limit paths if needed, but for now return all (or top 20 like Dash)
        paths = paths[:20]
        
        # Collect all nodes in these paths for the graph
        path_nodes = set()
        for p in paths:
            path_nodes.update(p)
            
        # Get subgraph for visualization
        sub = G.subgraph(path_nodes)
        
        elements = []
        for n in sub.nodes():
             elements.append({
                'data': {
                    'id': str(n),
                    'label': str(n),
                    'type': node_types.get(n, 'Document')
                }
            })
            
        seen_edges = set()
        for u, v in sub.edges():
            edge_id = f"{u}-{v}"
            if edge_id not in seen_edges:
                elements.append({'data': {'source': str(u), 'target': str(v), 'id': edge_id}})
                seen_edges.add(edge_id)
                
        # Path Table
        paths_table = []
        for i, p in enumerate(paths):
            route_str = ' -> '.join(f"{n}[{global_counts.get(n, 0)}]" for n in p)
            paths_table.append({
                'Path': i + 1,
                'Length': len(p) - 1,
                'Route': route_str,
                'Nodes': p  # Include raw node list for highlighting
            })
            
        return {"elements": elements, "table_data": paths_table}
        
    except nx.NetworkXNoPath:
        return {"elements": [], "table_data": [], "message": "No path found"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
