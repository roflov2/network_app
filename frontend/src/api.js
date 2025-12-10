import staticEdges from './staticData.json';

// Build graph structure from static data
const edges = staticEdges;
const nodes = new Set();
const nodeTypes = {};
const graph = {}; // adjacency list

// Build graph
edges.forEach(({ Source, Target, Target_Type }) => {
    nodes.add(Source);
    nodes.add(Target);
    nodeTypes[Target] = Target_Type;
    nodeTypes[Source] = nodeTypes[Source] || 'Document';

    if (!graph[Source]) graph[Source] = [];
    if (!graph[Target]) graph[Target] = [];
    graph[Source].push(Target);
    graph[Target].push(Source);
});

// Calculate global counts (connections to documents)
const documents = new Set(edges.filter(e =>
    ['MENTIONS', 'CONTAINS', 'HAS', 'APPEARS_IN', 'MENTIONED_IN', 'CONTAINED_IN', 'FOUND_IN'].includes(e.Edge_Type)
).flatMap(e => [e.Source, e.Target]).filter(n => n.startsWith('DOC-') || n.startsWith('REF-')));

const globalCounts = {};
nodes.forEach(n => {
    if (documents.has(n)) {
        globalCounts[n] = 0;
    } else {
        globalCounts[n] = (graph[n] || []).filter(nb => documents.has(nb)).length;
    }
});

// Search nodes
export const searchNodes = async (query) => {
    if (!query || query.length < 2) return [];
    const term = query.toLowerCase();
    const allNodes = Array.from(nodes).sort();
    return allNodes
        .filter(n => n.toLowerCase().includes(term))
        .slice(0, 50)
        .map(n => ({ label: n, value: n }));
};

// Get 2-hop neighbors
export const getNeighbors = async (nodeId, allowedTypes) => {
    if (!nodes.has(nodeId)) {
        return { elements: [], table_data: [] };
    }

    const allowed = allowedTypes ? new Set(allowedTypes) : new Set(Object.values(nodeTypes));
    const MAX_NODES = 100;

    // First hop
    const firstHop = (graph[nodeId] || []).filter(n => allowed.has(nodeTypes[n]));

    // Second hop with scoring
    const branchData = {};
    firstHop.forEach(fh => {
        const secondHop = new Set(
            (graph[fh] || []).filter(n => n !== nodeId && allowed.has(nodeTypes[n]))
        );
        const score = Array.from(secondHop).reduce((sum, n) => sum + (globalCounts[n] || 0), 0);
        branchData[fh] = { secondHop, score };
    });

    // Greedy selection
    const selected = new Set([nodeId]);
    const sortedBranches = Object.entries(branchData).sort((a, b) => b[1].score - a[1].score);

    for (const [fh, { secondHop }] of sortedBranches) {
        if (selected.size >= MAX_NODES) break;

        const newNodes = Array.from(secondHop).filter(n => !selected.has(n));

        if (selected.size + 1 + newNodes.length <= MAX_NODES) {
            selected.add(fh);
            newNodes.forEach(n => selected.add(n));
        } else if (selected.size + 2 <= MAX_NODES) {
            selected.add(fh);
            const remaining = MAX_NODES - selected.size;
            newNodes.sort((a, b) => (globalCounts[b] || 0) - (globalCounts[a] || 0));
            newNodes.slice(0, remaining).forEach(n => selected.add(n));
        }
    }

    // Build elements
    const elements = [];
    const seenEdges = new Set();

    // Nodes
    selected.forEach(n => {
        elements.push({
            data: {
                id: n,
                label: globalCounts[n] ? `${n}\n[${globalCounts[n]}]` : n,
                type: nodeTypes[n] || 'Document',
                count: globalCounts[n] || 0
            }
        });
    });

    // Edges
    selected.forEach(u => {
        (graph[u] || []).forEach(v => {
            if (selected.has(v)) {
                const edgeId = [u, v].sort().join('-');
                if (!seenEdges.has(edgeId)) {
                    elements.push({ data: { source: u, target: v, id: `${u}-${v}` } });
                    seenEdges.add(edgeId);
                }
            }
        });
    });

    // Table data
    const tableData = [];
    seenEdges.clear();
    selected.forEach(u => {
        (graph[u] || []).forEach(v => {
            if (selected.has(v)) {
                const edgeId = [u, v].sort().join('-');
                if (!seenEdges.has(edgeId)) {
                    const edge = edges.find(e =>
                        (e.Source === u && e.Target === v) || (e.Source === v && e.Target === u)
                    );
                    tableData.push({
                        Source: u,
                        Source_Count: globalCounts[u] || 0,
                        Target: v,
                        Target_Count: globalCounts[v] || 0,
                        Edge_Type: edge?.Edge_Type || 'CONNECTED'
                    });
                    seenEdges.add(edgeId);
                }
            }
        });
    });

    tableData.sort((a, b) => b.Target_Count - a.Target_Count);

    return { elements, table_data: tableData };
};

// BFS for shortest paths
export const getPaths = async (start, target) => {
    if (!nodes.has(start) || !nodes.has(target)) {
        return { elements: [], table_data: [], message: 'Node not found' };
    }

    // BFS to find all shortest paths
    const paths = [];
    const queue = [[start]];
    const visited = new Set();
    let shortestLength = Infinity;

    while (queue.length > 0 && paths.length < 20) {
        const path = queue.shift();
        const node = path[path.length - 1];

        if (path.length > shortestLength) break;

        if (node === target) {
            shortestLength = path.length;
            paths.push(path);
            continue;
        }

        if (visited.has(node) && path.length > 1) continue;
        visited.add(node);

        for (const neighbor of (graph[node] || [])) {
            if (!path.includes(neighbor)) {
                queue.push([...path, neighbor]);
            }
        }
    }

    if (paths.length === 0) {
        return { elements: [], table_data: [], message: 'No path found' };
    }

    // Collect path nodes
    const pathNodes = new Set();
    paths.forEach(p => p.forEach(n => pathNodes.add(n)));

    // Build elements
    const elements = [];
    const seenEdges = new Set();

    pathNodes.forEach(n => {
        elements.push({
            data: {
                id: n,
                label: n,
                type: nodeTypes[n] || 'Document'
            }
        });
    });

    pathNodes.forEach(u => {
        (graph[u] || []).forEach(v => {
            if (pathNodes.has(v)) {
                const edgeId = [u, v].sort().join('-');
                if (!seenEdges.has(edgeId)) {
                    elements.push({ data: { source: u, target: v, id: `${u}-${v}` } });
                    seenEdges.add(edgeId);
                }
            }
        });
    });

    // Path table
    const tableData = paths.map((p, i) => ({
        Path: i + 1,
        Length: p.length - 1,
        Route: p.map(n => `${n}[${globalCounts[n] || 0}]`).join(' -> '),
        Nodes: p
    }));

    return { elements, table_data: tableData };
};
