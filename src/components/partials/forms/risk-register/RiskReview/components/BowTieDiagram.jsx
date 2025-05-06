import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  Position,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import '../../../../../../assets/FlowStyles.css';
import { useParams } from 'react-router-dom';
import { useRiskName } from '../../../../../../queries/risks/getRiskName';

// Node types
const nodeTypes = {
  cause: ({ data }) => (
    <div className="custom-node" style={{ borderColor: '#FF5722', backgroundColor: '#FFF3F0' }}>
      <div className="text-sm font-medium">{data.label}</div>
    </div>
  ),
  preMitigation: ({ data }) => (
    <div className="custom-node" style={{ borderColor: '#2196F3', backgroundColor: '#F0F8FF' }}>
      <div className="text-sm font-medium">{data.label}</div>
    </div>
  ),
  event: ({ data }) => (
    <div className="custom-node" style={{ borderColor: '#673AB7', backgroundColor: '#F3E5F5', minWidth: '150px' }}>
      <div className="text-sm font-medium">{data.label}</div>
    </div>
  ),
  postMitigation: ({ data }) => (
    <div className="custom-node" style={{ borderColor: '#4CAF50', backgroundColor: '#F1F8E9' }}>
      <div className="text-sm font-medium">{data.label}</div>
    </div>
  ),
  consequence: ({ data }) => (
    <div className="custom-node" style={{ borderColor: '#FFC107', backgroundColor: '#FFFDE7' }}>
      <div className="text-sm font-medium">{data.label}</div>
    </div>
  ),
};

