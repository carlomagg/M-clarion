import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { hideAssignedProcess } from "../../../../../config/slices/globalSlice";
import SelectDropdown from "../../../../partials/dropdowns/SelectDropdown/SelectDropdown";
import MultiSelectorDropdown from "../../../../partials/dropdowns/MultiSelectorDropdown/MultiSelectorDropdown";
import { CKEField } from "../../../../partials/Elements/Elements";
import ProcessService from "../../../../../services/Process.service";
import { useQuery } from "@tanstack/react-query";
import { useMessage } from "../../../../../contexts/MessageContext.jsx";

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

const ProcessTab = ({ setActiveTab, formData, updateFormData, fromRiskLog }) => {
  // const [priority, setPriority] = useState("High");
  const [assignmentForm, setAssignmentForm] = useState({
    description: formData.description || "",
    note: formData.note || "",
    businessUnit: formData.businessUnit || "",
    priority: formData.priorityLevel || "High",
  });
  const [selectedProcesses, setSelectedProcesses] = useState(formData.relatedProcesses || []);

  const { processTypeTitle, processType, processId } = useSelector(
    (state) => state.global
  );

  console.log("Current Process ID:", processId); // Add this debug log

  // Fetch all processes for the dropdown
  const { data: processDataLog } = useQuery({
    queryKey: ["processeslog"],
    queryFn: () => ProcessService.getProcessLog(),
  });

  // Transform processes for dropdown format
  const availableProcesses = processDataLog?.Processes?.map(process => ({
    id: process.id,
    text: process.name
  })) || [];

  // Filter out the current process from the available processes
  const relatedProcesses = availableProcesses.filter(process => process.id !== processId);

  const {
    isLoading,
    data: BusinessUnit,
    error,
    refetch,
  } = useQuery({
    queryKey: ["businessunit"],
    queryFn: () => ProcessService.getBusinessUnit(),
  });

  const { isLoading: geepy, data: PriorityLevel } = useQuery({
    queryKey: ["priorityLevel"],
    queryFn: () => ProcessService.getPriorityLevel(),
  });

  const { dispatchMessage } = useMessage();

  useEffect(() => {
    // Only attempt to update the priority if we have valid data
    if (PriorityLevel && PriorityLevel.process_boundaries && Array.isArray(PriorityLevel.process_boundaries) && PriorityLevel.process_boundaries.length > 0) {
      // We have a valid priority level, use it
      // Only set default if priority isn't already set
      if (!assignmentForm.priority) {
        setAssignmentForm(prevForm => ({
          ...prevForm,
          priority: PriorityLevel.process_boundaries[0].id
        }));
        console.log("Set priority level to:", PriorityLevel.process_boundaries[0].id);
      } else {
        console.log("Priority already set to:", assignmentForm.priority);
      }
    } else {
      // No valid priority level data, use default
      console.log("No valid priority levels from API, using default");
      // Keep using the existing priority or set to a default string value that won't crash
      // Don't try to set to undefined or null
      setAssignmentForm(prevForm => ({
        ...prevForm,
        priority: prevForm.priority || 1 // Default to id 1 (Low)
      }));
    }
  }, [PriorityLevel]);

  console.log("Current priority:", assignmentForm.priority);
  console.log("Priority levels:", PriorityLevel);

  const handlePriorityClick = (level) => {
    console.log("Selected priority level:", level.id);
    setAssignmentForm((prevForm) => ({
      ...prevForm, // Spread the previous state
      priority: level.id, // Update the specific field
    }));
    
    // Also update the parent form data to ensure it's passed to review
    if (updateFormData) {
      updateFormData({
        priorityLevel: level.id
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target; // Get input name and value
    console.log({ name: name, value: value });
    setAssignmentForm((prevForm) => ({
      ...prevForm, // Spread the previous state
      [name]: value, // Update the specific field
    }));
  };
  const categories = [
    { id: 1, text: "Category 1" },
    { id: 2, text: "Category 2" },
    { id: 3, text: "Category 3" },
    { id: 4, text: "Category 4" },
  ];
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleBackorDiscard = () => {
    // First hide the process assignment screen in the Redux state
    dispatch(hideAssignedProcess());
    
    // Then navigate based on context
    if (fromRiskLog) {
      // If we came from risk log, go back to risk log
      navigate('/risks');
    } else {
      // If we're on the process assignment page, go back to the process selector
      // Otherwise, go to the process log
      if (location.pathname === "/process-management/assign") {
        // Force a reload to ensure clean state
        window.location.href = '/process-management/log';
      } else {
        navigate('/process-management/log');
      }
    }
  };

  const stripHtmlTags = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '');
  };

  // Add validation function to check required fields
  const validateForm = () => {
    const validationErrors = [];
    
    // Check if business unit is selected
    if (!assignmentForm.businessUnit) {
      validationErrors.push("Business Unit is required");
    }
    
    // Check priority level (though this should always have a default value)
    if (!assignmentForm.priority) {
      validationErrors.push("Priority Level is required");
    }
    
    // Check description/dependencies field
    if (!stripHtmlTags(assignmentForm.description).trim()) {
      validationErrors.push("Dependencies field is required");
    }
    
    // Optional: validate note field if it's required
    // if (!stripHtmlTags(assignmentForm.note).trim()) {
    //   validationErrors.push("Notes field is required");
    // }
    
    // Return validation results
    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors
    };
  };

  const handleNextButtonClick = async () => {
    console.log("Attempting to proceed to Task and Workflow with form data:", assignmentForm);
    
    // Validate the form before proceeding
    const validation = validateForm();
    if (!validation.isValid) {
      const errorMessage = `Please complete these required fields: ${validation.errors.join(", ")}`;
      dispatchMessage('error', errorMessage);
      console.log('Validation failed:', validation.errors);
      // Add debug alert for validation error
      showDebugAlert('Error: ' + errorMessage);
      return; // Stop execution if validation fails
    }
    
    try {
      // Save to database before proceeding (similar to handleSaveAsDraft)
      const contentData = {
        process_id: processId,
        unit: parseInt(assignmentForm.businessUnit),
        level: assignmentForm.priority,
        dependency: stripHtmlTags(assignmentForm.description),
        note: stripHtmlTags(assignmentForm.note),
        process_ids: selectedProcesses.map(process => process.id)
      };
      
      // Save to database
      const assignmentResponse = await ProcessService.addProcessAssignment(contentData);
      console.log("Process Assignment API response:", assignmentResponse);
      
      // Get the assignment ID from the response
      const assignmentId = assignmentResponse?.id || assignmentResponse?.assignment_id;
      console.log("Retrieved assignment ID:", assignmentId);
      
      // Include the priority and assignment ID in the update
      const updatedFormData = {
        ...assignmentForm,
        priority: assignmentForm.priority,
        processType: processType,
        relatedProcesses: selectedProcesses,
        assignmentId: assignmentId // Store the assignment ID in the form data
      };
      
      // Update parent form data
      if (updateFormData) {
        updateFormData(updatedFormData);
      }
      
      // Show a success message when proceeding to next step
      dispatchMessage('success', 'Process assignment saved successfully');
      console.log('Process assignment saved successfully - alert dispatched');
      // Add debug alert to ensure visibility
      showDebugAlert('Process assignment saved successfully');
      
      // Navigate to next tab
      setActiveTab("Task And Workflow");
    } catch (error) {
      console.error("Error in saving process assignment:", error);
      let errorMessage = 'Failed to save process assignment. ';
      
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage += 'Please check if all required fields are filled correctly.';
      } else if (error.response?.status === 404) {
        errorMessage += 'Process assignment endpoint not found.';
      } else {
        errorMessage += 'An unexpected error occurred.';
      }
      
      dispatchMessage('error', errorMessage);
      // Add debug alert for error
      showDebugAlert('Error: ' + errorMessage);
    }
  };

  const handleSaveAsDraft = async () => {
    try {
      // Validate the form before saving as draft
      // For drafts, let's be less strict but still require some minimum values
      if (!assignmentForm.businessUnit) {
        dispatchMessage('error', 'Business Unit is required even for draft');
        return;
      }
      
      const contentData = {
        process_id: processId,
        unit: parseInt(assignmentForm.businessUnit),
        level: assignmentForm.priority,
        dependency: stripHtmlTags(assignmentForm.description),
        note: stripHtmlTags(assignmentForm.note),
        process_ids: selectedProcesses.map(process => process.id)
      };
      
      await ProcessService.addProcessAssignment(contentData);
      dispatchMessage('success', 'Process assignment draft saved successfully');
      console.log('Process assignment draft saved successfully - alert dispatched');
      // Add debug alert to ensure visibility
      showDebugAlert('Process assignment draft saved successfully');
      // Note: We don't navigate to Task And Workflow when saving as draft
    } catch (error) {
      console.error("Error in saving draft:", error);
      let errorMessage = 'Failed to save draft. ';
      
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage += 'Please check if all required fields are filled correctly.';
      } else if (error.response?.status === 404) {
        errorMessage += 'Process assignment endpoint not found.';
      } else {
        errorMessage += 'An unexpected error occurred.';
      }
      
      dispatchMessage('error', errorMessage);
      // Add debug alert for error
      showDebugAlert('Error: ' + errorMessage);
    }
  };

  // Update parent state whenever local state changes
  useEffect(() => {
    if (processId) { // Only update if we have a processId
      updateFormData({
        title: processTypeTitle,
        description: assignmentForm.description,
        processType: processType,
        businessUnit: assignmentForm.businessUnit,
        priorityLevel: assignmentForm.priority,
        relatedProcesses: selectedProcesses,
        dependencies: assignmentForm.description,
        note: assignmentForm.note,
        processNumber: processId
      });
    }
  }, [assignmentForm, selectedProcesses, processTypeTitle, processType, processId]);

  // Initialize form data with processId when it becomes available
  useEffect(() => {
    if (processId && updateFormData) {
      updateFormData(prevData => ({
        ...prevData,
        processNumber: processId
      }));
    }
  }, [processId, updateFormData]);

  return (
    <div className="border p-6 mt-4 rounded-lg flex flex-col gap-8 w-full bg-gray-50 shadow">
      {/* Process ID and Metadata Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-300 p-6">
        <div className="flex flex-col space-y-2 mb-4">
          <div className="flex items-center">
            <span className="text-gray-500 w-32">PROCESS ID:</span>
            <span className="text-gray-700">{processId}</span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-500 w-32">Version:</span>
            <span className="text-gray-700">1</span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-500 w-32">Date Created:</span>
            <span className="text-gray-700">12/04/2024</span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-500 w-32">Last Updated:</span>
            <span className="text-gray-700">12/04/2024</span>
          </div>
        </div>
        
        {/* Title and Process Type in the same row */}
        <div className="flex gap-6 mb-6">
          <div className="w-1/2">
            <label className="block text-sm text-gray-500 mb-2">Title</label>
            <p className="text-gray-500">
              {processTypeTitle}
            </p>
          </div>
          <div className="w-1/2">
            <label className="block text-sm text-gray-500 mb-2">Process Type</label>
            <p className="text-gray-500">
              {processType}
            </p>
          </div>
        </div>
        
        {/* Business Unit moved to its own row */}
        <div className="w-full mt-4">
          <label className="block text-sm text-gray-500 mb-2">Business Unit</label>
          <select
            className="w-1/2 border-b border-border-gray py-2 text-gray-500"
            value={assignmentForm.businessUnit}
            name="businessUnit"
            onChange={(e) => handleInputChange(e)}
          >
            {BusinessUnit &&
              BusinessUnit["units"]?.map((businessUnit, index) => (
                <option key={index} value={businessUnit.id}>
                  {businessUnit.name}
                </option>
              ))}
          </select>
        </div>
      </div>
      
      {/* Priority Level Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-300 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b-2 border-b-gray-300">Priority Level</h3>
        <div className="flex flex-wrap gap-3 justify-start">
          {/* Check if we have valid priority level data from API */}
          {PriorityLevel && PriorityLevel.process_boundaries && Array.isArray(PriorityLevel.process_boundaries) && PriorityLevel.process_boundaries.length > 0 ? (
            // Render priority levels from API
            PriorityLevel.process_boundaries.map((priorityLevel, index) => {
              // Use the color from the API data directly
              const bgColor = priorityLevel.colour || "bg-gray-200";
              const textColor = "text-white"; // Use white text for better contrast
              
              // For selected item, add a highlight effect without changing the color
              const isSelected = Number(assignmentForm.priority) === Number(priorityLevel.id);
              console.log(`Comparing ${assignmentForm.priority} with ${priorityLevel.id}: ${isSelected}`);
              
              if (isSelected) {
                // Add border highlight for selected item
                return (
                  <button
                    key={index}
                    onClick={() => handlePriorityClick(priorityLevel)}
                    className={`px-8 py-4 rounded-md ring-2 ring-offset-2 ring-blue-500 font-medium`}
                    style={{ backgroundColor: bgColor, color: textColor }}
                  >
                    {priorityLevel.description}
                  </button>
                );
              }
              
              return (
                <button
                  key={index}
                  onClick={() => handlePriorityClick(priorityLevel)}
                  className={`px-8 py-4 rounded-md`}
                  style={{ backgroundColor: bgColor, color: textColor }}
                >
                  {priorityLevel.description}
                </button>
              );
            })
          ) : (
            // Fallback buttons when API data is not available
            <>
              {/* Default priority level buttons */}
              <div className="flex flex-wrap gap-3 justify-start">
                {[
                  { id: 1, description: "Low", colour: "#00FF00", lower_bound: 0, higher_bound: 20 },
                  { id: 2, description: "Medium", colour: "#FFFF00", lower_bound: 21, higher_bound: 50 },
                  { id: 4, description: "Critical", colour: "#FF0000", lower_bound: 81, higher_bound: 100 }
                ].map((level, index) => {
                  // Use the color from the fallback data
                  const bgColor = level.colour || "bg-gray-200";
                  const textColor = "text-white";
                  
                  // Highlight selected button
                  const isSelected = Number(assignmentForm.priority) === Number(level.id);
                  
                  if (isSelected) {
                    return (
                      <button
                        key={index}
                        onClick={() => handlePriorityClick(level)}
                        className={`px-8 py-4 rounded-md ring-2 ring-offset-2 ring-blue-500 font-medium`}
                        style={{ backgroundColor: bgColor, color: textColor }}
                      >
                        {level.description}
                      </button>
                    );
                  }
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handlePriorityClick(level)}
                      className={`px-8 py-4 rounded-md font-medium`}
                      style={{ backgroundColor: bgColor, color: textColor }}
                    >
                      {level.description}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Related Processes Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-300 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b-2 border-b-gray-300">Related Processes</h3>
        <div className="w-1/2">
          <MultiSelectorDropdown
            allItems={relatedProcesses}
            selectedItems={selectedProcesses}
            onSetItems={setSelectedProcesses}
            placeholder={"Add related processes"}
            label={""}
            name={"process_ids"}
          />
        </div>
      </div>
      
      {/* Dependencies Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-300 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b-2 border-b-gray-300">Dependencies</h3>
        <CKEField
          {...{
            name: "description",
            label: "",
            value: assignmentForm.description,
            onChange: handleInputChange,
          }}
        />
      </div>
      
      {/* Notes Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-300 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b-2 border-b-gray-300">Notes</h3>
        <CKEField
          {...{
            name: "note",
            label: "",
            value: assignmentForm.note,
            onChange: handleInputChange,
          }}
        />
      </div>
      
      {/* Action Buttons */}
      <div className="w-full gap-2 flex mt-4">
        <button
          onClick={handleBackorDiscard}
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
          onClick={handleNextButtonClick}
          className="py-3 rounded-lg bg-button-pink disabled:bg-button-pink/70 text-white font-bold flex justify-center items-center flex-1 basis-64 shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.30)] whitespace-nowrap"
        >
          Next
        </button>
      </div>
    </div>
  );
};
function BusinessUnitDropdown({ categories, selected, onChange }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  return (
    <SelectDropdown
      label={"Business Unit"}
      placeholder={"Select Business Unit"}
      items={categories}
      name={"class"}
      selected={selected}
      onSelect={onChange}
      isCollapsed={isCollapsed}
      onToggleCollpase={setIsCollapsed}
    />
  );
}

export default ProcessTab;
