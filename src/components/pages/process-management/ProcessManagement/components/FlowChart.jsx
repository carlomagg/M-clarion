// import React, { useState } from "react";
// import "beautiful-react-diagrams/styles.css";
// import Diagram, { createSchema } from "beautiful-react-diagrams";

import React, { useState } from "react";
import "beautiful-react-diagrams/styles.css";
// import { Button } from "beautiful-react-ui";
import Diagram, { useSchema, createSchema } from "beautiful-react-diagrams";
import { CKEField } from "../../../../partials/Elements/Elements";
import axios from "axios";
import { get } from "lockr";
import { ACCESS_TOKEN_NAME, BASE_API_URL } from "../../../../../utils/consts";
import { useMessage } from "../../../../../contexts/MessageContext.jsx";
import ProcessService from "../../../../../services/Process.service";
import EditableReactFlowChart from "../../../../partials/EditableReactFlowChart/EditableReactFlowChart";

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
      <div className="flex flex-col space-y-2 mb-4">
        <div className="flex items-center">
          <span className="text-gray-500 w-32">PROCESS ID:</span>
          <span className="text-gray-700">{processId}</span>
        </div>
        <div className="flex items-center">
          <span className="text-gray-500 w-32">Version:</span>
          <span className="text-gray-700">{version}</span>
        </div>
        <div className="flex items-center">
          <span className="text-gray-500 w-32">Date Created:</span>
          <span className="text-gray-700">{dateCreated}</span>
        </div>
        <div className="flex items-center">
          <span className="text-gray-500 w-32">Last Updated:</span>
          <span className="text-gray-700">{lastUpdated}</span>
        </div>
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
  
  console.log("FlowChart - Received formData:", formData);

  // Convert saved diagram to React Flow format if exists
  const convertDiagramToReactFlow = (savedDiagram) => {
    if (!savedDiagram) {
      return { nodes: [], edges: [] };
    }
    
    try {
      // Make sure we have nodes array
      const nodes = savedDiagram.nodes || [];
      const links = savedDiagram.links || [];
      
      // Convert nodes to React Flow format
      const rfNodes = nodes.map(node => {
        // Extract position information, defaulting to coordinates if available or a random position
        const position = node.position || node.coordinates || { 
          x: Math.floor(Math.random() * 500) + 100, 
          y: Math.floor(Math.random() * 300) + 100
        };
        
        // Determine node type
        let nodeType = 'process';
        let label = 'Node';
        
        if (node.content) {
          if (node.content.title) {
            label = node.content.title;
            nodeType = 'process';
          } else if (node.content.taskName) {
            label = node.content.taskName;
            nodeType = 'task';
          } else if (node.content.label) {
            label = node.content.label;
            nodeType = node.content.isChecked !== undefined ? 'checkbox' : 'process';
          }
        } else if (node.data && node.data.label) {
          label = node.data.label;
          nodeType = node.data.nodeType || 'process';
        }
        
        return {
          id: node.id,
          type: 'editableNode',
          data: {
            label,
            nodeType,
          },
          position
        };
      });
      
      // Convert links to React Flow edges
      const rfEdges = links.map(link => ({
        id: `e-${link.input || link.source}-${link.output || link.target}`,
        source: link.input || link.source,
        target: link.output || link.target,
        animated: true
      }));
      
      return { nodes: rfNodes, edges: rfEdges };
    } catch (error) {
      console.error("Error converting diagram to React Flow format:", error);
      return { nodes: [], edges: [] };
    }
  };
  
  // Get the initial data for the React Flow chart
  const { nodes: initialNodes, edges: initialEdges } = convertDiagramToReactFlow(localFormData.diagram);
  
  // Handle diagram changes
  const handleDiagramChange = (newDiagram) => {
    console.log("Diagram changed:", newDiagram);
    
    // Create a proper diagram format for saving
    const savedDiagram = {
      nodes: newDiagram.nodes.map(node => ({
        id: node.id,
        type: node.type,
        position: node.position,
        content: {
          title: node.data.nodeType === 'process' ? node.data.label : undefined,
          taskName: node.data.nodeType === 'task' ? node.data.label : undefined,
          label: node.data.nodeType === 'checkbox' ? node.data.label : undefined,
          processType: node.data.nodeType === 'process' ? 'Custom' : undefined,
          priorityLevel: node.data.nodeType === 'process' ? 'Medium' : undefined,
          businessUnit: node.data.nodeType === 'process' ? 'Custom' : undefined,
          selectedOwners: node.data.nodeType === 'task' ? [] : undefined,
          turnAroundTime: node.data.nodeType === 'task' ? 0 : undefined,
          isChecked: node.data.nodeType === 'checkbox' ? false : undefined,
        }
      })),
      links: newDiagram.edges.map(edge => ({
        input: edge.source,
        output: edge.target
      }))
    };
    
    setLocalFormData(prev => ({
      ...prev,
      diagram: savedDiagram
    }));
  };

  function handleChange(e) {
    setLocalFormData({
      ...localFormData,
      [e.target.name]: e.target.value
    });
  }

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

      // Save the current schema state
      const updatedData = {
        name: localFormData.name,
        note: localFormData.note || "",
        diagram: localFormData.diagram // This will be stored in local state but not sent to API
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
      console.error("Error saving flow chart:", error);
      dispatchMessage('error', 'Failed to save flow chart. Please try again.');
    }
  };

  const handleSaveAsDraft = async () => {
    try {
      // Validate minimum required field
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
      
      // Update parent component state with the current data
      updateFormData(localFormData);
      dispatchMessage('success', 'Flow chart draft saved!');
    } catch (error) {
      console.error("Error saving draft:", error);
      dispatchMessage('error', 'Failed to save draft. Please try again.');
    }
  };

  const handleBackButtonClick = () => {
    setActiveTab("Task and Workflow");
  };

  return (
    <>
      <div className="border rounded-lg flex flex-col gap-4 bg-white shadow p-6">
        <ProcessInfoHeader processData={formData} />
        
        <div className="w-full flex border-b border-b-[#CCCCCC] justify-between p-2">
          <div className="flex gap-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="font-bold">Process Flow</p>
          </div>
        </div>
        
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Flow Chart Name</label>
              <input
                type="text"
                name="name"
                value={localFormData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter flow chart name"
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Note</label>
            <textarea
              name="note"
              value={localFormData.note}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              rows="3"
              placeholder="Add notes about this flow chart"
            />
          </div>
          
          <div className="border rounded-lg p-4 bg-gray-50" style={{ height: '600px' }}>
            <EditableReactFlowChart
              initialNodes={initialNodes}
              initialEdges={initialEdges}
              onChange={handleDiagramChange}
            />
          </div>
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
