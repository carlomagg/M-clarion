import React from "react";
import vIcon from "../../../../../assets/icons/v-shape.svg";
import Diagram, { useSchema, createSchema } from "beautiful-react-diagrams";
import { CKEField } from "../../../../partials/Elements/Elements";

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

const Review = ({ setActiveTab, processData, onEdit }) => {
  const { processTab, taskWorkflow, flowChart } = processData;

  const handleEdit = (section) => {
    switch (section) {
      case "process":
        onEdit("Process Tab");
        break;
      case "workflow":
        onEdit("Task And Workflow");
        break;
      case "flowchart":
        onEdit("Flow Chart");
        break;
    }
  };

  return (
    <>
      <div className="border p-6 mt-4 rounded-lg flex flex-col gap-4 bg-white shadow">
        <div className="w-full flex border-b border-b-[#CCCCCC] justify-between p-2">
          <div className="flex gap-3">
            <img src={vIcon} alt="" />
            <p className="font-bold">Process Details</p>
          </div>
          <button 
            onClick={() => handleEdit("process")}
            className="text-[#DD127A] hover:underline"
          >
            Edit
          </button>
        </div>
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-pink-500 font-bold">PROCESS ID: Q1234</span>
          <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded">
            Version 1
          </span>
          <span className="text-gray-500">Date Created: 12/04/2024</span>
          <span className="text-gray-500">Last Updated: 12/04/2024</span>
        </div>
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">{processTab.title}</h3>
          <div>
            <p className="text-gray-600 mb-2">Description</p>
            <p>{processTab.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="font-semibold">Process Type</p>
              <p>{processTab.processType}</p>
            </div>
            <div>
              <p className="font-semibold">Business Unit</p>
              <p>{processTab.businessUnit}</p>
            </div>
          </div>
          <div className="gap-5">
            <p className="font-semibold mb-2">Priority Level</p>
            <button className="text-white px-10 py-6 rounded bg-[#DD121E]">
              High
            </button>
          </div>
          <div className="gap-6 mt-2">
            <p className="font-semibold">Related Processes</p>
            <div className="mt-2">
              <button className="py-2 p-2 rounded-2xl bg-[#CDF8EB] text-[#025D63]">
                Mauris nec leo non Sodales lobortis.
              </button>
            </div>
            <div className="mt-2">
              <button className="py-2 p-2 rounded-2xl bg-[#CDF8EB] text-[#025D63]">
                Sodales lobortis.
              </button>
            </div>
            <div className="mt-2">
              <button className="py-2 p-2 rounded-2xl bg-[#CDF8EB] text-[#025D63]">
                Non libero sodales lobortis.
              </button>
            </div>
          </div>
          <div className="mt-3">
            <p className="mb-3">Dependecies</p>
            <p className="text-black">
              <strong>Lorem ipsum: </strong>dolor sit amet, consectetur adipiscing
              elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit
              amet sapien fringilla, mattis ligula consectetur, ultrices mauris.
              Maecenas vitae mattis tellus. Nullam quis imperdiet augue.
              Vestibulum auctor ornare leo, non suscipit magna interdum eu.
              Curabitur pellentesque nibh nibh, at maximus ante fermentum sit
              amet. Pellentesque commodo lacus at sodales sodales. Quisque
              sagittis orci ut diam condimentum, vel euismod erat placerat.
            </p>
          </div>
          <div className="gap-8 mt-2 space-x-2">
            <p className="font-semibold">Tags</p>
            <button className="py-2 p-2 rounded-2xl bg-[#E2E2E2] text-[#000000]">
              Mauris
            </button>

            <button className="py-2 p-2 rounded-2xl bg-[#E2E2E2] text-[#000000]">
              nec
            </button>

            <button className="py-2 p-2 rounded-2xl bg-[#E2E2E2] text-[#000000]">
              libero
            </button>
            <button className="py-2 p-2 rounded-2xl bg-[#E2E2E2] text-[#000000]">
              sodales
            </button>
            <button className="py-2 p-2 rounded-2xl bg-[#E2E2E2] text-[#000000]">
              lobortis.
            </button>
            <button className="py-2 p-2 rounded-2xl bg-[#E2E2E2] text-[#000000]">
              muris
            </button>
            <button className="py-2 p-2 rounded-2xl bg-[#E2E2E2] text-[#000000]">
              nec
            </button>
          </div>
          <div className="mt-3">
            <p className="mb-3 font-bold">Note</p>
            <p className="text-black">
              Consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit
              urna. Pellentesque sit amet sapien fringilla, mattis ligula
              consectetur, ultrices mauris. Maecenas vitae mattis tellus. Nullam
              quis imperdiet augue. Vestibulum auctor ornare leo, non suscipit
              magna interdum eu. Curabitur pellentesque nibh nibh, at maximus ante
              fermentum sit amet.
            </p>
          </div>
        </div>
      </div>

      <div className="border p-6 mt-4 rounded-lg flex flex-col gap-4 bg-white shadow">
        <div className="w-full flex border-b border-b-[#CCCCCC] justify-between p-2">
          <div className="flex gap-3">
            <img src={vIcon} alt="" />
            <p className="font-bold">Workflow Steps</p>
          </div>
          <button 
            onClick={() => handleEdit("workflow")}
            className="text-[#DD127A] hover:underline"
          >
            Edit
          </button>
        </div>
        <table className="w-full text-left mt-4 text-gray-500">
          <thead className="text-gray-500 border-b border-b-[#CCCCCC]">
            <tr>
              <th scope="col" className="px-4 py-3">Task</th>
              <th scope="col" className="px-4 py-3">TAT</th>
              <th scope="col" className="px-4 py-3">Owner</th>
              <th scope="col" className="px-4 py-3">Start Date</th>
              <th scope="col" className="px-4 py-3">End Date</th>
            </tr>
          </thead>
          <tbody>
            {taskWorkflow.tasks.map((task, index) => (
              <tr key={index}>
                <td className="px-4 py-2">{task.name}</td>
                <td className="px-4 py-2">{task.tat}</td>
                <td className="px-4 py-2">{task.owner}</td>
                <td className="px-4 py-2">{task.startDate}</td>
                <td className="px-4 py-2">{task.endDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border p-6 mt-4 rounded-lg flex flex-col gap-4 bg-white shadow">
        <div className="w-full flex border-b border-b-[#CCCCCC] justify-between p-2">
          <div className="flex gap-3">
            <img src={vIcon} alt="" />
            <p className="font-bold">Flow Chart</p>
          </div>
          <button 
            onClick={() => handleEdit("flowchart")}
            className="text-[#DD127A] hover:underline"
          >
            Edit
          </button>
        </div>
        <div>
          <h3 className="font-semibold mb-4">{flowChart.name}</h3>
          <div style={{ height: "22.5rem" }}>
            <Diagram schema={flowChart.diagram || createSchema({})} />
          </div>
          <div className="mt-6">
            <p className="font-semibold mb-2">Note</p>
            <div dangerouslySetInnerHTML={{ __html: flowChart.note }} />
          </div>
        </div>
      </div>

      <div className="gap-2 flex mt-20">
        <button
          onClick={() => setActiveTab("Flow Chart")}
          className="py-3 rounded-lg bg-[#C3C3C3] disabled:bg-button-pink/70 text-black font-bold flex justify-center items-center flex-1 basis-64 shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.30)] whitespace-nowrap"
        >
          Back
        </button>
        <button
          className="py-3 rounded-lg bg-button-pink disabled:bg-button-pink/70 text-white font-bold flex flex-col justify-center items-center flex-1 basis-64 shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.30)] whitespace-nowrap"
        >
          Submit
        </button>
      </div>
    </>
  );
};

export default Review;
