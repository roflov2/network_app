import React, { useState, useEffect, useMemo } from 'react';
import InteractiveGraph from './components/Graph/InteractiveGraph';
import UploadModal from './components/UI/UploadModal';
import { Upload, Play, Menu, X, Search, Navigation, FileMinus, FilePlus } from 'lucide-react';
import { processGraphData, applyLayoutAndCommunities, findShortestPath, getPathSubgraph, filterGraphByTypes, getNodeTypes, collapseDocuments, get2HopNeighborhood, detectCommunities, greyOutNonCommunityNodes, filterGraphByCommunity, getCommunityCentrality } from './utils/graph-logic';
import { SearchUI } from './components/UI/SearchOverlay';
import PathModal from './components/UI/PathModal';
import TypeFilters from './components/UI/TypeFilters';
import Timeline from './components/Analytics/Timeline';
import SigmaPlayground from "./components/SigmaPlayground";
import { ErrorBoundary } from "react-error-boundary";
import Graph from 'graphology';
import "@react-sigma/core/lib/react-sigma.min.css";

import DataTable from './components/UI/DataTable';
import PathTable from './components/UI/PathTable';
import CommunityPanel from './components/UI/CommunityPanel';
import FloatingControls from './components/UI/FloatingControls';
import HelpModal from './components/UI/HelpModal';
import StatBox from './components/ui/StatBox';
import PixelButton from './components/ui/PixelButton';

