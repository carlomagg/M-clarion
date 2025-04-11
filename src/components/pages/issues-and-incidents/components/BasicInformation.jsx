import React, { useState } from "react";
import { CKEField, Field } from "../../../partials/Elements/Elements";
import SelectDropdown from "../../../partials/dropdowns/SelectDropdown/SelectDropdown";
import { MultiSelectorDropdown } from "../../../partials/forms/track-risk/components";

const BasicInformation = () => {
  const [formData, setFormData] = useState({ description: "INitiall desc" });
  const [selectedOwners, setSelectedOwners] = useState([]);

  const users = [
    { id: 1, text: "User 1" },
    { id: 2, text: "User 2" },
    { id: 3, text: "User 3" },
  ];

  const categories = [
    { id: 1, text: "Category 1" },
    { id: 2, text: "Category 2" },
    { id: 3, text: "Category 3" },
    { id: 4, text: "Category 4" },
  ];

  const classes = [
    { id: 1, text: "Class 1" },
    { id: 2, text: "Class 2" },
    { id: 3, text: "Class 3" },
    { id: 4, text: "Class 4" },
  ];

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  return (
    <div className="bg-white mt-4 p-7 pt-4 border border-[#CCC] w-full flex flex-col gap-6 rounded-lg relative">
      <form className="space-y-6">
        {/* Incident ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Incidence ID: 32930
          </label>
        </div>

        {/* Title */}
        <div>
          <Field
            {...{ name: "name", label: "Name", placeholder: "Enter risk name" }}
          />
        </div>

        {/* Description */}
        <div>
          <CKEField
            {...{
              name: "description",
              label: "Description",
              value: formData.description,
              onChange: handleChange,
            }}
          />
        </div>
        {/* Incident Area and Type */}
        <div className="flex gap-6">
          <IncidenceAreaDropdown categories={categories} />
          <IncidenceTypeDropdown classes={classes} />
        </div>

        {/* Location and Affected System */}
        <div className="flex gap-6">
          <Field
            {...{
              name: "name",
              label: "Location",
              placeholder: "Enter location",
            }}
          />
          <Field
            {...{
              name: "name",
              label: "Affected System",
              placeholder: "Enter affected system",
            }}
          />
        </div>

        {/* Start Date and End Date */}
        <div className="flex gap-6">
          <Field
            {...{ name: "start_date", label: "Start Date", type: "date" }}
          />
          <Field
            {...{ name: "start_date", label: "Start Date", type: "date" }}
          />
        </div>

        {/* Owner */}
        <div className="w-1/2">
          <MultiSelectorDropdown
            allItems={users}
            selectedItems={selectedOwners}
            onSetItems={setSelectedOwners}
            placeholder={"Select owner (one or more)"}
            label={"Owners"}
            name={"owner_ids"}
          />
        </div>

        <div>
          <Field
            {...{
              name: "name",
              label: "Tags",
              placeholder: "Enter incidence tags",
            }}
          />
        </div>

        {/* Note */}
        <div>
          <CKEField
            {...{
              name: "description",
              label: "Note",
              value: formData.description,
              onChange: handleChange,
            }}
          />
        </div>
      </form>
    </div>
  );
};

function IncidenceAreaDropdown({ categories, selected, onChange }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  return (
    <SelectDropdown
      label={"Incidence Area"}
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

function IncidenceTypeDropdown({ classes, selected, onChange }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  return (
    <SelectDropdown
      label={"Incendence Type"}
      placeholder={"Select Incidence Type"}
      items={classes}
      name={"class"}
      selected={selected}
      onSelect={onChange}
      isCollapsed={isCollapsed}
      onToggleCollpase={setIsCollapsed}
    />
  );
}

export default BasicInformation;
