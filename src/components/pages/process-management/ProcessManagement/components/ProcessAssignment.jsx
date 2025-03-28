import React, { useState } from "react";
import rightArrowIcon from "../../../../../assets/icons/small-right-arrow.svg";
import SelectDropdown from "../../../../partials/dropdowns/SelectDropdown/SelectDropdown";
import { useDispatch, useSelector } from "react-redux";
import { hideAssignedProcess } from "../../../../../config/slices/globalSlice";
import FlowChart from "./FlowChart";
import TaskAndWorkflow from "./TaskAndWorkflow";
import ProcessTab from "./ProcessTab";
import {
  FormCancelButton,
  FormCustomButton,
  FormProceedButton,
} from "../../../../partials/buttons/FormButtons/FormButtons";
import Review from "./Review";

const ProcessAssignment = () => {
  const [priority, setPriority] = useState("High");
  const [formData, setFormData] = useState({ description: "INitiall desc" });
  const [selectedOwners, setSelectedOwners] = useState([]);

  const { processTypeTitle, processType } = useSelector(
    (state) => state.global
  );
  const [activeTab, setActiveTab] = useState("Process Tab");

  const tabToRender = () => {
    switch (activeTab) {
      case "Process Tab":
        return <ProcessTab setActiveTab={setActiveTab} />;
      case "Task And Workflow":
        return <TaskAndWorkflow setActiveTab={setActiveTab} />;
      case "Flow Chart":
        return <FlowChart setActiveTab={setActiveTab} />;
      case "Review":
        return <Review />;

      default:
        return null;
    }
  };

  const users = [
    { id: 1, text: "User 1" },
    { id: 2, text: "User 2" },
    { id: 3, text: "User 3" },
  ];

  const handlePriorityClick = (level) => setPriority(level);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }
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

  return (
    <>
      <div className=" w-full p-6 mt-4 flex flex-col gap-4 ">
        <div className="bg-white p-1 rounded-lg border border-[#CCC]">
          <ul className="flex gap-6">
            <li
              className={`p-3  font-medium text-center text-sm rounded-md grow cursor-default ${
                activeTab === "Process Tab"
                  ? "text-text-pink bg-text-pink/15"
                  : "text-[#656565] "
              }`}
              onClick={() => setActiveTab("Process Tab")}
            >
              Process Tab
            </li>
            <img src={rightArrowIcon} alt="" className="shrink" />
            <li
              className={`p-3  font-medium text-center text-sm rounded-md grow cursor-default ${
                activeTab === "Task And Workflow"
                  ? "text-text-pink bg-text-pink/15"
                  : "text-[#656565]    "
              }`}
              onClick={() => setActiveTab("Task And Workflow")}
            >
              Task & Workflow
            </li>
            <img src={rightArrowIcon} alt="" className="shrink" />
            <li
              className={`p-3  font-medium text-center text-sm rounded-md grow cursor-default ${
                activeTab === "Flow Chart"
                  ? "text-text-pink bg-text-pink/15"
                  : "text-[#656565]   "
              }`}
              onClick={() => setActiveTab("Flow Chart")}
            >
              Flow Chart
            </li>
            <img src={rightArrowIcon} alt="" className="shrink" />
            <li
              className={`p-3  font-medium text-center text-sm rounded-md grow cursor-default ${
                activeTab === "Review"
                  ? "text-text-pink bg-text-pink/15"
                  : "text-[#656565]   "
              }`}
              onClick={() => setActiveTab("Review")}
            >
              Review
            </li>
          </ul>
        </div>
        <div>{tabToRender()}</div>
      </div>
    </>
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

export default ProcessAssignment;
