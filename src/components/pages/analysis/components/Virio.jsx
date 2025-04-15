import React, { useState } from "react";
import { Field, Input } from "../../../partials/Elements/Elements";
import plusIcon from "../../../../assets/icons/plus.svg";
import { PiDotsThreeVerticalBold } from "react-icons/pi";
import "react-quill/dist/quill.snow.css"; // Import Quill styles
import ReactQuill from "react-quill"; // Import Quill editor
import { useDispatch } from "react-redux";
import { toggleFormShow } from "../../../../config/slices/globalSlice";
import useModelComponent from "../../../../hooks/useModelComponent";
import AnalysisService from "../../../../services/Analysis.service";

const Virio = ({ id, strategyId }) => {
  const [vrioComponents, setVrioComponents] = useState({
    Value: [],
    Rarity: [],
    Imitability: [],
    Organization: [],
  });

  const [valueTextbox, setValueTextbox] = useState();
  const [rarityTextbox, setRarityTextbox] = useState();
  const [imitabilityTextbox, setImitabilityTextbox] = useState();
  const [organizationTextbox, setOrganizationTextbox] = useState();

  const dispatch = useDispatch();

  const { modelComponents } = useModelComponent(id);

  const [showMenu, setShowMenu] = useState({
    status: false,
    index: 0,
    category: "",
  });

  const handleMenu = (index, category) => {
    setShowMenu({ status: !showMenu.status, index: index, category: category });
  };
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
        case "Value":
          handleValue(component_id, valueTextbox);
          break;
        case "Rarity":
          handleRarity(component_id, rarityTextbox);
          break;
        case "Imitability":
          handleImitability(component_id, imitabilityTextbox);
          break;
        case "Organization":
          handleOrganization(component_id, organizationTextbox);
          break;

        default:
          break;
      }
    }
  };

  // ::: Handle Input box For Each Component ::: //
  const handleVrioBox = (component, e) => {
    console.log("target:", e.target.value);
    switch (component) {
      case "Value":
        setValueTextbox(e.target.value);
        break;
      case "Rarity":
        setRarityTextbox(e.target.value);
        break;
      case "Imitability":
        setImitabilityTextbox(e.target.value);
        break;
      case "Organization":
        setOrganizationTextbox(e.target.value);
        break;

      default:
        break;
    }
  };

  // ::: Get Default Text Input Value ::: //
  const getInputValue = (component) => {
    switch (component) {
      case "Value":
        return valueTextbox;
      case "Rarity":
        return rarityTextbox;
      case "Imitability":
        return imitabilityTextbox;
      case "Organization":
        return organizationTextbox;
      default:
        break;
    }
  };
  console.log(valueTextbox);
  // ::: Add New Button ::: //
  const handleAddNewButton = (component, e) => {
    switch (component) {
      case "Value":
        handleValue(e.target.value);
        break;
      case "Rarity":
        handleRarity(e.target.value);
        break;
      case "Imitability":
        handleImitability(e.target.value);
        break;
      case "Organization":
        handleOrganization(e.target.value);
        break;

      default:
        break;
    }
  };

  //::: handling model components ::: //
  const handleValue = async (component_id, text) => {
    if (text == undefined) return;
    setVrioComponents((prevComponents) => ({
      ...prevComponents,
      ["Value"]: [...prevComponents["Value"], text],
    }));
    setValueTextbox("");
    const res = await AnalysisService.addModelContent(
      strategyId,
      component_id,
      text
    );
  };
  const handleRarity = async (component_id, text) => {
    if (text == undefined) return;
    setVrioComponents((prevComponents) => ({
      ...prevComponents,
      ["Rarity"]: [...prevComponents["Rarity"], text],
    }));
    setRarityTextbox("");
    const res = await AnalysisService.addModelContent(
      strategyId,
      component_id,
      text
    );
  };
  const handleImitability = async (component_id, text) => {
    if (text == undefined) return;
    setVrioComponents((prevComponents) => ({
      ...prevComponents,
      ["Imitability"]: [...prevComponents["Imitability"], text],
    }));
    setImitabilityTextbox("");
    const res = await AnalysisService.addModelContent(
      strategyId,
      component_id,
      text
    );
  };
  const handleOrganization = async (component_id, text) => {
    if (text == undefined) return;
    setVrioComponents((prevComponents) => ({
      ...prevComponents,
      ["Organization"]: [...prevComponents["Organization"], text],
    }));
    setOrganizationTextbox("");
    const res = await AnalysisService.addModelContent(
      strategyId,
      component_id,
      text
    );
  };

  const handleDelete = (index, category) => {
    switch (category) {
      case "Value":
        setVrioComponents((prevComponents) => ({
          ...prevComponents,
          Value: prevComponents.Value.filter((_, i) => i !== index),
        }));
        break;
      case "Rarity":
        setVrioComponents((prevComponents) => ({
          ...prevComponents,
          Rarity: prevComponents.Rarity.filter((_, i) => i !== index),
        }));
        break;
      case "Imitability":
        setVrioComponents((prevComponents) => ({
          ...prevComponents,
          Imitability: prevComponents.Imitability.filter((_, i) => i !== index),
        }));
        break;
      case "Organization":
        setVrioComponents((prevComponents) => ({
          ...prevComponents,
          Organization: prevComponents.Organization.filter(
            (_, i) => i !== index
          ),
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
          className="px-5 hover:bg-gray-100"
        >
          Edit
        </li>
        <li
          onClick={() => handleDelete(index, category)}
          className="px-5 hover:bg-gray-100"
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
                {vrioComponents[component.component_name]?.map(
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
                onChange={(e) => handleVrioBox(component.component_name, e)}
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

export default Virio;

// {modelComponents &&
//   modelComponents.map((component, index) => (
//     <div key={index} className="gap-2">
//       <p className="">{component.component_name}</p>

//       <div className="pt-3">
//         {value.map((text, index) => (
//           <div className="relative max-w-fit flex gap-2 mb-3" key={index}>
//             <span>{index + 1}</span>
//             <TextLabel text={text} index={index} category={"value"} />
//             {showMenu.status &&
//               showMenu.index == index &&
//               showMenu.category == "value" && (
//                 <MenuDot text={text} index={index} category={"value"} />
//               )}
//           </div>
//         ))}
//       </div>

//       <input
//         value={valueTextbox}
//         onChange={(e) => setValueTextbox(e.target.value)}
//         onKeyDown={(e) => handleKeyDown(e, "value")}
//         className="border-border-gray mt-3 ml-3 p-3 rounded-lg placeholder:text-placeholder-gray border outline-text-pink disabled:bg-[#EBEBEB]"
//         placeholder="Enter Value"
//         type="text"
//         name=""
//       />

//       <div
//         onClick={() => handleValue(valueTextbox)}
//         className="flex mt-4 pl-10 m-6 gap-1"
//       >
//         <img src={plusIcon} className="" />
//         <p className="">Add New</p>
//       </div>
//     </div>
//   ))}
