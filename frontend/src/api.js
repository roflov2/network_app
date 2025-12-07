import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export const api = axios.create({
    baseURL: API_BASE_URL,
});

export const searchNodes = async (query) => {
    const response = await api.get(`/search?q=${query}`);
    return response.data;
};

export const getNeighbors = async (nodeId, allowedTypes) => {
    const params = allowedTypes ? { allowed_types: allowedTypes.join(',') } : {};
    const response = await api.get(`/neighbors/${nodeId}`, { params });
    return response.data;
};

export const getPaths = async (start, target) => {
    const response = await api.get(`/paths?start=${start}&target=${target}`);
    return response.data;
};

export const analyzeNetwork = async (startNode, nodes) => {
    const response = await api.post('/analyze', { start_node: startNode, nodes });
    return response.data;
};
