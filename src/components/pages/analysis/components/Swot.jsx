import React, { useEffect, useState } from "react";
import plusIcon from "../../../../assets/icons/plus.svg";
import { PiDotsThreeVerticalBold } from "react-icons/pi";
import { useDispatch } from "react-redux";
import { toggleFormShow } from "../../../../config/slices/globalSlice";
import axios from "axios";
import useModelComponent from "../../../../hooks/useModelComponent";
import AnalysisService from "../../../../services/Analysis.service";

const Swot = ({ id, strategyId }) => {
  const [swotComponents, setSwotComponents] = useState({
    Strengths: [],
    Weaknesses: [],
    Opportunities: [],
    Threats: [],
  });
  const [showMenu, setShowMenu] = useState({
    status: false,
    index: 0,
    category: "",
  });
  const [strengthTextbox, setStrengthTextbox] = useState();
  const [opportunityTextbox, setOpportunityTextbox] = useState();
  const [weaknessTextbox, setWeaknessTextbox] = useState();
  const [threatTextbox, setThreatTextbox] = useState();

  const { modelComponents } = useModelComponent(id);
  const dispatch = useDispatch();

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
          handleStrengths(component_id, strengthTextbox);
          break;
        case "Opportunities":
          handleOpportunity(component_id, opportunityTextbox);
          break;
        case "Weaknesses":
          handleWeakness(component_id, weaknessTextbox);
          break;
        case "Threats":
          handleThreat(component_id, threatTextbox);

        default:
          break;
      }
    }
  };

  // ::: Handle Input box For Each Component ::: //
  const handleSwotBox = (component, e) => {
    console.log("target:", e.target.value);
    switch (component) {
      case "Strengths":
        setStrengthTextbox(e.target.value);
        break;
      case "Opportunities":
        setOpportunityTextbox(e.target.value);
        break;
      case "Weaknesses":
        setWeaknessTextbox(e.target.value);
        break;
      case "Threats":
        setThreatTextbox(e.target.value);

      default:
        break;
    }
  };

  // ::: Get Default Text Input Value ::: //
  const getInputValue = (component) => {
    switch (component) {
      case "Strengths":
        return strengthTextbox;
      case "Opportunities":
        return opportunityTextbox;
      case "Weaknesses":
        return weaknessTextbox;
      case "Threats":
        return threatTextbox;

      default:
        break;
    }
  };
  console.log(opportunityTextbox);
  // ::: Add New Button ::: //
  const handleAddNewButton = (component, e) => {
    switch (component) {
      case "Strengths":
        handleStrengths(e.target.value);
        break;
      case "Opportunities":
        handleOpportunity(e.target.value);
        break;
      case "Weaknesses":
        handleWeakness(e.target.value);
        break;
      case "Threats":
        handleThreat(e.target.value);

      default:
        break;
    }
  };

  //::: handling model components ::: //
  const handleStrengths = async (component_id, text) => {
    if (text == undefined) return;
    setSwotComponents((prevComponents) => ({
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
    setSwotComponents((prevComponents) => ({
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

  const handleWeakness = async (component_id, text) => {
    if (text == undefined) return;
    setSwotComponents((prevComponents) => ({
      ...prevComponents,
      ["Weaknesses"]: [...prevComponents["Weaknesses"], text],
    }));
    setWeaknessTextbox("");
    const res = await AnalysisService.addModelContent(
      strategyId,
      component_id,
      text
    );
  };
  const handleThreat = async (component_id, text) => {
    if (text == undefined) return;
    setSwotComponents((prevComponents) => ({
      ...prevComponents,
      ["Threats"]: [...prevComponents["Threats"], text],
    }));
    setThreatTextbox("");
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
        setSwotComponents((prevComponents) => ({
          ...prevComponents,
          Strengths: prevComponents.Strengths.filter((_, i) => i !== index),
        }));
        break;
      case "Opportunities":
        setSwotComponents((prevComponents) => ({
          ...prevComponents,
          ["Opportunities"]: prevComponents.Opportunities.filter(
            (_, i) => i !== index
          ),
        }));
        break;
      case "Weaknesses":
        setSwotComponents((prevComponents) => ({
          ...prevComponents,
          ["Weaknesses"]: prevComponents.Weaknesses.filter(
            (_, i) => i !== index
          ),
        }));
        break;
      case "Threats":
        setSwotComponents((prevComponents) => ({
          ...prevComponents,
          ["Threats"]: prevComponents.Threats.filter((_, i) => i !== index),
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
  const MenuDot = ({ index, category, text }) => (
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
                {swotComponents[component.component_name]?.map(
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
                onChange={(e) => handleSwotBox(component.component_name, e)}
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

export default Swot;
