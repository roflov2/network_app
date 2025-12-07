// Entity type configuration
export const ENTITY_TYPES = {
    Document: { shape: 'star', color: '#6c757d' },
    Person: { shape: 'ellipse', color: '#4dabf7' },
    Organisation: { shape: 'triangle', color: '#ffd43b' },
    Phone: { shape: 'diamond', color: '#51cf66' },
    Website: { shape: 'hexagon', color: '#cc5de8' },
};

// Base graph styling
const BASE_STYLES = [
    {
        selector: 'node',
        style: {
            content: 'data(label)',
            'text-valign': 'bottom',
            'text-halign': 'center',
            'text-margin-y': 12,
            'text-wrap': 'wrap',
            'text-max-width': 140,
            width: 55,
            height: 55,
            'font-size': 11,
            color: '#eaeaea',
            'text-outline-color': '#1a1a2e',
            'text-outline-width': 2,
            'border-width': 2,
        },
    },
    {
        selector: 'edge',
        style: {
            width: 1.5,
            'line-color': '#707070',
            'curve-style': 'bezier',
            opacity: 0.6,
        },
    },
    // Type-specific styles
    ...Object.entries(ENTITY_TYPES).map(([type, cfg]) => ({
        selector: `node[type="${type}"]`,
        style: { 'background-color': cfg.color, shape: cfg.shape },
    })),
];

// Highlight styles
const HIGHLIGHT = {
    start: {
        'background-color': '#e94560',
        width: 80,
        height: 80,
        'border-width': 4,
        'border-color': '#fff',
        'font-size': 14,
    },
    target: {
        'background-color': '#51cf66',
        width: 80,
        height: 80,
        'border-width': 4,
        'border-color': '#fff',
        'font-size': 14,
    },
    selected: {
        'border-width': 4,
        'border-color': '#e94560',
    },
};

// Generate stylesheet with highlights
export const getStylesheet = (startNode, targetNode, selection) => {
    const styles = [...BASE_STYLES];

    if (startNode) {
        styles.push({ selector: `node[id="${startNode}"]`, style: HIGHLIGHT.start });
    }
    if (targetNode) {
        styles.push({ selector: `node[id="${targetNode}"]`, style: HIGHLIGHT.target });
    }

    if (selection) {
        // Handle PATH selection (list of nodes)
        if (selection.nodes) {
            const pathNodes = selection.nodes;
            // Dim all everything first
            styles.push(
                { selector: 'edge', style: { opacity: 0.1 } },
                { selector: 'node', style: { opacity: 0.3 } }
            );

            // Highlight nodes in path
            pathNodes.forEach(nodeId => {
                styles.push({
                    selector: `node[id="${nodeId}"]`,
                    style: {
                        'opacity': 1,
                        'border-width': 4,
                        'border-color': '#e94560'
                    }
                });
            });

            // Highlight edges between path nodes
            for (let i = 0; i < pathNodes.length - 1; i++) {
                const u = pathNodes[i];
                const v = pathNodes[i + 1];
                styles.push({
                    selector: `edge[id="${u}-${v}"], edge[id="${v}-${u}"]`,
                    style: { 'line-color': '#e94560', width: 4, opacity: 1 }
                });
            }

            // Keep start/target distinct if needed (they are already styled above, but order matters)
            // The above path style might override start/target colors if we aren't careful.
            // But usually start/target are endpoints of the path anyway.
        }
        // Handle SINGLE EDGE selection
        else if (selection.source && selection.target) {
            const { source, target } = selection;
            styles.push(
                { selector: 'edge', style: { opacity: 0.2 } },
                {
                    selector: `edge[id="${source}-${target}"], edge[id="${target}-${source}"]`,
                    style: { 'line-color': '#e94560', width: 4, opacity: 1 }
                },
                { selector: `node[id="${source}"], node[id="${target}"]`, style: HIGHLIGHT.selected }
            );
        }
    }

    return styles;
};

// Graph layout config
export const LAYOUT_CONFIG = {
    name: 'cose',
    animate: true,               // Enable animation for "physics" feel
    animationDuration: 1000,     // Duration of the physics simulation
    refresh: 20,                 // Number of ticks per frame; higher is faster but jerkier
    fit: true,                   // Fit to viewport
    padding: 30,                 // Padding on fit
    randomize: false,            // Keep existing positions if possible
    componentSpacing: 100,       // Distance between disconnected components
    nodeRepulsion: (node) => node.data('type') === 'Document' ? 2000000 : 400000, // Stronger repulsion for hub Documents
    nodeOverlap: 10,             // Node spacing prevent overlap
    idealEdgeLength: (edge) => edge.source().data('type') === 'Document' || edge.target().data('type') === 'Document' ? 200 : 100,
    edgeElasticity: 100,         // Higher = stiffer edges
    nestingFactor: 5,            // Nesting factor (default)
    gravity: 80,                 // Gravity to pull disjoint components together
    numIter: 1000,               // Run simulation longer
    initialTemp: 200,            // Initial temperature (higher = more movement)
    coolingFactor: 0.95,         // Cooling factor (lower = faster cooling)
    minTemp: 1.0                 // Minimum temperature to stop
};
