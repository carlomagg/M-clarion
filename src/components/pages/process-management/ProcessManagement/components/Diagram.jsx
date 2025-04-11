import React, { useCallback } from "react";
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
} from "reactflow";
import "reactflow/dist/style.css";

const initialNodes = [
  { id: "1", data: { label: "Start" }, position: { x: 250, y: 0 } },
  { id: "2", data: { label: "Process" }, position: { x: 250, y: 150 } },
];
const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];

const Diagram = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="h-[600px] border border-gray-300 shadow-lg rounded-md">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default Diagram;
