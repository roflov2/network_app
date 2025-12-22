import React, { useEffect, useRef, useState } from "react";
import GraphControls from "./GraphControls";
import Sigma from "sigma";
import { NodeCircleProgram, EdgeLineProgram, EdgeArrowProgram } from "sigma/rendering";
import { bindWebGLLayer, createContoursProgram } from "@sigma/layer-webgl";

import FA2Layout from "graphology-layout-forceatlas2/worker";
import Graph from 'graphology';
import { get2HopNeighborhood } from "../../utils/graph-logic";

export default function InteractiveGraph({ graphData, focusedNode, focusedEdge, onNodeClick, onEdgeClick, selectedCommunity, communityStats }) {
    const containerRef = useRef(null);
    const sigmaRef = useRef(null);
    const layoutRef = useRef(null);
    const contourCleanupRef = useRef(null); // Track contour layer cleanup
    const [hoveredNode, setHoveredNode] = useState(null);
    const [displayedGraph, setDisplayedGraph] = useState(null);
    const [clickedNodes, setClickedNodes] = useState(new Set());
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        if (!graphData) return;
        let sub = graphData;
        if (focusedNode) {
            sub = get2HopNeighborhood(graphData, focusedNode);
            setClickedNodes(prev => {
                const newSet = new Set(prev);
                newSet.add(focusedNode);
                return newSet;
            });
        }
        setDisplayedGraph(sub);
    }, [graphData, focusedNode, focusedEdge]);

    useEffect(() => {
        if (!containerRef.current) return;
        const initialGraph = new Graph();

        // Optimized Sigma settings for performance with large graphs
        const sigmaInstance = new Sigma(initialGraph, containerRef.current, {
            // **Rendering Optimizations**
            renderLabels: true,
            renderEdgeLabels: false,              // Edge labels are expensive
            labelWeight: "bold",
            allowInvalidContainer: true,

            // **Efficient Programs**
            defaultNodeType: "circle",            // Fastest node rendering
            defaultEdgeType: "line",              // Simple edge rendering
            nodeProgramClasses: { circle: NodeCircleProgram },
            edgeProgramClasses: { line: EdgeLineProgram, arrow: EdgeArrowProgram },

            // **Dynamic Quality Reduction**
            hideEdgesOnMove: true,                // Critical for performance during camera movement
            hideLabelsOnMove: true,               // Reduces text rendering overhead

            // **Level-of-Detail (LOD) Settings**
            labelRenderedSizeThreshold: 8,        // Hide small labels
            edgeRenderedSizeThreshold: 0.5,       // Hide thin edges

            // **Camera Settings**
            maxCameraRatio: 10,                   // Limit zoom out
            minCameraRatio: 0.05,                 // Limit zoom in
            zoomingRatio: 0.2,                    // Faster zoom steps
            doubleClickZoomingRatio: 2.5,         // Bigger zoom jumps

            // **Animation Performance**
            animationsTime: 150,                  // Shorter, snappier animations

            // **WebGL Optimizations**
            batchEdgesDrawing: true,              // Batch edge rendering operations
        });

        sigmaInstance.on("enterNode", (event) => {
            setHoveredNode(event.node);
            containerRef.current.style.cursor = "pointer";
        });
        sigmaInstance.on("leaveNode", () => {
            setHoveredNode(null);
            containerRef.current.style.cursor = "default";
        });
        sigmaInstance.on("clickNode", (event) => { if (onNodeClick) onNodeClick(event.node); });

        // ADDED: Edge Click Handler
        sigmaInstance.on("clickEdge", (event) => {
            if (onEdgeClick) onEdgeClick(event.edge);
        });

        sigmaInstance.on("clickStage", () => {
            if (onNodeClick) onNodeClick(null);
            // Reset View logic
            sigmaInstance.getCamera().animate({ ratio: 1.2, x: 0.5, y: 0.5 }, { duration: 500 });
        });

        sigmaRef.current = sigmaInstance;
        return () => { if (sigmaRef.current) sigmaRef.current.kill(); };
    }, []);

    useEffect(() => {
        if (!sigmaRef.current || !displayedGraph) return;

        const sigmaGraph = sigmaRef.current.getGraph();
        if (layoutRef.current) layoutRef.current.stop();

        sigmaGraph.clear();

        // Z-INDEX ORDERING: Add Documents first (bottom layer), then Entities (top layer)

        // Pass 1: Documents
        displayedGraph.forEachNode((node, attr) => {
            if (attr.type === 'Document') {
                sigmaGraph.addNode(node, {
                    ...attr,
                    x: attr.x ?? Math.random(),
                    y: attr.y ?? Math.random(),
                    size: attr.size ?? 12,
                    zIndex: 0, // Bottom layer
                    type: 'circle'
                });
            }
        });

        // Pass 2: Entities (everything else)
        displayedGraph.forEachNode((node, attr) => {
            if (attr.type !== 'Document') {
                sigmaGraph.addNode(node, {
                    ...attr,
                    x: attr.x ?? Math.random(),
                    y: attr.y ?? Math.random(),
                    size: attr.size ?? 25,
                    zIndex: 1, // Top layer
                    type: 'circle'
                });
            }
        });

        displayedGraph.forEachEdge((edge, attr, source, target, sourceAttr, targetAttr) => {
            if (sigmaGraph.hasNode(source) && sigmaGraph.hasNode(target)) {
                sigmaGraph.addEdgeWithKey(edge, source, target, {
                    ...attr,
                    type: 'line',
                    size: attr.size ?? 1
                });
            }
        });

        // Optimized FA2 settings for quick stabilization with minimal jitter
        const layout = new FA2Layout(sigmaGraph, {
            settings: {
                gravity: 1,
                scalingRatio: 100,
                barnesHutOptimize: true,
                slowDown: 10,           // Higher = faster convergence, less jitter
                linLogMode: true,       // Better for hub-and-spoke networks
                adjustSizes: false      // Don't adjust based on node degree
            }
        });
        layout.start();
        layoutRef.current = layout;

        // SAFE FIT LOGIC
        // User confirmed "Reset View" works.
        // Reset View is: x:0.5, y:0.5, ratio:1
        // We replicate this but add Zoom Out (ratio 1.2) + Vertical Bias (y: 0.6)
        const fitGraphToScreen = () => {
            if (!sigmaRef.current || !containerRef.current || focusedEdge) return;

            // Simple Static Fit - Trust the Reset Logic
            // x: 0.5 (Center)
            // y: 0.6 (Shifted slightly down to move graph up for timeline)
            // ratio: 1.2 (Slightly zoomed out from standard "1")
            sigmaRef.current.getCamera().animate(
                { x: 0.5, y: 0.6, ratio: 1.2 },
                { duration: 600 }
            );
        };

        fitGraphToScreen();

        // Stop layout after shorter time for stability (reduced jitter)
        setTimeout(() => {
            if (layout.isRunning()) {
                layout.stop();
            }
        }, 800);

        sigmaRef.current.refresh();

    }, [displayedGraph, focusedEdge]);

    useEffect(() => {
        if (!sigmaRef.current || !displayedGraph) return;

        sigmaRef.current.setSetting("nodeReducer", (node, data) => {
            const res = { ...data };

            // Apply opacity if set in data
            if (data.opacity !== undefined) {
                res.color = data.color + Math.round(data.opacity * 255).toString(16).padStart(2, '0');
            }

            // Default Z-Index based on type (Documents=0, Entities=1)
            // We set this during graph construction, but can enforce here if needed.
            // Highlighted nodes get zIndex 10.

            if (hoveredNode && displayedGraph.hasNode(hoveredNode)) {
                if (node === hoveredNode) {
                    res.highlighted = true;
                    // Restore full opacity if it was faint
                    if (res.color && res.color.length > 7) res.color = res.color.substring(0, 7);

                    res.size = (data.size || 5) * 1.5;
                    res.color = "#ff6b6b";
                    res.zIndex = 10;
                } else if (displayedGraph.hasEdge(node, hoveredNode) || displayedGraph.hasEdge(hoveredNode, node)) {
                    res.color = "#ffa500";
                    res.size = (data.size || 5) * 1.2;
                    res.zIndex = 5; // Neighbors above normal nodes
                    res.label = data.label;
                } else {
                    res.color = "#e0e0e0";
                    res.label = "";
                    res.zIndex = 0; // Background
                }
            }
            if (focusedNode === node) {
                res.highlighted = true;
                if (res.color && res.color.length > 7) res.color = res.color.substring(0, 7);
                res.size = (data.size || 5) * 1.3;
                res.color = "#2c3e50";
                res.zIndex = 10;
            }
            if (clickedNodes.has(node) && node !== focusedNode && node !== hoveredNode) {
                res.color = "#27ae60";
            }
            if (focusedEdge && displayedGraph.hasEdge(focusedEdge)) {
                if (displayedGraph.hasExtremity(focusedEdge, node)) {
                    res.highlighted = true;
                    if (res.color && res.color.length > 7) res.color = res.color.substring(0, 7);
                    res.size = (data.size || 5) * 1.5;
                    res.zIndex = 10;
                }
            }
            return res;
        });

        sigmaRef.current.setSetting("edgeReducer", (edge, data) => {
            const res = { ...data };

            // Safety check: ensure edge exists in displayed graph
            if (!displayedGraph.hasEdge(edge)) {
                return res;
            }

            // Visual Hierarchy: Faint edges for Documents
            // If we are not hovering/focusing, make document edges faint
            // We can detect document edges by checking source type logic or just defaulting all edges to faint 
            // since this is a bipartite graph and most edges involve a document.
            // A better check: is one extremity a Document?
            // However, inspecting node attributes here is expensive.
            // Strategy: Default edges to darker grey for visibility on white background
            if (!hoveredNode && !focusedNode && !focusedEdge) {
                res.color = "rgba(100, 100, 100, 0.5)";
            }

            if (hoveredNode && displayedGraph.hasNode(hoveredNode)) {
                if (displayedGraph.hasExtremity(edge, hoveredNode)) {
                    res.color = "#0F52BA"; // Sapphire (website brand)
                    res.size = (data.size || 1) * 2;
                    res.zIndex = 10;
                } else {
                    res.hidden = true;
                    res.color = "#f0f0f0";
                }
            }
            if (focusedEdge) {
                if (edge === focusedEdge) {
                    res.color = "#E0115F"; // Ruby (website brand)
                    res.size = (data.size || 1) * 4;
                    res.zIndex = 20;
                }
            }
            return res;
        });
        sigmaRef.current.refresh();
    }, [hoveredNode, focusedNode, focusedEdge, clickedNodes, displayedGraph]);

    useEffect(() => {
        if (sigmaRef.current) sigmaRef.current.refresh();
    }, [hoveredNode]);

    const handleZoomIn = () => { if (sigmaRef.current) sigmaRef.current.getCamera().animatedZoom({ duration: 400 }); };
    const handleZoomOut = () => { if (sigmaRef.current) sigmaRef.current.getCamera().animatedUnzoom({ duration: 400 }); };

    // Updated Center to match standard fit
    const handleCenter = () => {
        if (!sigmaRef.current) return;
        sigmaRef.current.getCamera().animate({ ratio: 1.2, x: 0.5, y: 0.5 }, { duration: 500 });
    };

    const handleFullscreen = () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) containerRef.current.parentElement.requestFullscreen();
        else document.exitFullscreen();
    };

    // Community Contour Effect
    useEffect(() => {
        if (!sigmaRef.current || !displayedGraph || selectedCommunity === null || selectedCommunity === undefined) {
            // Clean up existing contour if any
            if (contourCleanupRef.current) {
                contourCleanupRef.current();
                contourCleanupRef.current = null;
            }
            return;
        }

        // Get nodes in selected community
        const communityNodes = [];
        displayedGraph.forEachNode((node, attributes) => {
            if (attributes.community === parseInt(selectedCommunity)) {
                communityNodes.push(node);
            }
        });

        if (communityNodes.length === 0) return;

        // Get community color
        const communityColor = communityStats[selectedCommunity]?.color || '#3B82F6';

        // Create contour layer
        try {
            contourCleanupRef.current = bindWebGLLayer(
                `community-${selectedCommunity}`,
                sigmaRef.current,
                createContoursProgram(
                    communityNodes,
                    {
                        radius: 150,
                        border: {
                            color: communityColor,
                            thickness: 8,
                        },
                        levels: [
                            {
                                color: "#00000000", // Transparent fill
                                threshold: 0.5,
                            },
                        ],
                    },
                ),
            );
        } catch (error) {
            console.error("Error creating contour layer:", error);
        }

        return () => {
            if (contourCleanupRef.current) {
                contourCleanupRef.current();
                contourCleanupRef.current = null;
            }
        };
    }, [selectedCommunity, displayedGraph, communityStats]);

    useEffect(() => {
        const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener("fullscreenchange", onFsChange);
        return () => document.removeEventListener("fullscreenchange", onFsChange);
    }, []);

    return (
        <div className="relative w-full h-full group">
            <div ref={containerRef} style={{ width: "100%", height: "100%", background: "#fff" }} className="bg-white dark:bg-zinc-950" />
            <GraphControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onCenter={handleCenter} onFullscreen={handleFullscreen} isFullscreen={isFullscreen} />
        </div>
    );
}
