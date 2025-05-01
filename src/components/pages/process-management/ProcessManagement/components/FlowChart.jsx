// import React, { useState } from "react";
// import "beautiful-react-diagrams/styles.css";
// import Diagram, { createSchema } from "beautiful-react-diagrams";

import React, { useRef, useState, useEffect, useCallback } from "react";
import "beautiful-react-diagrams/styles.css";
// import { Button } from "beautiful-react-ui";
import Diagram, { useSchema, createSchema } from "beautiful-react-diagrams";
import { CKEField } from "../../../../partials/Elements/Elements";
import axios from "axios";
import { get } from "lockr";
import { ACCESS_TOKEN_NAME, BASE_API_URL } from "../../../../../utils/consts";
import { useMessage } from "../../../../../contexts/MessageContext.jsx";
import ProcessService from "../../../../../services/Process.service";

// New component to display process info header
const ProcessInfoHeader = ({ processData }) => {
  if (!processData) return null;
  
  const processId = processData?.processTab?.processNumber || '';
  const version = '1'; // This can be dynamically set if available in your data
  const dateCreated = new Date().toLocaleDateString(); // Can be dynamic if available
  const lastUpdated = new Date().toLocaleDateString(); // Can be dynamic if available
  const title = processData?.processTab?.title || 'Definition Axeus';
  const processType = processData?.processTab?.processType || 'type 44';
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      <div className="text-sm text-gray-600 mb-2">
        PROCESS ID: {processId} Version {version} Date Created: {dateCreated} Last Updated: {lastUpdated}
      </div>
      <div className="flex gap-6">
        <div className="w-1/2">
          <label className="block text-xs text-gray-500 mb-1">Title</label>
          <p className="text-gray-700">{title}</p>
        </div>
        <div className="w-1/2">
          <label className="block text-xs text-gray-500 mb-1">Process Type</label>
          <p className="text-gray-700">{processType}</p>
        </div>
      </div>
    </div>
  );
};

const CustomNode = ({ id, content, type }) => {
  return (
    <div
      style={{
        padding: "15px",
        backgroundColor: "#fff",
        border: `2px solid ${type === 'process' ? '#4A90E2' : type === 'checkbox' ? '#34D399' : '#DD127A'}`,
        borderRadius: "8px",
        minWidth: "200px",
        maxWidth: "300px"
      }}
    >
      {type === 'process' ? (
        <>
          <div className="font-medium text-blue-600">{content.title}</div>
          <div className="text-sm text-gray-500 mt-1">
            Type: {content.processType || 'Not specified'}
          </div>
          <div className="text-sm text-gray-500">
            Priority: {content.priorityLevel || 'Not specified'}
          </div>
          <div className="text-sm text-gray-500">
            Unit: {content.businessUnit || 'Not specified'}
          </div>
        </>
      ) : type === 'checkbox' ? (
        <>
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              checked={content.isChecked || false}
              onChange={content.onCheckChange}
              className="h-4 w-4 text-green-600"
            />
            <div className="font-medium text-green-600">{content.label || 'Checkbox'}</div>
          </div>
          <div className="text-sm text-gray-500 mt-2">
            {content.comment || 'No comment'}
          </div>
        </>
      ) : (
        <>
          <div className="font-medium text-pink-600">{content.taskName}</div>
          <div className="text-sm text-gray-500 mt-1">
            Owner: {content.selectedOwners?.map(owner => owner.text).join(', ')}
          </div>
          <div className="text-sm text-gray-500">
            TAT: {content.turnAroundTime} Minutes
          </div>
        </>
      )}
    </div>
  );
};

