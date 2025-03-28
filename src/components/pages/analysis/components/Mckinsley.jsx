import React, { useState } from "react";
import { Field, Input } from "../../../partials/Elements/Elements";
import plusIcon from "../../../../assets/icons/plus.svg";
import { PiDotsThreeVerticalBold } from "react-icons/pi";
import "react-quill/dist/quill.snow.css"; // Import Quill styles
import ReactQuill from "react-quill"; // Import Quill editor
import { useDispatch } from "react-redux";
import { toggleFormShow } from "../../../../config/slices/globalSlice";
import useModelComponent from "../../../../hooks/useModelComponent";

const Mckinsley = ({ id }) => {
  const [strategy, setStrategy] = useState([]);
  const [strategyTextbox, setStrategyTextbox] = useState();

  const [structure, setStructure] = useState([]);
  const [structureTextbox, setStructureTextbox] = useState();

  const [system, setSystem] = useState([]);
  const [systemTextbox, setSystemTextbox] = useState();

  const [sharedValue, setSharedValue] = useState([]);
  const [sharedValueTextbox, setSharedValueTextbox] = useState();

  const [skills, setSkills] = useState([]);
  const [skillsTextbox, setSkillsTextbox] = useState();

  const [style, setStyle] = useState([]);
  const [styleTextbox, setStyleTextbox] = useState();

  const [staff, setStaff] = useState([]);
  const [staffTextbox, setStaffTextbox] = useState();

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

  const handleStrategy = (text) => {
    if (text == undefined) return;
    setStrategy((prev) => [...prev, text]);
    setStrategyTextbox("");
  };
  const handleSystem = (text) => {
    if (text == undefined) return;
    setSystem((prev) => [...prev, text]);
    setSystemTextbox("");
  };

  const handleStructure = (text) => {
    if (text == undefined) return;
    setStructure((prev) => [...prev, text]);
    setStructureTextbox("");
  };

  const handleSharedValue = (text) => {
    if (text == undefined) return;
    setSharedValue((prev) => [...prev, text]);
    setSharedValueTextbox("");
  };

  const handleSkills = (text) => {
    if (text == undefined) return;
    setSkills((prev) => [...prev, text]);
    setSkillsTextbox("");
  };

  const handleStyle = (text) => {
    if (text == undefined) return;
    setStyle((prev) => [...prev, text]);
    setStyleTextbox("");
  };

  const handleStaff = (text) => {
    if (text == undefined) return;
    setStaff((prev) => [...prev, text]);
    setStaffTextbox("");
  };

  const handleKeyDown = (event, category) => {
    if (event.key === "Enter") {
      switch (category) {
        case "strategy":
          handleStrategy(strategyTextbox);
          break;
        case "structure":
          handleStructure(structureTextbox);
          break;
        case "system":
          handleSystem(systemTextbox);
          break;
        case "shared-Value":
          handleSharedValue(sharedValueTextbox);
          break;
        case "skills":
          handleSkills(skillsTextbox);
          break;
        case "style":
          handleStyle(styleTextbox);
          break;
        case "staff":
          handleStaff(staffTextbox);
          break;

        default:
          break;
      }
    }
  };

  const TextLabel = ({ text, index, category }) => (
    <div className=" flex p-4 gap-4 leading-[20px] bg-[#E2E2E2] rounded-[4px] text-[18px] font-[400] border-border-gray">
      <p>{text}</p>
      <PiDotsThreeVerticalBold
        className=""
        onClick={() => handleMenu(index, category)}
      />
    </div>
  );

  const handleDelete = (index, category) => {
    switch (category) {
      case "strategy":
        setStrategy((prev) => prev.filter((_, i) => i !== index));
        break;
      case "structure":
        setStructure((prev) => prev.filter((_, i) => i !== index));
        break;
      case "system":
        setSystem((prev) => prev.filter((_, i) => i !== index));
        break;
      case "shared-Value":
        setSharedValue((prev) => prev.filter((_, i) => i !== index));
        break;
      case "skills":
        setSkills((prev) => prev.filter((_, i) => i !== index));
        break;
      case "style":
        setStyle((prev) => prev.filter((_, i) => i !== index));
        break;
      case "staff":
        setStaff((prev) => prev.filter((_, i) => i !== index));
        break;

      default:
        break;
    }
  };

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
        <li className="px-4 hover:bg-gray-100">View</li>
      </ul>
    </div>
  );

  return (
    <div className="w-full bg-white mt-4 p-7 pt-4 grid grid-cols-2 gap-6 rounded-lg relative">
      {modelComponents &&
        modelComponents.map((component, index) => (
          <div key={index} className="gap-2">
            <p className="">{component.component_name}</p>
            <div className="pt-3">
              {strategy.map((text, index) => (
                <div className="relative max-w-fit flex gap-2 mb-3" key={index}>
                  <span>{index + 1}</span>
                  <TextLabel text={text} index={index} category={"strategy"} />
                  {showMenu.status &&
                    showMenu.index == index &&
                    showMenu.category == "strategy" && (
                      <MenuDot
                        text={text}
                        index={index}
                        category={"strategy"}
                      />
                    )}
                </div>
              ))}
            </div>

            <input
              value={strategyTextbox}
              onChange={(e) => setStrategyTextbox(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, "strategy")}
              className="border-border-gray mt-3 ml-3 p-3 rounded-lg placeholder:text-placeholder-gray border outline-text-pink disabled:bg-[#EBEBEB]"
              placeholder="Enter Strategy"
              type="text"
              name=""
            />

            <div
              onClick={() => handleStrategy(strategyTextbox)}
              className="flex mt-4 pl-10 m-6 gap-1"
            >
              <img src={plusIcon} className="" />
              <p className="">Add New </p>
            </div>
          </div>
        ))}
    </div>
  );
};

export default Mckinsley;
