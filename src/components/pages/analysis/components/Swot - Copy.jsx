import React, { useState } from "react";
import plusIcon from "../../../../assets/icons/plus.svg";
import { PiDotsThreeVerticalBold } from "react-icons/pi";
import "react-quill/dist/quill.snow.css"; // Import Quill styles
import ReactQuill from "react-quill"; // Import Quill editor
import EditForm from "../components/EditForm";

const Swot = () => {
  const [strengths, setStrengths] = useState([]);
  const [strengthTextbox, setStrengthTextbox] = useState();

  const [opportunity, setOpportunity] = useState([]);
  const [opportunityTextbox, setOpportunityTextbox] = useState();

  const [weakness, setWeakness] = useState([]);
  const [weaknessTextbox, setWeaknessTextbox] = useState();

  const [threat, setThreat] = useState([]);
  const [threatTextbox, setThreatTextbox] = useState();

  const [value, setValue] = useState("");

  const [showMenu, setShowMenu] = useState({
    status: false,
    index: 0,
    category: "",
  });
  const [showEditForm, setShowEditForm] = useState({
    status: false,
    index: 0,
    category: "",
  });

  const handleKeyDown = (event, category) => {
    if (event.key === "Enter") {
      switch (category) {
        case "strength":
          handleStrengths(strengthTextbox);
          break;
        case "opportunity":
          handleOpportunity(opportunityTextbox);
          break;
        case "weakness":
          handleWeakness(weaknessTextbox);
          break;
        case "threat":
          handleThreat(threatTextbox);

        default:
          break;
      }
    }
  };

  const handleOpportunity = (text) => {
    if (text == "") return;
    setOpportunity((prev) => [...prev, text]);
    setOpportunityTextbox("");
  };

  const handleStrengths = (text) => {
    if (text == "") return;
    setStrengths((prev) => [...prev, text]);
    setStrengthTextbox("");
  };

  const handleWeakness = (text) => {
    if (text == "") return;
    setWeakness((prev) => [...prev, text]);
    setWeaknessTextbox("");
  };

  const handleThreat = (text) => {
    if (text == "") return;
    setThreat((prev) => [...prev, text]);
    setThreatTextbox("");
  };
  const handleMenu = (onyin, category) => {
    setShowMenu({ status: !showMenu.status, index: onyin, category: category });
  };

  const handleEdit = (index, category) => {
    setShowEditForm({
      status: !showEditForm.status,
      index: index,
      category: category,
    });
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

  const MenuDot = () => (
    <div className="absolute top-0 -right-[90px] justify-center items-center w-[90px] h-[100px] bg-white border shadow-md cursor-pointer border-[#676767] text-black  flex  rounded-lg ">
      <ul>
        <li
          onClick={() => handleEdit(index, category)}
          className="px-4 hover:bg-gray-100"
        >
          Edit
        </li>
        <li className="px-4 hover:bg-gray-100">Delete</li>
        <li className="px-4 hover:bg-gray-100">View</li>
      </ul>
    </div>
  );

  return (
    <div className="bg-white mt-4 p-7 pt-4 max-w-7xl flex flex-col gap-6 rounded-lg relative">
      <div className="flex ">
        <div className="gap-2 py-2">
          <p className="">Strength</p>
          <div className="pt-3">
            {strengths.map((text, index) => (
              <div className="relative max-w-fit flex gap-2 mb-3" key={index}>
                <span>{index + 1}</span>
                <TextLabel text={text} index={index} category={"strength"} />
                {showMenu.status &&
                  showMenu.index == index &&
                  showMenu.category == "strength" && <MenuDot />}
                {showEditForm.status &&
                  showEditForm.index == index &&
                  showEditForm.category == "edit" && <EditForm />}
              </div>
            ))}
          </div>

          <input
            value={strengthTextbox}
            onChange={(e) => setStrengthTextbox(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, "strength")}
            className="border-border-gray mt-3 ml-3 p-3 rounded-lg placeholder:text-placeholder-gray border outline-text-pink disabled:bg-[#EBEBEB]"
            placeholder="Enter Strength"
            type="text"
            name="strength"
          />

          <div
            onClick={() => handleStrengths(strengthTextbox)}
            className="flex mt-4 pl-10 m-6 gap-1"
          >
            <img src={plusIcon} className="" />
            <p className="">Add New</p>
          </div>
        </div>

        <div className="pl-16 py-2">
          <p className="">Weakness</p>
          <div className="pt-3">
            {weakness.map((text, index) => (
              <div className="relative max-w-fit flex gap-2 mb-3" key={index}>
                <span>{index + 1}</span>
                <TextLabel text={text} index={index} category={"weakness"} />
                {showMenu.status &&
                  showMenu.index == index &&
                  showMenu.category == "weakness" && <MenuDot />}
              </div>
            ))}
          </div>
          <input
            value={weaknessTextbox}
            onChange={(e) => setWeaknessTextbox(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, "weakness")}
            className="border-border-gray mt-3 ml-3 p-3 rounded-lg placeholder:text-placeholder-gray border outline-text-pink disabled:bg-[#EBEBEB]"
            placeholder="Enter Weakness"
            type="text"
            name="strength"
          />

          <div
            onClick={() => handleWeakness(weaknessTextbox)}
            className="flex pt-4 pl-10 p-6 gap-1"
          >
            <img src={plusIcon} className="" />
            <p className="">Add New</p>
          </div>
        </div>
      </div>

      <div className="flex">
        <div className="gap-2 py-2">
          <p className="">Opportunity</p>

          <div className="pt-3">
            {opportunity.map((text, index) => (
              <div className="relative max-w-fit  flex gap-2 mb-3" key={index}>
                <span>{index + 1}</span>
                <TextLabel text={text} index={index} category={"opportunity"} />
                {showMenu.status &&
                  showMenu.index == index &&
                  showMenu.category == "opportunity" && <MenuDot />}
              </div>
            ))}
          </div>

          <input
            value={opportunityTextbox}
            onChange={(e) => setOpportunityTextbox(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, "opportunity")}
            className="border-border-gray mt-3 ml-3 p-3 rounded-lg placeholder:text-placeholder-gray border outline-text-pink disabled:bg-[#EBEBEB]"
            placeholder="Enter Opportunity"
            type="text"
            name="strength"
          />

          <div
            onClick={() => handleOpportunity(opportunityTextbox)}
            className="flex mt-4 ml-10 m-6 gap-1"
          >
            <img src={plusIcon} className="" />
            <p className="">Add New</p>
          </div>
        </div>

        <div className="ml-14 py-2">
          <p className="">Threat</p>

          <div className="pt-3">
            {threat.map((text, index) => (
              <div className="relative max-w-fit  flex gap-2 mb-3" key={index}>
                <span>{index + 1}</span>
                <TextLabel text={text} index={index} category={"threat"} />
                {showMenu.status &&
                  showMenu.index == index &&
                  showMenu.category == "threat" && <MenuDot />}
              </div>
            ))}
          </div>
          <input
            value={threatTextbox}
            onChange={(e) => setThreatTextbox(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, "threat")}
            className="border-border-gray mt-3 ml-3 p-3 rounded-lg placeholder:text-placeholder-gray border outline-text-pink disabled:bg-[#EBEBEB]"
            placeholder="Enter Threat"
            type="text"
            name="strength"
          />

          <div
            onClick={() => handleThreat(threatTextbox)}
            className="flex pt-4 pl-10 p-6 gap-1"
          >
            <img src={plusIcon} className="" />
            <p className="">Add New</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Swot;
