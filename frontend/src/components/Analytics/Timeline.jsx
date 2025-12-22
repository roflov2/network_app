import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Calendar, ChevronUp, ChevronDown } from 'lucide-react';

export default function Timeline({ graph, sidebarOpen, sidebarWidth }) {
    const [granularity, setGranularity] = useState('year'); // 'year' | 'month'
    const [isExpanded, setIsExpanded] = useState(true);

    // Generate/Extract Dates
    // Since our demo data has no dates, we mock them deterministically based on node ID
    const timelineData = useMemo(() => {
        if (!graph) return [];

        const nodes = graph.nodes();
        const dates = nodes.map((node, i) => {
            // Clump nodes to create peaks in the chart
            // Cluster 0: Recent (0-60 days)
            // Cluster 1: ~1 Year ago
            // Cluster 2: ~2 Years ago
            const clusterIdx = i % 3;
            const yearDays = 365;
            // Base offset: 0, 1 year, or 2 years
            const baseOffset = clusterIdx * yearDays;

            // Jitter: spread within 45 days so they fall in 1-2 months
            const jitter = (node.charCodeAt(0) * 17) % 45;

            const offsetDays = baseOffset + jitter;

            const baseDate = new Date();
            const date = new Date(baseDate);
            date.setDate(date.getDate() - offsetDays);
            return date;
        });

        // 1. Identify Range
        if (dates.length === 0) return [];
        const timestamps = dates.map(d => d.getTime());
        const minTime = Math.min(...timestamps);
        const maxTime = Math.max(...timestamps);

        const startDate = new Date(minTime);
        const endDate = new Date(maxTime);

        // Align start/end to granularity boundaries
        if (granularity === 'year') {
            startDate.setMonth(0, 1);
            endDate.setMonth(11, 31);
        } else {
            startDate.setDate(1); // Start of month
            endDate.setMonth(endDate.getMonth() + 1, 0); // End of month
        }

        // 2. Aggregate counts
        const aggregated = {};
        dates.forEach(date => {
            let key;
            if (granularity === 'year') {
                key = date.getFullYear().toString();
            } else {
                // Key format: YYYY-MM for sorting/filling
                const m = date.getMonth() + 1;
                key = `${date.getFullYear()}-${m.toString().padStart(2, '0')}`;
            }
            aggregated[key] = (aggregated[key] || 0) + 1;
        });

        // 3. Fill Zeros
        const result = [];
        const current = new Date(startDate);

        while (current <= endDate) {
            let key, name;

            if (granularity === 'year') {
                key = current.getFullYear().toString();
                name = key;
                // Next
                current.setFullYear(current.getFullYear() + 1);
            } else {
                const m = current.getMonth() + 1;
                key = `${current.getFullYear()}-${m.toString().padStart(2, '0')}`;
                name = current.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }); // "Jan 2023"
                // Next
                current.setMonth(current.getMonth() + 1);
            }

            result.push({
                name,
                count: aggregated[key] || 0,
                sortValue: granularity === 'year' ? parseInt(key) : new Date(key).getTime() // APPROX
            });
        }

        return result;

    }, [graph, granularity]);

    if (!graph) return null;

    return (
        <div
            style={{ left: sidebarOpen ? sidebarWidth : 0 }}
            className={`absolute bottom-0 right-0 z-20 bg-white/95 dark:bg-zinc-900/95 border-t border-zinc-200 dark:border-zinc-700 transition-all duration-300 ease-in-out ${isExpanded ? 'h-64' : 'h-12'}`}
        >

            {/* Header / Toggle */}
            <div className="flex items-center justify-between px-4 h-12 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                        <Calendar size={16} />
                        <span>Temporal Distribution</span>
                    </div>

                    {/* Granularity Switcher */}
                    <div className="flex bg-zinc-200 dark:bg-zinc-700 rounded-md p-1">
                        <button
                            onClick={() => setGranularity('year')}
                            className={`px-3 py-1 text-xs font-medium rounded ${granularity === 'year' ? 'bg-white dark:bg-zinc-600 shadow-sm text-blue-600 dark:text-blue-400' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
                        >
                            Year (Annual)
                        </button>
                        <button
                            onClick={() => setGranularity('month')}
                            className={`px-3 py-1 text-xs font-medium rounded ${granularity === 'month' ? 'bg-white dark:bg-zinc-600 shadow-sm text-blue-600 dark:text-blue-400' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
                        >
                            Month (Detailed)
                        </button>
                    </div>
                </div>

                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors"
                >
                    {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                </button>
            </div>

            {/* Chart Area */}
            {isExpanded && (
                <div className="w-full h-[calc(100%-3rem)] p-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={timelineData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 11, fill: '#6B7280' }}
                                tickLine={false}
                                axisLine={false}
                                minTickGap={30}
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: '#6B7280' }}
                                tickLine={false}
                                axisLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip
                                cursor={{ stroke: '#3B82F6', strokeWidth: 2 }}
                                contentStyle={{
                                    borderRadius: '8px',
                                    border: 'none',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    padding: '8px 12px'
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="#3B82F6"
                                strokeWidth={2}
                                dot={granularity === 'year' ? { r: 4, fill: '#3B82F6', strokeWidth: 2 } : false}
                                activeDot={{ r: 6, fill: '#3B82F6' }}
                                animationDuration={500}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
