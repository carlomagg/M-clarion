import React, { useState } from "react";
import { PiDotsThreeVerticalBold } from "react-icons/pi";
import {
  FormCancelButton,
  FormCustomButton,
  FormProceedButton,
} from "../../../partials/buttons/FormButtons/FormButtons";
import SelectDropdown from "../../../partials/dropdowns/SelectDropdown/SelectDropdown";
import { Field } from "../../../partials/Elements/Elements";

const ActionPlan = () => {
  const [formData, setFormData] = useState({ description: "INitiall desc" });

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

  const [actions, setActions] = useState([
    {
      id: 1,
      action: "Planning risk",
      assignedTo: "Name",
      dueDate: "12/2/2024",
    },
    {
      id: 2,
      action: "IT system are unavailable",
      assignedTo: "Name",
      dueDate: "12/2/2024",
    },
    {
      id: 3,
      action: "Mauris nec leo non libero sodales lobortis...",
      assignedTo: "Name",
      dueDate: "12/2/2024",
    },
  ]);

  const [newAction, setNewAction] = useState("");

  const handleAddAction = () => {
    if (newAction.trim()) {
      const newEntry = {
        id: actions.length + 1,
        action: newAction,
        assignedTo: "Name",
        dueDate: "12/3/2024",
      };
      setActions([...actions, newEntry]);
      setNewAction("");
    }
  };

  return (
    <div className="bg-white mt-4 p-7 pt-4 border border-[#CCC] w-full flex flex-col gap-6 rounded-lg relative">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Incidence ID: 32930</h2>
      </div>

      {/* Action Plan List */}
      <div className="mb-4">
        <div className="w-full  gap-6  grid grid-cols-4 font-semibold text-gray-500 border-b pb-2">
          <div className="">Action</div>
          <div className="mx-auto">Assigned To</div>
          <div className="mx-auto">Due Date</div>
          <div></div>
        </div>
        {actions.map((item, index) => (
          <div
            key={item.id}
            className=" grid grid-cols-4 py-2 border-b text-gray-700 items-center"
          >
            <div>{item.action}</div>
            <div className="">{item.assignedTo}</div>
            <div>{item.dueDate}</div>
            <div className="flex justify-end">
              <PiDotsThreeVerticalBold className="text-gray-500 cursor-pointer" />
            </div>
          </div>
        ))}
      </div>

      {/* Add New Action */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <input
          type="text"
          placeholder="Enter action"
          value={newAction}
          onChange={(e) => setNewAction(e.target.value)}
          className="col-span-1 border p-2 rounded"
        />

        <NameDropdown categories={categories} />

        <Field
          {...{
            name: "start_date",
            //  label: "Start Date",
            type: "date",
          }}
        />
      </div>

      <button
        onClick={handleAddAction}
        className="text-pink-600 font-semibold mb-4"
      >
        + Add Action Plan
      </button>

      {/* Bottom Buttons */}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <FormCancelButton text={"Discard"} />
        <FormCustomButton text={"Previous"} />
        <FormProceedButton text={"Next"} />
      </div>
    </div>
  );
};

function NameDropdown({ categories, selected, onChange }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  return (
    <SelectDropdown
      // label={"Name"}
      placeholder={"Select Incidence Area"}
      items={categories}
      name={"category"}
      selected={selected}
      onSelect={onChange}
      isCollapsed={isCollapsed}
      onToggleCollpase={setIsCollapsed}
    />
  );
}

export default ActionPlan;
