import React, { useState, useEffect } from "react";
import { CKEField, Field } from "../../../../partials/Elements/Elements";
import SelectDropdown from "../../../../partials/dropdowns/SelectDropdown/SelectDropdown";
import MultiSelectorDropdown from "../../../../partials/dropdowns/MultiSelectorDropdown/MultiSelectorDropdown";
import {
  FormCancelButton,
  FormProceedButton,
} from "../../../../partials/buttons/FormButtons/FormButtons";
import ProcessService from "../../../../../services/Process.service";
import { useQuery } from "@tanstack/react-query";
import { useMessage } from "../../../../../contexts/MessageContext";

import { PiDotsThreeVerticalBold } from "react-icons/pi";

const WorkflowForm = ({ setWorkflowSteps, setShowWorkflowForm, savedFormData, taskId }) => {
  const { dispatchMessage } = useMessage();
  
  const [formDetails, setFormDetails] = useState({
    taskName: savedFormData?.taskName || "",
    description: savedFormData?.description || "",
    turnAroundTime: savedFormData?.turnAroundTime || "",
    statusName: savedFormData?.statusName || "",
    startDate: savedFormData?.startDate || "",
    endDate: savedFormData?.endDate || "",
    owner_ids: savedFormData?.owner_ids || [],
    note: savedFormData?.note || "",
    control: savedFormData?.control || "",
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
      // Update form with existing task data
      setFormDetails({
        taskName: data.name || "",
        description: data.description || "",
        turnAroundTime: data.tat?.replace(" Hours", "") || "",
        statusName: data.status?.toString() || "",
        startDate: data.start_date || "",
        endDate: data.end_date || "",
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
      const contentData = {
        name: formDetails.taskName,
        description: formDetails.description,
        owner: selectedOwners.map(owner => owner.id),
        tat: formDetails.turnAroundTime,
        tags: "car yam egg",
        control_measure: formDetails.control,
        status: 1,
        note: formDetails.note || "12sd",
        assignment: 6,
        start_date: formDetails.startDate,
        end_date: formDetails.endDate
      };

      console.log('Sending task data:', contentData);

      if (taskId) {
        // Update existing task
        await ProcessService.updateProcessTask(taskId, contentData);
        dispatchMessage('success', 'Workflow task updated successfully');
      } else {
        // Create new task
        await ProcessService.addProcessTask(contentData);
        dispatchMessage('success', 'Workflow task saved successfully');
      }

      // Update the workflow steps UI
      const uiData = {
        task: formDetails.taskName,
        tat: formDetails.turnAroundTime + " Hours",
        status: formDetails.statusName,
        startDate: formDetails.startDate,
        endDate: formDetails.endDate,
        owners: selectedOwners.map(owner => owner.text),
        description: formDetails.description,
        note: formDetails.note,
        control: formDetails.control,
      };
      
      setWorkflowSteps(prevSteps => {
        if (taskId) {
          // Update existing step
          return prevSteps.map(step => 
            step.id === taskId ? uiData : step
          );
        }
        // Add new step
        return [...prevSteps, uiData];
      });

      setShowWorkflowForm(false);
    } catch (error) {
      console.error("Error saving workflow task:", error);
      let errorMessage = taskId ? 'Failed to update workflow task. ' : 'Failed to save workflow task. ';
      
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.response?.status === 404) {
        errorMessage += 'Task endpoint not found.';
      } else if (error.response?.status === 400) {
        errorMessage += 'Please check if all fields are filled correctly.';
      } else {
        errorMessage += 'An unexpected error occurred.';
      }
      
      dispatchMessage('error', errorMessage);
    }
  };

  const handleSaveAsDraft = async () => {
    try {
      const contentData = {
        name: formDetails.taskName || "",
        description: formDetails.description || "",
        owner: selectedOwners.map(owner => owner.id),
        tat: formDetails.turnAroundTime || "0",
        tags: "car yam egg",
        control_measure: formDetails.control || "",
        status: 1,
        note: formDetails.note || "",
        assignment: 6,
        start_date: formDetails.startDate || "",
        end_date: formDetails.endDate || ""
      };

      console.log('Saving task as draft:', contentData);

      if (taskId) {
        // Update existing task
        await ProcessService.updateProcessTask(taskId, contentData);
        dispatchMessage('success', 'Workflow task draft updated successfully');
      } else {
        // Create new task
        await ProcessService.addProcessTask(contentData);
        dispatchMessage('success', 'Workflow task draft saved successfully');
      }

      // Update the workflow steps UI only if we have the minimum required data
      if (formDetails.taskName) {
        const uiData = {
          task: formDetails.taskName,
          tat: formDetails.turnAroundTime ? formDetails.turnAroundTime + " Hours" : "",
          status: formDetails.statusName || "",
          startDate: formDetails.startDate || "",
          endDate: formDetails.endDate || "",
          owners: selectedOwners.map(owner => owner.text),
          description: formDetails.description || "",
          note: formDetails.note || "",
          control: formDetails.control || "",
        };
        
        setWorkflowSteps(prevSteps => {
          if (taskId) {
            // Update existing step
            return prevSteps.map(step => 
              step.id === taskId ? uiData : step
            );
          }
          // Add new step
          return [...prevSteps, uiData];
        });
      }

      // Don't close the form when saving as draft
      dispatchMessage('success', 'Draft saved successfully!');
    } catch (error) {
      console.error("Error saving workflow task draft:", error);
      let errorMessage = taskId ? 'Failed to update workflow task draft. ' : 'Failed to save workflow task draft. ';
      
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.response?.status === 404) {
        errorMessage += 'Task endpoint not found.';
      } else if (error.response?.status === 400) {
        errorMessage += 'Please check if all fields are filled correctly.';
      } else {
        errorMessage += 'An unexpected error occurred.';
      }
      
      dispatchMessage('error', errorMessage);
    }
  };

  const handleBack = () => {
    const currentFormState = {
      ...formDetails,
      selectedOwners
    };
    setShowWorkflowForm(false);
    if (typeof savedFormData === 'function') {
      savedFormData(currentFormState);
    }
  };

  // Show loading state while fetching task data
  if (taskId && taskLoading) {
    return <div className="text-center py-4">Loading task data...</div>;
  }

  return (
    <div className="bg-white mt-4 p-7 pt-4 border border-[#CCC] w-full flex flex-col gap-6 rounded-lg relative">
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
          <div className="relative">
            <input
              type="number"
              name="turnAroundTime"
              value={formDetails.turnAroundTime}
              placeholder="5"
              onChange={handleInputChange}
              className={`bg-white border ${errors.turnAroundTime ? 'border-red-500' : 'border-[#79747E]'} shadow max-w-[100px] px-2 py-2 rounded-lg`}
            />
            <span className="ml-2">Hours</span>
            {errors.turnAroundTime && (
              <p className="text-red-500 text-sm mt-1">{errors.turnAroundTime}</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex gap-3 pt-6">
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
      
      <div className="flex gap-4 pt-5">
        <div className="w-1/2">
          <Field
            {...{
              type: "date",
              name: "startDate",
              value: formDetails.startDate,
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
              value: formDetails.endDate,
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

function HoursDropdown({ categories, selected, onChange }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  return (
    <SelectDropdown
      label={""}
      placeholder={"Hours"}
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
