// API Base URL - Railway backend
const API_BASE = 'https://networkapp-production.up.railway.app';

// Search nodes
export const searchNodes = async (query) => {
    if (!query || query.length < 2) return [];

    try {
        const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Search failed');
        return await response.json();
    } catch (error) {
        console.error('Search error:', error);
        return [];
    }
};

// Get 2-hop neighbors
export const getNeighbors = async (nodeId, allowedTypes) => {
    try {
        let url = `${API_BASE}/neighbors/${encodeURIComponent(nodeId)}`;
        if (allowedTypes && allowedTypes.length > 0) {
            url += `?allowed_types=${allowedTypes.join(',')}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to get neighbors');
        return await response.json();
    } catch (error) {
        console.error('Neighbors error:', error);
        return { elements: [], table_data: [] };
    }
};

// Get shortest paths between two nodes
export const getPaths = async (start, target) => {
    try {
        const response = await fetch(
            `${API_BASE}/paths?start=${encodeURIComponent(start)}&target=${encodeURIComponent(target)}`
        );
        if (!response.ok) throw new Error('Failed to get paths');
        return await response.json();
    } catch (error) {
        console.error('Paths error:', error);
        return { elements: [], table_data: [], message: 'Error fetching paths' };
    }
};

// Get list of communities
export const getCommunities = async () => {
    try {
        const response = await fetch(`${API_BASE}/communities`);
        if (!response.ok) throw new Error('Failed to get communities');
        return await response.json();
    } catch (error) {
        console.error('Communities error:', error);
        return { elements: [], table_data: [] };
    }
};

// Get community subgraph
export const getCommunityGraph = async (commId) => {
    try {
        const response = await fetch(`${API_BASE}/community/${encodeURIComponent(commId)}`);
        if (!response.ok) throw new Error('Failed to get community graph');
        return await response.json();
    } catch (error) {
        console.error('Community graph error:', error);
        return { elements: [], table_data: [] };
    }
};
