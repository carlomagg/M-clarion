import React, { useState, useEffect } from "react";
import { CKEField, Field } from "../../../../partials/Elements/Elements";
import SelectDropdown from "../../../../partials/dropdowns/SelectDropdown/SelectDropdown";
import MultiSelectorDropdown from "../../../../partials/dropdowns/MultiSelectorDropdown/MultiSelectorDropdown";
import {
  FormCancelButton,
  FormProceedButton,
} from "../../../../partials/buttons/FormButtons/FormButtons";
import ProcessService from "../../../../../services/Process.service";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMessage } from "../../../../../contexts/MessageContext";
import { useParams } from "react-router-dom";

import { PiDotsThreeVerticalBold } from "react-icons/pi";

// Debug helper for message alerts
const showDebugAlert = (message) => {
  // Create a temporary element to show the message
  const alertElement = document.createElement('div');
  alertElement.style.position = 'fixed';
  alertElement.style.bottom = '20px';
  alertElement.style.right = '20px';
  
  // Determine if this is an error message
  const isError = message.toLowerCase().includes('error');
  
  // Set background color based on message type
  alertElement.style.backgroundColor = isError ? '#F44336' : '#4CAF50'; // Red for errors, green for success
  alertElement.style.color = 'white';
  alertElement.style.padding = '15px';
  alertElement.style.borderRadius = '5px';
  alertElement.style.zIndex = '9999';
  alertElement.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
  alertElement.textContent = message;
  
  // Add to document
  document.body.appendChild(alertElement);
  
  // Remove after 3 seconds
  setTimeout(() => {
    document.body.removeChild(alertElement);
  }, 3000);
};

