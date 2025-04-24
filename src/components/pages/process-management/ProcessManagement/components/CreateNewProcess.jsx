import React, { useState, useEffect } from "react";
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
import AIProcessOverview from "./AIProcessOverview";

const CreateNewProcess = ({ setProcesses = null, setShowItemForm = null, editProcess = null }) => {
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
  const [showAIReview, setShowAIReview] = useState(false);

  // Initialize form with edit data if available
  useEffect(() => {
    if (editProcess) {
      setNewForm({
        title: editProcess.name || "",
        description: editProcess.description || "",
        processType: editProcess.type?.toString() || "",
        processNumber: editProcess.number || "",
        tag: editProcess.tags || "",
        note: editProcess.note || "",
        version: editProcess.version?.toString() || "",
      });
    }
  }, [editProcess]);

  const queryClient = useQueryClient();
  const dispatchMessage = useDispatchMessage();
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log({ name: name, value: value });
    setNewForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  // Handle toggling AI Review visibility
  const handleToggleAIReview = () => {
    if (!newForm.title) {
      dispatchMessage('failed', 'Please enter a process title first');
      return;
    }
    setShowAIReview(!showAIReview);
  };

  // Handle applying AI suggestions
  const handleApplySuggestions = (suggestions) => {
    if (suggestions.description) {
      setNewForm(prev => ({
        ...prev,
        description: suggestions.description
      }));
    }
    
    if (suggestions.tags) {
      setNewForm(prev => ({
        ...prev,
        tag: suggestions.tags
      }));
    }
    
    dispatchMessage('success', 'AI suggestions applied successfully');
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

  const handleSave = async (e) => {
    e.preventDefault();
    console.log("Form Submitted:", newForm);
    
    const validationErrors = [];
    if (!newForm.title) validationErrors.push("Title is required");
    if (!newForm.processType) validationErrors.push("Process Type is required");
    if (!newForm.version) validationErrors.push("Version is required");
    
    if (validationErrors.length > 0) {
      const errorMessage = `Please complete these required fields: ${validationErrors.join(", ")}`;
      dispatchMessage('failed', errorMessage);
      return;
    }
    
    // Only include fields that have values
    const contentData = {
      name: newForm.title,
      type: parseInt(newForm.processType),
      ...(newForm.tag && { tags: newForm.tag }),
      ...(newForm.description && { description: newForm.description }),
      ...(newForm.note && { note: newForm.note }),
      ...(newForm.processNumber && { number: newForm.processNumber }),
      version: parseInt(newForm.version),
      status: editProcess?.status || 1
    };
    
    try {
      let res;
      if (editProcess) {
        console.log("Updating process with ID:", editProcess.id);
        console.log("Update payload:", contentData);
        res = await ProcessService.editProcess(editProcess.id, contentData);
        dispatchMessage('success', 'Process updated successfully');
      } else {
        res = await ProcessService.addProcessForm(contentData);
        dispatchMessage('success', 'Process saved successfully');
      }
      
      console.log("Process saved successfully:", res);
      queryClient.invalidateQueries("processqueue");
      queryClient.invalidateQueries("processeslog");
      
      if (setShowItemForm) {
        setShowItemForm(false);
      } else {
        navigate('/process-management');
      }
    } catch (error) {
      console.error("Error saving process:", error);
      let errorMessage = editProcess ? 'Failed to update process. ' : 'Failed to save process. ';
      
      if (error.response?.data) {
        if (typeof error.response.data === 'object') {
          // Handle validation errors from backend
          const errors = Object.entries(error.response.data)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
          errorMessage += errors;
        } else if (error.response.data.message) {
          errorMessage += error.response.data.message;
        } else if (error.response.data.detail) {
          errorMessage += error.response.data.detail;
        }
      } else if (error.request) {
        errorMessage += 'No response from server - please check your connection.';
      } else {
        errorMessage += error.message;
      }
      
      dispatchMessage('failed', errorMessage);
    }
  };

  const handleSaveToDraft = async (e) => {
    e.preventDefault();
    console.log("Form Submitted:", newForm);
    
    const contentData = {
      name: newForm.title || "Untitled",
      type: newForm.processType ? parseInt(newForm.processType) : 1,
      tags: newForm.tag || "",
      description: newForm.description || "",
      note: newForm.note || "",
      number: newForm.processNumber || "",
      version: newForm.version ? parseInt(newForm.version) : 1
    };
    
    try {
      const res = await ProcessService.addProcessdraft(contentData);
      console.log(res);
      queryClient.invalidateQueries("processqueue");
      if (setShowItemForm) {
        setShowItemForm(false);
      } else {
        navigate('/process-management');
      }
      dispatchMessage('success', 'Process draft saved successfully');
    } catch (error) {
      console.error("Error saving draft:", error);
      let errorMessage = 'Failed to save draft. ';
      
      if (error.response?.data) {
        if (error.response.data.message) {
          errorMessage += error.response.data.message;
        } else if (error.response.data.detail) {
          errorMessage += error.response.data.detail;
        }
      } else if (error.request) {
        errorMessage += 'No response from server - please check your connection.';
      } else {
        errorMessage += error.message;
      }
      
      dispatchMessage('failed', errorMessage);
    }
  };

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  const handleDiscard = () => {
    if (setShowItemForm) {
      setShowItemForm(false);
    } else {
      navigate('/process-management');
    }
  };

  const categories = [
    { id: 1, text: "Category 1" },
    { id: 2, text: "Category 2" },
    { id: 3, text: "Category 3" },
    { id: 4, text: "Category 4" },
  ];
  return (
    <div className="p-10 pt-4 w-full flex flex-col gap-6">
      <div className="flex gap-3">
        <button 
          onClick={handleToggleAIReview}
          className="flex px-4 border text-gray-600 gradient-border"
        >
          AI Review
        </button>
        <div className="w-full bg-white p-1 flex rounded-lg border border-[#CCC]">
          <button className="text-text-pink bg-text-pink/15 font-medium text-center text-sm rounded-md grow">
            Basic Information
          </button>
        </div>
      </div>
      {showAIReview ? (
        <AIProcessOverview 
          processTitle={newForm.title} 
          onClose={() => setShowAIReview(false)}
          onApplySuggestions={handleApplySuggestions}
        />
      ) : (
        <>
          <div className="bg-white mt-4 p-7 pt-4 border border-[#CCC] w-full flex flex-col gap-6 rounded-lg relative">
            <div className="flex flex-wrap items-center space-x-4 mb-4">
              <span className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-xs font-semibold">
                {editProcess ? `PROCESS ID: ${editProcess.id}` : 'New Process'}
              </span>
              <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold">
                Version {newForm.version || '1'}
              </span>
              <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold">
                Date Created: {new Date().toLocaleDateString()}
              </span>
              <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold">
                Last Updated: {new Date().toLocaleDateString()}
              </span>
            </div>
            <div className="gap-6">
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
              <FormProceedButton text={editProcess ? "Update" : "Save"} onClick={handleSave} />
            </div>
          </div>
          <div>
            <ProcessQueue />
          </div>
        </>
      )}
    </div>
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
