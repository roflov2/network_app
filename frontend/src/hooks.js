import { useState, useEffect, useCallback, useRef } from 'react';

// Debounce hook for search inputs
export const useDebounce = (value, delay = 300) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
};

// Node search hook
export const useNodeSearch = (searchFn) => {
    const [query, setQuery] = useState('');
    const [options, setOptions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(null);

    const debouncedQuery = useDebounce(query, 200);

    useEffect(() => {
        if (debouncedQuery.length >= 2) {
            searchFn(debouncedQuery).then(setOptions).catch(() => setOptions([]));
            setIsOpen(true);
        } else {
            setOptions([]);
            setIsOpen(false);
        }
    }, [debouncedQuery, searchFn]);

    const select = useCallback((node) => {
        setSelected(node);
        setQuery(node.label);
        setIsOpen(false);
    }, []);

    const clear = useCallback(() => {
        setSelected(null);
        setQuery('');
        setOptions([]);
    }, []);

    return { query, setQuery, options, isOpen, setIsOpen, selected, select, clear };
};

// Graph data hook
export const useGraphData = (fetchFn, deps = []) => {
    const [data, setData] = useState({ elements: [], tableData: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetch = useCallback(async (...args) => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchFn(...args);
            setData(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [fetchFn]);

    const clear = useCallback(() => {
        setData({ elements: [], tableData: [] });
        setError(null);
    }, []);

    return { ...data, loading, error, fetch, clear };
};

// CSV export utility
export const exportToCsv = (data, filename = 'export.csv') => {
    if (!data?.length) return;
    const headers = Object.keys(data[0]);
    const csv = [
        headers.join(','),
        ...data.map(row => headers.map(h => `"${row[h] ?? ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
};
