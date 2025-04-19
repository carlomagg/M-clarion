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
  // Form data state
  const [processData, setProcessData] = useState({
    processTab: {
      title: "",
      description: "",
      processType: "",
      businessUnit: "",
      priorityLevel: "High",
      relatedProcesses: [],
      dependencies: "",
      tags: [],
      note: "",
    },
    taskWorkflow: {
      tasks: [],
      workflow: []
    },
    flowChart: {
      name: "",
      note: "",
      diagram: null
    }
  });

  const [activeTab, setActiveTab] = useState("Process Tab");

  const updateProcessData = (tab, data) => {
    setProcessData(prev => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        ...data
      }
    }));
  };

  const handleEditFromReview = (tabName) => {
    setActiveTab(tabName);
  };

  const tabToRender = () => {
    switch (activeTab) {
      case "Process Tab":
        return <ProcessTab 
          setActiveTab={setActiveTab}
          formData={processData.processTab}
          updateFormData={(data) => updateProcessData('processTab', data)}
        />;
      case "Task And Workflow":
        return <TaskAndWorkflow 
          setActiveTab={setActiveTab}
          formData={processData.taskWorkflow}
          updateFormData={(data) => updateProcessData('taskWorkflow', data)}
        />;
      case "Flow Chart":
        return <FlowChart 
          setActiveTab={setActiveTab}
          formData={processData.flowChart}
          updateFormData={(data) => updateProcessData('flowChart', data)}
        />;
      case "Review":
        return <Review 
          setActiveTab={setActiveTab}
          processData={processData}
          onEdit={handleEditFromReview}
        />;
      default:
        return null;
    }
  };

  const dispatch = useDispatch();

  const handleBackorDiscard = () => {
    dispatch(hideAssignedProcess());
  };

  return (
    <>
      <div className="w-full p-6 mt-4 flex flex-col gap-4">
        <div className="bg-white p-1 rounded-lg border border-[#CCC]">
          <ul className="flex gap-6">
            <li
              className={`p-3 font-medium text-center text-sm rounded-md grow cursor-pointer ${
                activeTab === "Process Tab"
                  ? "text-text-pink bg-text-pink/15"
                  : "text-[#656565]"
              }`}
              onClick={() => setActiveTab("Process Tab")}
            >
              Process Tab
            </li>
            <img src={rightArrowIcon} alt="" className="shrink" />
            <li
              className={`p-3 font-medium text-center text-sm rounded-md grow cursor-pointer ${
                activeTab === "Task And Workflow"
                  ? "text-text-pink bg-text-pink/15"
                  : "text-[#656565]"
              }`}
              onClick={() => setActiveTab("Task And Workflow")}
            >
              Task & Workflow
            </li>
            <img src={rightArrowIcon} alt="" className="shrink" />
            <li
              className={`p-3 font-medium text-center text-sm rounded-md grow cursor-pointer ${
                activeTab === "Flow Chart"
                  ? "text-text-pink bg-text-pink/15"
                  : "text-[#656565]"
              }`}
              onClick={() => setActiveTab("Flow Chart")}
            >
              Flow Chart
            </li>
            <img src={rightArrowIcon} alt="" className="shrink" />
            <li
              className={`p-3 font-medium text-center text-sm rounded-md grow cursor-pointer ${
                activeTab === "Review"
                  ? "text-text-pink bg-text-pink/15"
                  : "text-[#656565]"
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