export default function App() {
    const [graph, setGraph] = useState(null);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(false);
    const [focusedNode, setFocusedNode] = useState(null);
    const [focusedEdge, setFocusedEdge] = useState(null);
    const [tableHeight, setTableHeight] = useState(500); // Default taller height
    const [sidebarWidth, setSidebarWidth] = useState(420); // Default width ~26rem (wider for table controls)
    const [isResizing, setIsResizing] = useState(false); // Track resize state
    const [isPathOpen, setIsPathOpen] = useState(false);
    const [pathGraph, setPathGraph] = useState(null); // Separate state for path view
    const [allPaths, setAllPaths] = useState(null); // Store all found paths
    const [selectedPathIndex, setSelectedPathIndex] = useState(0); // Which path is highlighted
    const [selectedTypes, setSelectedTypes] = useState(new Set());
    const [availableTypes, setAvailableTypes] = useState([]);
    const [isDocumentsCollapsed, setIsDocumentsCollapsed] = useState(false);
    const [showCommunities, setShowCommunities] = useState(false); // Community detection toggle
    const [selectedCommunity, setSelectedCommunity] = useState(null); // Selected community for isolation
    const [viewAllData, setViewAllData] = useState(false); // Toggle to show all data vs filtered
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const handleDemoLoad = async () => {
        setLoading(true);
        try {
            // Fetch from backend or static file based on environment
            // Force load static demo data for testing (using correct base path)
            const res = await fetch(import.meta.env.BASE_URL + 'demo-data.json');
            if (!res.ok) throw new Error("Failed to load demo data");
            const data = await res.json();
            const rawGraph = processGraphData(data.graph);
            const processedGraph = applyLayoutAndCommunities(rawGraph);
            setGraph(processedGraph);

            // Extract and initialize node types
            const types = getNodeTypes(processedGraph);
            setAvailableTypes(types);
            setSelectedTypes(new Set(types)); // Select all by default
        } catch (err) {
            console.error(err);
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Auto-load Demo Data on Startup (Refined Requirement)
    useEffect(() => {
        if (!graph) {
            handleDemoLoad();
        }
    }, []); // Run once on mount

    const handleUpload = async (file) => {
        setLoading(true);

        if (import.meta.env.PROD) {
            alert("File processing requires a Python backend and is not available in this GitHub Pages demo. Please use 'Load Demo Data' to explore the application features.");
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await fetch('/api/process-csv', {
                method: 'POST',
                body: formData
            });
            if (!res.ok) throw new Error("Upload failed");
            const data = await res.json();
            const rawGraph = processGraphData(data.graph);
            const processedGraph = applyLayoutAndCommunities(rawGraph);
            setGraph(processedGraph);

            // Extract and initialize node types
            const types = getNodeTypes(processedGraph);
            setAvailableTypes(types);
            setSelectedTypes(new Set(types)); // Select all by default
        } catch (err) {
            console.error(err);
            alert(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const handleFindPath = (source, target) => {
        if (!graph) return;
        const paths = findShortestPath(graph, source, target);
        if (paths && paths.length > 0) {
            console.log(`Found ${paths.length} shortest paths:`, paths);

            // Store all paths
            setAllPaths(paths);
            setSelectedPathIndex(0); // Select first path by default

            // Create subgraph for first path
            const pathSub = getPathSubgraph(graph, [paths[0]]);
            setPathGraph(pathSub); // Switch to path view
            setIsPathOpen(false);
            setFocusedNode(null); // Clear focus to avoid conflict
            setFocusedEdge(null);
        } else {
            alert(`No path found between ${source} and ${target}`);
        }
    };

    const handleSelectPath = (pathIndex) => {
        if (!graph || !allPaths || !allPaths[pathIndex]) return;

        setSelectedPathIndex(pathIndex);
        // Create subgraph for selected path only
        const pathSub = getPathSubgraph(graph, [allPaths[pathIndex]]);
        setPathGraph(pathSub);
    };

    // -----------------------------------------------------------------------
    // GRAPH PROCESSING PIPELINE
    // -----------------------------------------------------------------------

    // 1. Base Transformation: Focus Neighborhood + Type Filter + Community Detection
    // This is the "Single Source of Truth" for the graph structure and stats.
    const graphWithCommunities = useMemo(() => {
        if (!graph) return { graph: null, stats: {} };

        let processed = graph;

        // 1. Focus (2-hop)
        if (focusedNode && graph.hasNode(focusedNode)) {
            processed = get2HopNeighborhood(graph, focusedNode);
        }

        // 2. Type Filter
        processed = filterGraphByTypes(processed, selectedTypes, focusedNode);

        // 3. Community Detection (if enabled)
        if (showCommunities) {
            // detectCommunities returns { graph, stats }
            // Pass false to runClustering to preserve global community IDs
            const result = detectCommunities(processed, false);
            // Increase listeners to suppress warning (Sigma + Layout + Internal events)
            if (result.graph && result.graph.setMaxListeners) {
                result.graph.setMaxListeners(20);
            }
            return result;
        }

        // Increase listeners here too
        if (processed && processed.setMaxListeners) {
            processed.setMaxListeners(20);
        }

        // If not enabled, return graph without communities and empty stats
        return { graph: processed, stats: {} };
    }, [graph, focusedNode, selectedTypes, showCommunities]);

    // 2. Visual Transformation: Collapse Documents + Grey Out (Selection)
    // This depends on the Base Transformation but adds visual-only changes.
    const displayedGraph = useMemo(() => {
        if (pathGraph) return pathGraph;
        if (!graphWithCommunities.graph) return null;

        let displayGraph = graphWithCommunities.graph;

        // Apply document collapse if enabled
        if (isDocumentsCollapsed) {
            displayGraph = collapseDocuments(displayGraph);
        }

        // Apply community isolation if a community is selected
        if (selectedCommunity !== null && showCommunities) {
            displayGraph = greyOutNonCommunityNodes(displayGraph, selectedCommunity);
        }

        return displayGraph;
    }, [graphWithCommunities, pathGraph, isDocumentsCollapsed, selectedCommunity, showCommunities]);

    // 3. Table Data: Strict Filtering
    const tableGraph = useMemo(() => {
        if (viewAllData) return graph;

        // Use the displayed graph (visual state) as base, but enforce strict filtering
        let tGraph = displayedGraph;

        // Apply strict community filtering for the table if a community is selected
        if (showCommunities && selectedCommunity !== null) {
            tGraph = filterGraphByCommunity(tGraph, selectedCommunity);
        }

        return tGraph;
    }, [displayedGraph, viewAllData, graph, showCommunities, selectedCommunity]);




    // Community stats are now derived directly from graphWithCommunities
    const currentCommunityStats = graphWithCommunities.stats;

    // Detect Hub and Bridge nodes for the selected community
    const specialNodes = useMemo(() => {
        if (!showCommunities || selectedCommunity === null || !graph) return { hub: null, bridge: null };
        return getCommunityCentrality(graph, selectedCommunity);
    }, [graph, showCommunities, selectedCommunity]);


    return (
        <div className="relative h-screen w-full bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 overflow-hidden">
            {/* Sidebar */}
            <aside
                style={{
                    width: sidebarWidth,
                    transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)'
                }}
                className={`absolute top-0 left-0 h-full z-40 bg-retro-paper border-r-2 border-retro-border shadow-pro transition-transform duration-300 overflow-hidden group`}
            >
                <div className="h-full flex flex-col overflow-hidden">
                    {/* Top Section: Controls + Stats (Flex 1) */}
                    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                        <div className="p-4 space-y-4 overflow-y-auto">
                            <div className="flex items-center justify-between mb-2">
                                <h1 className="font-brand text-2xl tracking-tighter text-retro-primary">NETWORK<br />EXPLORER</h1>
                                <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
                                    <X size={20} />
                                </button>
                            </div>



                            {/* Help Blurb Removed - Moved to HelpModal */}

                            {/* Controls removed - moved to floating FABs */}

                            {/* Stats */}
                            {graph ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <StatBox label="Nodes" value={graph.order} />
                                        <StatBox label="Edges" value={graph.size} />
                                    </div>


                                    {/* Document Collapse Toggle (Moved here) */}
                                    {/* Document Collapse Toggle (Hidden in Path Mode) */}
                                    {!pathGraph && (
                                        <div className="mt-4 pt-4 border-t border-retro-border">
                                            <PixelButton
                                                onClick={() => setIsDocumentsCollapsed(!isDocumentsCollapsed)}
                                                active={isDocumentsCollapsed}
                                                className="w-full flex items-center justify-center gap-2"
                                            >
                                                {isDocumentsCollapsed ? <FilePlus size={14} /> : <FileMinus size={14} />}
                                                {isDocumentsCollapsed ? "Show Docs" : "Collapse Docs"}
                                            </PixelButton>
                                            {!isDocumentsCollapsed && (
                                                <div className="text-[10px] font-mono text-center text-retro-muted mt-2 uppercase tracking-tight">
                                                    Hide documents to simplify graph
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-zinc-400 text-sm italic text-center mt-10">
                                    No data loaded.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Resizable Table Section */}
                    {graph && (
                        <>
                            {/* Resizer Handle */}
                            <div
                                className="h-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-blue-500 cursor-ns-resize flex items-center justify-center transition-colors shadow-sm z-10"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    const startY = e.clientY;
                                    const startHeight = tableHeight;

                                    const onMouseMove = (moveEvent) => {
                                        const delta = startY - moveEvent.clientY; // Drag up increases height
                                        // Dynamic max height based on window, keeping 100px for header
                                        const maxHeight = window.innerHeight - 150;
                                        const newHeight = Math.max(100, Math.min(maxHeight, startHeight + delta));
                                        setTableHeight(newHeight);
                                    };

                                    const onMouseUp = () => {
                                        document.removeEventListener('mousemove', onMouseMove);
                                        document.removeEventListener('mouseup', onMouseUp);
                                        document.body.style.cursor = 'default';
                                    };

                                    document.addEventListener('mousemove', onMouseMove);
                                    document.addEventListener('mouseup', onMouseUp);
                                    document.body.style.cursor = 'ns-resize';
                                }}
                            >
                                <div className="w-8 h-1 bg-zinc-300 dark:bg-zinc-600 rounded-full" />
                            </div>

                            {/* Type Filters */}
                            <TypeFilters
                                availableTypes={availableTypes}
                                selectedTypes={selectedTypes}
                                onToggleType={(type) => {
                                    const newTypes = new Set(selectedTypes);
                                    if (newTypes.has(type)) {
                                        newTypes.delete(type);
                                    } else {
                                        newTypes.add(type);
                                    }
                                    setSelectedTypes(newTypes);
                                }}
                                onSelectAll={() => {
                                    setSelectedTypes(new Set(availableTypes));
                                }}
                                onDeselectAll={() => {
                                    setSelectedTypes(new Set());
                                }}
                                hideColors={showCommunities}
                            />



                            {/* Community Detection Toggle Removed - Moved to Floating Controls */}

                            {/* Table Panel */}
                            <div style={{ height: tableHeight, flexShrink: 0 }}>
                                {allPaths ? (
                                    <PathTable
                                        paths={allPaths}
                                        selectedPathIndex={selectedPathIndex}
                                        onSelectPath={handleSelectPath}
                                    />
                                ) : (
                                    <DataTable
                                        graph={tableGraph}
                                        fullGraph={graph}
                                        viewAllData={viewAllData}
                                        onToggleViewAll={() => setViewAllData(!viewAllData)}
                                        focusedNode={focusedNode}
                                        focusedEdge={focusedEdge}
                                        onSelection={(item, type) => {
                                            if (type === 'nodes') {
                                                setFocusedNode(item.id);
                                                setFocusedEdge(null);
                                            } else {
                                                // Edge selection: Source becomes main focus
                                                const source = graph.source(item.id);
                                                setFocusedNode(source);
                                                setFocusedEdge(item.id);
                                            }
                                        }}
                                    />
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Sidebar Width Resizer Handle (Right Edge) */}
                <div
                    className="absolute top-0 right-0 w-1 h-full cursor-ew-resize hover:bg-blue-500 transition-colors z-50 opacity-0 group-hover:opacity-100"
                    onMouseDown={(e) => {
                        e.preventDefault();
                        const startX = e.clientX;
                        const startWidth = sidebarWidth;
                        setIsResizing(true); // Disable transitions

                        const onMouseMove = (moveEvent) => {
                            const delta = moveEvent.clientX - startX;
                            const newWidth = Math.max(250, Math.min(800, startWidth + delta));
                            setSidebarWidth(newWidth);
                        };

                        const onMouseUp = () => {
                            setIsResizing(false); // Re-enable transitions
                            document.removeEventListener('mousemove', onMouseMove);
                            document.removeEventListener('mouseup', onMouseUp);
                            document.body.style.cursor = 'default';
                        };

                        document.addEventListener('mousemove', onMouseMove);
                        document.addEventListener('mouseup', onMouseUp);
                        document.body.style.cursor = 'ew-resize';
                    }}
                />
            </aside >

            {/* Main Content (Fullscreen Graph) */}
            < main className="absolute inset-0 h-full w-full flex flex-col" >
                {/* Mobile Toggle (Hamburger) - Positioned to ensure visibility over graph but under sidebar when open */}
                {
                    !sidebarOpen && (
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="absolute top-4 left-4 z-50 p-2 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm rounded-md shadow-md hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                        >
                            <Menu size={20} />
                        </button>
                    )
                }

                {/* Graph Area */}
                <div className="flex-1 bg-zinc-100 dark:bg-zinc-950 relative overflow-hidden">
                    {graph && isSearchOpen && <SearchUI graph={graph} onSelectNode={(nodeId) => {
                        setFocusedNode(nodeId);
                        setPathGraph(null); // Clear path mode on new search
                    }} />}

                    {graph && (
                        showCommunities ? (
                            <CommunityPanel
                                communities={currentCommunityStats}
                                selectedCommunityId={selectedCommunity}
                                onCommunityClick={(communityId) => {
                                    setSelectedCommunity(selectedCommunity === communityId ? null : communityId);
                                    setFocusedNode(null);
                                    setPathGraph(null);
                                }}
                                variant="bottom"
                                sidebarOpen={sidebarOpen}
                                sidebarWidth={sidebarWidth}
                                onClose={() => setShowCommunities(false)}
                            />
                        ) : (
                            <Timeline graph={graph} sidebarOpen={sidebarOpen} sidebarWidth={sidebarWidth} />
                        )
                    )}

                    {graph ? (
                        (() => {
                            console.log("Rendering InteractiveGraph with:", graph, "Order:", graph.order);
                            return (
                                <ErrorBoundary fallback={<div className="p-4 bg-red-100 text-red-800">Graph Crash Occurred. Check console for details.</div>}>
                                    <InteractiveGraph
                                        graphData={displayedGraph}
                                        key={graph.order} // Stable key to prevent re-mounting on resize
                                        focusedNode={focusedNode}
                                        focusedEdge={focusedEdge}
                                        selectedCommunity={selectedCommunity}
                                        communityStats={currentCommunityStats}
                                        specialNodes={specialNodes}
                                        onNodeClick={(node) => {
                                            setFocusedNode(node);
                                            setFocusedEdge(null);
                                            if (!node) setPathGraph(null); // Clear path on background click
                                        }}
                                        onEdgeClick={(edge) => {
                                            const source = graph.source(edge);
                                            setFocusedNode(source);
                                            setFocusedEdge(edge);
                                            setPathGraph(null); // Clear path mode
                                        }}
                                    />
                                </ErrorBoundary>
                            );
                        })()
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-zinc-400">
                            <div className="text-center">
                                <h3 className="text-lg font-medium mb-2">Ready to Explore</h3>
                                <p className="max-w-xs mx-auto">Import data to visualize connections and discover communities.</p>
                            </div>
                        </div>
                    )}

                    {loading && (
                        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center z-50">
                            <div className="bg-white dark:bg-zinc-800 px-6 py-4 rounded-full shadow-xl font-medium animate-pulse">
                                Loading Network...
                            </div>
                        </div>
                    )}
                </div>
            </main >

            {/* Community Statistics Panel Removed (Incorporated into Bottom Panel) */}

            <FloatingControls
                onUpload={() => setIsUploadOpen(true)}
                onFindPath={() => setIsPathOpen(true)}
                onClearPath={() => {
                    setPathGraph(null);
                    setAllPaths(null);
                    setSelectedPathIndex(0);
                    setFocusedNode(null);
                    setFocusedEdge(null);
                }}
                onOpenSettings={() => setSidebarOpen(!sidebarOpen)}
                onOpenHelp={() => setIsHelpOpen(true)}
                onToggleCommunities={() => {
                    const newShowCommunities = !showCommunities;
                    setShowCommunities(newShowCommunities);
                    // Clear community selection when hiding communities
                    if (!newShowCommunities) {
                        setSelectedCommunity(null);
                    }
                }}
                showCommunities={showCommunities}
                hasPath={!!pathGraph}
                isSearchOpen={isSearchOpen}
                onToggleSearch={() => setIsSearchOpen(!isSearchOpen)}
            />

            {/* Help Modal */}
            {isHelpOpen && <HelpModal onClose={() => setIsHelpOpen(false)} />}

            <UploadModal
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                onUpload={handleUpload}
            />

            <PathModal
                isOpen={isPathOpen}
                onClose={() => setIsPathOpen(false)}
                nodes={graph ? graph.mapNodes((n, a) => ({ id: n, label: a.label || n })) : []}
                onFindPath={handleFindPath}
            />
        </div >
    );
}
