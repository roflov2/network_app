# Network Explorer - Functional Specification

**Version:** 2.1 (Enhanced Visuals)
**Date:** December 2025
**Project Type:** Full-Stack Graph Visualization Application

---

## 1. Executive Summary

Network Explorer is a full-stack web application designed to visualize and analyze complex relationships between entities (people, organizations, phones, websites, cryptocurrency wallets) through shared document connections.

The system utilizes a **Client-First Intelligence** architecture. A lightweight Python backend handles data ingestion and transformation, while the React frontend leverages **WebGL (Sigma.js)** and **Graphology** to handle all rendering, layout, search, and analytical operations in the browser. This ensures instant feedback, high frame rates for large datasets (2,000+ nodes), and secure, stateless data exploration.

### Key Capabilities
-   **High-Performance Rendering:** WebGL-based visualization using **Sigma.js**.
-   **User Data Upload:** Secure, stateless CSV import functionality.
-   **Client-Side Intelligence:** Instant search, community detection (Louvain), and pathfinding performed in-browser.
-   **Community Analysis:** Clustering visualization with dedicated statistics and color coding.
-   **Rich Interactivity:** Focus-and-context exploration with physics-based animations.

---

## 2. System Overview

### 2.1 Architecture Pattern
**Frontend-Heavy Hybrid Architecture:**
-   **Backend (Optional):** FastAPI (Python) - Handles CSV parsing. Not required for static demo.
-   **Frontend (Smart):** React 19 + Vite - fully static capability for GitHub Pages.
-   **Data Flow:** CSV $\to$ Backend ETL $\to$ JSON (or Static JSON) $\to$ Client Memory.

### 2.2 Core Design Principles
1.  **Bipartite Graph Model:** Entities connect indirectly through document nodes.
2.  **WebGL First:** **Sigma.js** is the primary renderer, enabling performance on lower-end devices.
3.  **Client-Side Analytics:** To maximize responsiveness and privacy, algorithms (Search, Louvain, Centrality) run in the browser (Web Workers).
4.  **Statelessness:** The server does not retain user data between requests. Uploaded graphs exist only in the client's session memory.

---

## 3. Technical Stack

### 3.1 Backend Technologies
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Framework | FastAPI | API server & ETL processor |
| Data Processing | Pandas | CSV parsing & cleaning |
| Server | Uvicorn | ASGI server |
| Validation | Pydantic | Request schemas |

### 3.2 Frontend Technologies
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Framework | React 19 | UI component framework |
| State/Graph | **Graphology** | Graph data structure & algorithms |
| Rendering | **Sigma.js** | WebGL graph visualization |
| Layout | **ForceAtlas2** | **Hybrid Strategy:** Pre-calculated (100 iters) + Continuous (Worker) |
| Clustering | **Louvain** | `graphology-communities-louvain` |
| Search | **Fuse.js** | Fuzzy client-side search |
| Charts | Recharts | Timeline visualization |
| Styling | Tailwind CSS | UI components & layout |

---

## 4. Data Model

### 4.1 Entities & Edges
The graph is undirected and bipartite.

**Nodes:**
-   `key`: Unique ID (String).
-   `attributes`:
    -   `label`: Display name (for entities, includes document count: "John Smith (3)").
    -   `type`: Entity category (Document, Person, Organisation, etc.).
    -   `documentCount`: Number of unique documents the entity appears in (entities only, not documents).
    -   `x`, `y`: Coordinates (Float).
    -   `size`: Visual radius (Float).
    -   `color`: Hex code (String).
    -   `community`: Cluster ID (Integer).

**Edges:**
-   `key`: Unique ID.
-   `source`: Node Key.
-   `target`: Node Key.
-   `attributes`:
    -   `size`: Edge weight.
    -   `type`: "line".

### 4.2 Data Ingestion (CSV)
Users upload a CSV which acts as the source of truth.

