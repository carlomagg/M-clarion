import React, { useState } from "react";
import plusIcon from "../../../../../assets/icons/plus.svg";
import WorkflowForm from "./WorkflowForm";
import {
  FormCancelButton,
  FormCustomButton,
  FormProceedButton,
} from "../../../../partials/buttons/FormButtons/FormButtons";
import { CKEField } from "../../../../partials/Elements/Elements";
import { PiDotsThreeVerticalBold } from "react-icons/pi";

const TaskAndWorkflow = ({ setActiveTab }) => {
  const [workflowSteps, setWorkflowSteps] = useState([]);
  const [showWorkflowForm, setShowWorkflowForm] = useState();
  const [formData, setFormData] = useState({ description: "INitiall desc" });

  const [showTaskMenu, setShowTaskMenu] = useState({
    status: false,
    index: 0,
  });

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  const handleAddStep = () => {
    setShowWorkflowForm(true);
  };

  const handleNextButtonClick = () => {
    setActiveTab("Flow Chart");
  };

  const handleMenu = (index) => {
    setShowTaskMenu({ status: !showTaskMenu.status, index: index });
    console.log(index);
  };
  console.log(showTaskMenu);

  const MenuDot = ({ index }) => (
    <div className="absolute p-4  w-[120px] justify-center items-center  bg-white border shadow-md cursor-pointer border-[#676767] text-black flex rounded-lg ">
      <ul>
        {/* onClick={() => handleMenu(index, category)} */}
        {/* <li
          onClick={() => handleMenu(index)}
          className="px-2 hover:bg-gray-100"
        >
          Assign process
        </li> */}
        <li className="px-2 hover:bg-gray-100">Edit Process</li>
        <li className="px-2 hover:bg-gray-100">Delete</li>
        <li className="px-2 hover:bg-gray-100">Suspend</li>
        <li className="px-2 hover:bg-gray-100">History</li>
      </ul>
    </div>
  );

  return (
    <>
      <div
        className={`border p-6 mt-4 rounded-lg flex flex-col gap-4  bg-white shadow ${
          !showWorkflowForm ? "flex" : "hidden"
        }`}
      >
        {/* <div
        className={`border p-6 mt-4 rounded-lg flex flex-col gap-4  bg-white shadow ${
          !showWorkflowForm
            ? "opacity-100 pointer-events-auto"
            : "opacity-50 pointer-events-none"
        }`}
      > */}
        <div>
          <h3 className=" font-bold">Workflow steps</h3>
        </div>
        <table className="w-full text-left text-gray-500">
          <thead className=" text-gray-700 uppercase border-b-2  last:border-none">
            <tr>
              <th scope="col" className="px-4 py-3">
                Task
              </th>
              <th scope="col" className="px-4 py-3">
                TAT
              </th>
              <th scope="col" className="px-4 py-3">
                Owner
              </th>
              <th scope="col" className="px-4 py-3">
                Start date
              </th>
              <th scope="col" className="px-4 py-3">
                End date
              </th>
              <th scope="col" className="px-4 py-3">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {workflowSteps.map((workflow, index) => (
              <tr key={index}>
                {/* <span>{index + 1}</span> */}

                <td className=" p-3 px-4 py-3">{workflow.task}</td>
                <td className="px-4 py-3">{workflow.tat}</td>
                <td className="px-4 py-3">{workflow.owner}</td>
                <td className="px-4 py-3">{workflow.startDate}</td>
                <td className="px-4 py-3">{workflow.endDate}</td>
                <td className="px-3 py-3">{workflow.status}</td>
                <div className=" mt-4 font-bold ml-4">
                  <PiDotsThreeVerticalBold
                    onClick={() => handleMenu(index)}
                    className="pt-2 font-extrabold cursor-pointer text-black"
                  />
                  {showTaskMenu &&
                    showTaskMenu.status &&
                    showTaskMenu.index == index && <MenuDot index={index} />}
                </div>
              </tr>
            ))}
          </tbody>
        </table>
        <div
          onClick={() => handleAddStep()}
          className="flex items-center justify-center mt-4  m-6 gap-1 font-bold"
        >
          <img src={plusIcon} className="" />
          <p className="">Add New</p>
        </div>
        <div className="pt-4">
          <CKEField
            {...{
              name: "description",
              label: "Dependencies",
              value: formData.description,
              onChange: handleChange,
            }}
          />
        </div>
        <div className="w-full gap-2 flex mt-20 ">
          <button
            // onClick={handleBackorDiscard}
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
      {showWorkflowForm && (
        <WorkflowForm
          setWorkflowSteps={setWorkflowSteps}
          setShowWorkflowForm={setShowWorkflowForm}
        />
      )}
    </>
  );
};

export default TaskAndWorkflow;
