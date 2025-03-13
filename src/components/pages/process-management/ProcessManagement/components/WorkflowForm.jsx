import React, { useState } from "react";
import { CKEField, Field } from "../../../../partials/Elements/Elements";
import SelectDropdown from "../../../../partials/dropdowns/SelectDropdown/SelectDropdown";
import {
  FormCancelButton,
  FormProceedButton,
} from "../../../../partials/buttons/FormButtons/FormButtons";
import ProcessService from "../../../../../services/Process.service";
import { useQuery } from "@tanstack/react-query";

import { PiDotsThreeVerticalBold } from "react-icons/pi";

const WorkflowForm = ({ setWorkflowSteps, setShowWorkflowForm }) => {
  const [formDetails, setFormDetails] = useState({
    taskName: "",
    description: "",
    turnAroundTime: "",
    statusName: "",
    startDate: "",
    endDate: "",
    owner: "",
    note: "",
    control: "",
  });

  const [selectedStatus, setSelectedStatus] = useState("");

  const [selectedOwners, setSelectedOwners] = useState([]);

  const [formData, setFormData] = useState({ description: "initial desc" });

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }
  const categories = [
    { id: 1, text: "Completed 1" },
    { id: 2, text: "Pending 2" },
    { id: 3, text: "Category 3" },
  ];
  const users = [
    { id: 1, text: "User 1" },
    { id: 2, text: "User 2" },
    { id: 3, text: "User 3" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target; // Get input name and value
    console.log({ name: name, value: value });
    setFormDetails((prevDetails) => ({
      ...prevDetails, // Spread the previous state
      [name]: value, // Update the specific field
    }));
  };

  const { data: ProcessStatus } = useQuery({
    queryKey: ["processstatus"],
    queryFn: () => ProcessService.getProcessStatus(),
  });
  console.log("process status", ProcessStatus);
  // console.log("process status", ProcessStatus);

  const handleSave = async (e) => {
    e.preventDefault();
    const data = {
      task: formDetails.taskName,
      tat: formDetails.turnAroundTime + " " + "Hours",
      status: formDetails.statusName,
      startDate: formDetails.startDate,
      endDate: formDetails.endDate,
      owner: formDetails.owner,
      description: formDetails.description,
      note: formDetails.note,
      control: formDetails.control,
    };
    setWorkflowSteps((prevSteps) => [...prevSteps, data]);
    console.log("Form Submitted:", formDetails);

    const contentData = {
      name: formDetails.taskName,
      description: formDetails.description,
      owner: parseInt(formDetails.owner),
      tat: formDetails.turnAroundTime,
      control_measure: formDetails.control,
      status: parseInt(formDetails.statusName),
      note: formDetails.note,
      start_date: formDetails.startDate,
      end_date: formDetails.endDate,
    };
    setShowWorkflowForm(false);
    const res = await ProcessService.addProcessTask(contentData);
    console.log(res);
  };

  return (
    <div className="bg-white mt-4 p-7 pt-4 border border-[#CCC] w-full flex flex-col gap-6 rounded-lg relative">
      <div className=" w-full items-center gap-4 pt-3">
        <div className="gap-4 ">
          {/* <label className="pt-6 py-3">Task Name</label>
          <input
            type="text"
            name="taskName"
            className="border border-black p-3 w-full rounded-lg"
            value={formDetails.taskName}
            onChange={(e) => handleInputChange(e)}
            placeholder="Enter task name"
          /> */}
          <Field
            {...{
              name: "taskName",
              value: formDetails.taskName,
              label: "Task Name",
              onChange: handleInputChange,
              placeholder: "Enter task name",
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
            }}
          />
        </div>
        <div className="gap-5 pt-5">
          <p className="pb-4">Turn around Time</p>
          <div className="flex gap-3">
            <input
              type="number"
              name="turnAroundTime"
              value={formData.turnAroundTime}
              label="Time"
              placeholder="5"
              onChange={(e) => handleInputChange(e)}
              className="bg-white border border-[#79747E] shadow max-w-[50px] px-2 py-2 rounded-lg"
            />
            <div className="w-1/2">
              <HoursDropdown categories={categories} />
            </div>
          </div>
        </div>
        <div className="flex gap-3 pt-6">
          {/* <MultiSelectorDropdown
            allItems={users}
            selectedItems={selectedOwners}
            onSetItems={setSelectedOwners}
            placeholder={"Select owner (one or more)"}
            label={"Owners"}
            name={"owner_ids"}
            value={formDetails.owner_ids}
            onChange={(e) => handleInputChange(e)}
          /> */}
          <div className="ml-7 ">
            <p className="">Owners</p>
          </div>
          <select
            className="p-2 w-1/2 border-b px-2 py-2 border-border-gray  "
            value={formDetails.owner}
            name="owner"
            placeholder=" Select owner"
            onChange={(e) => handleInputChange(e)}
          >
            <option value="">owner 1</option>
            <option value="Completed">owner 2</option>
            <option value="Draft">owner 3</option>
            <option value="Pending">owner 4</option>
          </select>

          <div className="ml-7 ">
            <p className="">Status</p>
          </div>
          <select
            className="p-2 w-1/2 border-b px-2 py-2 border-border-gray  "
            value={formDetails.status}
            name="statusName"
            placeholder="Status Name"
            onChange={(e) => handleInputChange(e)}
          >
            {ProcessStatus &&
              ProcessStatus["Process Status"]?.map((processStatus, index) => (
                <option key={index} value={processStatus.id}>
                  {processStatus.name}
                </option>
              ))}
          </select>
        </div>
        <div className="flex pt-5">
          <div className="flex w-full">
            {/* <label className=" flex ">Start Date</label>
            <input
              type="date"
              name="startDate"
              className="p-2 border-b w-full  border-border-gray  "
              value={formDetails.startDate}
              onChange={(e) => handleInputChange(e)}
              placeholder=""
            /> */}
            <Field
              {...{
                type: "date",
                name: "startDate",
                value: formDetails.startDate,
                label: "Start Date",
                onChange: handleInputChange,
                placeholder: "",
              }}
            />
          </div>

          <div className="flex w-full">
            {/* <label className="flex">End Date</label>
            <input
              type="date"
              name="endDate"
              className="p-2 border-b  w-full border-border-gray  "
              value={formDetails.endDate}
              onChange={(e) => handleInputChange(e)}
              placeholder=""
            /> */}
            <Field
              {...{
                type: "date",
                name: "endDate",
                value: formDetails.endDate,
                label: "End Date",
                onChange: handleInputChange,
                placeholder: "",
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
              onChange: handleInputChange,
            }}
          />
        </div>
        <div className="gap-4 pt-5">
          <CKEField
            {...{
              name: "note",
              label: "Note",
              value: formDetails.note,
              onChange: handleInputChange,
            }}
          />
        </div>
        {/* <div className="w-1/2 pt-5">
          <VersionDropdown categories={categories} />
          
        </div> */}
        <div className="flex gap-3 pt-6">
          <FormCancelButton text={"Discard"} />

          <FormProceedButton text={"Save"} onClick={handleSave} />
        </div>
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
