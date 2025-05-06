import React, { useCallback, useState } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import '../../../assets/FlowStyles.css'; // Your custom styles here

let id = 0;
const getId = () => `node_${id++}`;

// Custom editable node with handles on all four sides
const EditableNode = ({ data, id }) => {
  const [value, setValue] = useState(data.label);

  const handleChange = (e) => {
    setValue(e.target.value);
    if (data.onChange) {
      data.onChange(id, e.target.value);
    }
  };

  return (
    <div className={`custom-node ${data.nodeType ? `${data.nodeType}-node` : ''}`}>
      <Handle type="target" position={Position.Top} id="t" />
      <Handle type="target" position={Position.Left} id="l" />
      <Handle type="source" position={Position.Bottom} id="b" />
      <Handle type="source" position={Position.Right} id="r" />
      <input
        className="custom-node-input"
        value={value}
        onChange={handleChange}
        placeholder="Label"
      />
    </div>
  );
};

// Custom node types
const nodeTypes = { editableNode: EditableNode };

const EditableReactFlowChart = ({ 
  initialNodes = [], 
  initialEdges = [], 
  readOnly = false,
  onNodesChange: externalNodesChange,
  onEdgesChange: externalEdgesChange,
  onChange
}) => {
  // Define a default onChange handler for initial nodes
  const defaultOnChange = useCallback((id, value) => {
    console.log(`Node ${id} changed to ${value}`);
  }, []);
  
  // Prepare initial nodes with onChange handler
  const preparedInitialNodes = initialNodes.length > 0 
    ? initialNodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          onChange: defaultOnChange
        }
      }))
    : [
        {
          id: getId(),
          type: 'editableNode',
          data: { 
            label: 'Start', 
            nodeType: 'process',
            onChange: defaultOnChange
          },
          position: { x: 250, y: 50 },
        },
      ];
  
  const [nodes, setNodes, onNodesChange] = useNodesState(preparedInitialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  // Define the updateNodeLabel function after state initialization
  const updateNodeLabel = useCallback((id, newLabel) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id
          ? { 
              ...node, 
              data: { 
                ...node.data, 
                label: newLabel, 
                onChange: updateNodeLabel 
              } 
            }
          : node
      )
    );
    
    if (onChange) {
      setTimeout(() => {
        onChange({ nodes, edges });
      }, 0);
    }
  }, [setNodes, nodes, edges, onChange]);

  // Update the onChange handler for all nodes
  React.useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onChange: updateNodeLabel
        }
      }))
    );
  }, [updateNodeLabel, setNodes]);

  // Handle nodes changes and propagate to parent if needed
  const handleNodesChange = (changes) => {
    onNodesChange(changes);
    if (externalNodesChange) {
      externalNodesChange(changes);
    }
    
    if (onChange) {
      // Allow parent to get updated node state
      setTimeout(() => {
        onChange({ nodes, edges });
      }, 0);
    }
  };

  // Handle edges changes and propagate to parent if needed
  const handleEdgesChange = (changes) => {
    onEdgesChange(changes);
    if (externalEdgesChange) {
      externalEdgesChange(changes);
    }
    
    if (onChange) {
      // Allow parent to get updated edge state
      setTimeout(() => {
        onChange({ nodes, edges });
      }, 0);
    }
  };

  const onConnect = useCallback(
    (params) => {
      const newEdges = addEdge({ ...params, animated: true }, edges);
      setEdges(newEdges);
      
      if (onChange) {
        onChange({ nodes, edges: newEdges });
      }
    },
    [setEdges, nodes, edges, onChange]
  );

  const handleAddNode = (nodeType = 'process') => {
    const newId = getId();
    const newNode = {
      id: newId,
      type: 'editableNode',
      data: { 
        label: `Node ${id}`, 
        nodeType: nodeType, 
        onChange: updateNodeLabel 
      },
      position: { x: Math.random() * 300 + 50, y: Math.random() * 300 + 50 },
    };
    
    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);
    
    if (onChange) {
      onChange({ nodes: updatedNodes, edges });
    }
  };

  const handleDeleteNode = () => {
    if (selectedNodeId) {
      const filteredNodes = nodes.filter((n) => n.id !== selectedNodeId);
      const filteredEdges = edges.filter(
        (e) => e.source !== selectedNodeId && e.target !== selectedNodeId
      );
      
      setNodes(filteredNodes);
      setEdges(filteredEdges);
      setSelectedNodeId(null);
      
      if (onChange) {
        onChange({ nodes: filteredNodes, edges: filteredEdges });
      }
    }
  };

  const onNodeClick = (_, node) => {
    setSelectedNodeId(node.id);
  };
  
  // Get flowchart data in a format that can be used for API
  const getFlowchartData = () => {
    return {
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.type,
        data: {
          label: node.data.label,
          nodeType: node.data.nodeType
        },
        position: node.position
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target
      }))
    };
  };

  return (
    <ReactFlowProvider>
      <div 
        className="react-flow-container p-4" 
        style={{ 
          width: '100%', 
          height: '100%', 
          minHeight: '400px',
          position: 'relative',
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px'
        }}
      >
        {!readOnly && (
          <div className="mb-4 flex gap-2" style={{ position: 'relative', zIndex: 5 }}>
            <button onClick={() => handleAddNode('process')} className="btn-primary">
              Add Process
            </button>
            <button onClick={() => handleAddNode('task')} className="btn-primary">
              Add Task
            </button>
            <button
              onClick={handleDeleteNode}
              disabled={!selectedNodeId}
              className={`btn-danger ${!selectedNodeId && 'btn-disabled'}`}
            >
              Delete Selected
            </button>
          </div>
        )}

        <div style={{ 
          position: 'relative',
          width: '100%', 
          height: readOnly ? '100%' : 'calc(100% - 60px)',
          minHeight: '350px'
        }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={onConnect}
            onNodeClick={!readOnly ? onNodeClick : undefined}
            nodeTypes={nodeTypes}
            fitView
            connectionMode="loose"
            nodesDraggable={!readOnly}
            nodesConnectable={!readOnly}
            elementsSelectable={!readOnly}
            style={{ width: '100%', height: '100%' }}
          >
            <MiniMap 
              nodeColor={(node) => {
                const nodeType = node.data?.nodeType;
                if (nodeType === 'process') return '#4A90E2';
                if (nodeType === 'task') return '#DD127A';
                return '#0ea5e9';
              }}
              position={readOnly ? "bottom-right" : "bottom-left"}
              maskColor="rgba(0,0,0,0.08)" 
            />
            <Controls position={readOnly ? "bottom-right" : "top-right"} showInteractive={!readOnly} />
            <Background gap={16} size={1} color="#e5e7eb" />
          </ReactFlow>
        </div>
      </div>
    </ReactFlowProvider>
  );
};

export default EditableReactFlowChart; 