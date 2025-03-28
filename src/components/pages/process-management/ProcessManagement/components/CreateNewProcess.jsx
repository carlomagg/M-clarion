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
    const data = {
      title: newForm.title,
      processType: newForm.processType,
      processNumber: newForm.processNumber,
      tag: newForm.tag,
      note: newForm.note,
      version: newForm.version,
      description: newForm.description,
    };
    setProcesses((prevProcesses) => [...prevProcesses, data]);
    console.log("Form Submitted:", newForm);
    const contentData = {
      name: newForm.title,
      type: parseInt(newForm.processType),
      tags: newForm.tag,
      note: newForm.note,
      version: parseInt(newForm.version),
      description: newForm.description,
      number: newForm.processNumber,
    };
    setShowItemForm(false);
    const res = await ProcessService.addProcessForm(contentData);
    console.log(res);
  };

  const handleSaveToDraft = async (e) => {
    e.preventDefault();
    console.log("Form Submitted:", newForm);
    const contentData = {
      name: newForm.title,
      type: parseInt(newForm.processType),
      tags: newForm.tag,
      note: newForm.note,
      version: parseInt(newForm.version),
      description: newForm.description,
      number: newForm.processNumber,
    };
    const res = await ProcessService.addProcessdraft(contentData);
    console.log(res);
    queryClient.invalidateQueries("processqueue");
    setShowItemForm(false);
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
        <div className=" relative flex gap-4">
          <label htmlFor="">Process type</label>
          <select
            className=" w-1/2 border-b border-border-gray  "
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
        <div>
          {/* <label className="pb-4">Tag</label>
          <input
            type="text"
            name="tag"
            value={newForm.tag}
            className="border border-black p-3 w-full rounded-lg"
            onChange={(e) => handleInputChange(e)}
            placeholder="Enter task name"
          /> */}
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
