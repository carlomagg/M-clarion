import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { hideAssignedProcess } from "../../../../../config/slices/globalSlice";
import SelectDropdown from "../../../../partials/dropdowns/SelectDropdown/SelectDropdown";
// import { MultiSelectorDropdown } from "../../../../partials/forms/track-risk/components";
import { CKEField } from "../../../../partials/Elements/Elements";
import ProcessService from "../../../../../services/Process.service";
import { useQuery } from "@tanstack/react-query";

const ProcessTab = ({ setActiveTab }) => {
  // const [priority, setPriority] = useState("High");
  const [formData, setFormData] = useState({ description: "INitiall desc" });
  const [selectedOwners, setSelectedOwners] = useState([]);
  const [assignmentForm, setAssignmentForm] = useState({
    description: "",
    note: "",
    businessUnit: "",
    priority: 0,
  });

  const { processTypeTitle, processType } = useSelector(
    (state) => state.global
  );
  const users = [
    { id: 1, text: "User 1" },
    { id: 2, text: "User 2" },
    { id: 3, text: "User 3" },
  ];
  // const handleBusinessUnit = (prop) => {
  //   const { target } = prop;
  //   setAssignmentForm((prevForm) => ({
  //     ...prevForm,
  //     businessUnit: target.value,
  //   }));
  // };
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

  useEffect(() => {
    setAssignmentForm((prevForm) => ({
      ...prevForm, // Spread the previous state
      ["priority"]: PriorityLevel?.data[0]?.id, // Update the specific field
    }));
  }, [PriorityLevel]);

  console.log(PriorityLevel);

  const handlePriorityClick = (level) => {
    setAssignmentForm((prevForm) => ({
      ...prevForm, // Spread the previous state
      ["priority"]: level.id, // Update the specific field
    }));
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

  const handleBackorDiscard = () => {
    dispatch(hideAssignedProcess());
  };
  const handleNextButtonClick = async () => {
    setActiveTab("Task And Workflow");
    const contentData = {
      dependency: assignmentForm.description,
      note: assignmentForm.note,
      unit: assignmentForm.businessUnit,
      level: assignmentForm.priority,
      // process_ids
    };
    const res = await ProcessService.addProcessAssignment(contentData);
  };

  return (
    <div className="border p-6 mt-4 rounded-lg flex flex-col gap-4 w-full bg-white shadow">
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-pink-500 font-bold">PROCESS ID: Q1234</span>
        <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded">
          Version 1
        </span>
        <span className="text-gray-500">Date Created: 12/04/2024</span>
        <span className="text-gray-500">Last Updated: 12/04/2024</span>
      </div>
      <div className=" gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium ">Title</label>

          <p className="mt-1 block border-gray-300 rounded-md shadow-sm">
            {processTypeTitle}
          </p>
        </div>
      </div>
      <div className="flex gap-4">
        <div className="pt-3 w-full">
          <label className="gap-5 block text-sm font-medium ">
            Process Type
          </label>
          <p className="mt-2 w-full border-gray-300 rounded-md shadow-sm">
            {processType}
          </p>
        </div>
        <div className="gap-3 w-[70%]">
          <label>Business Unit</label>
          <select
            className=" w-1/2 border-b border-border-gray  "
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
      {/* Priority Level  */}

      <div className="gap-2 flex flex-col pt-9 ">
        <label className="font-medium">Priority Level</label>
        <div className="flex gap-2">
          {PriorityLevel &&
            PriorityLevel.data?.map((priorityLevel, index) => (
              <button
                key={index}
                onClick={() => handlePriorityClick(priorityLevel)}
                className={`px-10 py-6 rounded ${
                  assignmentForm.priority === priorityLevel.id
                    ? "bg-pink-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {priorityLevel.description}
              </button>
            ))}
        </div>
      </div>
      <div className="w-1/2 mt-20">
        <MultiSelectorDropdown
          allItems={users}
          selectedItems={selectedOwners}
          onSetItems={setSelectedOwners}
          placeholder={"Add related processes"}
          label={"Related Processes"}
          name={"owner_ids"}
        />
      </div>
      <div className="mt-20">
        <CKEField
          {...{
            name: "description",
            label: "Dependencies",
            value: assignmentForm.description,
            onChange: handleInputChange,
          }}
        />
      </div>
      <div className="mt-20">
        <CKEField
          {...{
            name: "note",
            label: "Note",
            value: assignmentForm.note,
            onChange: handleInputChange,
          }}
        />
      </div>
      <div className="w-full gap-2 flex mt-20 ">
        <button
          onClick={handleBackorDiscard}
          className="py-3 rounded-lg bg-[#C3C3C3] disabled:bg-button-pink/70 text-black font-bold flex  justify-center items-center flex-1 basis-64 shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.30)] whitespace-nowrap"
        >
          Back
        </button>
        <button
          // onClick={handleBackorDiscard}
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