**Required Columns:**
-   `Source`, `Target`, `Edge_Type`, `Target_Type`, `Date`.

**Columns:**
-   `Source`: Identifier for the source node.
-   `Target`: Identifier for the target node.
-   `Edge_Type`: Label for the relationship (e.g., "MENTIONS").
-   `Target_Type`: Category of the target node (e.g., "Person", "Organisation").
-   `Date`: Temporal attribute (YYYY-MM-DD).

---

## 5. Features & Capabilities

### 5.1 Visualization & Interactivity
The application implements a "Focus & Context" interface.

#### Interaction Behaviors
1.  **Hover (Exploration):**
    -   **Trigger:** Mouse entering a node.
    -   **Visuals:**
        -   Target Node: Grows 1.5x, turns Red (`#ff6b6b`).
        -   Neighbors: Turn Orange (`#ffa500`), swell 1.2x.
        -   Non-Neighbors: Turn Light Grey (`#e0e0e0`) but remain visible (opacity 1.0).
        -   Edges between highlighted nodes become Red. Other edges fade.
    -   **Cursor:** Changes to pointer.

2.  **Click (Selection - 2-Hop Filter):**
    -   **Trigger:** Single click.
    -   **Effect:** ISOLATE the node's **2-Hop Neighborhood** (immediate neighbors + their neighbors).
    -   **Visual:** Apply thick Dark Blue border to selected node.
    -   **Camera:** Smoothly animates to center the node (Zoom 0.5, Duration 500ms).
    -   **History:** Node added to "Clicked History" (Green border).
    -   **Reset:** Clicking on the background resets the view to the full graph (Reset View logic).

2a. **Edge Click (Context Selection):**
    -   **Trigger:** Click on an edge line.
    -   **Effect:** Finds the **Source Node** of the edge and sets it as the focused node (triggering 2-hop filter).
    -   **Visual:** Edge turns Bright Red (`#ff0000`) and Thick (4x). Source Node center view.

3.  **Double Click:**
    -   **Trigger:** Double click.
        -   **Effect:** Zoom in tight (Ratio 0.2).

5.  **Graph Fitting Strategy (Reset View):**
    -   **Logic:** Static Safe Fit.
    -   **Settings:**
        -   Centering: `x: 0.5` (Horizontal Center).
        -   Vertical Shift: `y: 0.6` (Shifted Down to move graph Up, clearing Timeline).
        -   Zoom: `ratio: 1.2` (Slightly zoomed out for context).
    -   **Layout Scale:** ForceAtlas2 `scalingRatio: 100` to separate dense clusters.

### 5.2 Community Mode (Clustering)
**Algorithm:** Client-side Louvain Modularity (`graphology-communities-louvain`).
-   **Trigger:** User switches to "Community Mode".
-   **Process:**
    1.  Graphology calculates communities in real-time.
    2.  Nodes are recolored based on their assigned Community ID.
    3.  `ForceAtlas2` layout adjusts to pull connected communities tighter.
-   **Sidebar:** Displays a list of communities, sorted by size (node count).
    -   *Action:* Clicking a community in the list highlights all its members.

### 5.3 Data Tables (Interactive)

**Panel Location:** Resizable bottom panel showing tabular data.

**Table Types:**
1. **Node/Edge Table** - Default view showing graph data
2. **Path Table** - Replaces Node/Edge table when in path view

#### Node/Edge Table Features

**Filtered Data Display:**
- Tables show **only the data currently visible** in the graph
- Reflects active filters: type filters, 2-hop neighborhood, collapsed documents
- Real-time synchronization with graph state

**View All Data Toggle:**
- **Button:** "All Data" / "Filtered" toggle in toolbar
- **Purpose:** Temporarily view full dataset while filters are active
- **Use case:** Compare filtered subset to full dataset

**Tabs:**
- **Nodes Tab:** ID, Label, Type columns
- **Edges Tab:** Source, Target, Type columns
- Switch between tabs to inspect different data types

