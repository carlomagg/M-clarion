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
import '../../../../../assets/FlowStyles.css';

let id = 0;
const getId = () => `node_${id++}`;

// Custom editable node with handles on all four sides
const EditableNode = ({ data, id }) => {
  const [value, setValue] = useState(data.label);

  const handleChange = (e) => {
    setValue(e.target.value);
    data.onChange(id, e.target.value);
  };

  return (
    <div className="custom-node">
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

const nodeTypes = { editableNode: EditableNode };

const Diagram = ({ schema }) => {
  // Use provided schema if available, otherwise use initial nodes
  const initialNodes = schema?.nodes 
    ? schema.nodes.map(node => ({
        id: node.id,
        type: 'editableNode',
        data: { label: node.data?.label || 'Node', onChange: updateNodeLabel },
        position: node.position || { x: 250, y: 150 },
      }))
    : [
        {
          id: getId(),
          type: 'editableNode',
          data: { label: 'Start', onChange: () => {} },
          position: { x: 250, y: 50 },
        },
      ];

  const initialEdges = schema?.links
    ? schema.links.map(link => ({
        id: `e${link.input}-${link.output}`,
        source: link.input,
        target: link.output,
        animated: true,
      }))
    : [];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const updateNodeLabel = (id, newLabel) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, label: newLabel, onChange: updateNodeLabel } }
          : node
      )
    );
  };

  const handleAddNode = () => {
    const newId = getId();
    const newNode = {
      id: newId,
      type: 'editableNode',
      data: { label: `Step ${id}`, onChange: updateNodeLabel },
      position: { x: Math.random() * 300, y: Math.random() * 300 },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleDeleteNode = () => {
    if (selectedNodeId) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNodeId));
      setEdges((eds) => eds.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId));
      setSelectedNodeId(null);
    }
  };

  const onNodeClick = (_, node) => {
    setSelectedNodeId(node.id);
  };

  return (
    <ReactFlowProvider>
      <div className="p-4" style={{ height: '600px', background: '#f9fafb' }}>
        <div className="mb-4 flex gap-2">
          <button onClick={handleAddNode} className="btn-primary">
            Add Node
          </button>
          <button
            onClick={handleDeleteNode}
            disabled={!selectedNodeId}
            className={`btn-danger ${!selectedNodeId && 'btn-disabled'}`}
          >
            Delete Selected
          </button>
        </div>

        <div style={{ height: '85%' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            connectionMode="loose"
          >
            <MiniMap nodeColor={() => '#0ea5e9'} maskColor="rgba(0,0,0,0.08)" />
            <Controls />
            <Background gap={16} size={1} color="#e5e7eb" />
          </ReactFlow>
        </div>
      </div>
    </ReactFlowProvider>
  );
};

export default Diagram;
