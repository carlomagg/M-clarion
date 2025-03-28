// import React, { useState } from "react";
// import "beautiful-react-diagrams/styles.css";
// import Diagram, { createSchema } from "beautiful-react-diagrams";

import React, { useRef, useState } from "react";
import "beautiful-react-diagrams/styles.css";
// import { Button } from "beautiful-react-ui";
import Diagram, { useSchema, createSchema } from "beautiful-react-diagrams";
import { CKEField } from "../../../../partials/Elements/Elements";
import axios from "axios";
import { get } from "lockr";
import { ACCESS_TOKEN_NAME, BASE_API_URL } from "../../../../../utils/consts";

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

const FlowChart = ({ setActiveTab }) => {
  const [schema, { onChange }] = useSchema(initialSchema);
  const [formData, setFormData] = useState({ note: "INitiall desc" });

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  const handleNextButtonClick = async () => {
    setActiveTab("Review");
    // Function to convert the schema to JSON and send to backend
    const nodesData = schema.nodes.map((node) => ({
      id: node.id,
      coordinates: node.coordinates,
      text: node.content.props.initialText, // Extract the initialText from the CustomNode props
    }));

    const linksData = schema.links.map((link) => ({
      input: link.input,
      output: link.output,
      label: link.label,
    }));

    const payload = { nodes: nodesData, links: linksData };

    const contentData = {
      note: formData.note,
      flowchat: JSON.stringify(payload),
      process: 3,
    };

    console.log(payload);

    const token = get(ACCESS_TOKEN_NAME);

    try {
      const result = await axios.post(
        `${BASE_API_URL}/process/process-flowcharts/`,

        contentData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(result.data);

      // if (response.ok) {
      //   alert("Flowchart saved successfully!");
      // } else {
      //   alert("Failed to save flowchart.");
      // }
      return result.data;
    } catch (error) {
      console.error("Error saving flowchart:", error);
      throw error;
    }
  };

  return (
    <>
      <div>
        <div style={{ height: "22.5rem" }}>
          <Diagram schema={schema} onChange={onChange} />
        </div>
        <div className="mt-10">
          <CKEField
            {...{
              name: "note",
              label: "Note",
              value: formData.note,
              onChange: handleChange,
            }}
          />
        </div>

        <div className=" gap-2 flex mt-20 ">
          <button className="py-3 rounded-lg bg-[#C3C3C3] disabled:bg-button-pink/70 text-black font-bold flex  justify-center items-center flex-1 basis-64 shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.30)] whitespace-nowrap">
            Back
          </button>
          <button className="py-3 rounded-lg bg-[#C3C3C3] disabled:bg-button-pink/70 text-black font-bold flex flex-col justify-center items-center flex-1 basis-64 shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.30)] whitespace-nowrap">
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
