import { useState, useCallback, useMemo, memo, useRef, useEffect } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { searchNodes, getNeighbors, getPaths, analyzeNetwork } from './api';
import { useDebounce, exportToCsv } from './hooks';
import { ENTITY_TYPES, getStylesheet, LAYOUT_CONFIG } from './graphConfig';
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
const TypeChips = memo(({ types, selected, onToggle }) => (
  <div className="type-chips">
    {Object.entries(types).map(([type, { color }]) => (
      <button
        key={type}
        className={`chip ${selected.includes(type) ? 'active' : ''}`}
        style={{ '--chip-color': color }}
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
const DataTable = memo(({ data, columns, selectedIdx, onSelect, onDownload, title }) => (
  <div className="table-panel">
    <div className="table-header">
      <h3>{title}</h3>
      <button className="btn-icon" onClick={onDownload} title="Download CSV">
        ⬇️
      </button>
    </div>
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
  </div>
));

// ─────────────────────────────────────────────────────────────────────────────
// NETWORK GRAPH
// ─────────────────────────────────────────────────────────────────────────────
const NetworkGraph = memo(({ elements, stylesheet, onNodeClick }) => {
  const cyRef = useRef(null);
  const onNodeClickRef = useRef(onNodeClick);
  const prevElementsLength = useRef(elements.length);

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
      setTimeout(() => {
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
        cy.layout(LAYOUT_CONFIG).run();
      }, 50);
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
              <li>Numbers in brackets show how many documents mention that entity</li>
              <li>Click any row in the table to highlight that connection in the graph</li>
              <li>Download your results as a spreadsheet using the download button</li>
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
// AI MODAL
// ─────────────────────────────────────────────────────────────────────────────
const AiModal = memo(({ isOpen, content, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header>
          <h3>AI Analysis</h3>
          <button onClick={onClose}>✕</button>
        </header>
        <div className="modal-body">{content}</div>
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
  const [aiModal, setAiModal] = useState({ open: false, content: '' });
  const [showWelcome, setShowWelcome] = useState(true);

  // Computed
  const isPathMode = mode === 'path';
  const columns = useMemo(() =>
    isPathMode && targetNode
      ? ['Path', 'Length', 'Route']
      : ['Source', 'Source_Count', 'Target', 'Target_Count', 'Edge_Type'],
    [isPathMode, targetNode]
  );

  const selection = useMemo(() => {
    if (selectedRow === null || !tableData[selectedRow]) return null;
    const row = tableData[selectedRow];
    // If it's a path/route, we now have the 'Nodes' list from backend
    if (row.Nodes) return { nodes: row.Nodes };
    // Otherwise standard edge
    return row.Source ? { source: row.Source, target: row.Target } : null;
  }, [selectedRow, tableData]);

  const stylesheet = useMemo(
    () => getStylesheet(startNode, targetNode, selection),
    [startNode, targetNode, selection]
  );

  // Data fetching
  const fetchData = useCallback(async () => {
    if (!startNode) {
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
      } else if (targetNode) {
        const res = await getPaths(startNode, targetNode);
        setElements(res.elements || []);
        setTableData(res.table_data || []);
        setStatus(res.message || `${res.table_data?.length || 0} paths found`);
      } else {
        setStatus('Select target node');
      }
    } catch (err) {
      setStatus('Error: Check backend connection');
    } finally {
      setLoading(false);
    }
  }, [startNode, targetNode, mode, allowedTypes]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Handlers
  const handleNodeClick = useCallback((nodeId) => {
    if (isPathMode && startNode && nodeId !== startNode) {
      setTargetNode(nodeId);
      setTargetSearch(nodeId);
    } else {
      setStartNode(nodeId);
      setStartSearch(nodeId);
      setTargetNode('');
      setTargetSearch('');
    }
  }, [isPathMode, startNode]);

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

  const handleAiAnalysis = useCallback(async () => {
    setAiModal({ open: true, content: 'Analyzing...' });
    try {
      const nodeIds = elements.filter(e => !e.data.source).map(e => e.data.id);
      const res = await analyzeNetwork(startNode, nodeIds);
      setAiModal({ open: true, content: res.summary || 'No analysis available' });
    } catch {
      setAiModal({ open: true, content: 'Analysis failed. Check API key.' });
    }
  }, [startNode, elements]);

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

  // Render
  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="brand">
          <h1>Network Explorer</h1>
          <span className="badge">{Object.keys(ENTITY_TYPES).length} entity types</span>
        </div>
        <div className="legend">
          {Object.entries(ENTITY_TYPES).map(([t, { color }]) => (
            <span key={t} className="legend-dot" style={{ background: color }} title={t} />
          ))}
        </div>
      </header>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="mode-switch">
          <button className={mode === 'neighbor' ? 'active' : ''} onClick={() => setMode('neighbor')}>
            2-Hop
          </button>
          <button className={mode === 'path' ? 'active' : ''} onClick={() => setMode('path')}>
            Path
          </button>
        </div>

        <SearchInput
          label="Start"
          value={startSearch}
          onChange={setStartSearch}
          onSelect={handleStartSelect}
        />

        {isPathMode && (
          <SearchInput
            label="Target"
            value={targetSearch}
            onChange={setTargetSearch}
            onSelect={handleTargetSelect}
          />
        )}

        <TypeChips types={ENTITY_TYPES} selected={allowedTypes} onToggle={toggleType} />

        <div className="toolbar-actions">
          <button className="btn-secondary" onClick={handleClear}>Clear</button>
{/* Analyze button hidden for now
          <button
            className="btn-primary"
            onClick={handleAiAnalysis}
            disabled={!startNode || isPathMode}
          >
            🤖 Analyze
          </button>
*/}
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
      <main className="main">
        <DataTable
          data={tableData}
          columns={columns}
          selectedIdx={selectedRow}
          onSelect={setSelectedRow}
          onDownload={() => exportToCsv(tableData, 'network_data.csv')}
          title={isPathMode && targetNode ? 'Paths' : 'Edges'}
        />
        <div className="graph-panel">
          <NetworkGraph
            elements={elements}
            stylesheet={stylesheet}
            onNodeClick={handleNodeClick}
          />
        </div>
      </main>

      <AiModal
        isOpen={aiModal.open}
        content={aiModal.content}
        onClose={() => setAiModal({ open: false, content: '' })}
      />

      <WelcomeModal
        isOpen={showWelcome}
        onClose={() => setShowWelcome(false)}
      />
    </div>
  );
}
