import React, { useState } from "react";
import vIcon from "../../../../../assets/icons/v-shape.svg";
import Diagram, { useSchema, createSchema } from "beautiful-react-diagrams";
import { CKEField } from "../../../../partials/Elements/Elements";
import { useQuery } from "@tanstack/react-query";
import ProcessService from "../../../../../services/Process.service";
import { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import EditableReactFlowChart from '../../../../partials/EditableReactFlowChart/EditableReactFlowChart';

const CustomNode = ({ id, content, type }) => {
  // Handle the case where content might be undefined
  if (!content) {
    return (
      <div
        style={{
          padding: "10px",
          backgroundColor: "#f3f3f3",
          border: "1px solid #ccc",
          borderRadius: "5px",
        }}
      >
        <div className="text-gray-600">Node {id || 'Unknown'}</div>
      </div>
    );
  }

  // Handle checkbox nodes
  if (type === 'checkbox') {
    return (
      <div
        style={{
          padding: "15px",
          backgroundColor: "#fff",
          border: "2px solid #34D399",
          borderRadius: "8px",
          minWidth: "200px",
          maxWidth: "300px"
        }}
      >
        <div className="flex items-center gap-2">
          <input 
            type="checkbox" 
            checked={content.isChecked || false}
            disabled={true}
            className="h-4 w-4 text-green-600"
          />
          <div className="font-medium text-green-600">{content.label || 'Checkbox'}</div>
        </div>
        <div className="text-sm text-gray-500 mt-2">
          {content.comment || 'No comment'}
        </div>
      </div>
    );
  }
  
  // Handle process nodes
  else if (type === 'process') {
    return (
      <div
        style={{
          padding: "15px",
          backgroundColor: "#fff",
          border: "2px solid #4A90E2",
          borderRadius: "8px",
          minWidth: "200px",
          maxWidth: "300px"
        }}
      >
        <div className="font-medium text-blue-600">{content.title || 'Process'}</div>
        <div className="text-sm text-gray-500 mt-1">
          Type: {content.processType || 'Not specified'}
        </div>
        <div className="text-sm text-gray-500">
          Priority: {content.priorityLevel || 'Not specified'}
        </div>
        <div className="text-sm text-gray-500">
          Unit: {content.businessUnit || 'Not specified'}
        </div>
      </div>
    );
  }
  
  // Handle task nodes
  else if (type === 'task') {
    return (
      <div
        style={{
          padding: "15px",
          backgroundColor: "#fff",
          border: "2px solid #DD127A",
          borderRadius: "8px",
          minWidth: "200px",
          maxWidth: "300px"
        }}
      >
        <div className="font-medium text-pink-600">{content.taskName || 'Task'}</div>
        <div className="text-sm text-gray-500 mt-1">
          Owner: {content.selectedOwners?.map(owner => owner.text).join(', ') || 'Not assigned'}
        </div>
        <div className="text-sm text-gray-500">
          TAT: {content.turnAroundTime || 0} Minutes
        </div>
      </div>
    );
  }

  // Default node for any other type
  return (
    <div
      style={{
        padding: "10px",
        backgroundColor: "#f3f3f3",
        border: "1px solid #ccc",
        borderRadius: "5px",
      }}
    >
      <div className="text-gray-600">
        {typeof content === 'string' ? content : (content.label || id || 'Node')}
      </div>
    </div>
  );
};

const initialSchema = createSchema({
  nodes: [
    {
      id: "node-1",
      content: <CustomNode id="node-1" initialText="Node 1" />,
      coordinates: [400, 40],
    },
    {
      id: "node-2",
      content: <CustomNode id="node-2" initialText="Node 2" />,
      coordinates: [50, 300],
    },
    {
      id: "node-3",
      content: <CustomNode id="node-3" initialText="Node 3" />,
      coordinates: [400, 300],
    },
    {
      id: "node-4",
      content: <CustomNode id="node-4" initialText="Node 4" />,
      coordinates: [750, 300],
    },
    {
      id: "node-5",
      content: <CustomNode id="node-5" initialText="Node 5" />,
      coordinates: [400, 560],
    },
  ],
  links: [
    { input: "node-1", output: "node-2", label: "", readonly: true, className: "text-pink-500" },
    { input: "node-1", output: "node-3", label: "", readonly: true, className: "text-pink-500" },
    { input: "node-1", output: "node-4", label: "", readonly: true, className: "text-pink-500" },
    { input: "node-1", output: "node-5", label: "", readonly: true, className: "text-pink-500" },
  ],
});

const Review = ({ setActiveTab, processData, onEdit }) => {
  const { processTab, taskWorkflow, flowChart } = processData;
  const [showAlert, setShowAlert] = useState(false);
  
  console.log("Review Process Data:", processData);
  console.log("Process Tab Data:", processTab);
  console.log("Priority Value:", processTab.priority);

  // Fetch business unit data
  const { data: BusinessUnit } = useQuery({
    queryKey: ["businessunit"],
    queryFn: () => ProcessService.getBusinessUnit(),
  });

  // Function to get business unit name from ID
  const getBusinessUnitName = (unitId) => {
    if (!unitId) return 'Not specified';
    
    // If BusinessUnit data is available, look up the name by ID
    if (BusinessUnit && BusinessUnit.units && Array.isArray(BusinessUnit.units)) {
      const unit = BusinessUnit.units.find(unit => unit.id === parseInt(unitId) || unit.id === unitId);
      if (unit) {
        return unit.name;
      }
    }
    
    // Return ID as fallback if no match found
    return unitId;
  };

  // Function to get priority name from ID
  const getPriorityName = (priority) => {
    if (!priority) return 'Not specified';
    
    // Check if priority is already a string name
    if (typeof priority === 'string' && ['Low', 'Medium', 'Critical'].includes(priority)) {
      return priority;
    }
    
    // Convert to string for consistent handling
    const priorityId = String(priority).trim();
    
    // Direct mapping from priority ID to name based on the actual API data
    switch (priorityId) {
      case '1':
        return 'Low';
      case '2':
        return 'Medium';
      case '4':
        return 'Critical';
      default:
        return 'Not specified';
    }
  };

  // Function to get priority color based on ID or name
  const getPriorityColor = (priority) => {
    if (!priority) return 'bg-gray-500';
    
    // Get the priority name if it's an ID
    const priorityName = getPriorityName(priority);
    
    // Map the priority name to the correct color based on actual API data
    switch (priorityName) {
      case 'Low':
        return 'bg-[#00FF00]';
      case 'Medium':
        return 'bg-[#FFFF00]';
      case 'Critical':
        return 'bg-[#FF0000]';
      default:
        return 'bg-gray-500';
    }
  };

  const handleEdit = (section) => {
    switch (section) {
      case "process":
        onEdit("Process Details");
        break;
      case "workflow":
        onEdit("Task And Workflow");
        break;
      case "flowchart":
        onEdit("Flow Chart");
        break;
    }
  };

  const handleSubmit = () => {
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 3000); // Hide alert after 3 seconds
  };

  // Render the diagram with improved handling of node types
  const renderDiagram = (diagram) => {
    if (!diagram) {
      return (
        <div className="p-5 bg-gray-50 text-gray-500 border border-gray-200 rounded flex items-center justify-center min-h-[300px]">
          No flowchart available. Go to Flow Chart tab to create one.
        </div>
      );
    }
    
    try {
      // Convert the diagram to React Flow format
      const convertDiagramToReactFlow = (savedDiagram) => {
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
            
            // Determine node type and label
            let nodeType = 'process';
            let label = 'Node';
            
            if (node.content) {
              // Handle React element content from the old format
              if (typeof node.content === 'object' && node.content.type) {
                // It's a React element, try to extract data
                try {
                  if (node.content.props && node.content.props.content) {
                    // Extract from CustomNode
                    const props = node.content.props;
                    if (props.type === 'process' && props.content.title) {
                      label = props.content.title;
                      nodeType = 'process';
                    } else if (props.type === 'task' && props.content.taskName) {
                      label = props.content.taskName;
                      nodeType = 'task';
                    } else if (props.type === 'checkbox' && props.content.label) {
                      label = props.content.label;
                      nodeType = 'checkbox';
                    }
                  }
                } catch (err) {
                  console.warn("Couldn't extract data from React element", err);
                }
              }
              // Handle direct content object
              else if (typeof node.content === 'object') {
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
              }
            } else if (node.data && node.data.label) {
              // Already in React Flow format
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
      
      const { nodes, edges } = convertDiagramToReactFlow(diagram);
      
      return (
        <div className="h-full w-full border border-gray-200 rounded-lg overflow-hidden">
          <ReactFlowProvider>
            <EditableReactFlowChart
              initialNodes={nodes}
              initialEdges={edges}
              readOnly={true}
            />
          </ReactFlowProvider>
        </div>
      );
    } catch (error) {
      console.error("Error rendering diagram:", error);
      return (
        <div className="p-5 bg-red-50 text-red-500 border border-red-200 rounded">
          Error rendering diagram. Please go back to Flow Chart and try again.
        </div>
      );
    }
  };

  return (
    <>
      <div className="border p-6 mt-4 rounded-lg flex flex-col gap-4 bg-white shadow">
        <div className="w-full flex border-b border-b-[#CCCCCC] justify-between p-2">
          <div className="flex gap-3">
            <img src={vIcon} alt="" />
            <p className="font-bold">Process Details</p>
          </div>
          <button 
            onClick={() => handleEdit("process")}
            className="text-[#DD127A] hover:underline"
          >
            Edit
          </button>
        </div>
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">{processTab.title || 'No Title'}</h3>
          <div>
            <p className="text-gray-600 mb-2">Description</p>
            <div className="text-black prose max-w-none" dangerouslySetInnerHTML={{ __html: processTab.description || 'No description provided' }} />
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="font-semibold">Process Type</p>
              <p>{processTab.processType || 'Not specified'}</p>
            </div>
            <div>
              <p className="font-semibold">Business Unit</p>
              <p>{getBusinessUnitName(processTab.businessUnit)}</p>
            </div>
          </div>
          <div className="gap-5">
            <p className="font-semibold mb-2">Priority Level</p>
            <button className={`text-white px-10 py-6 rounded ${getPriorityColor(processTab.priority || processTab.priorityLevel)}`}>
              {getPriorityName(processTab.priority || processTab.priorityLevel)}
            </button>
          </div>
          <div className="gap-6 mt-2">
            <p className="font-semibold">Related Processes</p>
            {processTab.relatedProcesses && processTab.relatedProcesses.length > 0 ? (
              processTab.relatedProcesses.map((process, index) => (
                <div key={index} className="mt-2">
                  <button className="py-2 p-2 rounded-2xl bg-[#CDF8EB] text-[#025D63]">
                    {process.text}
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 mt-2">No related processes</p>
            )}
          </div>
          <div className="mt-3">
            <p className="mb-3">Dependencies</p>
            <div className="text-black prose max-w-none" dangerouslySetInnerHTML={{ __html: processTab.dependencies || 'No dependencies specified' }} />
          </div>
          <div className="gap-8 mt-2">
            <p className="font-semibold">Tags</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {processTab.tags && processTab.tags.length > 0 ? (
                processTab.tags.map((tag, index) => (
                  <button key={index} className="py-2 p-2 rounded-2xl bg-[#E2E2E2] text-[#000000]">
                    {tag}
                  </button>
                ))
              ) : (
                <p className="text-gray-500">No tags</p>
              )}
            </div>
          </div>
          <div className="mt-3">
            <p className="mb-3 font-bold">Note</p>
            <div className="text-black prose max-w-none" dangerouslySetInnerHTML={{ __html: processTab.note || 'No notes provided' }} />
          </div>
        </div>
      </div>

      <div className="border p-6 mt-4 rounded-lg flex flex-col gap-4 bg-white shadow">
        <div className="w-full flex border-b border-b-[#CCCCCC] justify-between p-2">
          <div className="flex gap-3">
            <img src={vIcon} alt="" />
            <p className="font-bold">Workflow Steps</p>
          </div>
          <button 
            onClick={() => handleEdit("workflow")}
            className="text-[#DD127A] hover:underline"
          >
            Edit
          </button>
        </div>
        <table className="w-full text-left mt-4 text-gray-500">
          <thead className="text-gray-500 border-b border-b-[#CCCCCC]">
            <tr>
              <th scope="col" className="px-4 py-3">Task</th>
              <th scope="col" className="px-4 py-3">TAT</th>
              <th scope="col" className="px-4 py-3">Owner</th>
              <th scope="col" className="px-4 py-3">Start Date</th>
              <th scope="col" className="px-4 py-3">End Date</th>
              <th scope="col" className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {taskWorkflow.tasks && taskWorkflow.tasks.length > 0 ? (
              taskWorkflow.tasks.map((task, index) => (
                <tr key={index} className="border-b last:border-none">
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-gray-900">{task.name || task.taskName}</div>
                      {task.description && (
                        <div className="text-sm text-gray-500" dangerouslySetInnerHTML={{ __html: task.description }} />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">{task.turnAroundTime ? `${task.turnAroundTime} Minutes` : '-'}</td>
                  <td className="px-4 py-3">
                    {task.selectedOwners?.map(owner => owner.text).join(', ') || '-'}
                  </td>
                  <td className="px-4 py-3">
                    {task.startDate ? new Date(task.startDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3">
                    {task.endDate ? new Date(task.endDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      task.statusName?.toLowerCase() === 'active' ? 'bg-green-100 text-green-800' :
                      task.statusName?.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      task.statusName?.toLowerCase() === 'completed' ? 'bg-blue-100 text-blue-800' :
                      task.statusName?.toLowerCase() === 'suspended' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.statusName || 'Pending'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-500">
                  No tasks available. Click "Add Step" to create a new task.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="border p-6 mt-4 rounded-lg flex flex-col gap-4 bg-white shadow">
        <div className="w-full flex border-b border-b-[#CCCCCC] justify-between p-2">
          <div className="flex gap-3">
            <img src={vIcon} alt="" />
            <p className="font-bold">Flow Chart</p>
          </div>
          <button 
            onClick={() => handleEdit("flowchart")}
            className="text-[#DD127A] hover:underline"
          >
            Edit
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-lg text-gray-900">{flowChart.name || 'Process Flow Chart'}</h3>
            {flowChart.note && (
              <div className="mt-2 text-gray-700">
                <p className="font-medium mb-1">Note:</p>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: flowChart.note }} />
              </div>
            )}
          </div>
          
          <div style={{ height: "450px", width: "100%" }}>
            {flowChart.diagram ? (
              renderDiagram(flowChart.diagram)
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
                No flow chart diagram available
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="gap-2 flex mt-20">
        <button
          onClick={() => setActiveTab("Flow Chart")}
          className="py-3 rounded-lg bg-[#C3C3C3] disabled:bg-button-pink/70 text-black font-bold flex justify-center items-center flex-1 basis-64 shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.30)] whitespace-nowrap"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          className="py-3 rounded-lg bg-button-pink disabled:bg-button-pink/70 text-white font-bold flex flex-col justify-center items-center flex-1 basis-64 shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.30)] whitespace-nowrap"
        >
          Submit
        </button>
      </div>

      {/* Success Alert */}
      {showAlert && (
        <div className="fixed bottom-4 right-4 p-4 rounded-lg shadow-lg bg-green-500 text-white">
          Process submitted successfully!
        </div>
      )}
    </>
  );
};

export default Review;