**Bi-directional Selection:**
- **Graph → Table:** Clicking nodes/edges highlights corresponding table rows
- **Table → Graph:** Clicking table rows focuses graph elements
- Visual indicator: Blue background + left border (Sapphire `#0F52BA`)

**CSV Export:**
- Download button exports current tab data to CSV
- Filename format: `nodes-YYYY-MM-DD.csv` or `edges-YYYY-MM-DD.csv`
- Exports filtered/searched data (respects current view)

**Search/Filter:**
- Text search across ID and Label fields
- Filters table rows without affecting graph

#### Path Table

**Trigger:** Appears when "Find Path" is active, replaces Node/Edge table

**Features:**
- Lists all shortest paths found between source and target
- Columns: Path Number, Path (node sequence), Hops count
- **Clickable rows:** Select path to highlight only that path in graph
- **Visual selection:** Blue left border on selected path
- **CSV Export:** Download all paths with format `paths-YYYY-MM-DD.csv`

**Behavior:**
- Paths shown as: `Node1 → Node2 → Node3`
- First path selected by default
- Click "Clear Path" to return to Node/Edge table

### 5.4 Node Type Filtering
**Purpose:** Allow users to focus on specific entity types by filtering the graph visualization.

**Dynamic Type Recognition:**
-   Node types are automatically extracted from the CSV's `Target_Type` column
-   Any type found in the data will appear in the filter list
-   No hardcoded type limitations

**Color Coding:**
Nodes are colored using the **website brand palette** (from Bias and Brew) for visual consistency:
-   **Document:** Neutral Grey (`#6B7280`) - Connection hubs in the bipartite graph
-   **Person:** Sapphire (`#0F52BA`) - Individual entities
-   **Phone:** Tangerine (`#F28500`) - Phone numbers and contact info
-   **Organisation:** Taupe (`#483C32`) - Organizations
-   **Email:** Ruby (`#E0115F`) - Email addresses and digital contact
-   **Website:** Sapphire (`#0F52BA`) - Website URLs
-   **Cryptocurrency/Wallet:** Tangerine (`#F28500`) - Crypto addresses and financial entities

**Brand Palette Reference:**
-   **Sapphire** (`#0F52BA`): Primary blue - professional, trustworthy
-   **Ruby** (`#E0115F`): Accent pink/red - highlights, alerts
-   **Tangerine** (`#F28500`): Accent orange - energy, warnings
-   **Taupe** (`#483C32`): Brown-grey - sophisticated, subtle
-   **Charcoal** (`#36454F`): Text and UI borders

**Unknown types** (e.g., "Vehicle", "Location", "IP Address") automatically receive distinct colors generated from a deterministic hash of the type name, ensuring consistent coloring across sessions.

**Filter Controls:**
-   **Location:** Sidebar, below main controls
-   **Interface:** Collapsible checkbox list (collapsed by default)
    -   Header shows count: "Node Types (5/7)" (selected/total)
    -   Click header or chevron to expand/collapse
    -   Color indicators next to each type name
-   **Actions:**
    -   Toggle individual types to show/hide them
    -   "Select All" button to show all types (visible when expanded)
    -   "Deselect All" button to hide all types (visible when expanded)
-   **Behavior:** 
    -   Unchecking a type hides those nodes and their connecting edges
    -   Filtering applies to the entire graph (works with other features like search, path finding)
    -   All types are selected by default on data load
    -   **Focused nodes preserved:** If a node is selected and its type is filtered out, it remains visible with its immediate neighbors

### 5.5 Document Collapse Mode
**Purpose:** Transform the bipartite graph into an entity-only projection by collapsing document nodes.

**Toggle:** "Collapse Documents" checkbox in sidebar (below type filters)