const BowTieDiagram = ({ formData, setFormData, mode, riskEvent }) => {
  const { id: riskID } = useParams();
  const fieldNames = {
    'causes': 'common_causes',
    'preEvent': 'pre_event',
    'postEvent': 'post_event',
    'consequences': 'consequences'
  };

  // risk name query
  const { isLoading, error, data: riskEventName } = useRiskName(riskID);
  
  // Create nodes and edges based on form data
  const createNodesAndEdges = () => {
    const nodes = [];
    const edges = [];
    let nodeId = 1;
    
    // Create center event node
    const eventNode = {
      id: 'event',
      type: 'event',
      data: { label: riskEventName || 'Risk Event' },
      position: { x: 400, y: 250 },
    };
    nodes.push(eventNode);
    
    // Create causes
    if (formData[fieldNames.causes]?.length) {
      formData[fieldNames.causes].forEach((cause, index) => {
        if (!cause) return;
        
        const id = `cause-${nodeId++}`;
        nodes.push({
          id,
          type: 'cause',
          data: { label: cause },
          position: { x: 50, y: 100 + index * 100 },
        });
        
        edges.push({
          id: `e-${id}-event`,
          source: id,
          target: 'event',
          animated: true,
        });
      });
    }
    
    // Create pre-event mitigations
    if (formData[fieldNames.preEvent]?.length) {
      formData[fieldNames.preEvent].forEach((mitigation, index) => {
        if (!mitigation) return;
        
        const id = `pre-${nodeId++}`;
        nodes.push({
          id,
          type: 'preMitigation',
          data: { label: mitigation },
          position: { x: 200, y: 150 + index * 100 },
        });
      });
    }
    
    // Create post-event mitigations
    if (formData[fieldNames.postEvent]?.length) {
      formData[fieldNames.postEvent].forEach((mitigation, index) => {
        if (!mitigation) return;
        
        const id = `post-${nodeId++}`;
        nodes.push({
          id,
          type: 'postMitigation',
          data: { label: mitigation },
          position: { x: 600, y: 150 + index * 100 },
        });
      });
    }
    
    // Create consequences
    if (formData[fieldNames.consequences]?.length) {
      formData[fieldNames.consequences].forEach((consequence, index) => {
        if (!consequence) return;
        
        const id = `consequence-${nodeId++}`;
        nodes.push({
          id,
          type: 'consequence',
          data: { label: consequence },
          position: { x: 750, y: 100 + index * 100 },
        });
        
        edges.push({
          id: `e-event-${id}`,
          source: 'event',
          target: id,
          animated: true,
        });
      });
    }
    
    return { nodes, edges };
  };
  
  const { nodes: initialNodes, edges: initialEdges } = createNodesAndEdges();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  // Update nodes and edges when form data changes
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = createNodesAndEdges();
    setNodes(newNodes);
    setEdges(newEdges);
  }, [formData, riskEventName]);
  
  // Only needed if you want to allow connections in edit mode
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );
  
  if (isLoading) return <div>Loading</div>;
  if (error) return <div>Error loading risk data</div>;
  
  return (
    <ReactFlowProvider>
      <div style={{ height: '450px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={mode !== 'view' ? onConnect : undefined}
          nodeTypes={nodeTypes}
          fitView
          nodesDraggable={mode !== 'view'}
          nodesConnectable={mode !== 'view'}
          elementsSelectable={mode !== 'view'}
        >
          <Controls />
          <Background gap={16} size={1} color="#e5e7eb" />
        </ReactFlow>
      </div>
      
      {mode !== 'view' && (
        <div className="mt-4 space-y-4">
          <h5 className="font-medium text-sm text-gray-700">Causes and Effects</h5>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h6 className="font-medium text-sm text-gray-700 mb-2">Common Causes</h6>
              {formData[fieldNames.causes]?.map((cause, index) => (
                <div key={`cause-${index}`} className="flex mb-2">
                  <input
                    type="text"
                    value={cause}
                    onChange={(e) => {
                      const newCauses = [...formData[fieldNames.causes]];
                      newCauses[index] = e.target.value;
                      setFormData({...formData, [fieldNames.causes]: newCauses});
                    }}
                    className="flex-1 border rounded p-2 text-sm"
                    placeholder="Enter cause"
                    disabled={mode === 'view'}
                  />
                  {mode !== 'view' && (
                    <button
                      onClick={() => {
                        const newCauses = formData[fieldNames.causes].filter((_, i) => i !== index);
                        setFormData({...formData, [fieldNames.causes]: newCauses});
                      }}
                      className="ml-2 text-red-500 px-2"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              {mode !== 'view' && (
                <button
                  onClick={() => {
                    const newCauses = [...(formData[fieldNames.causes] || []), ''];
                    setFormData({...formData, [fieldNames.causes]: newCauses});
                  }}
                  className="text-blue-500 text-sm"
                >
                  + Add Cause
                </button>
              )}
            </div>
            
            <div>
              <h6 className="font-medium text-sm text-gray-700 mb-2">Consequences</h6>
              {formData[fieldNames.consequences]?.map((consequence, index) => (
                <div key={`consequence-${index}`} className="flex mb-2">
                  <input
                    type="text"
                    value={consequence}
                    onChange={(e) => {
                      const newConsequences = [...formData[fieldNames.consequences]];
                      newConsequences[index] = e.target.value;
                      setFormData({...formData, [fieldNames.consequences]: newConsequences});
                    }}
                    className="flex-1 border rounded p-2 text-sm"
                    placeholder="Enter consequence"
                    disabled={mode === 'view'}
                  />
                  {mode !== 'view' && (
                    <button
                      onClick={() => {
                        const newConsequences = formData[fieldNames.consequences].filter((_, i) => i !== index);
                        setFormData({...formData, [fieldNames.consequences]: newConsequences});
                      }}
                      className="ml-2 text-red-500 px-2"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              {mode !== 'view' && (
                <button
                  onClick={() => {
                    const newConsequences = [...(formData[fieldNames.consequences] || []), ''];
                    setFormData({...formData, [fieldNames.consequences]: newConsequences});
                  }}
                  className="text-blue-500 text-sm"
                >
                  + Add Consequence
                </button>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <h6 className="font-medium text-sm text-gray-700 mb-2">Pre-Event Mitigations</h6>
              {formData[fieldNames.preEvent]?.map((mitigation, index) => (
                <div key={`pre-${index}`} className="flex mb-2">
                  <input
                    type="text"
                    value={mitigation}
                    onChange={(e) => {
                      const newMitigations = [...formData[fieldNames.preEvent]];
                      newMitigations[index] = e.target.value;
                      setFormData({...formData, [fieldNames.preEvent]: newMitigations});
                    }}
                    className="flex-1 border rounded p-2 text-sm"
                    placeholder="Enter pre-event mitigation"
                    disabled={mode === 'view'}
                  />
                  {mode !== 'view' && (
                    <button
                      onClick={() => {
                        const newMitigations = formData[fieldNames.preEvent].filter((_, i) => i !== index);
                        setFormData({...formData, [fieldNames.preEvent]: newMitigations});
                      }}
                      className="ml-2 text-red-500 px-2"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              {mode !== 'view' && (
                <button
                  onClick={() => {
                    const newMitigations = [...(formData[fieldNames.preEvent] || []), ''];
                    setFormData({...formData, [fieldNames.preEvent]: newMitigations});
                  }}
                  className="text-blue-500 text-sm"
                >
                  + Add Pre-Event Mitigation
                </button>
              )}
            </div>
            
            <div>
              <h6 className="font-medium text-sm text-gray-700 mb-2">Post-Event Mitigations</h6>
              {formData[fieldNames.postEvent]?.map((mitigation, index) => (
                <div key={`post-${index}`} className="flex mb-2">
                  <input
                    type="text"
                    value={mitigation}
                    onChange={(e) => {
                      const newMitigations = [...formData[fieldNames.postEvent]];
                      newMitigations[index] = e.target.value;
                      setFormData({...formData, [fieldNames.postEvent]: newMitigations});
                    }}
                    className="flex-1 border rounded p-2 text-sm"
                    placeholder="Enter post-event mitigation"
                    disabled={mode === 'view'}
                  />
                  {mode !== 'view' && (
                    <button
                      onClick={() => {
                        const newMitigations = formData[fieldNames.postEvent].filter((_, i) => i !== index);
                        setFormData({...formData, [fieldNames.postEvent]: newMitigations});
                      }}
                      className="ml-2 text-red-500 px-2"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              {mode !== 'view' && (
                <button
                  onClick={() => {
                    const newMitigations = [...(formData[fieldNames.postEvent] || []), ''];
                    setFormData({...formData, [fieldNames.postEvent]: newMitigations});
                  }}
                  className="text-blue-500 text-sm"
                >
                  + Add Post-Event Mitigation
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </ReactFlowProvider>
  );
};

export default BowTieDiagram; 