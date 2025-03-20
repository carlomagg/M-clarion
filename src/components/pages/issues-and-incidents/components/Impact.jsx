import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { CKEField } from "../../../partials/Elements/Elements";
import {
  FormCancelButton,
  FormCustomButton,
  FormProceedButton,
} from "../../../partials/buttons/FormButtons/FormButtons";

const Impact = () => {
  const [severity, setSeverity] = useState(2); // Default severity level
  const [priority, setPriority] = useState("High"); // Default priority
  const [description, setDescription] = useState("");

  const handleSeverityClick = (level) => setSeverity(level);
  const handlePriorityClick = (level) => setPriority(level);
  const [formData, setFormData] = useState({ description: "INitiall desc" });

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  return (
    <div className="bg-white mt-4 p-7 pt-4 border border-[#CCC] w-full flex flex-col gap-6 rounded-lg relative">
      <h2 className="text-lg font-semibold mb-4">Incidence ID: 32930</h2>

      {/* Impact Description */}
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

      {/* Severity and Priority */}
      <div className="flex  mb-4 gap-2">
        {/* Severity Section */}
        <div className="flex flex-col">
          <label className="font-medium mb-2">Severity</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                onClick={() => handleSeverityClick(level)}
                className={`px-10 py-6 rounded ${
                  severity === level
                    ? "bg-pink-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Priority Section */}
        <div className="flex flex-col  justify-center ml-7 ">
          <label className="font-medium ">Priority</label>
          <div className="flex gap-2">
            {["Low", "Medium", "High"].map((level) => (
              <button
                key={level}
                onClick={() => handlePriorityClick(level)}
                className={`px-20 py-7 rounded ${
                  priority === level
                    ? "bg-pink-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <FormCancelButton text={"Discard"} />
        <FormCustomButton text={"Previous"} />
        <FormProceedButton text={"Next"} />
      </div>
    </div>
  );
};

export default Impact;