**Behavior:**
-   **Documents hidden:** All document nodes are removed from view
-   **Entities directly connected:** If two entities appear in the same document, they become directly connected
-   **Edge weighting:** 
    -   Edge thickness reflects the number of shared documents (1-5 cap)
    -   Edge label shows: "Via X document(s)"
    -   Hover over edge to see tooltip with connection details
-   **Example:** 
    -   Before: `John Smith → DOC-001 → jane@email.com`
    -   After: `John Smith ↔ jane@email.com` (labeled "Via 1 document")

**Use Cases:**
-   Reveal entity-to-entity relationships
-   Identify co-occurrence patterns
-   Simplify document-heavy graphs
-   Network analysis on entity connections

### 5.6 Search (Client-Side)
**Engine:** `Fuse.js`.
-   **Index:** Built dynamically from Graphology node attributes upon data load.
-   **Features:**
    -   Fuzzy matching (tolerates typos).
    -   Instant results (<10ms).
-   **Action:** Selecting a result triggers the **Click (Selection)** behavior (Camera pan + Zoom).

### 5.7 Shortest Path Finder
**Algorithm:** Client-side BFS (Unweighted).
-   **Trigger:** "Find Path" button in sidebar.
-   **Inputs:** User selects Source and Target nodes via modal.
-   **Output:**
    -   Calculates **all** shortest paths (if multiple exist)
    -   Isolates the graph to ONLY show the nodes and edges in the paths ("Path View")
    -   Alerts user if multiple paths found
    -   Clears other focus modes
-   **Clear Path:** "Clear Path" button appears when in path view
    -   Returns to normal filtered graph view
    -   Clears focused nodes/edges
-   **Alternate Exit:** Clicking background also returns to full graph

### 5.8 Data Import & Demo Data
**Workflow:**
1.  **CSV Upload:**
    -   User clicks "Upload Data".
    -   Selects a `.csv` file via Drag & Drop or File Browser.
    -   **Backend:** Parses CSV, identifies the ID column, explodes lists, constructs JSON graph.
    -   **Frontend:** Receives JSON, initializes Graphology instance.

3.  **Test Data (Demo Mode):**
    -   **Concept:** Instantly load a pre-configured dataset.
    -   **Static/Prod:** Fetches `demo-data.json` directly from the server (no backend required).
    -   **Local/Dev:** Fetches from Python backend via `/load-demo`.

---

## 6. API Specification

### 6.1 Base URL
-   **Local:** `http://localhost:8000`
-   **Production:** `https://networkapp-production.up.railway.app`

### 6.2 Endpoints

#### `GET /`
**Response:** `{"status": "ok", "version": "2.0"}`

#### `POST /process-csv`
**Purpose:** Stateless ETL. Converts raw CSV to Graph JSON.

**Request:** `multipart/form-data` (`file`)

**Response:**
```json
{
  "graph": {
    "nodes": [
      {"key": "DOC-1", "attributes": {"type": "Document", "label": "DOC-1"}},
      {"key": "Alice", "attributes": {"type": "Person", "label": "Alice"}}
    ],
    "edges": [
      {"key": "e1", "source": "DOC-1", "target": "Alice", "attributes": {"type": "MENTIONS"}}
    ]
  },
  "metadata": {
    "node_count": 2,
    "edge_count": 1
  }
}

```

**Errors:**

* `400 Bad Request`: "CSV must contain a column with 'id', 'ref', or 'doc'."

#### `POST /load-demo`
**Purpose:** Loads a pre-defined test dataset for demonstration purposes.

**Request:** Empty body.

**Response:** Returns the same Graph JSON structure as `/process-csv`.

---

## 7. Frontend Architecture

### 7.1 Component Structure

```
App.jsx
├── Header (Upload Button, Stats)
├── Sidebar (Community Stats, Legend)
├── MainCanvas
│   ├── SearchOverlay (Fuse.js Autocomplete)
│   ├── SigmaContainer (Div reference for Raw Sigma)
│   │   └── SigmaInstance (Manual lifecycle management)
│   └── Timeline (Recharts)
└── Modals
    └── UploadModal (Dropzone + Progress)

```

