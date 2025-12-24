import Graph from 'graphology';
import louvain from 'graphology-communities-louvain';
import Fuse from 'fuse.js';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import betweenness from 'graphology-metrics/centrality/betweenness';
import degree from 'graphology-metrics/centrality/degree';

// Node type color mapping (Website brand palette)
const NODE_TYPE_COLORS = {
    'Document': '#6B7280',       // Neutral grey (not part of brand, but works well)
    'Person': '#0F52BA',         // Sapphire (primary entities)
    'Phone': '#F28500',          // Tangerine (contact/communication)
    'Organisation': '#483C32',   // Taupe (organizations)
    'Organization': '#483C32',   // Taupe (alternate spelling)
    'Email': '#E0115F',          // Ruby (digital contact)
    'Website': '#8B5CF6',        // Purple (web entities)
    'Cryptocurrency': '#F28500', // Tangerine (financial)
    'Wallet': '#F28500',         // Tangerine (financial)
};

// Secondary color palette for overflow node types
// Curated to complement primary brand colors (Sapphire, Ruby, Tangerine, Taupe, Charcoal)
const SECONDARY_PALETTE = [
    '#8B5CF6', // Purple - complements Sapphire
    '#10B981', // Emerald - complements Tangerine
    '#F59E0B', // Amber - warm complement
    '#3B82F6', // Sky Blue - lighter Sapphire variant
    '#EC4899', // Pink - lighter Ruby variant
    '#6366F1', // Indigo - cool complement
    '#14B8A6', // Teal - between blue and green
    '#A855F7', // Violet - richer purple
    '#F97316', // Deep Orange - Tangerine variant
    '#06B6D4', // Cyan - cool accent
    '#D946EF', // Fuchsia - vibrant complement
    '#84CC16', // Lime - bright accent
    '#EF4444', // Red - bold accent
    '#8B4513', // Saddle Brown - earthy tone
    '#4B5563', // Cool Gray - neutral
];

