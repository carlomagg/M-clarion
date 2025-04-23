import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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

const ProcessAssignment = ({ fromRiskLog }) => {
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

  const [activeTab, setActiveTab] = useState("Process Details");
  const navigate = useNavigate();
  const location = useLocation();
  const { showAssignedProcess } = useSelector((state) => state.global);
  
  // Check if we're coming directly from the process assignment menu
  // If we have showAssignedProcess = false, it means we came directly from the menu
  // and not from clicking a process in the selection table
  const fromDirectMenu = location.pathname === "/process-management/assign" && !showAssignedProcess;

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
      case "Process Details":
        return <ProcessTab 
          setActiveTab={setActiveTab}
          formData={processData.processTab}
          updateFormData={(data) => updateProcessData('processTab', data)}
          fromRiskLog={fromRiskLog}
        />;
      case "Task And Workflow":
        return <TaskAndWorkflow 
          setActiveTab={setActiveTab}
          formData={processData}
          updateFormData={(data) => updateProcessData('taskWorkflow', data)}
        />;
      case "Flow Chart":
        return <FlowChart 
          setActiveTab={setActiveTab}
          formData={processData}
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

  // If we directly access process assignment page, redirect to process selector
  useEffect(() => {
    if (fromDirectMenu) {
      navigate('/process-management/assign');
    }
  }, [fromDirectMenu, navigate]);

  return (
    <>
      <div className="w-full p-6 mt-4 flex flex-col gap-4">
        <div className="flex justify-between px-16 mb-6">
          <div className={`flex items-center ${activeTab === "Process Details" ? 'text-pink-500' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-lg 
              ${activeTab === "Process Details" ? 'bg-pink-600 border-pink-600 text-white' : 'border-gray-400'}`}>
              1
            </div>
          </div>
          <div className={`flex items-center ${activeTab === "Task And Workflow" ? 'text-pink-500' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-lg 
              ${activeTab === "Task And Workflow" ? 'bg-pink-600 border-pink-600 text-white' : 'border-gray-400'}`}>
              2
            </div>
          </div>
          <div className={`flex items-center ${activeTab === "Flow Chart" ? 'text-pink-500' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-lg 
              ${activeTab === "Flow Chart" ? 'bg-pink-600 border-pink-600 text-white' : 'border-gray-400'}`}>
              3
            </div>
          </div>
          <div className={`flex items-center ${activeTab === "Review" ? 'text-pink-500' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-lg 
              ${activeTab === "Review" ? 'bg-pink-600 border-pink-600 text-white' : 'border-gray-400'}`}>
              4
            </div>
          </div>
        </div>
        <div className="bg-white p-1 rounded-lg border border-[#CCC] w-full">
          <ul className="flex gap-6">
            <li
              className={`p-3 font-medium text-center text-sm rounded-md grow cursor-pointer ${
                activeTab === "Process Details"
                  ? "text-text-pink bg-text-pink/15"
                  : "text-[#656565]"
              }`}
              onClick={() => setActiveTab("Process Details")}
            >
              Process Details
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
