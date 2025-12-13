import { useState, useCallback, useMemo, memo, useRef, useEffect } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { searchNodes, getNeighbors, getPaths, getCommunities, getCommunityGraph } from './api';
import { useDebounce, exportToCsv } from './hooks';
import { ENTITY_TYPES, getStylesheet, LAYOUT_CONFIG, getCommunityColor } from './graphConfig';
import Timeline from './Timeline';
import './App.css';

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH INPUT COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const SearchInput = memo(({ label, value, onChange, onSelect, placeholder = "Search nodes..." }) => {
  const [options, setOptions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const debouncedValue = useDebounce(value, 200);

  useEffect(() => {
    if (debouncedValue.length >= 2) {
      searchNodes(debouncedValue).then(results => {
        setOptions(results);
        // Only auto-open dropdown if user has interacted with the input
        if (hasInteracted) {
          setIsOpen(results.length > 0);
        }
      }).catch(() => setOptions([]));
    } else {
      setOptions([]);
      setIsOpen(false);
    }
  }, [debouncedValue, hasInteracted]);

  const handleSelect = (opt) => {
    onSelect(opt.value);
    setIsOpen(false);
    setOptions([]);
  };

  return (
    <div className="search-box">
      <label>{label}</label>
      <div className="search-wrapper">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setHasInteracted(true);
            onChange(e.target.value);
          }}
          onFocus={() => {
            setHasInteracted(true);
            if (options.length) setIsOpen(true);
          }}
          placeholder={placeholder}
        />
        {isOpen && options.length > 0 && (
          <ul className="dropdown">
            {options.map((opt) => (
              <li key={opt.value} onMouseDown={() => handleSelect(opt)}>
                {opt.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// TYPE FILTER CHIPS
// ─────────────────────────────────────────────────────────────────────────────
const TypeChips = memo(({ types, selected, onToggle, overrideColor }) => (
  <div className="type-chips">
    {Object.entries(types).map(([type, { color }]) => (
      <button
        key={type}
        className={`chip ${selected.includes(type) ? 'active' : ''}`}
        style={{ '--chip-color': overrideColor || color }}
        onClick={() => onToggle(type)}
      >
        {type}
      </button>
    ))}
  </div>
));

// ─────────────────────────────────────────────────────────────────────────────
// DATA TABLE
// ─────────────────────────────────────────────────────────────────────────────
const DataTable = memo(({ data, columns, selectedIdx, onSelect, onDownload, title, isCollapsed }) => (
  <div className="table-panel">
    <div className="table-header">
      <h3>{title}</h3>
      <div className="table-header-actions">
        <button className="btn-icon" onClick={onDownload} title="Download CSV">
          ↓
        </button>

      </div>
    </div>
    {!isCollapsed && (
      <div className="table-scroll">
        <table>
          <thead>
            <tr>{columns.map(col => <th key={col}>{col.replace('_', ' ')}</th>)}</tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={i}
                className={selectedIdx === i ? 'selected' : ''}
                onClick={() => onSelect(i)}
              >
                {columns.map(col => <td key={col}>{row[col]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
));

// ─────────────────────────────────────────────────────────────────────────────
// NETWORK GRAPH
// ─────────────────────────────────────────────────────────────────────────────
const NetworkGraph = memo(({ elements, stylesheet, onNodeClick }) => {
  const cyRef = useRef(null);
  const onNodeClickRef = useRef(onNodeClick);
  const prevElementsLength = useRef(-1); // Start at -1 to ensure layout runs on first mount

  const layoutRef = useRef(null); // Track active layout

  // Keep the callback ref updated
  useEffect(() => {
    onNodeClickRef.current = onNodeClick;
  }, [onNodeClick]);

  // Re-run layout when elements change
  useEffect(() => {
    const cy = cyRef.current;
    if (cy && elements.length > 0 && elements.length !== prevElementsLength.current) {
      prevElementsLength.current = elements.length;

      // Small delay to let new elements render, then run layout
      const timerId = setTimeout(() => {
        if (cy.destroyed()) return; // Safety check

        try {
          // Stop any previous running layout
          if (layoutRef.current) {
            layoutRef.current.stop();
            layoutRef.current = null;
          }

          // 1. PRE-LAYOUT: Arrange HUB (Document) nodes in a large circle to maximize distance
          const docNodes = cy.nodes('[type="Document"]');
          if (docNodes.length > 0) {
            // Run a circle layout only on document nodes
            docNodes.layout({
              name: 'circle',
              radius: 800, // Large initial radius to spread them out
              fit: false,  // Don't fit yet
              animate: false
            }).run();
          }

          // 2. MAIN PHYSICS LAYOUT: Run cose on everything
          // It will respect the initial positions of Documents because randomize is false in LAYOUT_CONFIG
          const layout = cy.layout(LAYOUT_CONFIG);
          layoutRef.current = layout; // Store ref
          layout.run();
        } catch (e) {
          console.warn("Layout error:", e);
        }
      }, 50);

      return () => {
        clearTimeout(timerId);
        if (layoutRef.current) {
          try { layoutRef.current.stop(); } catch (e) { /**/ }
          layoutRef.current = null;
        }
      };
    }
  }, [elements]);

  const handleCyInit = useCallback((cy) => {
    cyRef.current = cy;
    cy.on('tap', 'node', (e) => {
      onNodeClickRef.current(e.target.id());
    });
  }, []);

  if (!elements.length) {
    return <div className="graph-empty">Select a node to visualize the network</div>;
  }

  return (
    <CytoscapeComponent
      elements={elements}
      stylesheet={stylesheet}
      layout={LAYOUT_CONFIG}
      className="graph-canvas"
      cy={handleCyInit}
    />
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// WELCOME MODAL
// ─────────────────────────────────────────────────────────────────────────────
const WelcomeModal = memo(({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal welcome-modal" onClick={(e) => e.stopPropagation()}>
        <header>
          <h3>Welcome to Network Explorer</h3>
          <button onClick={onClose}>✕</button>
        </header>
        <div className="modal-body">
          <p className="welcome-intro">
            Discover connections between people, organisations, websites, and more.
          </p>

          <div className="welcome-section">
            <h4>How to use</h4>
            <ul>
              <li><strong>Search</strong> - Type a name in the search box to find and explore any entity</li>
              <li><strong>Click nodes</strong> - Click on any circle in the graph to see its connections</li>
              <li><strong>Filter</strong> - Use the colored buttons to show/hide different types of entities</li>
            </ul>
          </div>

          <div className="welcome-section">
            <h4>Two viewing modes</h4>
            <ul>
              <li><strong>2-Hop</strong> - See everything connected to your selected item (and what those connect to)</li>
              <li><strong>Path</strong> - Find how two items are connected to each other</li>
            </ul>
          </div>

          <div className="welcome-section">
            <h4>Tips</h4>
            <ul>
              <li>The 2-Hop graph is <strong>bipartite</strong> - it shows where the central node coexists with other entities in the same document</li>
              <li>Document nodes act as hubs connecting entities that appear together</li>
              <li>Numbers in brackets show how many documents mention that entity</li>
              <li>Click any row in the table to highlight that connection in the graph</li>
              <li>Use the maximize button on the graph to expand it for better viewing</li>
              <li>Download your results as a spreadsheet using the download button</li>
            </ul>
          </div>

          <div className="welcome-section">
            <h4>Community Detection</h4>
            <ul>
              <li>The network is automatically clustered into communities using the <strong>Louvain method</strong>.</li>
              <li>The <strong>Community</strong> tab initially shows a "Meta-Graph" of how these communities interact.</li>
              <li>Click a Community Node to "drill down" and see the specific entities inside it.</li>
              <li>Entities are colored by their community to show group membership.</li>
            </ul>
          </div>

          <button className="btn-primary welcome-start" onClick={onClose}>
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
});



// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  // State
  const [mode, setMode] = useState('neighbor');
  const [startNode, setStartNode] = useState('Google');
  const [targetNode, setTargetNode] = useState('');
  const [startSearch, setStartSearch] = useState('Google');
  const [targetSearch, setTargetSearch] = useState('');
  const [allowedTypes, setAllowedTypes] = useState(Object.keys(ENTITY_TYPES));
  const [elements, setElements] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null);

  const [showWelcome, setShowWelcome] = useState(true);
  const [isTableCollapsed, setIsTableCollapsed] = useState(() => window.innerWidth < 768);


  // Computed
  const isPathMode = mode === 'path';
  const isCommunityMode = mode === 'community';

  const columns = useMemo(() => {
    if (isPathMode && targetNode) return ['Path', 'Length', 'Route'];
    if (isCommunityMode && !selectedCommunity) return ['id', 'label', 'size']; // Community List columns
    return ['Source', 'Source_Count', 'Target', 'Target_Count', 'Edge_Type', 'Date'];
  }, [isPathMode, targetNode, isCommunityMode, selectedCommunity]);

  const selection = useMemo(() => {
    if (selectedRow === null || !tableData[selectedRow]) return null;
    const row = tableData[selectedRow];
    // If it's a path/route, we now have the 'Nodes' list from backend
    if (row.Nodes) return { nodes: row.Nodes };
    // Otherwise standard edge
    return row.Source ? { source: row.Source, target: row.Target } : null;
  }, [selectedRow, tableData]);

  const stylesheet = useMemo(
    () => getStylesheet(startNode, targetNode, selection, mode),
    [startNode, targetNode, selection, mode]
  );

  // Timeline Data Aggregation
  const timelineData = useMemo(() => {
    if (!tableData || tableData.length === 0 || !startNode) return [];

    const dateCounts = {};

    tableData.forEach(row => {
      const dateStr = row.Date;
      if (!dateStr) return;

      // Bucket by Month (YYYY-MM)
      // Assuming ISO format YYYY-MM-DD
      const monthBucket = dateStr.substring(0, 7);

      if (monthBucket.match(/^\d{4}-\d{2}$/)) {
        dateCounts[monthBucket] = (dateCounts[monthBucket] || 0) + 1;
      }
    });

    return Object.entries(dateCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [tableData, startNode]);

  // Data fetching
  const fetchData = useCallback(async () => {
    if (!startNode && mode !== 'community') {
      setElements([]);
      setTableData([]);
      setStatus('');
      return;
    }

    setLoading(true);
    setSelectedRow(null);

    try {
      if (mode === 'neighbor') {
        const typesParam = allowedTypes.length < Object.keys(ENTITY_TYPES).length ? allowedTypes : null;
        const res = await getNeighbors(startNode, typesParam);
        setElements(res.elements || []);
        setTableData(res.table_data || []);
        const nodeCount = res.elements?.filter(e => !e.data.source).length || 0;
        setStatus(`${nodeCount} nodes · ${res.table_data?.length || 0} edges`);
      } else if (mode === 'community') {
        if (!selectedCommunity) {
          // Load list of communities
          const comms = await getCommunities();
          setCommunities(comms.table_data || []);
          // Render Meta-Graph (Community Nodes)
          setElements(comms.elements || []);
          setTableData(comms.table_data || []);
          setStatus(`${comms.table_data?.length || 0} communities found`);
          setStartNode(''); // Clear start node to avoid coloring interference in config
        } else {
          // Load specific community graph
          const res = await getCommunityGraph(selectedCommunity);
          setElements(res.elements || []);
          setTableData(res.table_data || []);
          setStartNode(`Community ${selectedCommunity}`); // Mock for timeline title
          setStatus(`Community ${selectedCommunity}: ${res.elements?.length || 0} elements`);
        }
      } else if (targetNode) {
        const res = await getPaths(startNode, targetNode);
        setElements(res.elements || []);
        setTableData(res.table_data || []);
        setStatus(res.message || `${res.table_data?.length || 0} paths found`);
      } else {
        setStatus('Select target node');
      }
    } catch {
      setStatus('Error: Check backend connection');
    } finally {
      setLoading(false);
    }
  }, [startNode, targetNode, mode, allowedTypes, selectedCommunity]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Handlers
  const handleNodeClick = useCallback((nodeId) => {
    if (mode === 'community' && nodeId.startsWith('COMM-')) {
      // Drill down into community
      const commId = nodeId.replace('COMM-', '');
      setSelectedCommunity(commId);
      return;
    }

    if (isPathMode && startNode && nodeId !== startNode) {
      setTargetNode(nodeId);
      setTargetSearch(nodeId);
    } else {
      setStartNode(nodeId);
      setStartSearch(nodeId);
      setTargetNode('');
      setTargetSearch('');
    }
  }, [isPathMode, startNode, mode]);

  const handleClear = useCallback(() => {
    setStartNode('');
    setTargetNode('');
    setStartSearch('');
    setTargetSearch('');
    setElements([]);
    setTableData([]);
    setSelectedRow(null);
    setStatus('');
  }, []);

  const toggleType = useCallback((type) => {
    setAllowedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  }, []);



  const handleStartSelect = useCallback((val) => {
    setStartNode(val);
    setStartSearch(val);
    setTargetNode('');
    setTargetSearch('');
  }, []);

  const handleTargetSelect = useCallback((val) => {
    setTargetNode(val);
    setTargetSearch(val);
  }, []);

  const toggleTableCollapse = useCallback(() => {
    setIsTableCollapsed(prev => !prev);
  }, []);



  // Render
  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="brand">
          <h1>Network Explorer</h1>
          <span className="badge">{Object.keys(ENTITY_TYPES).length} entity types</span>
        </div>
        <div className="header-actions">
          <button
            className="btn-help"
            onClick={() => setShowWelcome(true)}
            title="Help"
          >
            ?
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="mode-switch">
          <button className={mode === 'neighbor' ? 'active' : ''} onClick={() => { setMode('neighbor'); setStartNode('Google'); }}>
            2-Hop
          </button>
          <button className={mode === 'path' ? 'active' : ''} onClick={() => setMode('path')}>
            Path
          </button>
          <button className={mode === 'community' ? 'active' : ''} onClick={() => { setMode('community'); setSelectedCommunity(null); }}>
            Community
          </button>
        </div>



        {mode !== 'community' && (
          <SearchInput
            label="Start"
            value={startSearch}
            onChange={setStartSearch}
            onSelect={handleStartSelect}
          />
        )}

        {isPathMode && (
          <SearchInput
            label="Target"
            value={targetSearch}
            onChange={setTargetSearch}
            onSelect={handleTargetSelect}
          />
        )}

        {/* Only show type filters if NOT in Meta-Graph view (Community mode without selection) */}
        {!(mode === 'community' && !selectedCommunity) && (
          <TypeChips
            types={ENTITY_TYPES}
            selected={allowedTypes}
            onToggle={toggleType}
            overrideColor={selectedCommunity && mode === 'community' ? getCommunityColor(selectedCommunity) : null}
          />
        )}

        <div className="toolbar-actions">
          {mode === 'community' && selectedCommunity && (
            <button className="btn-secondary" onClick={() => setSelectedCommunity(null)}>
              ← Back
            </button>
          )}
          <button className="btn-secondary" onClick={toggleTableCollapse}>
            {isTableCollapsed ? 'View Table' : 'Hide Table'}
          </button>
          <button className="btn-secondary" onClick={handleClear}>Clear</button>
        </div>
      </div>

      {/* Status */}
      {(status || loading) && (
        <div className="status-bar">
          {loading ? <span className="spinner" /> : null}
          <span>{loading ? 'Loading...' : status}</span>
        </div>
      )}

      {/* Main */}
      <main className={`main ${isTableCollapsed ? 'table-collapsed' : ''}`}>
        <DataTable
          data={tableData}
          columns={columns}
          selectedIdx={selectedRow}
          onSelect={(idx) => {
            if (mode === 'community' && !selectedCommunity) {
              const comm = tableData[idx];
              if (comm) setSelectedCommunity(comm.id);
            } else {
              setSelectedRow(idx);
            }
          }}
          onDownload={() => exportToCsv(tableData, 'network_data.csv')}
          title={isPathMode && targetNode ? 'Paths' : 'Edges'}

          isCollapsed={isTableCollapsed}
        />
        <div className="graph-panel">

          <NetworkGraph
            key={`${mode}-${selectedCommunity || ''}`} // Force remount on mode/context switch
            elements={elements}
            stylesheet={stylesheet}
            onNodeClick={handleNodeClick}
          />
        </div>
      </main>

      {/* Timeline Visualization */}
      {((mode === 'neighbor' && startNode) || (mode === 'community' && selectedCommunity)) && (
        <Timeline
          data={timelineData}
          title={mode === 'community' ? `Community ${selectedCommunity}` : startNode}
        />
      )}



      <WelcomeModal
        isOpen={showWelcome}
        onClose={() => setShowWelcome(false)}
      />
    </div>
  );
}
