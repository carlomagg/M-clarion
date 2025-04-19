import React, { useState, useEffect } from "react";
import plusIcon from "../../../../../assets/icons/plus.svg";
import WorkflowForm from "./WorkflowForm";
import {
  FormCancelButton,
  FormCustomButton,
  FormProceedButton,
} from "../../../../partials/buttons/FormButtons/FormButtons";
import { CKEField } from "../../../../partials/Elements/Elements";
import { PiDotsThreeVerticalBold } from "react-icons/pi";

const TaskAndWorkflow = ({ setActiveTab, formData, updateFormData }) => {
  const [workflowSteps, setWorkflowSteps] = useState(formData?.tasks || []);
  const [showWorkflowForm, setShowWorkflowForm] = useState(false);
  const [savedWorkflowForm, setSavedWorkflowForm] = useState(null);

  const [showTaskMenu, setShowTaskMenu] = useState({
    status: false,
    index: 0,
  });

  // Update local state when parent data changes
  useEffect(() => {
    if (formData?.tasks) {
      setWorkflowSteps(formData.tasks);
    }
  }, [formData]);

  // Update parent state when local state changes
  useEffect(() => {
    updateFormData?.({
      tasks: workflowSteps,
      workflow: []
    });
  }, [workflowSteps, updateFormData]);

  const handleAddStep = () => {
    setShowWorkflowForm(true);
  };

  const handleNextButtonClick = () => {
    setActiveTab("Flow Chart");
  };

  const handleBackClick = () => {
    setActiveTab("Process Tab");
  };

  const handleMenu = (index) => {
    setShowTaskMenu({ status: !showTaskMenu.status, index: index });
  };

  const handleSaveFormState = (formState) => {
    setSavedWorkflowForm(formState);
  };

  const MenuDot = ({ index }) => (
    <div className="absolute p-4  w-[120px] justify-center items-center  bg-white border shadow-md cursor-pointer border-[#676767] text-black flex rounded-lg ">
      <ul>
        <li className="px-2 hover:bg-gray-100">Edit Process</li>
        <li className="px-2 hover:bg-gray-100">Delete</li>
        <li className="px-2 hover:bg-gray-100">Suspend</li>
        <li className="px-2 hover:bg-gray-100">History</li>
      </ul>
    </div>
  );

  return (
    <div className="w-full">
      {!showWorkflowForm ? (
        <div className="border p-6 mt-4 rounded-lg flex flex-col gap-4 bg-white shadow">
          <div className="flex justify-between items-center">
            <h3 className="font-bold">Workflow steps</h3>
            <button
              onClick={handleAddStep}
              className="flex items-center gap-2 bg-button-pink text-white px-4 py-2 rounded-lg"
            >
              <img src={plusIcon} alt="" />
              Add Step
            </button>
          </div>
          <table className="w-full text-left text-gray-500">
            <thead className="text-gray-700 uppercase border-b-2 last:border-none">
              <tr>
                <th scope="col" className="px-4 py-3">Task</th>
                <th scope="col" className="px-4 py-3">TAT</th>
                <th scope="col" className="px-4 py-3">Owner</th>
                <th scope="col" className="px-4 py-3">Start date</th>
                <th scope="col" className="px-4 py-3">End date</th>
                <th scope="col" className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {workflowSteps.map((workflow, index) => (
                <tr key={index}>
                  <td className="p-3 px-4 py-3">{workflow.task}</td>
                  <td className="px-4 py-3">{workflow.tat}</td>
                  <td className="px-4 py-3">{workflow.owners?.join(", ")}</td>
                  <td className="px-4 py-3">{workflow.startDate}</td>
                  <td className="px-4 py-3">{workflow.endDate}</td>
                  <td className="px-3 py-3">{workflow.status}</td>
                  <div className="mt-4 font-bold ml-4">
                    <PiDotsThreeVerticalBold
                      onClick={() => handleMenu(index)}
                      className="pt-2 font-extrabold cursor-pointer text-black"
                    />
                    {showTaskMenu &&
                      showTaskMenu.status &&
                      showTaskMenu.index === index && <MenuDot index={index} />}
                  </div>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex gap-2 mt-20">
            <button 
              onClick={handleBackClick}
              className="py-3 rounded-lg bg-[#C3C3C3] disabled:bg-button-pink/70 text-black font-bold flex justify-center items-center flex-1 basis-64 shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.30)] whitespace-nowrap"
            >
              Back
            </button>
            <button
              onClick={handleNextButtonClick}
              className="py-3 rounded-lg bg-button-pink disabled:bg-button-pink/70 text-white font-bold flex flex-col justify-center items-center flex-1 basis-64 shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.30)] whitespace-nowrap"
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <WorkflowForm
          setWorkflowSteps={setWorkflowSteps}
          setShowWorkflowForm={setShowWorkflowForm}
          savedFormData={savedWorkflowForm}
        />
      )}
    </div>
  );
};

export default TaskAndWorkflow;
