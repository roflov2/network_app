import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Calendar, ChevronUp, ChevronDown } from 'lucide-react';
import PixelButton from '../UI/PixelButton';

export default function Timeline({ graph, sidebarOpen, sidebarWidth }) {
    const [granularity, setGranularity] = useState('year'); // 'year' | 'month'
    const [isExpanded, setIsExpanded] = useState(false);

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
            className={`absolute bottom-0 right-0 z-20 bg-white border-t-2 border-retro-border shadow-pro transition-all duration-300 ease-in-out ${isExpanded ? 'h-64' : 'h-10'}`}
        >
            {isExpanded ? (
                <>
                    {/* Expanded Header */}
                    <div className="flex items-center justify-between px-4 h-12 bg-slate-50 border-b-2 border-retro-border">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm font-brand tracking-wide text-retro-primary uppercase">
                                <Calendar size={16} />
                                <span>Temporal Distribution</span>
                            </div>

                            {/* Granularity Switcher */}
                            <div className="flex gap-2">
                                <PixelButton
                                    onClick={() => setGranularity('year')}
                                    active={granularity === 'year'}
                                    size="sm"
                                    className="!text-[10px] !px-2 !py-1"
                                >
                                    Year
                                </PixelButton>
                                <PixelButton
                                    onClick={() => setGranularity('month')}
                                    active={granularity === 'month'}
                                    size="sm"
                                    className="!text-[10px] !px-2 !py-1"
                                >
                                    Month
                                </PixelButton>
                            </div>
                        </div>

                        <PixelButton
                            onClick={() => setIsExpanded(false)}
                            size="sm"
                            className="!p-1"
                            title="Collapse"
                        >
                            <ChevronDown size={14} />
                        </PixelButton>
                    </div>
                </>
            ) : (
                /* Collapsed Handle */
                <button
                    onClick={() => setIsExpanded(true)}
                    className="w-full h-full flex items-center justify-between px-4 hover:bg-slate-50 transition-colors cursor-pointer"
                    title="Expand Temporal Distribution"
                >
                    <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-retro-border">
                        <Calendar size={14} />
                        <span>Temporal Distribution</span>
                    </div>
                    <ChevronUp size={16} className="text-retro-muted" />
                </button>
            )}

            {/* Chart Area */}
            {isExpanded && (
                <div className="w-full h-[calc(100%-3rem)] p-4 bg-white">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={timelineData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid stroke="#e2e8f0" vertical={false} strokeDasharray="0" />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'JetBrains Mono' }}
                                tickLine={false}
                                axisLine={{ stroke: '#e2e8f0' }}
                                minTickGap={30}
                            />
                            <YAxis
                                tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'JetBrains Mono' }}
                                tickLine={false}
                                axisLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip
                                cursor={{ stroke: '#2563eb', strokeWidth: 1, strokeDasharray: '4 4' }}
                                contentStyle={{
                                    borderRadius: '0px',
                                    border: '2px solid #1e293b',
                                    boxShadow: '4px 4px 0px 0px #1e293b',
                                    backgroundColor: '#ffffff',
                                    fontFamily: 'JetBrains Mono',
                                    fontSize: '12px',
                                    padding: '8px 12px'
                                }}
                            />
                            <Line
                                type="step"
                                dataKey="count"
                                stroke="#2563eb"
                                strokeWidth={2}
                                dot={{ fill: '#fff', stroke: '#2563eb', strokeWidth: 2, r: 3 }}
                                activeDot={{ r: 5, fill: '#2563eb', stroke: '#1e293b', strokeWidth: 2 }}
                                animationDuration={500}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
