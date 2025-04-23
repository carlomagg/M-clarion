import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import plusIcon from "../../../../../assets/icons/plus.svg";
import WorkflowForm from "./WorkflowForm";
import ProcessService from "../../../../../services/Process.service";
import {
  FormCancelButton,
  FormCustomButton,
  FormProceedButton,
} from "../../../../partials/buttons/FormButtons/FormButtons";
import { CKEField } from "../../../../partials/Elements/Elements";
import { PiDotsThreeVerticalBold } from "react-icons/pi";

// Process info header component
const ProcessInfoHeader = ({ processData }) => {
  if (!processData) return null;
  
  const processId = processData?.processNumber || '';
  const version = '1'; // This can be dynamically set if available in your data
  const dateCreated = new Date().toLocaleDateString(); // Can be dynamic if available
  const lastUpdated = new Date().toLocaleDateString(); // Can be dynamic if available
  const title = processData?.title || 'Definition Axeus';
  const processType = processData?.processType || 'type 44';
  
  console.log("TaskAndWorkflow - ProcessInfoHeader - formData:", processData);
  
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

const TaskAndWorkflow = ({ setActiveTab, formData, updateFormData }) => {
  const { id: processId } = useParams();
  const queryClient = useQueryClient();
  const stepsRef = useRef([]);
  const [workflowSteps, setWorkflowSteps] = useState(formData?.taskWorkflow?.tasks || []);
  const [showWorkflowForm, setShowWorkflowForm] = useState(false);
  const [savedWorkflowForm, setSavedWorkflowForm] = useState(null);
  const [showTaskMenu, setShowTaskMenu] = useState({
    status: false,
    index: null
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [lastAddedTaskId, setLastAddedTaskId] = useState(null);

  useEffect(() => {
    stepsRef.current = workflowSteps;
    console.log("Ref updated with steps:", stepsRef.current);
  }, [workflowSteps]);

  console.log("TaskAndWorkflow - Initial formData:", formData);
  console.log("TaskAndWorkflow - Initial workflowSteps:", workflowSteps);

  useEffect(() => {
    console.log("TaskAndWorkflow - formData changed:", formData);
    if (formData?.taskWorkflow?.tasks?.length > 0 && workflowSteps.length === 0) {
      console.log("TaskAndWorkflow - Setting workflow steps from formData");
      setWorkflowSteps(formData.taskWorkflow.tasks);
    }
  }, [formData]);

  useEffect(() => {
    if (lastAddedTaskId) {
      setTimeout(() => {
        setLastAddedTaskId(null);
      }, 2000);
    }
  }, [lastAddedTaskId]);

  const addTaskToWorkflow = useCallback((newTask) => {
    console.log("Adding new task explicitly:", newTask);
    console.log("Current steps before adding:", stepsRef.current);
    
    const updatedSteps = [...stepsRef.current, newTask];
    console.log("New steps array after adding:", updatedSteps);
    
    setWorkflowSteps(updatedSteps);
    
    setLastAddedTaskId(newTask.id);
    
    if (updateFormData) {
      updateFormData({
        tasks: updatedSteps
      });
    }
  }, [updateFormData]);

  const updateTaskInWorkflow = useCallback((taskId, updatedTask) => {
    console.log(`Updating task with ID ${taskId}:`, updatedTask);
    console.log("Current steps before updating:", stepsRef.current);
    
    const updatedSteps = stepsRef.current.map(step => 
      step.id === taskId ? updatedTask : step
    );
    console.log("New steps array after updating:", updatedSteps);
    
    setWorkflowSteps(updatedSteps);
    
    if (updateFormData) {
      updateFormData({
        tasks: updatedSteps
      });
    }
  }, [updateFormData]);

  useEffect(() => {
    console.log("TaskAndWorkflow - workflowSteps changed, updating parent:", workflowSteps);
    console.log("TaskAndWorkflow - Current task count:", workflowSteps.length);
    if (updateFormData) {
      updateFormData({
        tasks: workflowSteps
      });
    }
  }, [workflowSteps, updateFormData]);

  const handleAddStep = () => {
    console.log('Opening workflow form to add new task');
    setEditingIndex(null);
    setSavedWorkflowForm(null);
    setShowWorkflowForm(true);
  };

  const handleNextButtonClick = () => {
    console.log("TaskAndWorkflow - Moving to Flow Chart with steps:", workflowSteps);
    setActiveTab("Flow Chart");
  };

  const handleBackClick = () => {
    setActiveTab("Process Details");
  };

  const handleMenu = (index) => {
    setShowTaskMenu(prev => ({
      status: prev.index === index ? !prev.status : true,
      index
    }));
  };

  const handleSaveFormState = (formState) => {
    setSavedWorkflowForm(formState);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      // First, let's normalize the date string format
      let normalizedDate;
      
      // Check if this is a date-time string with time component (e.g. "2024-11-14 05:59:11.803")
      if (typeof dateString === 'string' && dateString.includes(' ')) {
        // Extract just the date part
        normalizedDate = dateString.split(' ')[0];
      } else {
        normalizedDate = dateString;
      }
      
      // Handle both YYYY-MM-DD and MM/DD/YYYY formats
      const date = new Date(normalizedDate);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error('Invalid date value:', dateString);
        return dateString; // Return the original if we can't parse it
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return dateString;
    }
  };

  const formatTAT = (tat) => {
    if (!tat) return '';
    return `${tat} Minutes`;
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const MenuDot = ({ index }) => (
    <div className="absolute p-4 w-[120px] justify-center items-center bg-white border shadow-md cursor-pointer border-[#676767] text-black flex rounded-lg">
      <ul>
        <li className="px-2 hover:bg-gray-100">Edit Process</li>
        <li className="px-2 hover:bg-gray-100">Delete</li>
        <li className="px-2 hover:bg-gray-100">Suspend</li>
        <li className="px-2 hover:bg-gray-100">History</li>
      </ul>
    </div>
  );

  const stripHtmlTags = (html) => {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const handleEditTask = (index) => {
    console.log(`Editing task at index ${index}:`, workflowSteps[index]);
    setEditingIndex(index);
    setShowWorkflowForm(true);
    
    // Create a copy of the task data for editing
    // If there's already a taskName property, keep it; otherwise use the name property
    const task = workflowSteps[index];
    setSavedWorkflowForm({
      ...task,
      taskName: task.taskName || task.name
    });
  };

  return (
    <div className="w-full">
      {!showWorkflowForm ? (
        <>
          {console.log("TaskAndWorkflow render - formData:", formData)}
          {/* Add process info header at the top */}
          <ProcessInfoHeader processData={formData.processTab} />
            
          <div className="bg-white mt-4 p-7 pt-4 border border-[#CCC] w-full flex flex-col gap-6 rounded-lg">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">
                Workflow steps 
                <span className="ml-2 bg-gray-200 px-2 py-1 rounded-full text-sm">
                  {workflowSteps.length}
                </span>
              </h3>
              <button
                onClick={handleAddStep}
                className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg border border-[#676767] hover:bg-gray-50"
              >
                <img src={plusIcon} alt="" className="text-[#DD127A] fill-[#DD127A]" />
                Add Step
              </button>
            </div>
            
            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-4 py-2 text-left text-gray-700 font-medium">Task</th>
                    <th className="px-4 py-2 text-left text-gray-700 font-medium">TAT</th>
                    <th className="px-4 py-2 text-left text-gray-700 font-medium">Owner</th>
                    <th className="px-4 py-2 text-left text-gray-700 font-medium">Start date</th>
                    <th className="px-4 py-2 text-left text-gray-700 font-medium">End date</th>
                    <th className="px-4 py-2 text-left text-gray-700 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {workflowSteps && workflowSteps.length > 0 ? (
                    workflowSteps.map((workflow, index) => (
                      <tr 
                        key={workflow.id || `task-${index}`} 
                        className={`border-b hover:bg-gray-50 ${workflow.id === lastAddedTaskId ? 'bg-green-50 animate-pulse' : ''}`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex flex-col" onClick={() => handleEditTask(index)}>
                            <span className="cursor-pointer hover:text-blue-600">{workflow.name || workflow.taskName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">{formatTAT(workflow.turnAroundTime)}</td>
                        <td className="px-4 py-3">{workflow.selectedOwners?.map(owner => owner.text).join(', ')}</td>
                        <td className="px-4 py-3">{formatDate(workflow.start_date || workflow.startDate)}</td>
                        <td className="px-4 py-3">{formatDate(workflow.end_date || workflow.endDate)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-sm ${getStatusStyle(workflow.statusName)}`}>
                            {workflow.statusName || 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-gray-500">
                        No tasks available. Click "Add Step" to create a new task.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          
            <div className="gap-2 flex mt-20">
              <button
                onClick={handleBackClick}
                className="py-3 rounded-lg bg-[#C3C3C3] disabled:bg-button-pink/70 text-black font-bold flex justify-center items-center flex-1 basis-64 shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.30)] whitespace-nowrap"
              >
                Back
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
      ) : (
        <WorkflowForm
          formData={formData}
          processId={formData?.processTab?.processNumber}
          workflowSteps={workflowSteps} 
          editingIndex={editingIndex}
          savedFormData={savedWorkflowForm}
          saveFormState={handleSaveFormState}
          setShowWorkflowForm={setShowWorkflowForm}
          closeForm={() => {
            setShowWorkflowForm(false);
            setEditingIndex(null);
          }}
          addTaskToWorkflow={(task) => {
            const updatedSteps = [...workflowSteps, task];
            setWorkflowSteps(updatedSteps);
            if (updateFormData) {
              updateFormData({
                ...formData?.taskWorkflow,
                tasks: updatedSteps,
              });
            }
          }}
          updateTaskInWorkflow={(task, index) => {
            const updatedSteps = [...workflowSteps];
            updatedSteps[index] = task;
            setWorkflowSteps(updatedSteps);
            if (updateFormData) {
              updateFormData({
                ...formData?.taskWorkflow,
                tasks: updatedSteps,
              });
            }
          }}
          onAfterSave={() => {
            setShowWorkflowForm(false);
            setEditingIndex(null);
          }}
        />
      )}
    </div>
  );
};

export default TaskAndWorkflow;