### 7.2 Styling System (Reducers)

**Sigma Reducers** (Memoized functions):

* **NodeReducer:** Handles Hover, Selection, and History highlighting logic.
* **EdgeReducer:** Hides edges not connected to the hovered node to reduce visual clutter.

### 7.3 Performance Tuning

**Optimization Strategy:** Multi-layered approach for smooth 60fps with large graphs (1000+ nodes).

#### Rendering Optimizations

**Edge Labels Disabled:**
- Edge labels are computationally expensive with many edges
- Disabled by default: `renderEdgeLabels: false`

**Efficient WebGL Programs:**
- `defaultNodeType: "circle"` - Fastest node rendering program
- `defaultEdgeType: "line"` - Simple line rendering (no curves/arrows overhead)
- Custom NodeCircleProgram and EdgeLineProgram for optimized shaders

**Batch Operations:**
- `batchEdgesDrawing: true` - Groups edge rendering operations
- Reduces WebGL draw calls significantly

#### Dynamic Quality Reduction

**Hide-on-Move (Critical for Performance):**
- `hideEdgesOnMove: true` - Hides edges during camera movement
- `hideLabelsOnMove: true` - Hides text during panning/zooming
- **Result:** Maintains smooth 60fps during interactions

**Level-of-Detail (LOD) Thresholds:**
- `labelRenderedSizeThreshold: 8` - Auto-hide labels smaller than 8px
- `edgeRenderedSizeThreshold: 0.5` - Auto-hide edges thinner than 0.5px
- Only renders visible details, ignoring off-screen/tiny elements

#### Camera & Animation Settings

**Zoom Limits:**
- `maxCameraRatio: 10` - Prevents excessive zoom out
- `minCameraRatio: 0.05` - Prevents excessive zoom in
- Limits rendering complexity at extreme zoom levels

**Responsive Controls:**
- `zoomingRatio: 0.2` - Faster zoom steps (20% increments)
- `doubleClickZoomingRatio: 2.5` - Bigger zoom jumps on double-click
- `animationsTime: 150` - Snappy 150ms animations (vs default longer)

#### Layout Performance

**ForceAtlas2 Optimizations:**
- **Hybrid Layout Strategy:**
  1.  **Pre-calculation:** Runs 100 iterations of ForceAtlas2 *before* initial render to "unfold" the graph.
  2.  **Continuous:** Web Worker layout takes over for smooth stabilization.
- Tuned settings for quick stabilization with minimal jitter:
  - `scalingRatio: 10` - Prevents node overlap
  - `gravity: 0.5` - Gentle pull to center
  - `slowDown: 3` - Reduces oscillation
  - `timeout: 3000` - Auto-stops after 3 seconds

**Spatial Efficiency:**
- Pre-calculated node positions when possible
- Spatial clustering for better locality of reference

#### Memory Management

**Event Throttling:**
- Hover events throttled to 50ms
- Prevents excessive re-renders during rapid mouse movement

**Efficient Data Structures:**
- Graphology's optimized graph storage
- Memoized settings and computed values
- Minimal state updates

#### Performance Impact

**For Large Graphs (1000+ nodes):**
- Camera movement: Smooth 60fps (edges/labels hidden during move)
- Initial render: Optimized with batch operations
- Zoom operations: Fast and responsive
- Memory usage: Reduced via LOD and hide-on-move

**User Experience:**
- Snappy interactions even with complex graphs
- No lag during panning/zooming
- Instant response to node clicks
- Smooth transitions and animations

---

## 8. Deployment

### 8.1 Strategy

*   **Primary Deployment:** **GitHub Pages** (Static Frontend).
    *   **CI/CD:** GitHub Actions automatically builds and deploys on push to `main`.