// New component for node sidebar
const NodeSidebar = ({ onAddNode }) => {
  const [checkboxComment, setCheckboxComment] = useState('');
  const [checkboxLabel, setCheckboxLabel] = useState('');
  
  const handleDragStart = (e, nodeType) => {
    e.dataTransfer.setData('application/reactflow', nodeType);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  return (
    <div className="bg-white border-r border-gray-200 p-4 w-64 overflow-y-auto">
      <h3 className="font-semibold text-lg mb-4">Add Nodes</h3>
      
      <div className="mb-6">
        <h4 className="font-medium text-sm text-gray-600 mb-2">Process Node</h4>
        <div 
          className="border border-blue-400 rounded-md p-3 mb-2 cursor-move bg-blue-50 hover:bg-blue-100"
          draggable
          onDragStart={(e) => handleDragStart(e, 'process')}
        >
          Process
        </div>
      </div>
      
      <div className="mb-6">
        <h4 className="font-medium text-sm text-gray-600 mb-2">Task Node</h4>
        <div 
          className="border border-pink-400 rounded-md p-3 mb-2 cursor-move bg-pink-50 hover:bg-pink-100"
          draggable
          onDragStart={(e) => handleDragStart(e, 'task')}
        >
          Task
        </div>
      </div>
      
      <div className="mb-6">
        <h4 className="font-medium text-sm text-gray-600 mb-2">Checkbox Node</h4>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Label"
            value={checkboxLabel}
            onChange={(e) => setCheckboxLabel(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <textarea
            placeholder="Comment"
            value={checkboxComment}
            onChange={(e) => setCheckboxComment(e.target.value)}
            className="w-full p-2 border rounded h-20"
          />
          <div 
            className="border border-green-400 rounded-md p-3 cursor-move bg-green-50 hover:bg-green-100"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('application/reactflow', 'checkbox');
              e.dataTransfer.setData('checkbox-label', checkboxLabel);
              e.dataTransfer.setData('checkbox-comment', checkboxComment);
            }}
          >
            Checkbox: {checkboxLabel || 'Untitled'}
          </div>
        </div>
      </div>
      
      <button
        onClick={() => onAddNode('process')}
        className="w-full py-2 px-4 bg-blue-500 text-white rounded mb-2 hover:bg-blue-600"
      >
        Add Process Node
      </button>
      
      <button
        onClick={() => onAddNode('task')}
        className="w-full py-2 px-4 bg-pink-500 text-white rounded mb-2 hover:bg-pink-600"
      >
        Add Task Node
      </button>
      
      <button
        onClick={() => {
          if (checkboxLabel) {
            onAddNode('checkbox', { label: checkboxLabel, comment: checkboxComment });
            setCheckboxLabel('');
            setCheckboxComment('');
          }
        }}
        className="w-full py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600"
        disabled={!checkboxLabel}
      >
        Add Checkbox Node
      </button>
    </div>
  );
};

const FlowChart = ({ setActiveTab, formData, updateFormData }) => {
  const { dispatchMessage } = useMessage();
  const [localFormData, setLocalFormData] = useState({
    name: formData?.flowChart?.name || "",
    note: formData?.flowChart?.note || "",
    diagram: formData?.flowChart?.diagram || null
  });
  
  // State for manual drawing mode
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualSchema, setManualSchema] = useState(null);
  
  // State for node connection creation
  const [connectionStart, setConnectionStart] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  
  console.log("FlowChart - Received formData:", formData);

  // Fix: Move handleManualSchemaChange declaration to the top of the component
  const handleManualSchemaChange = (newSchema) => {
    try {
      // Ensure newSchema has valid nodes and links
      const validatedSchema = {
        ...newSchema,
        nodes: Array.isArray(newSchema.nodes) ? newSchema.nodes : [],
        links: Array.isArray(newSchema.links) ? newSchema.links : []
      };
      
      // Log the schema change for debugging
      console.log("Schema update - nodes:", validatedSchema.nodes.length, "links:", validatedSchema.links.length);
      
      // Only update if there's an actual change
      if (JSON.stringify(validatedSchema) !== JSON.stringify(manualSchema)) {
        // Important: directly call setManualSchema to update the state
        setManualSchema(validatedSchema);
        
        // Only call onChange if not from a drag operation to avoid conflicts
        const isFromDrag = validatedSchema._dragOperation === true;
        if (!isFromDrag && onChange) {
          onChange(validatedSchema);
        }
      }
    } catch (error) {
      console.error("Error updating schema:", error);
      // Create a fresh empty schema if there's an error
      const emptySchema = createSchema({ nodes: [], links: [] });
      setManualSchema(emptySchema);
      if (onChange) {
        onChange(emptySchema);
      }
    }
  };

  // Function to start connection between nodes
  const handleStartConnection = (nodeId) => {
    if (!isManualMode) return;
    
    try {
      // Validate manualSchema before starting connection
      if (!manualSchema || !manualSchema.nodes || !manualSchema.links) {
        console.log("Invalid schema for connection, creating new one");
        setManualSchema(createSchema({ nodes: [], links: [] }));
        dispatchMessage('error', 'Cannot create connection. Please try again.');
        return;
      }
      
      setConnectionStart(nodeId);
      setIsConnecting(true);
      dispatchMessage('info', 'Connection started. Click on another node to connect.');
    } catch (error) {
      console.error("Error starting connection:", error);
      setConnectionStart(null);
      setIsConnecting(false);
      dispatchMessage('error', 'Failed to start connection. Please try again.');
    }
  };
  
  // Function to complete connection between nodes
  const handleCompleteConnection = (nodeId) => {
    try {
      if (!isManualMode || !connectionStart || connectionStart === nodeId) {
        setIsConnecting(false);
        setConnectionStart(null);
        return;
      }
      
      // Validate manualSchema before completing connection
      if (!manualSchema || !manualSchema.nodes || !manualSchema.links) {
        console.log("Invalid schema for completing connection");
        setIsConnecting(false);
        setConnectionStart(null);
        dispatchMessage('error', 'Cannot create connection. Please try again.');
        return;
      }
      
      // Create new connection
      const currentNodes = Array.isArray(manualSchema.nodes) ? [...manualSchema.nodes] : [];
      const currentLinks = Array.isArray(manualSchema.links) ? [...manualSchema.links] : [];
      
      // Generate unique link ID
      const linkId = `link-${connectionStart}-${nodeId}-${new Date().getTime()}`;
      
      // Add new link
      const newLink = {
        input: connectionStart,
        output: nodeId,
        label: "",
        readonly: false,
        id: linkId
      };
      
      const newSchema = createSchema({
        nodes: currentNodes,
        links: [...currentLinks, newLink]
      });
      
      console.log("Created new connection:", newLink);
      handleManualSchemaChange(newSchema);
      
      // Reset connection state
      setIsConnecting(false);
      setConnectionStart(null);
      dispatchMessage('success', 'Connection created successfully!');
    } catch (error) {
      console.error("Error completing connection:", error);
      setConnectionStart(null);
      setIsConnecting(false);
      dispatchMessage('error', 'Failed to create connection. Please try again.');
    }
  };
  
  // Function to cancel connection creation
  const handleCancelConnection = () => {
    setIsConnecting(false);
    setConnectionStart(null);
  };

  // Enhance CustomNode to handle connections - fixing issues with the manual mode
  const EnhancedCustomNode = (nodeProps) => {
    const { id, content, type } = nodeProps;
    
    // Fix: Use useCallback to ensure stable function references
    const handleNodeClick = useCallback((e) => {
      e.stopPropagation(); // Prevent event propagation
      if (isConnecting && !connectionStart) {
        handleStartConnection(id);
      } else if (isConnecting && connectionStart) {
        handleCompleteConnection(id);
      }
    }, [id, isConnecting, connectionStart]);

    const handleConnectClick = useCallback((e) => {
      e.stopPropagation();
      e.preventDefault(); // Prevent any default behavior
      handleStartConnection(id);
    }, [id]);

    const handleDeleteClick = useCallback((e) => {
      e.stopPropagation();
      e.preventDefault(); // Prevent any default behavior
      // Delete the node and any connected links
      if (manualSchema) {
        const newNodes = manualSchema.nodes.filter(node => node.id !== id);
        const newLinks = manualSchema.links.filter(link => 
          link.input !== id && link.output !== id
        );
        
        const newSchema = createSchema({
          nodes: newNodes,
          links: newLinks
        });
        
        // Log the deletion for debugging
        console.log("Deleting node:", id);
        console.log("Before delete - nodes:", manualSchema.nodes.length, "links:", manualSchema.links.length);
        console.log("After delete - nodes:", newNodes.length, "links:", newLinks.length);
        
        handleManualSchemaChange(newSchema);
        dispatchMessage('info', `Node ${id} deleted`);
      }
    }, [id, manualSchema]);
    
    return (
      <div 
        className={`${isConnecting ? 'cursor-crosshair' : 'cursor-move'} relative`}
        onClick={handleNodeClick}
        data-node-id={id} // Add data attribute for easier identification
      >
        {isManualMode && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex space-x-1 z-50">
            {/* Connect button */}
            <button 
              className="bg-blue-500 text-white p-1 rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-blue-600 shadow-md"
              title="Connect to another node"
              onClick={handleConnectClick}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
              </svg>
            </button>
            
            {/* Delete node button */}
            <button 
              className="bg-red-500 text-white p-1 rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 shadow-md"
              title="Delete node"
              onClick={handleDeleteClick}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        <CustomNode id={id} content={content} type={type} />
      </div>
    );
  };

  // Function to convert enhanced nodes back to regular nodes for serialization
  const serializeNodes = (nodes) => {
    if (!nodes || !Array.isArray(nodes)) return [];
    
    return nodes.map(node => {
      try {
        // Ensure node has an id
        const nodeId = node.id || `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        // Handle various node content structures
        if (node.content?.props) {
          // Try to get content and type from props
          let content, type;
          
          // Direct props access
          if (node.content.props.content && node.content.props.type) {
            content = node.content.props.content;
            type = node.content.props.type;
          } 
          // Nested within children (for EnhancedCustomNode)
          else if (node.content.props.children?.props) {
            content = node.content.props.children.props.content;
            type = node.content.props.children.props.type;
          }
          // Fallback
          else {
            content = { label: 'Node' };
            type = 'task';
          }
          
          return {
            ...node,
            id: nodeId,
            content: <CustomNode 
              id={nodeId} 
              content={content}
              type={type} 
            />
          };
        }
        
        // Return the node unchanged if it doesn't match expected structure
        return node;
      } catch (error) {
        console.error("Error serializing node:", error, node);
        // Return a basic valid node as fallback
        return {
          id: node.id || `fallback-${Date.now()}`,
          content: <CustomNode 
            id={node.id || 'unknown'} 
            content={{ label: 'Node' }}
            type="task" 
          />,
          coordinates: node.coordinates || [0, 0]
        };
      }
    });
  };

  // Modified: Remove the reference to handleManualSchemaChange from generateSchema
  const generateSchema = () => {
    try {
      // If we have a manually created diagram, return it but with properly serialized nodes
      if (isManualMode && manualSchema) {
        if (!manualSchema.nodes || !manualSchema.links) {
          console.log("Invalid manual schema, creating empty one");
          return createSchema({ nodes: [], links: [] });
        }
        
        const serializedNodes = serializeNodes(manualSchema.nodes);
        return createSchema({
          nodes: serializedNodes,
          links: manualSchema.links
        });
      }
      
      // If we have a saved diagram and want to use it, ensure nodes are properly formatted
      if (localFormData.diagram) {
        console.log("FlowChart - Using saved diagram:", localFormData.diagram);
        
        // Validate the saved diagram
        if (!localFormData.diagram.nodes || !Array.isArray(localFormData.diagram.nodes)) {
          console.log("Invalid saved diagram, creating empty one");
          return createSchema({ nodes: [], links: [] });
        }
        
        // Check if we need to enhance nodes for manual mode
        if (isManualMode) {
          const enhancedNodes = localFormData.diagram.nodes.map(node => {
            // Extract content and type
            let content, type;
            try {
              if (node.content?.props) {
                content = node.content.props.content;
                type = node.content.props.type;
              } else {
                content = { label: 'Node' };
                type = 'task';
              }
            } catch (e) {
              console.error("Error extracting node content:", e);
              content = { label: 'Node' };
              type = 'task';
            }
            
            return {
              ...node,
              content: <EnhancedCustomNode 
                id={node.id} 
                content={content}
                type={type} 
              />
            };
          });
          
          return createSchema({
            nodes: enhancedNodes,
            links: Array.isArray(localFormData.diagram.links) ? localFormData.diagram.links : []
          });
        }
        
        return localFormData.diagram;
      }
      
      // Get process details from parent's processTab data
      const processDetails = {
        title: formData?.processTab?.title || 'Process',
        processType: formData?.processTab?.processType || 'Not specified',
        priorityLevel: formData?.processTab?.priorityLevel || 'Not specified',
        businessUnit: formData?.processTab?.businessUnit || 'Not specified',
        dependencies: formData?.processTab?.dependencies || ''
      };
      
      console.log("FlowChart - Process Details:", processDetails);
      
      // Get tasks from taskWorkflow data
      const tasks = formData?.taskWorkflow?.tasks || [];
      console.log("FlowChart - Task Workflow Data:", tasks);

      const nodes = [];
      const links = [];

      // Add process node at the top with actual process details
      nodes.push({
        id: 'process-node',
        content: <CustomNode 
          id="process-node" 
          content={processDetails}
          type="process" 
        />,
        coordinates: [250, 50],
      });

      // Add task nodes
      if (tasks && tasks.length > 0) {
        console.log("FlowChart - Creating nodes for tasks:", tasks.length);
        tasks.forEach((task, index) => {
          console.log(`FlowChart - Creating node for task ${index + 1}:`, task);
          const nodeId = `task-${index + 1}`;
          nodes.push({
            id: nodeId,
            content: <CustomNode 
              id={nodeId} 
              content={{
                taskName: task.name || task.taskName || `Task ${index + 1}`,
                selectedOwners: task.selectedOwners || [],
                turnAroundTime: task.turnAroundTime || 0,
                description: task.description || '',
                startDate: task.startDate,
                endDate: task.endDate,
                statusName: task.statusName || 'Pending'
              }} 
              type="task" 
            />,
            coordinates: [250, 200 + (index * 150)], // Stack tasks vertically below process
          });

          // Link process to first task
          if (index === 0) {
            links.push({
              input: 'process-node',
              output: nodeId,
              label: "",
              readonly: false, // Allow editing in manual mode
            });
          }

          // Link tasks sequentially
          if (index > 0) {
            links.push({
              input: `task-${index}`,
              output: nodeId,
              label: "",
              readonly: false, // Allow editing in manual mode
            });
          }
        });
      } else {
        console.log("FlowChart - No tasks found in workflow data");
      }

      const schema = createSchema({ nodes, links });
      console.log("FlowChart - Generated schema:", schema);
      
      // If we're in manual mode, set this as the initial schema for editing with enhanced nodes
      if (isManualMode && !manualSchema) {
        try {
          const enhancedNodes = nodes.map(node => {
            // Extract the content and type
            const { content, type } = node.content.props;
            
            return {
              ...node,
              content: <EnhancedCustomNode 
                id={node.id} 
                content={content}
                type={type} 
              />
            };
          });
          
          const enhancedSchema = createSchema({
            nodes: enhancedNodes,
            links
          });
          
          // Use a timeout to avoid state update during render
          setTimeout(() => {
            setManualSchema(enhancedSchema);
          }, 0);
        } catch (e) {
          console.error("Error enhancing nodes:", e);
          const emptySchema = createSchema({ nodes: [], links: [] });
          setTimeout(() => {
            setManualSchema(emptySchema);
          }, 0);
        }
      }
      
      return schema;
    } catch (error) {
      console.error("Error generating schema:", error);
      return createSchema({ nodes: [], links: [] });
    }
  };

  const [schema, { onChange }] = useSchema(generateSchema());

  // Update handleDrop to handle errors and safely access manualSchema
  const handleDrop = (e) => {
    if (!isManualMode) return;
    
    e.preventDefault();
    
    try {
      // Check if manualSchema is null or undefined
      if (!manualSchema) {
        const emptySchema = createSchema({ 
          nodes: [], 
          links: [] 
        });
        setManualSchema(emptySchema);
        console.log("Created new empty schema for drop (null case):", emptySchema);
        
        // Return early and let the user try again after schema is initialized
        setTimeout(() => {
          dispatchMessage('info', 'Please try dropping the node again');
        }, 100);
        return;
      }
      
      // Check if manualSchema has nodes and links properties
      if (!manualSchema.nodes || !manualSchema.links) {
        // Create a valid schema with the current nodes if they exist, or empty arrays
        const validNodes = Array.isArray(manualSchema.nodes) ? manualSchema.nodes : [];
        const emptySchema = createSchema({ 
          nodes: validNodes, 
          links: [] 
        });
        setManualSchema(emptySchema);
        console.log("Created fixed schema structure for drop:", emptySchema);
        
        // Return early and let the user try again after schema is initialized
        setTimeout(() => {
          dispatchMessage('info', 'Please try dropping the node again');
        }, 100);
        return;
      }
      
      // Fix: Get drop position relative to the diagram container with scroll offset
      const diagramContainer = document.getElementById('diagram-container');
      if (!diagramContainer) {
        console.error("Diagram container not found");
        dispatchMessage('error', 'Failed to find diagram container. Please try again.');
        return;
      }
      
      const diagramRect = diagramContainer.getBoundingClientRect();
      const dropX = Math.max(20, e.clientX - diagramRect.left + diagramContainer.scrollLeft);
      const dropY = Math.max(20, e.clientY - diagramRect.top + diagramContainer.scrollTop);
      
      const nodeType = e.dataTransfer.getData('application/reactflow');
      if (!nodeType) {
        console.error("No node type found in drop data");
        dispatchMessage('error', 'Failed to get node type. Please try again.');
        return;
      }
      
      console.log("Dropping node of type:", nodeType, "at position:", dropX, dropY);
      
      // Make sure we're working with arrays
      const currentNodes = Array.isArray(manualSchema.nodes) ? [...manualSchema.nodes] : [];
      const currentLinks = Array.isArray(manualSchema.links) ? [...manualSchema.links] : [];
      
      // Generate a unique ID and timestamp for the node
      const timestamp = new Date().getTime();
      const randomId = Math.floor(Math.random() * 1000);
      let nodeId, nodeContent;
      
      if (nodeType === 'checkbox') {
        const checkboxLabel = e.dataTransfer.getData('checkbox-label');
        const checkboxComment = e.dataTransfer.getData('checkbox-comment');
        
        nodeId = `checkbox-${timestamp}-${randomId}`;
        
        // Function to handle checkbox state changes
        const handleCheckChange = (e) => {
          if (!manualSchema || !manualSchema.nodes) return;
          
          const updatedNodes = manualSchema.nodes.map(node => {
            if (node.id === nodeId) {
              const currentChecked = node.content?.props?.content?.isChecked || false;
              return {
                ...node,
                content: <EnhancedCustomNode 
                  id={nodeId} 
                  content={{
                    label: checkboxLabel,
                    comment: checkboxComment,
                    isChecked: !currentChecked,
                    onCheckChange: handleCheckChange
                  }}
                  type="checkbox" 
                />
              };
            }
            return node;
          });
          
          const updatedSchema = createSchema({
            nodes: updatedNodes,
            links: Array.isArray(manualSchema.links) ? [...manualSchema.links] : []
          });
          
          handleManualSchemaChange(updatedSchema);
        };
        
        nodeContent = <EnhancedCustomNode 
          id={nodeId} 
          content={{
            label: checkboxLabel || 'Checkbox',
            comment: checkboxComment || '',
            isChecked: false,
            onCheckChange: handleCheckChange
          }}
          type="checkbox" 
        />;
        
        const newNode = {
          id: nodeId,
          content: nodeContent,
          coordinates: [dropX, dropY]
        };
        
        const newSchema = createSchema({
          nodes: [...currentNodes, newNode],
          links: currentLinks
        });
        
        console.log("Added dropped checkbox node:", nodeId);
        handleManualSchemaChange(newSchema);
        dispatchMessage('success', 'Added checkbox node');
      } else if (nodeType === 'process') {
        nodeId = `process-${timestamp}-${randomId}`;
        nodeContent = <EnhancedCustomNode 
          id={nodeId} 
          content={{
            title: 'New Process',
            processType: 'Custom',
            priorityLevel: 'Medium',
            businessUnit: 'Custom',
          }}
          type="process" 
        />;
        
        const newNode = {
          id: nodeId,
          content: nodeContent,
          coordinates: [dropX, dropY]
        };
        
        const newSchema = createSchema({
          nodes: [...currentNodes, newNode],
          links: currentLinks
        });
        
        console.log("Added dropped process node:", nodeId);
        handleManualSchemaChange(newSchema);
        dispatchMessage('success', 'Added process node');
      } else if (nodeType === 'task') {
        nodeId = `task-${timestamp}-${randomId}`;
        nodeContent = <EnhancedCustomNode 
          id={nodeId} 
          content={{
            taskName: 'New Task',
            selectedOwners: [],
            turnAroundTime: 0,
          }} 
          type="task" 
        />;
        
        const newNode = {
          id: nodeId,
          content: nodeContent,
          coordinates: [dropX, dropY]
        };
        
        const newSchema = createSchema({
          nodes: [...currentNodes, newNode],
          links: currentLinks
        });
        
        console.log("Added dropped task node:", nodeId);
        handleManualSchemaChange(newSchema);
        dispatchMessage('success', 'Added task node');
      } else {
        console.log("Unknown node type:", nodeType);
        dispatchMessage('warning', `Unknown node type: ${nodeType}`);
      }
    } catch (error) {
      console.error("Error dropping node:", error);
      dispatchMessage('error', 'Failed to drop node. Please try again.');
      
      // Reset the schema to a valid state if needed
      if (!manualSchema || !manualSchema.nodes || !manualSchema.links) {
        setManualSchema(createSchema({ nodes: [], links: [] }));
      }
    }
  };
  
  // Update handleDragOver to improve dragging behavior
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Update schema when process details or tasks change
  useEffect(() => {
    if (!isManualMode) {
      console.log("FlowChart - FormData updated:", formData);
      const newSchema = generateSchema();
      onChange(newSchema);
    }
  }, [formData?.processTab, formData?.taskWorkflow?.tasks]);

  // Update local form when parent data changes
  useEffect(() => {
    if (formData) {
      setLocalFormData(prev => ({
        ...prev,
        name: formData.name || prev.name,
        note: formData.note || prev.note,
        diagram: formData.diagram || prev.diagram
      }));
    }
  }, [formData]);

  function handleChange(e) {
    const newData = {
      ...localFormData,
      [e.target.name]: e.target.value,
    };
    setLocalFormData(newData);
    updateFormData(newData);
  }

  // Toggle between automatic and manual modes with proper schema conversion
  const toggleDrawingMode = () => {
    try {
      if (!isManualMode) {
        // When switching to manual mode, use current schema as starting point
        const currentSchema = schema || generateSchema();
        
        // Ensure currentSchema has valid nodes and links
        if (!currentSchema || !currentSchema.nodes || !currentSchema.links) {
          console.log("Creating empty schema for manual mode");
          const emptySchema = createSchema({ nodes: [], links: [] });
          setManualSchema(emptySchema);
          setIsManualMode(true);
          return;
        }
        
        // Create enhanced nodes with control buttons
        const enhancedNodes = currentSchema.nodes.map(node => {
          try {
            // Extract content and type from the node
            let content, type;
            
            if (node.content && node.content.props) {
              // Try direct access first
              if (node.content.props.content && node.content.props.type) {
                content = node.content.props.content;
                type = node.content.props.type;
              } 
              // Try nested structure
              else if (node.content.props.children && node.content.props.children.props) {
                content = node.content.props.children.props.content;
                type = node.content.props.children.props.type;
              }
              // Use default values if nothing found
              else {
                content = { label: 'Node' };
                type = 'task';
              }
            } else {
              // Fallback for unexpected node structure
              content = { label: node.id || 'Node' };
              type = 'task';
            }
            
            return {
              ...node,
              content: <EnhancedCustomNode 
                id={node.id} 
                content={content}
                type={type} 
              />
            };
          } catch (e) {
            console.error("Error enhancing node during toggle:", e, node);
            // Return node with minimal valid content as fallback
            return {
              ...node,
              content: <EnhancedCustomNode 
                id={node.id || `node-${Date.now()}`} 
                content={{ label: 'Node' }}
                type="task" 
              />
            };
          }
        });
        
        // Create enhanced schema with proper links
        const enhancedSchema = createSchema({
          nodes: enhancedNodes,
          links: Array.isArray(currentSchema.links) ? [...currentSchema.links] : []
        });
        
        console.log("Switching to manual mode with schema:", enhancedSchema);
        setManualSchema(enhancedSchema);
      } else {
        // When switching from manual to automatic mode, serialize the manual schema
        if (manualSchema && manualSchema.nodes) {
          const serializedNodes = serializeNodes(manualSchema.nodes);
          const autoSchema = createSchema({
            nodes: serializedNodes,
            links: Array.isArray(manualSchema.links) ? [...manualSchema.links] : []
          });
          
          // Update the schema to preserve manual changes
          console.log("Switching to automatic mode with preserved changes");
          onChange(autoSchema);
        }
      }
      
      // Toggle the mode
      setIsManualMode(!isManualMode);
      
      // Clear connection state when toggling
      setIsConnecting(false);
      setConnectionStart(null);
    } catch (error) {
      console.error("Error toggling drawing mode:", error);
      // Create a fresh empty schema if there's an error
      const emptySchema = createSchema({ nodes: [], links: [] });
      setManualSchema(emptySchema);
      setIsManualMode(!isManualMode);
      dispatchMessage('error', 'Error switching modes. Starting with a clean diagram.');
    }
  };

  // Fix the handleNextButtonClick and handleSaveAsDraft functions to properly serialize data
  const handleNextButtonClick = async () => {
    try {
      // Validate required fields
      if (!localFormData.name) {
        dispatchMessage('error', 'Please provide a name for the flowchart');
        return;
      }

      // Get process ID from form data
      const processId = formData?.processTab?.processNumber;
      if (!processId) {
        dispatchMessage('error', 'Process ID not found');
        return;
      }

      // Determine which schema to save with serialization
      let finalSchema;
      if (isManualMode && manualSchema) {
        // Serialize nodes to remove complex React components
        const serializedNodes = serializeNodes(manualSchema.nodes);
        finalSchema = createSchema({
          nodes: serializedNodes,
          links: manualSchema.links
        });
      } else {
        finalSchema = schema;
      }

      // Save the current schema state
      const updatedData = {
        name: localFormData.name,
        note: localFormData.note || "",
        diagram: finalSchema // This will be stored in local state but not sent to API
      };
      
      // Save to database with the correct structure
      await ProcessService.saveFlowChart(processId, {
        name: updatedData.name,
        note: updatedData.note,
        process_id: processId
      });
      
      // Update parent component state with full data including diagram
      updateFormData(updatedData);
      dispatchMessage('success', 'Flow chart saved successfully!');
      setActiveTab("Review");
    } catch (error) {
      console.error('Error saving flowchart:', error);
      let errorMessage = 'Failed to save flowchart. ';
      
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage += 'Please check if all required fields are filled correctly.';
      } else if (error.response?.status === 404) {
        errorMessage += 'Flowchart endpoint not found.';
      } else {
        errorMessage += 'An unexpected error occurred.';
      }
      
      dispatchMessage('error', errorMessage);
    }
  };

  const handleSaveAsDraft = async () => {
    try {
      // Get process ID from form data
      const processId = formData?.processTab?.processNumber;
      if (!processId) {
        dispatchMessage('error', 'Process ID not found');
        return;
      }

      // Determine which schema to save with serialization
      let finalSchema;
      if (isManualMode && manualSchema) {
        // Serialize nodes to remove complex React components
        const serializedNodes = serializeNodes(manualSchema.nodes);
        finalSchema = createSchema({
          nodes: serializedNodes,
          links: manualSchema.links
        });
      } else {
        finalSchema = schema;
      }

      // Save current state as draft
      const draftData = {
        name: localFormData.name || "Draft Flow",
        note: localFormData.note || "",
        diagram: finalSchema // This will be stored in local state but not sent to API
      };
      
      // Save to database with the correct structure
      await ProcessService.saveFlowChart(processId, {
        name: draftData.name,
        note: draftData.note,
        process_id: processId
      });
      
      // Update parent component state with full data including diagram
      updateFormData(draftData);
      dispatchMessage('success', 'Flow chart draft saved successfully!');
    } catch (error) {
      console.error('Error saving flowchart draft:', error);
      let errorMessage = 'Failed to save draft. ';
      
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage += 'Please check if all required fields are filled correctly.';
      } else if (error.response?.status === 404) {
        errorMessage += 'Flowchart endpoint not found.';
      } else {
        errorMessage += 'An unexpected error occurred.';
      }
      
      dispatchMessage('error', errorMessage);
    }
  };

  const handleBackButtonClick = () => {
    setActiveTab("Task And Workflow");
  };

  // Add debug console logs to help troubleshoot
  useEffect(() => {
    if (isManualMode) {
      console.log("Manual Mode Active, Schema:", manualSchema);
    }
  }, [isManualMode, manualSchema]);

  // Ensure we have a valid schema in manual mode
  useEffect(() => {
    if (isManualMode && !manualSchema) {
      const initialSchema = generateSchema();
      setManualSchema(initialSchema);
    }
  }, [isManualMode]);

  // Update the addNode function to use EnhancedCustomNode with the fixed implementation
  const handleAddNode = (nodeType, nodeData = {}) => {
    if (!isManualMode) return;
    
    // Check if manualSchema is null or undefined
    if (!manualSchema) {
      const emptySchema = createSchema({ 
        nodes: [], 
        links: [] 
      });
      setManualSchema(emptySchema);
      console.log("Created new empty schema (null):", emptySchema);
      
      // Return early and let the user try again after schema is initialized
      setTimeout(() => {
        dispatchMessage('info', 'Please try adding the node again');
      }, 100);
      return;
    }
    
    // Check if manualSchema has nodes and links properties
    if (!manualSchema.nodes || !manualSchema.links) {
      // Create a valid schema with the current nodes if they exist, or empty arrays
      const validNodes = Array.isArray(manualSchema.nodes) ? manualSchema.nodes : [];
      const emptySchema = createSchema({ 
        nodes: validNodes, 
        links: [] 
      });
      setManualSchema(emptySchema);
      console.log("Created new schema with valid structure:", emptySchema);
      
      // Return early and let the user try again after schema is initialized
      setTimeout(() => {
        dispatchMessage('info', 'Please try adding the node again');
      }, 100);
      return;
    }
    
    try {
      // Get the diagram container dimensions for positioning
      const diagramContainer = document.getElementById('diagram-container');
      const containerRect = diagramContainer.getBoundingClientRect();
      const scrollLeft = diagramContainer.scrollLeft || 0;
      const scrollTop = diagramContainer.scrollTop || 0;
      
      // Calculate a position that's visible in the viewport and accounts for scroll
      const baseX = Math.max(50, Math.min(400, containerRect.width / 2)) + scrollLeft;
      const baseY = Math.max(50, Math.min(200, containerRect.height / 3)) + scrollTop;
      
      // Add some randomness to prevent exact overlap
      const offsetX = Math.random() * 100 - 50; // random -50 to 50
      const offsetY = Math.random() * 60 - 30;  // random -30 to 30

      // Make sure we're working with arrays
      const currentNodes = Array.isArray(manualSchema.nodes) ? [...manualSchema.nodes] : [];
      const currentLinks = Array.isArray(manualSchema.links) ? [...manualSchema.links] : [];
      
      let nodeContent = null;
      let nodeId = '';
      
      // Generate a unique ID for the node
      const timestamp = new Date().getTime();
      const randomId = Math.floor(Math.random() * 1000);
      
      if (nodeType === 'process') {
        nodeId = `process-${timestamp}-${randomId}`;
        nodeContent = <EnhancedCustomNode 
          id={nodeId} 
          content={{
            title: 'New Process',
            processType: 'Custom',
            priorityLevel: 'Medium',
            businessUnit: 'Custom',
          }}
          type="process" 
        />;
      } else if (nodeType === 'task') {
        nodeId = `task-${timestamp}-${randomId}`;
        nodeContent = <EnhancedCustomNode 
          id={nodeId} 
          content={{
            taskName: 'New Task',
            selectedOwners: [],
            turnAroundTime: 0,
          }} 
          type="task" 
        />;
      } else if (nodeType === 'checkbox') {
        nodeId = `checkbox-${timestamp}-${randomId}`;
        
        // Function to handle checkbox state changes
        const handleCheckChange = (e) => {
          if (!manualSchema || !manualSchema.nodes) return;
          
          const updatedNodes = manualSchema.nodes.map(node => {
            if (node.id === nodeId) {
              const currentChecked = node.content?.props?.content?.isChecked || false;
              return {
                ...node,
                content: <EnhancedCustomNode 
                  id={nodeId} 
                  content={{
                    ...nodeData,
                    isChecked: !currentChecked,
                    onCheckChange: handleCheckChange
                  }}
                  type="checkbox" 
                />
              };
            }
            return node;
          });
          
          const updatedSchema = createSchema({
            nodes: updatedNodes,
            links: Array.isArray(manualSchema.links) ? [...manualSchema.links] : []
          });
          
          handleManualSchemaChange(updatedSchema);
        };
        
        nodeContent = <EnhancedCustomNode 
          id={nodeId} 
          content={{
            label: nodeData.label || 'Checkbox',
            comment: nodeData.comment || '',
            isChecked: false,
            onCheckChange: handleCheckChange
          }}
          type="checkbox" 
        />;
      }
      
      // Add the new node to the schema
      if (nodeContent) {
        const newNode = {
          id: nodeId,
          content: nodeContent,
          coordinates: [baseX + offsetX, baseY + offsetY], // Improved positioning
        };
        
        const newSchema = createSchema({
          nodes: [...currentNodes, newNode],
          links: currentLinks
        });
        
        console.log("Adding new node:", nodeId, nodeType);
        handleManualSchemaChange(newSchema);
        dispatchMessage('success', `Added new ${nodeType} node`);
        
        // Scroll to the new node if needed
        setTimeout(() => {
          const nodeElement = document.querySelector(`[data-node-id="${nodeId}"]`);
          if (nodeElement) {
            nodeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    } catch (error) {
      console.error("Error adding node:", error);
      dispatchMessage('error', 'Failed to add node. Please try again.');
      
      // Reset the schema to a valid state
      setManualSchema(createSchema({ nodes: [], links: [] }));
    }
  };

  return (
    <>
      <div className="bg-white mt-4 p-7 pt-4 border border-[#CCC] w-full flex flex-col gap-6 rounded-lg">
        {/* Add the process info header at the top */}
        <ProcessInfoHeader processData={formData} />
        
        {/* Toggle for drawing mode */}
        <div className="flex justify-end">
          <button
            onClick={toggleDrawingMode}
            className={`px-4 py-2 rounded-lg ${
              isManualMode ? 'bg-button-pink text-white' : 'bg-gray-200 text-gray-700'
            } font-medium transition duration-300`}
          >
            {isManualMode ? 'Switch to Automatic Mode' : 'Switch to Manual Drawing Mode'}
          </button>
        </div>
        
        {/* Connection mode indicator */}
        {isConnecting && (
          <div className="bg-blue-100 border border-blue-300 rounded px-4 py-2 flex justify-between items-center">
            <span className="text-blue-700">
              <strong>Connection Mode:</strong> Click on a node to connect it or press Escape to cancel
            </span>
            <button 
              onClick={handleCancelConnection}
              className="ml-4 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              Cancel
            </button>
          </div>
        )}
        
        <div className="flex">
          {/* Node sidebar - only shown in manual mode */}
          {isManualMode && (
            <NodeSidebar onAddNode={handleAddNode} />
          )}
          
          {/* Diagram area */}
          <div 
            id="diagram-container"
            className={`border border-gray-200 rounded-lg p-4 ${isManualMode ? 'flex-1' : 'w-full'}`} 
            style={{ height: "30rem", overflow: "auto" }} // Added overflow to ensure scrolling works
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            tabIndex={0}
            onKeyDown={(e) => {
              // Cancel connection on Escape key
              if (e.key === 'Escape' && isConnecting) {
                handleCancelConnection();
              }
            }}
          >
            <Diagram 
              schema={isManualMode ? manualSchema || schema : schema} 
              onChange={isManualMode ? (newSchema) => {
                // Mark schema updates from drag operations to avoid onChange conflicts
                if (newSchema && typeof newSchema === 'object') {
                  newSchema._dragOperation = true;
                }
                // Update the manual schema right away to ensure responsive dragging
                handleManualSchemaChange(newSchema);
              } : onChange}
              // Add key prop to force re-render when mode changes
              key={isManualMode ? 'manual-mode' : 'auto-mode'}
            />
          </div>
        </div>
        
        {/* Instructions for manual mode */}
        {isManualMode && (
          <div className="bg-gray-50 p-3 rounded border border-gray-200 text-sm text-gray-600">
            <h4 className="font-medium mb-1">Manual Flow Chart Instructions:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Drag nodes from the sidebar to add them to the canvas</li>
              <li>Click and drag nodes to reposition them</li>
              <li>Use the connect button (link icon) on nodes to create connections</li>
              <li>Use the delete button (X icon) to remove nodes</li>
              <li>Drag and drop checkbox nodes to add comments to the flow chart</li>
            </ul>
          </div>
        )}
        
        <div className="mt-10 space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Flowchart Name"
            value={localFormData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <CKEField
            {...{
              name: "note",
              label: "Note",
              value: localFormData.note,
              onChange: handleChange,
            }}
          />
        </div>

        <div className="gap-2 flex mt-20">
          <button
            onClick={handleBackButtonClick}
            className="py-3 rounded-lg bg-[#C3C3C3] disabled:bg-button-pink/70 text-black font-bold flex justify-center items-center flex-1 basis-64 shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.30)] whitespace-nowrap"
          >
            Back
          </button>
          <button
            onClick={handleSaveAsDraft}
            className="py-3 rounded-lg bg-[#C3C3C3] disabled:bg-button-pink/70 text-black font-bold flex flex-col justify-center items-center flex-1 basis-64 shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.30)] whitespace-nowrap"
          >
            Save to draft
          </button>
          <button
            onClick={handleNextButtonClick}
            className="py-3 rounded-lg bg-button-pink disabled:bg-button-pink/70 text-white font-bold flex flex-col justify-center items-center flex-1 basis-64 shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.30)] whitespace-nowrap"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
};

export default FlowChart;
