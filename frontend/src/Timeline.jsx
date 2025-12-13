import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Timeline = ({ data, title }) => {
    // If no data, don't render anything
    if (!data || data.length === 0) return null;

    // Modern dark theme tooltip style
    const tooltipStyle = {
        backgroundColor: '#1a1a2e',
        border: '1px solid #707070',
        borderRadius: '4px',
        padding: '8px',
        color: '#eaeaea',
        fontSize: '12px'
    };

    return (
        <div className="timeline-container" style={{
            width: '100%',
            height: '180px',
            backgroundColor: 'var(--bg-card)',
            borderTop: '1px solid var(--border)',
            padding: '10px 20px',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{
                display: 'flex',
                justifybox: 'space-between',
                marginBottom: '5px',
                color: '#eaeaea',
                fontSize: '14px',
                fontWeight: '500'
            }}>
                <span>Activity Timeline: {title}</span>
            </div>

            <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <XAxis
                            dataKey="date"
                            tick={{ fill: '#9ca3af', fontSize: 10 }}
                            axisLine={{ stroke: '#707070' }}
                            tickLine={false}
                        />
                        <YAxis
                            hide={true}
                        />
                        <Tooltip
                            contentStyle={tooltipStyle}
                            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                        />
                        <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill="#ff0055" />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default Timeline;
