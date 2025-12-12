// Entity type configuration
export const ENTITY_TYPES = {
    Document: { shape: 'star', color: '#6c757d' },
    Person: { shape: 'ellipse', color: '#4dabf7' },
    Organisation: { shape: 'triangle', color: '#ffd43b' },
    Phone: { shape: 'diamond', color: '#51cf66' },
    Website: { shape: 'hexagon', color: '#cc5de8' },
    Crypto: { shape: 'octagon', color: '#f59f00' },
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

// Primary palette (shades can be generated or selected)
const PRIMARY_PALETTE = {
    BLUE: '#4da6ff',   // Community 0
    RED: '#ff6666',    // Community 1
    GREEN: '#00cc66',  // Community 2
    PURPLE: '#cc66ff', // Community 3
    ORANGE: '#ffb84d', // Community 4
    TEAL: '#00e6e6',   // Community 5
    PINK: '#ff66b3',   // Community 6
    YELLOW: '#e6e600', // Community 7
    NAVY: '#3333cc'    // Community 8
};

// Map entity types to relative lightness/saturation adjustments (mocked by using alpha/hex variation if possible, or mapping to specific shades)
// Simpler approach: Use the same hue but different brightness based on type hash or static mapping.
const TYPE_SHADE_OFFSET = {
    Document: 0,
    Person: 20,
    Organisation: 40,
    Phone: -20,
    Website: -40,
    Crypto: 60
};

// Helper to darken/lighten hex color
const adjustColor = (color, amount) => {
    return color; // Placeholder for now, simple implementation complex in pure JS without lib. 
    // For now, we'll just stick to the base color to ensure consistency as requested, 
    // unless the user strictly needs distinct shades per type. 
    // "Use the primary pallette colours, with shades to make it look more tidy."
    // Let's implement a simple hash-based variation if needed, or just standard colors.
    // Actually, Cytoscape supports 'opacity'. Maybe use that?
    // Or we just accept the base community color for ALL types in that community to be "tidy".
    // User said: "colors consistent with the community colour".
};


// Quick consistent color generator for communities using Primary Palette
export const getCommunityColor = (id) => {
    const palette = Object.values(PRIMARY_PALETTE);
    return palette[parseInt(id) % palette.length] || '#eaeaea';
};

// Generate stylesheet with highlights
export const getStylesheet = (startNode, targetNode, selection, viewMode) => {
    // If in community mode, override base styles for node coloring
    let currentBaseStyles = BASE_STYLES;

    if (viewMode === 'community') {
        currentBaseStyles = [
            // Filter out existing type-based background colors but KEEP everything else
            ...BASE_STYLES.filter(s => !s.selector.includes('node[type=')),
            // Re-apply shapes based on type
            ...Object.entries(ENTITY_TYPES).map(([type, cfg]) => ({
                selector: `node[type="${type}"]`,
                style: { 'shape': cfg.shape }
            })),
            // Apply community-based coloring
            {
                selector: 'node[community]',
                style: {
                    'background-color': (ele) => getCommunityColor(ele.data('community')),
                    // Optional: Make different types slightly distinct in opacity or brightness if needed
                    // 'background-opacity': (ele) => ele.data('type') === 'Document' ? 1 : 0.7 
                }
            },
            // Special styling for the Meta-Graph "Community" nodes
            {
                selector: 'node[type="Community"]',
                style: {
                    'shape': 'ellipse',
                    'width': (ele) => Math.max(60, Math.min(180, (ele.data('size') || 10) * 1.8)),
                    'height': (ele) => Math.max(60, Math.min(180, (ele.data('size') || 10) * 1.8)),
                    'background-color': (ele) => getCommunityColor(ele.data('community')),
                    'font-size': 24,           // Lager font for importance
                    'font-weight': 'bold',
                    'border-width': 2,         // Standard border
                    'border-color': '#fff',
                    'text-valign': 'bottom',   // Consistent positioning (below)
                    'text-halign': 'center',
                    'text-margin-y': 8,
                    'color': '#eaeaea',        // Consistent text color
                    'text-outline-width': 3,
                    'text-outline-color': '#1a1a2e' // Consistent background match
                }
            }
        ];
    }

    const styles = [...currentBaseStyles];

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
    animate: true,
    animationDuration: 1500,     // Slower animation for bounce
    animationEasing: 'ease-out-elastic', // Bounce physics!
    refresh: 20,
    fit: true,
    padding: 30,
    randomize: false,
    componentSpacing: 120,
    // Increased repulsion for better separation
    nodeRepulsion: (node) =>
        node.data('type') === 'Community' ? 10000000 : // Massive repulsion for meta-bubbles
            node.data('type') === 'Document' ? 2000000 : 400000,
    nodeOverlap: 20,
    idealEdgeLength: (edge) =>
        edge.source().data('type') === 'Community' ? 400 : // Longer edges for meta-graph
            edge.source().data('type') === 'Document' || edge.target().data('type') === 'Document' ? 200 : 100,
    edgeElasticity: 100,
    nestingFactor: 5,
    gravity: 80,
    numIter: 1000,
    initialTemp: 200,
    coolingFactor: 0.95,
    minTemp: 1.0
};