const WorkflowForm = ({ 
  setWorkflowSteps, 
  setShowWorkflowForm, 
  savedFormData, 
  taskId,
  existingSteps = [],
  addTaskToWorkflow,
  updateTaskInWorkflow,
  onAfterSave = () => {},
  initialValues,
  editingIndex,
  saveFormState,
  workflowSteps,
  processId: propProcessId,
  assignmentId: propAssignmentId
}) => {
  // Use passed processId prop if available, otherwise fall back to URL params
  const { id: urlProcessId } = useParams();
  const processId = propProcessId || urlProcessId;
  
  console.log("WorkflowForm - Using processId:", processId);
  console.log("WorkflowForm - Using assignmentId:", propAssignmentId);
  
  const queryClient = useQueryClient();
  const { dispatchMessage } = useMessage();
  
  const [formDetails, setFormDetails] = useState({
    taskName: savedFormData?.taskName || savedFormData?.name || "",
    description: savedFormData?.description || "",
    turnAroundTime: savedFormData?.turnAroundTime || "",
    statusName: savedFormData?.statusName || "",
    startDate: savedFormData?.startDate || savedFormData?.start_date || "",
    endDate: savedFormData?.endDate || savedFormData?.end_date || "",
    owner_ids: savedFormData?.owner_ids || [],
    note: savedFormData?.note || "",
    control: savedFormData?.control || savedFormData?.control_measure || "",
  });

  const [selectedOwners, setSelectedOwners] = useState(savedFormData?.selectedOwners || []);
  const [errors, setErrors] = useState({});

  // Fetch users for owners dropdown
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => ProcessService.getUsers(),
  });

  // Transform users data for dropdown format
  const formattedUsers = React.useMemo(() => {
    console.log('Raw users data:', users);
    if (!users || !Array.isArray(users)) return [];
    
    return users.map(user => ({
      id: user.user_id,
      text: `${user.firstname} ${user.lastname}`,
      email: user.email,
      is_admin: user.is_admin,
      is_suspended: user.is_suspended
    })).filter(user => !user.is_suspended);
  }, [users]);

  // Debug logging
  console.log("Formatted users for dropdown:", formattedUsers);

  // Fetch process statuses
  const { data: ProcessStatus } = useQuery({
    queryKey: ["processstatus"],
    queryFn: () => ProcessService.getProcessStatus(),
  });

  // Fetch task data if taskId is provided (edit mode)
  const { data: taskData, isLoading: taskLoading } = useQuery({
    queryKey: ["task", taskId],
    queryFn: () => ProcessService.getProcessTask(taskId),
    enabled: !!taskId, // Only run query if taskId exists
    onSuccess: (data) => {
      // Parse TAT value for proper display
      let tatValue = data.TAT || "";
      // If TAT contains "HOURS", convert to minutes for editing
      if (typeof tatValue === 'string' && tatValue.includes('HOURS')) {
        const hoursValue = parseInt(tatValue.replace('HOURS', '').trim());
        tatValue = hoursValue * 60; // Convert hours to minutes
      } else if (typeof tatValue === 'string') {
        // Extract numeric value if it exists
        const match = tatValue.match(/\d+/);
        tatValue = match ? match[0] : "";
      }

      // Update form with existing task data
      setFormDetails({
        taskName: data.name || "",
        description: data.description || "",
        turnAroundTime: tatValue,
        statusName: data.status?.toString() || "",
        startDate: data.start_date || "", // API returns YYYY-MM-DD
        endDate: data.end_date || "", // API returns YYYY-MM-DD
        owner_ids: data.owner_ids || [],
        note: data.note || "",
        control: data.control_measure || "",
      });
      // Set selected owners if they exist
      if (data.owner_ids) {
        const ownerData = data.owner_ids.map(id => {
          const user = users?.data?.find(u => u.user_id === id);
          return user ? {
            id: user.user_id,
            text: `${user.firstname} ${user.lastname}`
          } : null;
        }).filter(Boolean);
        setSelectedOwners(ownerData);
      }
    }
  });

  // Debug logging
  useEffect(() => {
    console.log("WorkflowForm - Initializing with savedFormData:", savedFormData);
    console.log("WorkflowForm - Existing steps:", existingSteps);
    console.log("WorkflowForm - Task ID for editing:", taskId);
  }, [savedFormData, existingSteps, taskId]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formDetails.taskName?.trim()) {
      newErrors.taskName = "Task name is required";
    }
    
    if (!formDetails.description?.trim()) {
      newErrors.description = "Description is required";
    }
    
    if (!formDetails.turnAroundTime) {
      newErrors.turnAroundTime = "Turn around time is required";
    } else if (isNaN(formDetails.turnAroundTime) || formDetails.turnAroundTime <= 0) {
      newErrors.turnAroundTime = "Turn around time must be a positive number";
    }
    
    if (!formDetails.statusName) {
      newErrors.statusName = "Status is required";
    }
    
    if (!selectedOwners.length) {
      newErrors.owners = "At least one owner must be selected";
    }
    
    if (!formDetails.startDate) {
      newErrors.startDate = "Start date is required";
    }
    
    if (!formDetails.endDate) {
      newErrors.endDate = "End date is required";
    } else if (new Date(formDetails.startDate) > new Date(formDetails.endDate)) {
      newErrors.endDate = "End date must be after start date";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormDetails(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      dispatchMessage('error', 'Please fill in all required fields correctly');
      return;
    }

    try {
      // Format dates properly for API
      const formattedStartDate = formDetails.startDate ? 
        new Date(formDetails.startDate).toISOString().split('T')[0] + ' 00:00:00.000' :
        "2024-11-14 05:59:11.803";
      
      const formattedEndDate = formDetails.endDate ? 
        new Date(formDetails.endDate).toISOString().split('T')[0] + ' 00:00:00.000' :
        "2024-11-24 05:59:11.803";
        
      // Use the assignment ID from props, or try to find it from workflowSteps
      const assignmentId = propAssignmentId || (workflowSteps && workflowSteps[0]?.assignmentId);
      console.log("WorkflowForm - Using assignmentId for task:", assignmentId);
      
      // The payload for the API
      const taskData = {
        owner: 1,
        name: formDetails.taskName,
        description: formDetails.description,
        tat: `${formDetails.turnAroundTime} MINUTES`,
        tags: "car yam egg",
        control_measure: formDetails.control || "Get a measure",
        status: 1,
        note: formDetails.note || "12sd",
        assignment: assignmentId, // Use the actual assignment ID
        start_date: formattedStartDate,
        end_date: formattedEndDate
      };

      console.log('Sending task data to correct endpoint:', taskData);
      console.log(`Using specific URL: /process/process-assignments/${assignmentId}/process-tasks/`);

      // Call the service with the actual assignment ID
      const result = await ProcessService.addProcessTask(assignmentId, taskData);
      console.log("Task saved successfully:", result);

      // Create the new task object
      const newTask = {
        ...taskData,
        id: result.id || Math.floor(Math.random() * 10000), // Simple numeric ID if API doesn't return one
        selectedOwners: selectedOwners,
        turnAroundTime: formDetails.turnAroundTime,
        statusName: result.status || 'Pending',
        start_date: formattedStartDate, // Use formatted date
        end_date: formattedEndDate, // Use formatted date
        startDate: formattedStartDate, // Include both versions for consistency
        endDate: formattedEndDate, // Include both versions for consistency
        taskName: formDetails.taskName // Add taskName for consistency
      };
      
      console.log("New task created:", newTask);
      
      // Use the direct functions for updating task list
      if (taskId) {
        updateTaskInWorkflow(taskId, newTask);
        // Use consistent message format and log the message dispatching
        console.log("Dispatching success message: Task updated successfully");
        dispatchMessage('success', 'Task updated successfully');
        // Show debug alert as backup
        showDebugAlert('Task updated successfully');
      } else {
        // Make sure addTaskToWorkflow is called with the new task
        if (typeof addTaskToWorkflow === 'function') {
          addTaskToWorkflow(newTask);
          // Use consistent message format and log the message dispatching
          console.log("Dispatching success message: Task added successfully");
          dispatchMessage('success', 'Task added successfully');
          // Show debug alert as backup
          showDebugAlert('Task added successfully');
        } else {
          console.error("addTaskToWorkflow is not a function", addTaskToWorkflow);
          dispatchMessage('error', 'Could not add task to workflow');
          // Show debug alert as backup
          showDebugAlert('Error: Could not add task to workflow');
        }
      }
      
      setShowWorkflowForm(false);
      onAfterSave();
    } catch (error) {
      console.error('Error saving task:', error);
      let errorMessage = 'Failed to save task. ';
      
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage += 'Please check if all required fields are filled correctly.';
      } else if (error.response?.status === 404) {
        errorMessage += 'Task endpoint not found.';
      } else {
        errorMessage += error.message || 'An unexpected error occurred.';
      }
      
      dispatchMessage('error', errorMessage);
      // Show debug alert for error
      showDebugAlert('Error: ' + errorMessage);
    }
  };

  // Format date for input fields (YYYY-MM-DD)
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  };

  const handleSaveAsDraft = async () => {
    try {
      // Format dates properly for API
      const formattedStartDate = formDetails.startDate ? 
        new Date(formDetails.startDate).toISOString().split('T')[0] + ' 00:00:00.000' :
        "2024-11-14 05:59:11.803";
      
      const formattedEndDate = formDetails.endDate ? 
        new Date(formDetails.endDate).toISOString().split('T')[0] + ' 00:00:00.000' :
        "2024-11-24 05:59:11.803";
        
      // Use the assignment ID from props, or try to find it from workflowSteps
      const assignmentId = propAssignmentId || (workflowSteps && workflowSteps[0]?.assignmentId);
      console.log("WorkflowForm - Using assignmentId for task:", assignmentId);
      
      // Use the assignment ID from props, or try to find it from workflowSteps
      const draftAssignmentId = propAssignmentId || (workflowSteps && workflowSteps[0]?.assignmentId);
      console.log("WorkflowForm - Using assignmentId for draft task:", draftAssignmentId);
      
      // The payload structure for the API
      const taskData = {
        owner: 1,
        name: formDetails.taskName || "Draft Task",
        description: formDetails.description || "Draft description",
        tat: `${formDetails.turnAroundTime || "2"} MINUTES`,
        tags: "car yam egg",
        control_measure: formDetails.control || "Get a measure",
        status: 1,
        note: formDetails.note || "12sd",
        assignment: draftAssignmentId, // Use the actual assignment ID
        start_date: formattedStartDate,
        end_date: formattedEndDate
      };

      console.log('Sending draft task data to correct endpoint:', taskData);
      console.log(`Using specific URL: /process/process-assignments/${draftAssignmentId}/process-tasks/`);

      // Call the service with the actual assignment ID
      const result = await ProcessService.addProcessTask(draftAssignmentId, taskData);

      // Create new draft task object
      const newTask = {
        ...taskData,
        id: result.id || Math.floor(Math.random() * 10000), // Simple numeric ID
        selectedOwners: selectedOwners,
        turnAroundTime: formDetails.turnAroundTime || "2",
        statusName: 'Pending',
        start_date: formattedStartDate, // Use formatted date
        end_date: formattedEndDate, // Use formatted date
        startDate: formattedStartDate, // Include both versions for consistency
        endDate: formattedEndDate, // Include both versions for consistency
        taskName: formDetails.taskName || "Draft Task" // Add taskName for consistency
      };
      
      console.log("New draft task created:", newTask);
      
      // Check if addTaskToWorkflow is a function before calling it
      if (typeof addTaskToWorkflow === 'function') {
        // Always add as new task when saving as draft
        addTaskToWorkflow(newTask);
        // Use consistent message format and log the message dispatching
        console.log("Dispatching success message: Task draft saved successfully!");
        dispatchMessage('success', 'Task draft saved successfully!');
        // Show debug alert as backup
        showDebugAlert('Task draft saved successfully!');
      } else {
        console.error("addTaskToWorkflow is not a function", addTaskToWorkflow);
        dispatchMessage('error', 'Could not save draft task to workflow');
        // Show debug alert as backup
        showDebugAlert('Error: Could not save draft task to workflow');
      }
      
      // Close form regardless
      if (typeof setShowWorkflowForm === 'function') {
        setShowWorkflowForm(false);
      } else if (typeof closeForm === 'function') {
        closeForm();
      }
      
      onAfterSave();
    } catch (error) {
      console.error('Error saving task draft:', error);
      let errorMessage = 'Failed to save draft. ';
      
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage += 'Please check if all required fields are filled correctly.';
      } else if (error.response?.status === 404) {
        errorMessage += 'Task endpoint not found.';
      } else {
        errorMessage += error.message || 'An unexpected error occurred.';
      }
      
      dispatchMessage('error', errorMessage);
      // Show debug alert for error
      showDebugAlert('Error: ' + errorMessage);
    }
  };

  const handleBack = () => {
    const currentFormState = {
      ...formDetails,
      selectedOwners
    };
    
    // Save form state if the function is provided
    if (typeof saveFormState === 'function') {
      console.log("Saving form state before going back:", currentFormState);
      saveFormState(currentFormState);
    } else {
      console.log("saveFormState is not a function or not provided");
    }
    
    // Close the form regardless
    if (typeof setShowWorkflowForm === 'function') {
      setShowWorkflowForm(false);
    } else if (typeof closeForm === 'function') {
      closeForm();
    }
  };

  // Show loading state while fetching task data
  if (taskId && taskLoading) {
    return <div className="text-center py-4">Loading task data...</div>;
  }

  return (
    <div className="bg-white mt-4 p-7 pt-4 border border-[#CCC] w-full max-w-4xl mx-auto flex flex-col gap-6 rounded-lg relative">
      <div className="w-full items-center gap-4 pt-3">
        <Field
          {...{
            name: "taskName",
            value: formDetails.taskName,
            label: "Task Name",
            onChange: handleInputChange,
            placeholder: "Enter task name",
            error: errors.taskName,
            required: true
          }}
        />
      </div>
      
      <div className="gap-4 pt-5">
        <CKEField
          {...{
            name: "description",
            label: "Description",
            value: formDetails.description,
            onChange: handleInputChange,
            error: errors.description,
            required: true
          }}
        />
      </div>
      
      <div className="gap-5 pt-5">
        <p className="pb-4">Turn around Time <span className="text-red-500">*</span></p>
        <div className="flex gap-3">
          <div className="relative w-1/3">
            <input
              type="number"
              name="turnAroundTime"
              value={formDetails.turnAroundTime}
              placeholder="5"
              onChange={handleInputChange}
              className={`bg-white border ${errors.turnAroundTime ? 'border-red-500' : 'border-[#79747E]'} shadow max-w-[100px] px-2 py-2 rounded-lg`}
            />
            <span className="ml-2">Minutes</span>
            {errors.turnAroundTime && (
              <p className="text-red-500 text-sm mt-1">{errors.turnAroundTime}</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex gap-6 pt-6">
        <div className="w-1/2">
          <MultiSelectorDropdown
            allItems={formattedUsers}
            selectedItems={selectedOwners}
            onSetItems={setSelectedOwners}
            placeholder={usersLoading ? "Loading owners..." : "Select owner (one or more)"}
            label={"Owners"}
            name={"owner_ids"}
            error={errors.owners}
            required={true}
          />
          {formattedUsers.length === 0 && !usersLoading && (
            <p className="text-sm text-gray-500 mt-1">No users available</p>
          )}
        </div>
        
        <div className="w-1/2">
          <label className="block mb-2">Status <span className="text-red-500">*</span></label>
          <select
            className={`p-2 w-full border rounded-lg ${errors.statusName ? 'border-red-500' : 'border-[#79747E]'}`}
            value={formDetails.statusName}
            name="statusName"
            onChange={handleInputChange}
          >
            <option value="">Select Status</option>
            {ProcessStatus?.["Process Status"]?.map((status, index) => (
              <option key={index} value={status.id}>
                {status.name}
              </option>
            ))}
          </select>
          {errors.statusName && (
            <p className="text-red-500 text-sm mt-1">{errors.statusName}</p>
          )}
        </div>
      </div>
      
      <div className="flex gap-6 pt-5">
        <div className="w-1/2">
          <Field
            {...{
              type: "date",
              name: "startDate",
              value: formDetails.startDate, // Use date directly
              label: "Start Date",
              onChange: handleInputChange,
              error: errors.startDate,
              required: true
            }}
          />
        </div>

        <div className="w-1/2">
          <Field
            {...{
              type: "date",
              name: "endDate",
              value: formDetails.endDate, // Use date directly
              label: "End Date",
              onChange: handleInputChange,
              error: errors.endDate,
              required: true
            }}
          />
        </div>
      </div>

      <div className="gap-4 pt-5">
        <CKEField
          {...{
            name: "control",
            label: "Control Measures",
            value: formDetails.control,
            onChange: handleInputChange
          }}
        />
      </div>

      <div className="gap-4 pt-5">
        <CKEField
          {...{
            name: "note",
            label: "Note",
            value: formDetails.note,
            onChange: handleInputChange
          }}
        />
      </div>

      <div className="flex gap-4 mt-8">
        <button
          onClick={handleBack}
          className="py-3 rounded-lg bg-[#C3C3C3] disabled:bg-button-pink/70 text-black font-bold flex justify-center items-center flex-1 basis-64 shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.30)] whitespace-nowrap"
        >
          Back
        </button>
        <button
          onClick={handleSaveAsDraft}
          className="py-3 rounded-lg bg-[#C3C3C3] disabled:bg-button-pink/70 text-black font-bold flex justify-center items-center flex-1 basis-64 shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.30)] whitespace-nowrap"
        >
          Save to draft
        </button>
        <button
          onClick={handleSave}
          className="py-3 rounded-lg bg-button-pink disabled:bg-button-pink/70 text-white font-bold flex justify-center items-center flex-1 basis-64 shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.30)] whitespace-nowrap"
        >
          Save
        </button>
      </div>
    </div>
  );
};

function MinutesDropdown({ categories, selected, onChange }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  return (
    <SelectDropdown
      label={""}
      placeholder={"Minutes"}
      items={categories}
      name={"class"}
      selected={selected}
      onSelect={onChange}
      isCollapsed={isCollapsed}
      onToggleCollpase={setIsCollapsed}
    />
  );
}

function StatusDropdown({ categories, selected, onChange }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  return (
    <SelectDropdown
      label={"Status"}
      placeholder={"Pending"}
      items={categories}
      name={"class"}
      selected={selected}
      onSelect={onChange}
      isCollapsed={isCollapsed}
      onToggleCollpase={setIsCollapsed}
    />
  );
}

function VersionDropdown({ categories, selected, onChange }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  return (
    <SelectDropdown
      label={"Version"}
      placeholder={"1.0"}
      items={categories}
      name={"class"}
      selected={selected}
      onSelect={onChange}
      isCollapsed={isCollapsed}
      onToggleCollpase={setIsCollapsed}
    />
  );
}

export default WorkflowForm;