*   **Backend (Optional):** Railway/Render (Python/FastAPI) if CSV upload is required.
*   **Demo Mode:** The live GitHub Pages demo uses static JSON data, making the backend optional for viewers.

### 8.2 Security & Persistence

* **Data Privacy:** Uploaded data is processed in memory and returned immediately. It is **never saved to disk** on the server.
* **Persistence:** Graph state exists in the user's browser RAM. Refreshing the page resets the app to the default dataset.

---

## 9. Implementation Guide: Graphology + Sigma

### 9.1 Graph Initialization

```javascript
// On data load
const graph = new Graph();
graph.import(data); // Import JSON from API

// 1. Run Layout (Pre-calculation)
forceAtlas2.assign(graph, { iterations: 100 });

// 2. Calculate Communities
const communities = louvain(graph);
graph.forEachNode((node) => {
  graph.setNodeAttribute(node, 'community', communities[node]);
  graph.setNodeAttribute(node, 'color', COMMUNITY_COLORS[communities[node]]);
});

// 3. Build Search Index
const searchIndex = new Fuse(graph.mapNodes((n, attr) => ({ id: n, ...attr })), {
  keys: ['label']
});
```

### 9.2 Reference: Interactive Graph (Events & Reducers)

```javascript
import React, { useEffect, useRef } from "react";
import Sigma from "sigma";
import { NodeCircleProgram, EdgeLineProgram } from "sigma/rendering"; // Crucial imports

function InteractiveGraph({ graphData }) {
const containerRef = useRef(null);
const sigmaRef = useRef(null);

useEffect(() => {
  if (!graphData || !containerRef.current) return;

  // 1. Sanitize Data (Required for Sigma to prevent crashes)
  graphData.forEachNode((node) => {
    graphData.setNodeAttribute(node, 'type', 'circle'); // Force known type
  });
  graphData.forEachEdge((edge) => {
    graphData.setEdgeAttribute(edge, 'type', 'line');   // Force known type
  });

  // 2. Initialize Manual Sigma Instance
  const renderer = new Sigma(graphData, containerRef.current, {
    renderLabels: true,
    defaultNodeType: "circle",
    defaultEdgeType: "line",
    // Explicitly register default programs
    nodeProgramClasses: {
      circle: NodeCircleProgram
    },
    edgeProgramClasses: {
      line: EdgeLineProgram
    }
  });

  sigmaRef.current = renderer;

  // 3. Register Event Listeners manually
  renderer.on('clickNode', (event) => {
    const nodeData = renderer.getGraph().getNodeAttributes(event.node);
    renderer.getCamera().animate(
      { x: nodeData.x, y: nodeData.y, ratio: 0.5 }, 
      { duration: 500 }
    );
  });

  // Cleanup
  return () => {
    renderer.kill();
  };
}, [graphData]);

return <div ref={containerRef} style={{ height: "100%", width: "100%" }} />;
}

// Advanced node reducer for dynamic styling based on interaction state
const nodeReducer = (node, data) => {
  const graph = sigma.getGraph();
  const newData = { ...data };
  
  // Highlight hovered node and its neighbors
  if (hoveredNode) {
    if (node === hoveredNode) {
      // Make hovered node larger and brighter
      newData.size = data.size * 1.5;
      newData.color = "#ff6b6b";
      newData.borderSize = 2;
      newData.borderColor = "#000";
    } else {
      // Check if this node is a neighbor of hovered node
      const neighbors = graph.neighbors(hoveredNode);
      if (neighbors.includes(node)) {
        // Highlight neighbors with medium emphasis
        newData.color = "#ffa500";
        newData.size = data.size * 1.2;
      } else {
        // Fade non-related nodes
        newData.color = "#e0e0e0";
        newData.size = data.size * 0.8;
      }
    }
  }
  
  // Persistent selection styling
  if (selectedNode === node) {
    newData.borderSize = 3;
    newData.borderColor = "#2c3e50";
    newData.size = data.size * 1.3;
  }
  
  // Mark previously clicked nodes
  if (clickedNodes.has(node)) {
    newData.borderSize = 1;
    newData.borderColor = "#27ae60";
  }
  
  return newData;
};

// Edge reducer for dynamic edge styling
const edgeReducer = (edge, data) => {
  const graph = sigma.getGraph();
  const newData = { ...data };
  
  // Highlight edges connected to hovered node
  if (hoveredNode) {
    const [source, target] = graph.extremities(edge);
    if (source === hoveredNode || target === hoveredNode) {
      newData.size = data.size * 2;
      newData.color = "#ff6b6b";
    } else {
      // Fade other edges
      newData.color = "#f0f0f0";
      newData.size = data.size * 0.5;
    }
  }
  
  return newData;
};

return (
  <SigmaContainer 
    settings={{ 
      nodeReducer, 
      edgeReducer,
      // Enhance interactivity with smooth animations
      animationsTime: 200,
      hideEdgesOnMove: true, // Performance optimization during pan/zoom
      hideLabelsOnMove: true
    }}
  >
    {/* Display interaction state */}
    {selectedNode && (
      <div style={{
        position: "absolute",
        top: 10,
        left: 10,
        backgroundColor: "rgba(255,255,255,0.9)",
        padding: "10px",
        borderRadius: "5px",
        zIndex: 1000
      }}>
        Selected: {selectedNode}
      </div>
    )}
  </SigmaContainer>
);
}
```

