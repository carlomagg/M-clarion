import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useDispatch, useSelector } from "react-redux";
import { toggleFormShow } from "../../../../config/slices/globalSlice";
import aiIcon from "../../../../assets/icons/ai-icon.svg";
import "./AiColor.css";
import { CKEField } from "../../../partials/Elements/Elements";

const EditForm = () => {
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");
  const { title } = useSelector((state) => state.global);
  const [formData, setFormData] = useState({ description: "INitiall desc" });

  const [scopeActive, setScopeActive] = useState("Internal");
  const [impactActive, setImpactActive] = useState("Positive");

  const [priorityActive, setPriorityActive] = useState("Low");

  const dispatch = useDispatch();

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  const toggleScope = (option) => {
    setScopeActive(option);
  };
  const toggleImpact = (option) => {
    setImpactActive(option);
  };

  const togglePriority = (option) => {
    setPriorityActive(option);
  };

  const handleAISuggestion = (setValue) => {
    setValue((prevValue) => prevValue + "\nAI Suggested Text...");
  };
  const handleBackorDiscard = () => {
    dispatch(toggleFormShow());
  };

  return (
    <div className="max-w-7xl mx-auto p-8 bg-white rounded-lg shadow-md">
      {/* Analysis Section */}
      <h2 className="text-2xl font-semibold mb-6">Analysis</h2>

      {/* Title Input */}
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Title
        </label>

        <p
          readOnly
          className="border border-gray-300 rounded-md w-full px-4 py-2"
        >
          {title}
        </p>
      </div>

      {/* Description Section with AI Suggestion */}
      <div className="mb-6 relative">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Description
        </label>
        <CKEField
          {...{
            name: "description",
            label: "Description",
            value: formData.description,
            onChange: handleChange,
          }}
        />

        {/* <button
          onClick={() => handleAISuggestion(setDescription)}
          className="flex rounded-lg gap-2 absolute mb-4 right-2 bg-white text-black px-2 py-1  text-xs  gradient-border"
        >
          <img src={aiIcon} />
          AI Suggestion
        </button> */}
      </div>

      {/* Scope and Impact Section */}
      <div className="mt-16 flex">
        <div className="gap-8">
          <label className="block text-gray-700 text-sm font-bold ">
            Scope
          </label>
          <div className="flex mt-2 ">
            <button
              className={` border px-4 py-2 rounded-s-2xl ${
                scopeActive === "Internal"
                  ? "bg-[#DD127A] text-white rounded-s-2xl"
                  : "bg-white text-black rounded-s-2xl"
              }`}
              onClick={() => toggleScope("Internal")}
            >
              Internal
            </button>
            <button
              className={` border border-gray-300 text-black px-4 py-2 rounded-e-2xl ${
                scopeActive === "External"
                  ? "bg-[#DD127A] text-white rounded-e-2xl"
                  : " bg-white text-black rounded-e-2xl "
              }`}
              onClick={() => toggleScope("External")}
            >
              External
            </button>
          </div>
        </div>
        <div className="gap-8 ml-5">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Impact
          </label>
          <div className="flex mt-2">
            <button
              className={`border border-gray-300 px-4 py-2 rounded-s-2xl ${
                impactActive === "Positive"
                  ? "bg-[#DD127A] text-white rounded-s-2xl"
                  : "bg-white text-black rounded-s-2xl"
              }`}
              onClick={() => toggleImpact("Positive")}
            >
              Positive
            </button>
            <button
              className={`border border-gray-300  px-4 py-2 rounded-e-2xl ${
                impactActive === "Negative"
                  ? "bg-[#DD127A] text-white rounded-e-2xl"
                  : "bg-white text-black rounded-e-2xl"
              }`}
              onClick={() => toggleImpact("Negative")}
            >
              Negative
            </button>
          </div>
        </div>
      </div>

      {/* Priority Section */}
      <div className="mt-6">
        <label className="block text-gray-700  font-bold mb-2">Priority</label>
        <div className="flex gap-1">
          <button
            className={`py-5 pr-16 pl-16 gap-4 rounded border hover:border-[#DD127A] ${
              priorityActive === "Low"
                ? "bg-[#DD127A] text-white rounded"
                : "bg-[#D9D9D9] text-black"
            }`}
            onClick={() => togglePriority("Low")}
          >
            Low
          </button>
          <button
            className={`hover:border-[#DD127A] border  py-5 pr-16 pl-16 gap-4  rounded ${
              priorityActive === "Medium"
                ? "bg-[#DD127A] text-white rounded"
                : "bg-[#D9D9D9] text-black"
            }`}
            onClick={() => togglePriority("Medium")}
          >
            Medium
          </button>
          <button
            className={` hover:border-[#DD127A] border py-5 pr-16 pl-16 gap-4 rounded ${
              priorityActive === "High"
                ? "bg-[#DD127A] text-white rounded"
                : "bg-[#D9D9D9] text-black"
            }`}
            onClick={() => togglePriority("High")}
          >
            High
          </button>
        </div>
        <div className="leading-10">
          <p>
            <strong>Mauris nec leo non</strong> libero sodales lobortis. Mauris
            nec leo non libero sodales lobortis.
          </p>
        </div>
      </div>

      {/* Note Section with AI Suggestion */}
      <div className="mt-5 relative">
        <label className="block text-gray-700 text-sm font-bold ">Note</label>
        <CKEField
          {...{
            name: "description",
            label: "Description",
            value: formData.description,
            onChange: handleChange,
          }}
        />
      </div>

      {/* Form Buttons */}
      <div className="w-full gap-2 flex mt-20 ">
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
      </div>
    </div>
  );
};

export default EditForm;
