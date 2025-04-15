import React, { useState } from "react";
import "./AiColor.css";
import { CKEField, Field } from "../../../../partials/Elements/Elements";
import SelectDropdown from "../../../../partials/dropdowns/SelectDropdown/SelectDropdown";
import {
  FormCancelButton,
  FormCustomButton,
  FormProceedButton,
} from "../../../../partials/buttons/FormButtons/FormButtons";
import { useNavigate } from "react-router-dom";
import ProcessQueue from "./ProcessQueue";
import ProcessService from "../../../../../services/Process.service";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useDispatchMessage from "../../../../../hooks/useDispatchMessage";

const CreateNewProcess = ({ setProcesses, setShowItemForm }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ description: "INitiall desc" });
  const [newForm, setNewForm] = useState({
    title: "",
    description: "",
    processType: "",
    processNumber: "",
    tag: "",
    note: "",
    version: "",
  });

  const queryClient = useQueryClient();
  const dispatchMessage = useDispatchMessage();
  
  const handleInputChange = (e) => {
    const { name, value } = e.target; // Get input name and value
    console.log({ name: name, value: value });
    setNewForm((prevForm) => ({
      ...prevForm, // Spread the previous state
      [name]: value, // Update the specific field
    }));
  };

  const {
    isLoading,
    data: ProcessTypes,
    error,
    refetch,
  } = useQuery({
    queryKey: ["processtypes"],
    queryFn: () => ProcessService.getProcessType(),
  });

  const { data: ProcessVersion } = useQuery({
    queryKey: ["processversion"],
    queryFn: () => ProcessService.getProcessVersion(),
  });
  console.log("process version", ProcessVersion);

  const handleSave = async (e) => {
    e.preventDefault();
    console.log("Form Submitted:", newForm);
    
    // Validate required fields
    const validationErrors = [];
    if (!newForm.title) validationErrors.push("Title is required");
    if (!newForm.processType) validationErrors.push("Process Type is required");
    if (!newForm.version) validationErrors.push("Version is required");
    
    // Show validation errors if any
    if (validationErrors.length > 0) {
      const errorMessage = `Please complete these required fields: ${validationErrors.join(", ")}`;
      dispatchMessage('failed', errorMessage);
      return; // Stop execution if validation fails
    }
    
    // Format the data to exactly match the working payload structure
    // Using the exact same field names and order as the working example
    const contentData = {
      name: newForm.title,
      type: parseInt(newForm.processType),
      tags: newForm.tag,
      description: newForm.description,
      note: newForm.note,
      number: newForm.processNumber,
      version: parseInt(newForm.version)
    };
    
    // Log the exact payload for debugging
    console.log("Sending payload:", JSON.stringify(contentData, null, 2));
    
    try {
      const res = await ProcessService.addProcessForm(contentData);
      console.log("Process saved successfully:", res);
      queryClient.invalidateQueries("processqueue");
      setShowItemForm(false);
      dispatchMessage('success', 'Process saved successfully');
    } catch (error) {
      console.error("Error saving process:", error);
      console.error("Request data:", contentData);
      
      // Enhanced error logging and messaging
      if (error.response) {
        console.error("Server response status:", error.response.status);
        console.error("Server response headers:", error.response.headers);
        console.error("Server response data:", error.response.data);
        
        let errorMessage = 'Failed to save process. ';
        
        // Try to extract specific field errors if available
        if (error.response.data && typeof error.response.data === 'object') {
          if (error.response.data.message) {
            errorMessage += error.response.data.message;
          } else if (error.response.data.detail) {
            errorMessage += error.response.data.detail;
          } else {
            // Check for field-specific errors
            const fieldErrors = [];
            Object.entries(error.response.data).forEach(([field, errors]) => {
              if (Array.isArray(errors)) {
                fieldErrors.push(`${field}: ${errors.join(', ')}`);
              } else if (typeof errors === 'string') {
                fieldErrors.push(`${field}: ${errors}`);
              }
            });
            
            if (fieldErrors.length > 0) {
              errorMessage += `Please check these fields: ${fieldErrors.join('; ')}`;
            }
          }
        }
        
        dispatchMessage('failed', errorMessage);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
        dispatchMessage('failed', 'Failed to save process. No response from server - please check your connection.');
      } else {
        // Something happened in setting up the request
        console.error("Request setup error:", error.message);
        dispatchMessage('failed', `Failed to save process. ${error.message}`);
      }
    }
  };

  const handleSaveToDraft = async (e) => {
    e.preventDefault();
    console.log("Form Submitted:", newForm);
    
    // Format the data exactly like the working payload
    const contentData = {
      name: newForm.title || "Untitled",
      type: newForm.processType ? parseInt(newForm.processType) : 1, // Default to 1 if not provided
      tags: newForm.tag || "",
      description: newForm.description || "",
      note: newForm.note || "",
      number: newForm.processNumber || "",
      version: newForm.version ? parseInt(newForm.version) : 1 // Default to 1 if not provided
    };
    
    // Log the exact payload for debugging
    console.log("Sending payload:", JSON.stringify(contentData, null, 2));
    
    try {
      const res = await ProcessService.addProcessdraft(contentData);
      console.log(res);
      queryClient.invalidateQueries("processqueue");
      setShowItemForm(false);
      dispatchMessage('success', 'Process draft saved successfully');
    } catch (error) {
      console.error("Error saving draft:", error);
      console.error("Request data:", contentData);
      
      // Enhanced error logging and messaging
      if (error.response) {
        console.error("Server response status:", error.response.status);
        console.error("Server response headers:", error.response.headers);
        console.error("Server response data:", error.response.data);
        
        let errorMessage = 'Failed to save draft. ';
        
        // Try to extract specific field errors if available
        if (error.response.data && typeof error.response.data === 'object') {
          if (error.response.data.message) {
            errorMessage += error.response.data.message;
          } else if (error.response.data.detail) {
            errorMessage += error.response.data.detail;
          } else {
            // Check for field-specific errors
            const fieldErrors = [];
            Object.entries(error.response.data).forEach(([field, errors]) => {
              if (Array.isArray(errors)) {
                fieldErrors.push(`${field}: ${errors.join(', ')}`);
              } else if (typeof errors === 'string') {
                fieldErrors.push(`${field}: ${errors}`);
              }
            });
            
            if (fieldErrors.length > 0) {
              errorMessage += `Please check these fields: ${fieldErrors.join('; ')}`;
            }
          }
        }
        
        dispatchMessage('failed', errorMessage);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
        dispatchMessage('failed', 'Failed to save draft. No response from server - please check your connection.');
      } else {
        // Something happened in setting up the request
        console.error("Request setup error:", error.message);
        dispatchMessage('failed', `Failed to save draft. ${error.message}`);
      }
    }
  };

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  const handleDiscard = () => {
    window.history.back();
  };

  const categories = [
    { id: 1, text: "Category 1" },
    { id: 2, text: "Category 2" },
    { id: 3, text: "Category 3" },
    { id: 4, text: "Category 4" },
  ];
  return (
    <>
      <div className="flex gap-3">
        {/* <div className="flex space-x-4 mb-6"> */}
        <button className="flex px-4 border text-gray-600 gradient-border ">
          AI Review
        </button>
        <div className="w-full bg-white p-1 flex rounded-lg border border-[#CCC]">
          <button className=" text-text-pink bg-text-pink/15 font-medium text-center text-sm rounded-md grow">
            Basic Information
          </button>
        </div>
      </div>
      <div className="bg-white mt-4 p-7 pt-4 border border-[#CCC] w-full flex flex-col gap-6 rounded-lg relative">
        <div className="flex flex-wrap items-center space-x-4 mb-4">
          <span className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-xs font-semibold">
            PROCESS ID: Q1234
          </span>
          <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold">
            Version 1
          </span>
          <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold">
            Date Created: 12/04/2024
          </span>
          <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold">
            Last Updated: 12/04/2024
          </span>
        </div>
        <div className="gap-6">
          {/* <label className="pb-4">Title</label>
          <input
            type="text"
            name="title"
            value={newForm.title}
            className="border border-black p-3 w-full rounded-lg"
            onChange={(e) => handleInputChange(e)}
            placeholder="Enter task name"
          /> */}
          <Field
            {...{
              name: "title",
              value: newForm.title,
              label: "Title",
              onChange: handleInputChange,
              placeholder: "Enter title name",
            }}
          />
        </div>
        <div>
          <CKEField
            {...{
              name: "description",
              label: "Description",
              value: newForm.description,
              onChange: handleInputChange,
            }}
          />
        </div>
        <div className="relative flex gap-4 w-full">
          <div className="flex flex-col w-1/2">
            <label htmlFor="processType" className="mb-1">Process type</label>
            <select
              id="processType"
              className="w-full p-3 border-b border-border-gray"
              value={newForm.processType}
              name="processType"
              onChange={(e) => handleInputChange(e)}
            >
              {ProcessTypes &&
                ProcessTypes["Process Types"]?.map((processType, index) => (
                  <option key={index} value={processType.id}>
                    {processType.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="w-1/2">
            <Field
              {...{
                name: "processNumber",
                value: newForm.processNumber,
                label: "Process Number",
                onChange: handleInputChange,
                placeholder: "Enter process number ",
              }}
            />
          </div>
        </div>
        <div className="w-1/2">
          <Field
            {...{
              name: "tag",
              value: newForm.tag,
              label: "Tag",
              onChange: handleInputChange,
              placeholder: "Enter tag name",
            }}
          />
        </div>
        <div>
          <CKEField
            {...{
              name: "note",
              value: newForm.note,
              label: "Note",
              // value: formData.description,
              onChange: handleInputChange,
            }}
          />
        </div>
        <div className="w-1/2">
          <label htmlFor="">Version</label>
          <select
            className=" w-1/2 border-b border-border-gray  "
            value={newForm.version}
            name="version"
            onChange={(e) => handleInputChange(e)}
          >
            {ProcessVersion &&
              ProcessVersion["Process Versions"]?.map(
                (processVersion, index) => (
                  <option key={index} value={processVersion.id}>
                    {processVersion?.name}
                  </option>
                )
              )}
          </select>
        </div>
        <div className="flex gap-3">
          <FormCancelButton text={"Discard"} onClick={handleDiscard} />
          <FormCustomButton
            text={"save to draft"}
            onClick={handleSaveToDraft}
          />
          <FormProceedButton text={"Save"} onClick={handleSave} />
        </div>
      </div>
      <div>
        <ProcessQueue />
      </div>
    </>
  );
};

function ProcessDropdown({ categories, selected, onChange }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  return (
    <SelectDropdown
      label={"Process Type"}
      placeholder={"Select process type"}
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

export default CreateNewProcess;

{
  /* <div className="w-full gap-2 flex mt-20 ">
        <button
          onClick={handleBackorDiscard}
          // className="bg-gray-200  text-gray-700 gap-8 py-4 pl-16 rounded"
          className="py-3 rounded-lg bg-[#C3C3C3] disabled:bg-button-pink/70 text-black font-bold flex  justify-center items-center flex-1 basis-64 shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.30)] whitespace-nowrap"
        >
          Back
        </button>
        <button
          onClick={handleBackorDiscard}
          // className="bg-gray-200 text-gray-700 pr-16 pl-16 rounded"
          className="py-3 rounded-lg bg-[#C3C3C3] disabled:bg-button-pink/70 text-black font-bold flex flex-col justify-center items-center flex-1 basis-64 shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.30)] whitespace-nowrap"
        >
          Discard
        </button>
        <button
          onClick={handleBackorDiscard}
          className="py-3 rounded-lg bg-button-pink disabled:bg-button-pink/70 text-white font-bold flex flex-col justify-center items-center flex-1 basis-64 shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.30)] whitespace-nowrap"
        >
          Save
        </button>
      </div> */
}
