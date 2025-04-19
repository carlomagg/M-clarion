// import React, { useState } from "react";
// import "beautiful-react-diagrams/styles.css";
// import Diagram, { createSchema } from "beautiful-react-diagrams";

import React, { useRef, useState, useEffect } from "react";
import "beautiful-react-diagrams/styles.css";
// import { Button } from "beautiful-react-ui";
import Diagram, { useSchema, createSchema } from "beautiful-react-diagrams";
import { CKEField } from "../../../../partials/Elements/Elements";
import axios from "axios";
import { get } from "lockr";
import { ACCESS_TOKEN_NAME, BASE_API_URL } from "../../../../../utils/consts";
import { useMessage } from "../../../../../contexts/MessageContext";

const CustomNode = ({ id, initialText }) => {
  const [text, setText] = useState(initialText);

  const handleChange = (e) => setText(e.target.value);

  return (
    <div
      style={{
        padding: "10px",
        backgroundColor: "#f3f3f3",
        border: "1px solid #ccc",
        borderRadius: "5px",
      }}
    >
      <input
        type="text"
        value={text}
        onChange={handleChange}
        placeholder={`Type in ${id}`}
        style={{ width: "100%" }}
      />
    </div>
  );
};

const initialSchema = createSchema({
  nodes: [
    {
      id: "node-1",
      content: <CustomNode id="node-1" initialText="Node 1" />,
      coordinates: [250, 60],
    },
    {
      id: "node-2",
      content: <CustomNode id="node-2" initialText="Node 2" />,
      coordinates: [100, 200],
    },
    {
      id: "node-3",
      content: <CustomNode id="node-3" initialText="Node 3" />,
      coordinates: [250, 220],
    },
    {
      id: "node-4",
      content: <CustomNode id="node-4" initialText="Node 4" />,
      coordinates: [400, 200],
    },
    {
      id: "node-5",
      content: <CustomNode id="node-5" initialText="Node 5" />,
      coordinates: [400, 200],
    },
  ],
  links: [
    { input: "node-1", output: "node-2", label: "", readonly: true },
    { input: "node-1", output: "node-3", label: "", readonly: true },
    { input: "node-1", output: "node-4", label: "", readonly: true },
    { input: "node-1", output: "node-5", label: "", readonly: true },
  ],
});

const FlowChart = ({ setActiveTab, formData, updateFormData }) => {
  const [schema, { onChange }] = useSchema(initialSchema);
  const [localFormData, setLocalFormData] = useState(formData || { name: "", note: "" });
  const { dispatchMessage } = useMessage();

  // Update local form when parent data changes
  useEffect(() => {
    if (formData) {
      setLocalFormData(formData);
    }
  }, [formData]);

  function handleChange(e) {
    const newData = {
      ...localFormData,
      [e.target.name]: e.target.value,
    };
    setLocalFormData(newData);
    updateFormData(newData);
  }

  const handleNextButtonClick = async () => {
    try {
      const contentData = {
        name: localFormData.name || "",
        note: localFormData.note || "",
        process_id: 34
      };

      console.log("Submitting flowchart:", contentData);

      const token = get(ACCESS_TOKEN_NAME);
      
      let result;
      if (localFormData.id) {
        // Update existing flowchart
        result = await axios.put(
          `${BASE_API_URL}/process/process-flowcharts/${localFormData.id}/update/`,
          contentData,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        // Create new flowchart
        result = await axios.post(
          `${BASE_API_URL}/process/process-flowcharts`,
          contentData,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
      
      console.log("Flowchart saved successfully:", result.data);
      updateFormData({ ...contentData, id: result.data.id });
      dispatchMessage('success', 'Flowchart saved successfully!');
      setActiveTab("Review");
      return result.data;
    } catch (error) {
      console.error("Error saving flowchart:", error.response?.data || error.message);
      dispatchMessage('error', 'Failed to save flowchart. Please try again.');
      throw error;
    }
  };

  const handleSaveAsDraft = async () => {
    try {
      // For drafts, we allow empty fields
      const contentData = {
        name: localFormData.name || "",
        note: localFormData.note || "",
        process_id: 34
      };

      console.log("Saving flowchart as draft:", contentData);

      const token = get(ACCESS_TOKEN_NAME);
      
      let result;
      if (localFormData.id) {
        // Update existing flowchart
        result = await axios.put(
          `${BASE_API_URL}/process/process-flowcharts/${localFormData.id}/update/`,
          contentData,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        // Create new flowchart
        result = await axios.post(
          `${BASE_API_URL}/process/process-flowcharts`,
          contentData,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
      
      console.log("Flowchart draft saved successfully:", result.data);
      updateFormData({ ...contentData, id: result.data.id });
      dispatchMessage('success', 'Flowchart draft saved successfully!');
      return result.data;
    } catch (error) {
      console.error("Error saving flowchart draft:", error.response?.data || error.message);
      dispatchMessage('error', 'Failed to save flowchart draft. Please try again.');
      throw error;
    }
  };

  const handleBackButtonClick = () => {
    setActiveTab("Task And Workflow");
  };

  return (
    <>
      <div>
        <div style={{ height: "22.5rem" }}>
          <Diagram schema={schema} onChange={onChange} />
        </div>
        <div className="mt-10 space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Flowchart Name"
            value={localFormData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <CKEField
            {...{
              name: "note",
              label: "Note",
              value: localFormData.note,
              onChange: handleChange,
            }}
          />
        </div>

        <div className="gap-2 flex mt-20">
          <button 
            onClick={handleBackButtonClick}
            className="py-3 rounded-lg bg-[#C3C3C3] disabled:bg-button-pink/70 text-black font-bold flex justify-center items-center flex-1 basis-64 shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.30)] whitespace-nowrap"
          >
            Back
          </button>
          <button 
            onClick={handleSaveAsDraft}
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
    </>
  );
};

export default FlowChart;
