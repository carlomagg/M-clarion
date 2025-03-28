import React, { useState } from "react";
import plusIcon from "../../../../assets/icons/plus.svg";
import { PiDotsThreeVerticalBold } from "react-icons/pi";
import { useDispatch } from "react-redux";
import { toggleFormShow } from "../../../../config/slices/globalSlice";
import useModelComponent from "../../../../hooks/useModelComponent";
import AnalysisService from "../../../../services/Analysis.service";

const Pestle = ({ id, strategyId }) => {
  const [pestelComponents, setPestelComponents] = useState({
    Political: [],
    Economical: [],
    Social: [],
    Technology: [],
    Environmental: [],
    Legal: [],
  });

  const [showMenu, setShowMenu] = useState({
    status: false,
    index: 0,
    category: "",
  });

  const [politicalTextbox, setPoliticalTextbox] = useState();
  const [economicalTextbox, setEconomicalTextbox] = useState();
  const [socialTextbox, setSocialTextbox] = useState();
  const [technologyTextbox, setTechnologyTextbox] = useState();
  const [environmentalTextbox, setEnvironmentalTextbox] = useState();
  const [legalTextbox, setLegalTextbox] = useState();

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
        case "Political":
          handlePolitical(component_id, politicalTextbox);
          break;
        case "Economical":
          handleEconomical(component_id, economicalTextbox);
          break;
        case "Social":
          handleSocial(component_id, socialTextbox);
          break;
        case "Technology":
          handleTechnology(component_id, technologyTextbox);
          break;
        case "Environmental":
          handleEnvironmental(component_id, environmentalTextbox);
          break;
        case "Legal":
          handleLegal(component_id, legalTextbox);

        default:
          break;
      }
    }
  };

  // ::: Handle Input box For Each Component ::: //
  const handlePestelBox = (component, e) => {
    console.log("target:", e.target.value);
    switch (component) {
      case "Political":
        setPoliticalTextbox(e.target.value);
        break;
      case "Economical":
        setEconomicalTextbox(e.target.value);
        break;
      case "Social":
        setSocialTextbox(e.target.value);
        break;
      case "Technology":
        setTechnologyTextbox(e.target.value);
        break;
      case "Environmental":
        setEnvironmentalTextbox(e.target.value);
        break;
      case "Legal":
        setLegalTextbox(e.target.value);

      default:
        break;
    }
  };
  // ::: Get Default Text Input Value ::: //
  const getInputValue = (component) => {
    switch (component) {
      case "Political":
        return politicalTextbox;
      case "Economical":
        return economicalTextbox;
      case "Social":
        return socialTextbox;
      case "Technology":
        return technologyTextbox;
      case "Environmental":
        return environmentalTextbox;
      case "Legal":
        return legalTextbox;

      default:
        break;
    }
  };
  // console.log(opportunityTextbox);
  // ::: Add New Button ::: //
  const handleAddNewButton = (component, e) => {
    switch (component) {
      case "Political":
        handlePolitical(e.target.value);
        break;
      case "Economical":
        handleEconomical(e.target.value);
        break;
      case "Social":
        handleSocial(e.target.value);
        break;
      case "Technology":
        handleTechnology(e.target.value);
        break;
      case "Environmental":
        handleEnvironmental(e.target.value);
        break;
      case "Legal":
        handleLegal(e.target.value);

      default:
        break;
    }
  };

  //::: handling model components ::: //
  const handlePolitical = async (component_id, text) => {
    if (text == undefined) return;
    setPestelComponents((prevComponents) => ({
      ...prevComponents,
      ["Political"]: [...prevComponents["Political"], text],
    }));
    setPoliticalTextbox("");
    const res = await AnalysisService.addModelContent(
      strategyId,
      component_id,
      text
    );
  };

  const handleEconomical = async (component_id, text) => {
    if (text == undefined) return;
    setPestelComponents((prevComponents) => ({
      ...prevComponents,
      ["Economical"]: [...prevComponents["Economical"], text],
    }));
    setEconomicalTextbox("");
    const res = await AnalysisService.addModelContent(
      strategyId,
      component_id,
      text
    );
  };
  const handleSocial = async (component_id, text) => {
    if (text == undefined) return;
    setPestelComponents((prevComponents) => ({
      ...prevComponents,
      ["Social"]: [...prevComponents["Social"], text],
    }));
    setSocialTextbox("");
    const res = await AnalysisService.addModelContent(
      strategyId,
      component_id,
      text
    );
  };

  const handleTechnology = async (component_id, text) => {
    if (text == undefined) return;
    setPestelComponents((prevComponents) => ({
      ...prevComponents,
      ["Technology"]: [...prevComponents["Technology"], text],
    }));
    setTechnologyTextbox("");
    const res = await AnalysisService.addModelContent(
      strategyId,
      component_id,
      text
    );
  };
  const handleEnvironmental = async (component_id, text) => {
    if (text == undefined) return;
    setPestelComponents((prevComponents) => ({
      ...prevComponents,
      ["Environmental"]: [...prevComponents["Environmental"], text],
    }));
    setEnvironmentalTextbox("");
    const res = await AnalysisService.addModelContent(
      strategyId,
      component_id,
      text
    );
  };

  const handleLegal = async (component_id, text) => {
    if (text == undefined) return;
    setPestelComponents((prevComponents) => ({
      ...prevComponents,
      ["Legal"]: [...prevComponents["Legal"], text],
    }));
    setLegalTextbox("");
    const res = await AnalysisService.addModelContent(
      strategyId,
      component_id,
      text
    );
  };

  //::: ActionTriggers ::: //
  const handleMenu = (onyin, category) => {
    setShowMenu({ status: !showMenu.status, index: onyin, category: category });
  };

  const handleDelete = (index, category) => {
    switch (category) {
      case "Political":
        setPestelComponents((prevComponents) => ({
          ...prevComponents,
          Political: prevComponents.Political.filter((_, i) => i !== index),
        }));
        break;
      case "Economical":
        setPestelComponents((prevComponents) => ({
          ...prevComponents,
          Economical: prevComponents.Economical.filter((_, i) => i !== index),
        }));
        break;
      case "Social":
        setPestelComponents((prevComponents) => ({
          ...prevComponents,
          Social: prevComponents.Social.filter((_, i) => i !== index),
        }));
        break;
      case "Technology":
        setPestelComponents((prevComponents) => ({
          ...prevComponents,
          Technology: prevComponents.Technology.filter((_, i) => i !== index),
        }));
        break;
      case "Environmental":
        setPestelComponents((prevComponents) => ({
          ...prevComponents,
          Environmental: prevComponents.Environmental.filter(
            (_, i) => i !== index
          ),
        }));
        break;
      case "Legal":
        setPestelComponents((prevComponents) => ({
          ...prevComponents,
          Legals: prevComponents.Legal.filter((_, i) => i !== index),
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
    <div className="w-full   bg-white mt-4 min-h-[100px]">
      {modelComponents ? (
        <div className="p-7 pt-4  grid grid-cols-2 gap-6 rounded-lg relative">
          {modelComponents.map((component, index) => (
            <div key={index} className="gap-2 py-2">
              <p className="">{component.component_name}</p>
              <div className="pt-3">
                {pestelComponents[component.component_name]?.map(
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
                onChange={(e) => handlePestelBox(component.component_name, e)}
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

export default Pestle;