### 9.3 Reference: Community Graph (Manual Build & Clustering)

```javascript
import { useState, useEffect } from "react";
import { SigmaContainer, useLoadGraph } from "@react-sigma/core";
import { useLayoutForceAtlas2 } from "@react-sigma/layout-forceatlas2";
import Graph from "graphology";
import louvain from "graphology-communities-louvain";

function ClusteredGraph() {
const loadGraph = useLoadGraph();
const { start, stop } = useLayoutForceAtlas2();
const [clusterStats, setClusterStats] = useState({});

useEffect(() => {
  const graph = new Graph();
  
  // Generate a network with natural community structure
  // This simulates real-world networks with distinct groups
  const communities = [
    { id: "tech", size: 15, color: "#3498db" },
    { id: "marketing", size: 12, color: "#e74c3c" },
    { id: "sales", size: 10, color: "#2ecc71" },
    { id: "support", size: 8, color: "#f39c12" }
  ];
  
  let nodeId = 0;
  const communityNodes = {};
  
  // Create nodes within each community
  communities.forEach(community => {
    communityNodes[community.id] = [];
    
    for (let i = 0; i < community.size; i++) {
      const id = "node_" + nodeId++;
      
      // Nodes start clustered around community centers
      const angle = (i / community.size) * 2 * Math.PI;
      const radius = 50 + Math.random() * 30;
      const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 50;
      const y = Math.sin(angle) * radius + (Math.random() - 0.5) * 50;
      
      graph.addNode(id, {
        x: x,
        y: y,
        size: 8 + Math.random() * 12,
        label: community.id.charAt(0).toUpperCase() + i,
        color: community.color,
        community: community.id,
        // Store original community for comparison with detected communities
        originalCommunity: community.id
      });
      
      communityNodes[community.id].push(id);
    }
  });
  
  // Add dense connections within communities (high clustering coefficient)
  Object.values(communityNodes).forEach(nodes => {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        // High probability of intra-community connections
        if (Math.random() < 0.4) {
          graph.addEdge(nodes[i], nodes[j], {
            size: 1 + Math.random() * 2,
            color: "#bdc3c7",
            type: "intra-community"
          });
        }
      }
    }
  });
  
  // Add sparse connections between communities (inter-community edges)
  const allNodes = graph.nodes();
  for (let i = 0; i < 20; i++) {
    const node1 = allNodes[Math.floor(Math.random() * allNodes.length)];
    const node2 = allNodes[Math.floor(Math.random() * allNodes.length)];
    
    const node1Community = graph.getNodeAttribute(node1, "community");
    const node2Community = graph.getNodeAttribute(node2, "community");
    
    // Only add inter-community edges
    if (node1Community !== node2Community && !graph.hasEdge(node1, node2)) {
      graph.addEdge(node1, node2, {
        size: 0.5 + Math.random(),
        color: "#95a5a6",
        type: "inter-community"
      });
    }
  }
  
  // Run Louvain community detection algorithm
  // This will detect communities based on the network structure
  const communities = louvain(graph);
  
  // Assign detected community colors
  const detectedCommunityColors = {
    0: "#9b59b6", 1: "#e67e22", 2: "#1abc9c", 3: "#34495e", 
    4: "#e91e63", 5: "#ff9800", 6: "#607d8b", 7: "#8bc34a"
  };
  
  // Update node colors based on detected communities
  graph.forEachNode((node, attributes) => {
    const detectedCommunity = communities[node];
    graph.setNodeAttribute(node, "detectedCommunity", detectedCommunity);
    graph.setNodeAttribute(node, "color", detectedCommunityColors[detectedCommunity] || "#95a5a6");
    
    // Add border to show original vs detected community match
    const originalMatch = attributes.originalCommunity === detectedCommunity;
    graph.setNodeAttribute(node, "borderSize", originalMatch ? 2 : 0);
    graph.setNodeAttribute(node, "borderColor", originalMatch ? "#27ae60" : "#e74c3c");
  });
  
  // Calculate clustering statistics
  const communityStats = {};
  Object.entries(communities).forEach(([node, community]) => {
    if (!communityStats[community]) {
      communityStats[community] = { count: 0, nodes: [] };
    }
    communityStats[community].count++;
    communityStats[community].nodes.push(node);
  });
  
  setClusterStats(communityStats);
  loadGraph(graph);
  
  // Apply force-directed layout to see community structure emerge
  start();
  setTimeout(() => stop(), 4000);
  
}, [loadGraph, start, stop]);

return (
  <div style={{ display: "flex", height: "600px" }}>
    <div style={{ flex: 1 }}>
      <SigmaContainer
        settings={{
          renderLabels: true,
          labelSize: 10,
          labelColor: { color: "#000" },
          defaultNodeBorderColor: "#000",
          // Optimize for community visualization
          minCameraRatio: 0.05,
          maxCameraRatio: 5
        }}
      >
        {/* Graph content rendered here */}
      </SigmaContainer>
    </div>
    
    {/* Community statistics panel */}
    <div style={{ 
      width: "250px", 
      padding: "20px", 
      backgroundColor: "#f8f9fa",
      overflowY: "auto"
    }}>
      <h3>Detected Communities</h3>
      {Object.entries(clusterStats).map(([communityId, stats]) => (
        <div key={communityId} style={{
          margin: "10px 0",
          padding: "10px",
          backgroundColor: "white",
          borderRadius: "5px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          <strong>Community {communityId}</strong>
          <div>Size: {stats.count} nodes</div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            Modularity-based grouping
          </div>
        </div>
      ))}
      
      <div style={{ marginTop: "20px", fontSize: "14px", color: "#666" }}>
        <strong>Legend:</strong>
        <div>• Green border: Correct detection</div>
        <div>• No border: Misclassified</div>
      </div>
    </div>
  </div>
);
}

```

---

## 10. Future Enhancements

* **Export Graph:** Button to save the current visual state (JSON) to local disk to "save" a session.
* **Screenshot:** Canvas to PNG export.
* **Filter Widgets:** Range sliders for "Degree Centrality" to hide disconnected nodes.

---

**End of Specification v2.0**