// Generate a consistent color for unknown types
export function getColorForType(type) {
    if (NODE_TYPE_COLORS[type]) {
        return NODE_TYPE_COLORS[type];
    }

    // Use deterministic hash to select from secondary palette
    let hash = 0;
    for (let i = 0; i < type.length; i++) {
        hash = type.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Map hash to secondary palette index
    const index = Math.abs(hash) % SECONDARY_PALETTE.length;
    return SECONDARY_PALETTE[index];
}

export function processGraphData(data) {
    const graph = new Graph();
    // Import assumes data format { nodes: [], edges: [] }
    graph.import(data);
    return graph;
}

// Apply community detection and recolor nodes by community
export function detectCommunities(graph) {
    if (!graph) return { graph, stats: {} };

    // Create a copy to avoid mutating the original
    const communityGraph = graph.copy();

    // Run Louvain community detection
    louvain.assign(communityGraph);

    // Calculate community statistics
    const communityStats = {};

    communityGraph.forEachNode((node, attributes) => {
        const communityId = attributes.community;
        if (communityId !== undefined) {
            if (!communityStats[communityId]) {
                // Use secondary palette for community colors
                const communityColor = SECONDARY_PALETTE[communityId % SECONDARY_PALETTE.length];
                communityStats[communityId] = {
                    count: 0,
                    nodes: [],
                    color: communityColor
                };
            }
            communityStats[communityId].count++;
            communityStats[communityId].nodes.push(node);

            // Apply community color
            const communityColor = communityStats[communityId].color;
            communityGraph.setNodeAttribute(node, 'color', communityColor);
        }
    });

    return { graph: communityGraph, stats: communityStats };
}

// Grey out nodes not in the selected community (visual highlight instead of filter)
export function greyOutNonCommunityNodes(graph, communityId) {
    if (!graph || communityId === null || communityId === undefined) return graph;

    const modified = graph.copy();

    // Store original colors and grey out non-community nodes
    modified.forEachNode((node, attributes) => {
        if (attributes.community !== parseInt(communityId)) {
            // Grey out nodes not in selected community
            modified.setNodeAttribute(node, 'color', '#CCCCCC'); // Light grey instead of dark
            modified.setNodeAttribute(node, 'originalColor', attributes.color); // Store original
            modified.setNodeAttribute(node, 'zIndex', -10); // Very low z-index for greyed nodes
            modified.setNodeAttribute(node, 'size', (attributes.size || 5) * 0.7); // Smaller size
        } else {
            // Selected community nodes above greyed but below contour
            modified.setNodeAttribute(node, 'zIndex', -5);
        }
    });

    // Grey out edges that don't belong to the selected community
    modified.forEachEdge((edge, attributes, source, target) => {
        const sourceInCommunity = modified.getNodeAttribute(source, 'community') === parseInt(communityId);
        const targetInCommunity = modified.getNodeAttribute(target, 'community') === parseInt(communityId);

        if (!sourceInCommunity || !targetInCommunity) {
            // Hide edges that connect to nodes outside the community
            modified.setEdgeAttribute(edge, 'hidden', true);
        } else {
            // Ensure edges within community are visible
            modified.setEdgeAttribute(edge, 'hidden', false);
            // Make edges within community darker and more prominent
            modified.setEdgeAttribute(edge, 'color', '#444444'); // Dark grey for good contrast without being too harsh
            modified.setEdgeAttribute(edge, 'size', 3); // Thicker edges
        }
    });

    return modified;
}

// Filter graph to ONLY show nodes in the selected community (for Table view)
export function filterGraphByCommunity(graph, communityId) {
    if (!graph) return new Graph();
    if (communityId === null || communityId === undefined) return graph;

    const filtered = new Graph();
    const commId = parseInt(communityId);

    // Add nodes belonging to the community
    graph.forEachNode((node, attr) => {
        if (attr.community === commId) {
            filtered.addNode(node, attr);
        }
    });

    // Add edges where both source and target are in the community
    graph.forEachEdge((edge, attr, source, target) => {
        if (filtered.hasNode(source) && filtered.hasNode(target)) {
            filtered.addEdgeWithKey(edge, source, target, attr);
        }
    });

    return filtered;
}

// Calculate centrality for a community to find Hub and Bridge
export function getCommunityCentrality(graph, communityId) {
    if (!graph || communityId === null || communityId === undefined) return { hub: null, bridge: null };

    // 1. Create a subgraph for the community to calculate local centrality
    // (Centrality should be relative to the community structure)
    const communityGraph = filterGraphByCommunity(graph, communityId);

    if (communityGraph.order === 0) return { hub: null, bridge: null };

    // 2. Calculate Degree Centrality (Hub)
    // Degree is simple: who has the most connections within the community?
    const degrees = degree.degreeCentrality(communityGraph);
    let maxDegree = -1;
    let hubNode = null;

    for (const [node, score] of Object.entries(degrees)) {
        if (score > maxDegree) {
            maxDegree = score;
            hubNode = node;
        }
    }

    // 3. Calculate Betweenness Centrality (Bridge)
    // Betweenness is expensive, but community subgraphs are usually small enough.
    // Who acts as a bridge/connector within the community?
    const betweennessScores = betweenness(communityGraph);
    let maxBetweenness = -1;
    let bridgeNode = null;

    for (const [node, score] of Object.entries(betweennessScores)) {
        // Exclude the hub from being the bridge if possible, to show two different interesting nodes
        // unless it's overwhelmingly the bridge too.
        if (score > maxBetweenness) {
            maxBetweenness = score;
            bridgeNode = node;
        }
    }

    // Fallback: If bridge is same as hub, try to find second best bridge?
    // For now, allow them to be the same if one node dominates everything.

    return { hub: hubNode, bridge: bridgeNode };
}

export function applyLayoutAndCommunities(graph) {
    // 1. Detect Communities FIRST (Crucial Step)
    // We need to know who belongs together before we decide where to put them.
    const communities = louvain(graph);
    graph.forEachNode((node) => {
        graph.setNodeAttribute(node, 'community', communities[node]);
    });

    // 2. Analyze Community Counts to assign "Real Estate"
    const communityCounts = {};
    let totalNodes = 0;

    graph.forEachNode((node, attr) => {
        const comm = attr.community;
        communityCounts[comm] = (communityCounts[comm] || 0) + 1;
        totalNodes++;
    });

    const communityList = Object.keys(communityCounts);
    const angleStep = (2 * Math.PI) / communityList.length;
    const initialRadius = 1000; // Large radius to ensure separation

    // 3. Pre-Calculate Centrality for Sizing
    // (Making hubs bigger helps visual hierarchy)
    const degrees = {};
    graph.forEachNode(node => degrees[node] = graph.degree(node));

    // 4. Seeding Positions: The "Circle of Communities" Logic
    graph.forEachNode((node, attr) => {
        const commId = attr.community;

        // Find the "center" of this node's community
        // We map the community ID to an angle on a circle
        const commIndex = communityList.indexOf(String(commId));
        const angle = commIndex * angleStep;

        // Calculate the "Center of Gravity" for this specific community
        const communityCenterX = Math.cos(angle) * initialRadius;
        const communityCenterY = Math.sin(angle) * initialRadius;

        // Place the node randomly *around* its community center
        // (Adding jitter so they don't stack on top of each other)
        if (attr.x === undefined || attr.y === undefined) {
            graph.setNodeAttribute(node, 'x', communityCenterX + (Math.random() * 200 - 100));
            graph.setNodeAttribute(node, 'y', communityCenterY + (Math.random() * 200 - 100));
        }

        // Apply Logarithmic Sizing
        const degree = degrees[node] || 0;
        let size = 5 + (Math.log(degree + 1) * 3);

        // Visual Hierarchy: Reduce size of Document nodes
        if (attr.type === 'Document') {
            size *= 0.5; // Half size for structural nodes
        }

        graph.setNodeAttribute(node, 'size', size);

        // Apply Color by Type
        const nodeType = attr.type || 'Unknown';
        let color = getColorForType(nodeType);

        // Visual Hierarchy: Faint Documents
        if (nodeType === 'Document') {
            // Apply 60% opacity to the base grey
            color = color + '99';
        }

        graph.setNodeAttribute(node, 'color', color);
    });

    // 5. Run ForceAtlas2 to "Relax" the Graph
    // Since nodes are already grouped, we don't need aggressive gravity.
    // We just need to tighten the local connections.
    forceAtlas2.assign(graph, {
        iterations: 150, // Enough to settle
        settings: {
            gravity: 0.5,           // Lower gravity prevents communities merging back into a blob
            scalingRatio: 20,       // High scaling keeps communities distinct
            barnesHutOptimize: true,
            strongGravityMode: false, // OFF: We don't want to force a circle shape anymore
            outboundAttractionDistribution: true // Helps spread out hubs ("anti-hairball" setting)
        }
    });

    return graph;
}

export function buildSearchIndex(graph) {
    const serializedNodes = graph.mapNodes((node, attr) => ({
        id: node,
        ...attr
    }));

    return new Fuse(serializedNodes, {
        keys: ['label', 'id'],
        threshold: 0.3
    });
}

export function get2HopNeighborhood(graph, nodeId) {
    if (!graph.hasNode(nodeId)) return graph;

    const neighbors = new Set();
    neighbors.add(nodeId);

    // 1-Hop
    graph.forEachNeighbor(nodeId, (neighbor) => {
        neighbors.add(neighbor);
        // 2-Hop
        graph.forEachNeighbor(neighbor, (neighbor2) => {
            neighbors.add(neighbor2);
        });
    });

    // Create subgraph
    const subgraph = new Graph();
    // Copy nodes
    neighbors.forEach(node => {
        subgraph.addNode(node, graph.getNodeAttributes(node));
    });
    // Copy edges if both extremities exist
    graph.forEachEdge((edge, attr, source, target) => {
        if (neighbors.has(source) && neighbors.has(target)) {
            subgraph.addEdgeWithKey(edge, source, target, attr);
        }
    });

    return subgraph;
}

// === NEW: Pathfinding Logic (All Shortest Paths) ===
export function findShortestPath(graph, startNode, endNode) {
    if (!graph.hasNode(startNode) || !graph.hasNode(endNode)) return null;
    if (startNode === endNode) return [[startNode]];

    const queue = [startNode];
    const dist = new Map();
    dist.set(startNode, 0);
    const parents = new Map(); // node -> array of parents

    while (queue.length > 0) {
        const u = queue.shift();

        // Optimization: stop if we are going deeper than the found shortest path to target
        // (BFS guarantees first time we hit endNode we found min dist)
        if (dist.has(endNode) && dist.get(u) >= dist.get(endNode)) continue;

        const currentDist = dist.get(u);

        graph.forEachNeighbor(u, (v) => {
            if (!dist.has(v)) {
                // First time visit
                dist.set(v, currentDist + 1);
                parents.set(v, [u]);
                queue.push(v);
            } else if (dist.get(v) === currentDist + 1) {
                // Another optimal path to v found
                parents.get(v).push(u);
            }
        });
    }

    if (!parents.has(endNode)) return null; // No path found

    // Reconstruct all paths via DFS
    const allPaths = [];

    function buildPaths(current, path) {
        if (current === startNode) {
            allPaths.push([startNode, ...path]);
            return;
        }
        const pars = parents.get(current) || [];
        for (const p of pars) {
            buildPaths(p, [current, ...path]);
        }
    }

    buildPaths(endNode, []);
    return allPaths;
}

export function getPathSubgraph(graph, allPaths) {
    const subgraph = new Graph();

    // Normalize input to array of paths
    const paths = (Array.isArray(allPaths[0])) ? allPaths : [allPaths];

    paths.forEach(pathNodes => {
        // Add Nodes
        pathNodes.forEach(node => {
            if (graph.hasNode(node) && !subgraph.hasNode(node)) {
                subgraph.addNode(node, graph.getNodeAttributes(node));
            }
        });

        // Add Edges
        for (let i = 0; i < pathNodes.length - 1; i++) {
            const u = pathNodes[i];
            const v = pathNodes[i + 1];

            let edge = graph.edge(u, v);
            let source = u;
            let target = v;

            if (!edge) {
                edge = graph.edge(v, u);
                source = v;
                target = u;
            }

            if (edge && !subgraph.hasEdge(edge)) {
                subgraph.addEdgeWithKey(edge, source, target, graph.getEdgeAttributes(edge));
            }
        }
    });

    return subgraph;
}

// === NEW: Type-based Filtering ===
export function filterGraphByTypes(graph, selectedTypes, focusedNode = null) {
    // If no filter or empty, return original graph
    if (!selectedTypes || selectedTypes.size === 0) {
        return graph;
    }

    const filtered = new Graph();
    const nodesToInclude = new Set();

    // First pass: collect nodes matching type filter
    graph.forEachNode((node, attr) => {
        if (selectedTypes.has(attr.type)) {
            nodesToInclude.add(node);
        }
    });

    // Force-include focused node and its immediate neighbors (preserves selection context)
    if (focusedNode && graph.hasNode(focusedNode)) {
        nodesToInclude.add(focusedNode);

        // Include all neighbors of focused node for context
        graph.forEachNeighbor(focusedNode, (neighbor) => {
            nodesToInclude.add(neighbor);
        });
    }

    // Add all collected nodes to filtered graph
    nodesToInclude.forEach(node => {
        if (graph.hasNode(node)) {
            filtered.addNode(node, graph.getNodeAttributes(node));
        }
    });

    // Add edges where BOTH nodes are in filtered set
    graph.forEachEdge((edge, attr, source, target) => {
        if (filtered.hasNode(source) && filtered.hasNode(target)) {
            filtered.addEdgeWithKey(edge, source, target, attr);
        }
    });

    return filtered;
}

// === NEW: Document Collapse (Projection) ===
export function collapseDocuments(graph) {
    const collapsed = new Graph();

    // 1. Identify all document nodes
    const documentNodes = [];
    graph.forEachNode((node, attr) => {
        if (attr.type === 'Document') {
            documentNodes.push(node);
        }
    });

    // 2. For each document, connect all its neighbors to each other
    documentNodes.forEach(doc => {
        const neighbors = graph.neighbors(doc);

        // Create edges between all pairs of neighbors
        for (let i = 0; i < neighbors.length; i++) {
            for (let j = i + 1; j < neighbors.length; j++) {
                const node1 = neighbors[i];
                const node2 = neighbors[j];

                // Add nodes if not already present
                if (!collapsed.hasNode(node1)) {
                    collapsed.addNode(node1, graph.getNodeAttributes(node1));
                }
                if (!collapsed.hasNode(node2)) {
                    collapsed.addNode(node2, graph.getNodeAttributes(node2));
                }

                // Check if edge already exists
                const existingEdge = collapsed.edge(node1, node2);

                if (!existingEdge) {
                    // Create new edge
                    const edgeKey = `proj-${node1}-${node2}`;
                    collapsed.addEdgeWithKey(edgeKey, node1, node2, {
                        viaDocuments: [doc],
                        weight: 1,
                        size: 1,
                        color: '#999',
                        label: `Via 1 document`
                    });
                } else {
                    // Edge exists, increment weight and add document
                    const attr = collapsed.getEdgeAttributes(existingEdge);
                    attr.viaDocuments.push(doc);
                    attr.weight += 1;
                    attr.size = Math.min(attr.weight, 5); // Cap size at 5
                    attr.label = `Via ${attr.weight} document${attr.weight > 1 ? 's' : ''}`;
                    // No need to set attributes - getEdgeAttributes returns a mutable reference
                }
            }
        }
    });

    return collapsed;
}

// Helper to extract unique node types from graph
export function getNodeTypes(graph) {
    const types = new Set();
    graph.forEachNode((node, attr) => {
        if (attr.type) {
            types.add(attr.type);
        }
    });
    return Array.from(types).sort();
}
