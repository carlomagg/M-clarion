import React, { useState } from "react";
import plusIcon from "../../../../assets/icons/plus.svg";
import { PiDotsThreeVerticalBold } from "react-icons/pi";
import "react-quill/dist/quill.snow.css"; // Import Quill styles
import ReactQuill from "react-quill"; // Import Quill editor
import { useDispatch } from "react-redux";
import { toggleFormShow } from "../../../../config/slices/globalSlice";
import useModelComponent from "../../../../hooks/useModelComponent";
import AnalysisService from "../../../../services/Analysis.service";

const Soar = ({ id, strategyId }) => {
  const [soarComponents, setSoarComponents] = useState({
    Strengths: [],
    Opportunities: [],
    Aspirations: [],
    Results: [],
  });

  const [showMenu, setShowMenu] = useState({
    status: false,
    index: 0,
    category: "",
  });

  const [strengthsTextbox, setStrengthTextbox] = useState();
  const [opportunityTextbox, setOpportunityTextbox] = useState();
  const [aspirationTextbox, setAspirationTextbox] = useState();
  const [resultTextbox, setResultTextbox] = useState();

  const dispatch = useDispatch();

  const { modelComponents } = useModelComponent(id);

  // ::: Trigger on Enter Key ::: //
  const handleKeyDown = (event, component) => {
    const category = component.component_name;
    const { component_id } = component;
    if (event.key === "Enter") {
      if (strategyId == "") {
        alert("Please select a strategy");
        return;
      }
      switch (category) {
        case "Strengths":
          handleStrength(component_id, strengthsTextbox);
          break;
        case "Opportunities":
          handleOpportunity(component_id, opportunityTextbox);
          break;
        case "Aspirations":
          handleAspiration(component_id, aspirationTextbox);
          break;
        case "Results":
          handleResult(component_id, resultTextbox);
          break;

        default:
          break;
      }
    }
  };

  // ::: Handle Input box For Each Component ::: //
  const handleSoarBox = (component, e) => {
    console.log("target:", e.target.value);
    switch (component) {
      case "Strengths":
        setStrengthTextbox(e.target.value);
        break;
      case "Opportunities":
        setOpportunityTextbox(e.target.value);
        break;
      case "Aspirations":
        setAspirationTextbox(e.target.value);
        break;
      case "Results":
        setResultTextbox(e.target.value);
        break;

      default:
        break;
    }
  };

  // ::: Get Default Text Input Value ::: //
  const getInputValue = (component) => {
    switch (component) {
      case "Strengths":
        return strengthsTextbox;
      case "Opportunities":
        return opportunityTextbox;
      case "Aspirations":
        return aspirationTextbox;
      case "Results":
        return resultTextbox;

      default:
        break;
    }
  };
  console.log(strengthsTextbox);
  // ::: Add New Button ::: //
  const handleAddNewButton = (component, e) => {
    switch (component) {
      case "Strengths":
        handleStrength(e.target.value);
        break;
      case "Opportunities":
        handleOpportunity(e.target.value);
        break;
      case "Aspirations":
        handleAspiration(e.target.value);
        break;
      case "Results":
        handleResult(e.target.value);
        break;

      default:
        break;
    }
  };

  //::: handling model components ::: //
  const handleStrength = async (component_id, text) => {
    if (text == undefined) return;
    setSoarComponents((prevComponents) => ({
      ...prevComponents,
      ["Strengths"]: [...prevComponents["Strengths"], text],
    }));
    setStrengthTextbox("");
    const res = await AnalysisService.addModelContent(
      strategyId,
      component_id,
      text
    );
  };
  const handleOpportunity = async (component_id, text) => {
    if (text == undefined) return;
    setSoarComponents((prevComponents) => ({
      ...prevComponents,
      ["Opportunities"]: [...prevComponents["Opportunities"], text],
    }));
    setOpportunityTextbox("");
    const res = await AnalysisService.addModelContent(
      strategyId,
      component_id,
      text
    );
  };
  const handleAspiration = async (component_id, text) => {
    if (text == undefined) return;
    setSoarComponents((prevComponents) => ({
      ...prevComponents,
      ["Aspirations"]: [...prevComponents["Aspirations"], text],
    }));
    setAspirationTextbox("");
    const res = await AnalysisService.addModelContent(
      strategyId,
      component_id,
      text
    );
  };
  const handleResult = async (component_id, text) => {
    if (text == undefined) return;
    setSoarComponents((prevComponents) => ({
      ...prevComponents,
      ["Results"]: [...prevComponents["Results"], text],
    }));
    setResultTextbox("");
    const res = await AnalysisService.addModelContent(
      strategyId,
      component_id,
      text
    );
  };

  //::: ActionTriggers ::: //
  const handleMenu = (index, category) => {
    setShowMenu({ status: !showMenu.status, index: index, category: category });
  };

  const handleDelete = (index, category) => {
    switch (category) {
      case "Strengths":
        setSoarComponents((prevComponents) => ({
          ...prevComponents,
          Strengths: prevComponents.Strengths.filter((_, i) => i !== index),
        }));
        break;
      case "Opportunities":
        setSoarComponents((prevComponents) => ({
          ...prevComponents,
          Opportunities: prevComponents.Opportunities.filter(
            (_, i) => i !== index
          ),
        }));
        break;
      case "Aspirations":
        setSoarComponents((prevComponents) => ({
          ...prevComponents,
          Aspirations: prevComponents.Aspirations.filter((_, i) => i !== index),
        }));
        break;
      case "Results":
        setSoarComponents((prevComponents) => ({
          ...prevComponents,
          Results: prevComponents.Results.filter((_, i) => i !== index),
        }));
        break;

      default:
        break;
    }
  };
  // ::: UI Elements ::: //
  const TextLabel = ({ text, index, category }) => (
    <div className=" flex p-4 gap-4 leading-[20px] bg-[#E2E2E2] rounded-[4px] text-[18px] font-[400] border-border-gray">
      <p>{text}</p>
      <PiDotsThreeVerticalBold
        className=""
        onClick={() => handleMenu(index, category)}
      />
    </div>
  );

  const MenuDot = ({ text, index, category }) => (
    <div className="absolute top-0 -right-[90px] justify-center items-center w-[90px] h-[100px] bg-white border shadow-md cursor-pointer border-[#676767] text-black  flex  rounded-lg ">
      <ul>
        <li
          onClick={() => dispatch(toggleFormShow(text))}
          className="px-4 hover:bg-gray-100"
        >
          Edit
        </li>
        <li
          onClick={() => handleDelete(index, category)}
          className="px-4 hover:bg-gray-100"
        >
          Delete
        </li>
        {/* <li className="px-4 hover:bg-gray-100">View</li> */}
      </ul>
    </div>
  );
  return (
    <div className="w-full bg-white mt-4 min-h-[100px]">
      {modelComponents ? (
        <div className="p-7 pt-4  grid grid-cols-2 gap-6 rounded-lg relative">
          {modelComponents.map((component, index) => (
            <div key={index} className="gap-2 py-2">
              <p className="">{component.component_name}</p>
              <div className="pt-3">
                {soarComponents[component.component_name]?.map(
                  (text, index) => (
                    <div
                      className="relative max-w-fit flex gap-2 mb-3"
                      key={index}
                    >
                      <span>{index + 1}</span>
                      <TextLabel
                        text={text}
                        index={index}
                        category={component.component_name}
                      />
                      {showMenu.status &&
                        showMenu.index == index &&
                        showMenu.category == component.component_name && (
                          <MenuDot
                            text={text}
                            index={index}
                            category={component.component_name}
                          />
                        )}
                    </div>
                  )
                )}
              </div>

              <input
                value={getInputValue(component.component_name)}
                onChange={(e) => handleSoarBox(component.component_name, e)}
                onKeyDown={(e) => handleKeyDown(e, component)}
                className="border-border-gray mt-3 ml-3 p-3 rounded-lg placeholder:text-placeholder-gray border outline-text-pink disabled:bg-[#EBEBEB]"
                placeholder={`Enter ${component.component_name}`}
                type="text"
                name={component.component_name}
              />

              <div
                onClick={() => handleAddNewButton(component.component_name)}
                className="flex mt-4 pl-10 m-6 gap-1"
              >
                <img src={plusIcon} className="" />
                <p className="">Add New</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center p-7 justify-center">
          <h2>Select an Analysis Tool</h2>
        </div>
      )}
    </div>
  );
};

export default Soar;

// {modelComponents &&
//   modelComponents.map((component, index) => (
//     <div key={index} className="gap-2">
//       <p className="">{component.component_name}</p>

//       <div className="pt-3">
//         {strength.map((text, index) => (
//           <div className="relative max-w-fit flex gap-2 mb-3" key={index}>
//             <span>{index + 1}</span>
//             <TextLabel text={text} index={index} category={"strength"} />
//             {showMenu.status &&
//               showMenu.index == index &&
//               showMenu.category == "strength" && (
//                 <MenuDot
//                   text={text}
//                   index={index}
//                   category={"strength"}
//                 />
//               )}
//           </div>
//         ))}
//       </div>

//       <input
//         value={strengthTextbox}
//         onChange={(e) => setStrengthTextbox(e.target.value)}
//         onKeyDown={(e) => handleKeyDown(e, "strength")}
//         className="border-border-gray mt-3 ml-3 p-3 rounded-lg placeholder:text-placeholder-gray border outline-text-pink disabled:bg-[#EBEBEB]"
//         placeholder="Enter Strength"
//         type="text"
//         name="strength"
//       />

//       <div
//         onClick={() => handleStrength(strengthTextbox)}
//         className="flex mt-4 pl-10 m-6 gap-1"
//       >
//         <img src={plusIcon} className="" />
//         <p className="">Add New</p>
//       </div>
//     </div>
//   ))}
