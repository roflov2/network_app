import React, { useEffect, useRef } from "react";
import Graph from "graphology";
import Sigma from "sigma";

export default function SigmaPlayground() {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // 1. Create Graph
        const graph = new Graph();
        graph.addNode("1", { label: "Node 1", x: 0, y: 0, size: 10, color: "blue" });
        graph.addNode("2", { label: "Node 2", x: 1, y: 1, size: 20, color: "red" });
        graph.addEdge("1", "2", { size: 5, color: "purple" });

        // 2. Instantiate Sigma
        // We need to clean up instance on unmount
        const renderer = new Sigma(graph, containerRef.current);

        // Cleanup
        return () => {
            renderer.kill();
        };
    }, []);

    return (
        <div
            ref={containerRef}
            style={{ width: "800px", height: "600px", background: "white", border: "1px solid #ccc" }}
        />
    );
}
