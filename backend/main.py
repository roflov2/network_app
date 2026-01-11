from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
import os

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://roflov2.github.io",
        "https://roflov2.github.io/network_app_2",
        "https://roflov2.github.io/network_app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def process_dataframe(df: pd.DataFrame):
    """
    Converts a pandas DataFrame into a Graphology-compatible JSON structure.
    Input Schema: ['Source', 'Target', 'Edge_Type', 'Target_Type', 'Date']
    Nodes: Derived from unique Source and Target values.
    Edges: Direct mapping from rows.
    """
    REQUIRED_COLUMNS = {'Source', 'Target', 'Edge_Type', 'Target_Type', 'Date'}
    
    # Validation
    if not REQUIRED_COLUMNS.issubset(df.columns):
        missing = REQUIRED_COLUMNS - set(df.columns)
        raise ValueError(f"CSV missing required columns: {missing}")

    # Deduplicate edges (same source-target-type-date combination)
    df = df.drop_duplicates(subset=['Source', 'Target', 'Edge_Type', 'Date'], keep='first')

    nodes = {}
    edges = []
    edge_counter = 0  # Use counter for unique edge keys
    
    # Helper to add node if not exists
    def add_node(key, label, node_type):
        if key not in nodes:
            nodes[key] = {
                "key": str(key), 
                "attributes": {
                    "label": str(label), 
                    "type": str(node_type)
                }
            }
        # Note: If a node appears multiple times with different types, the first one wins 
        # or we could update/merge. For now, simple first-seen logic.

    for _, row in df.iterrows():
        source = str(row['Source'])
        target = str(row['Target'])
        edge_type = str(row['Edge_Type'])
        target_type = str(row['Target_Type'])
        date = str(row['Date'])
        
        # Add Nodes
        # Source nodes are Documents (the connecting entities in bipartite graph)
        # Target nodes have specific types (Person, Phone, Organisation, etc.)
        add_node(source, source, "Document") 
        add_node(target, target, target_type)

        # Add Edge with unique counter-based key
        edge_key = f"e{edge_counter}"
        edge_counter += 1
        
        edges.append({
            "key": edge_key,
            "source": source,
            "target": target,
            "attributes": {
                "type": edge_type,
                "date": date
            }
        })

    # Calculate document counts for entity nodes
    # For each entity (non-Document node), count how many unique documents it appears in
    entity_document_counts = {}
    for _, row in df.iterrows():
        source = str(row['Source'])
        target = str(row['Target'])
        
        # Track which documents each entity appears in
        if target not in entity_document_counts:
            entity_document_counts[target] = set()
        entity_document_counts[target].add(source)
    
    # Add document count to entity node attributes
    for node_key, node_data in nodes.items():
        if node_data['attributes']['type'] != 'Document':
            doc_count = len(entity_document_counts.get(node_key, set()))
            node_data['attributes']['documentCount'] = doc_count
            # Update label to include count
            original_label = node_data['attributes']['label']
            node_data['attributes']['label'] = f"{original_label} ({doc_count})"

    return {
        "nodes": list(nodes.values()),
        "edges": edges,
        "metadata": {
            "node_count": len(nodes),
            "edge_count": len(edges)
        }
    }

@app.get("/")
def read_root():
    return {"status": "ok", "version": "2.0"}

@app.post("/process-csv")
async def process_csv(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    try:
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        graph_data = process_dataframe(df)
        return {"graph": graph_data}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.post("/load-demo")
def load_demo():
    try:
        # Load edges.pkl from backend directory
        file_path = os.path.join(os.path.dirname(__file__), "edges.pkl")
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Demo data (edges.pkl) not found on server.")
        
        df = pd.read_pickle(file_path)
        graph_data = process_dataframe(df)
        return {"graph": graph_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading demo data: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
