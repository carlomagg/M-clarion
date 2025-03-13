import React, { useState } from "react";
import plusIcon from "../../../../assets/icons/plus.svg";
import { PiDotsThreeVerticalBold } from "react-icons/pi";
import "react-quill/dist/quill.snow.css"; // Import Quill styles
import ReactQuill from "react-quill"; // Import Quill editor
import { useDispatch } from "react-redux";
import { toggleFormShow } from "../../../../config/slices/globalSlice";
import useModelComponent from "../../../../hooks/useModelComponent";

const PortersFiveForces = ({ id }) => {
  const [threatEntrance, setThreatEntrance] = useState([]);
  const [threatEntranceTextbox, setThreatEntranceTextbox] = useState();

  const [suppliersPower, setSuppliersPower] = useState([]);
  const [suppliersPowerTextbox, setSuppliersPowerTextbox] = useState();

  const [suppliersBuyer, setSuppliersBuyer] = useState([]);
  const [suppliersBuyerTextbox, setSuppliersBuyerTextbox] = useState();

  const [threatSubstitute, setThreatSubstitute] = useState([]);
  const [threatSubstituteTextbox, setThreatSubstituteTextbox] = useState();

  const [industryRivalry, setIndustryRivalry] = useState([]);
  const [industryRivalryTextbox, setIndustryRivalryTextbox] = useState();

  const dispatch = useDispatch();

  const { modelComponents } = useModelComponent(id);

  const [showMenu, setShowMenu] = useState({
    status: false,
    index: 0,
    category: "",
  });

  const handleKeyDown = (event, category) => {
    if (event.key === "Enter") {
      switch (category) {
        case "threat-entrance":
          handleThreatEntrance(threatEntranceTextbox);
          break;
        case "suppliers-power":
          handleSuppliersPower(suppliersPowerTextbox);
          break;
        case "suppliers-buyer":
          handleSuppliersBuyer(suppliersBuyerTextbox);
          break;
        case "threat-substitute":
          handleThreatSubstitute(threatSubstituteTextbox);
          break;
        case "industry-rivalry":
          handleIndustryRivalry(industryRivalryTextbox);
          break;
        default:
          break;
      }
    }
  };

  const handleThreatEntrance = (text) => {
    if (text == undefined) return;
    setThreatEntrance((prev) => [...prev, text]);
    setThreatEntranceTextbox("");
  };

  const handleSuppliersPower = (text) => {
    if (text == undefined) return;
    setSuppliersPower((prev) => [...prev, text]);
    setSuppliersPowerTextbox("");
  };

  const handleSuppliersBuyer = (text) => {
    if (text == undefined) return;
    setSuppliersBuyer((prev) => [...prev, text]);
    setSuppliersBuyerTextbox("");
  };

  const handleThreatSubstitute = (text) => {
    if (text == undefined) return;
    setThreatSubstitute((prev) => [...prev, text]);
    setThreatSubstituteTextbox("");
  };
  const handleIndustryRivalry = (text) => {
    if (text == undefined) return;
    setIndustryRivalry((prev) => [...prev, text]);
    setIndustryRivalryTextbox("");
  };

  const handleMenu = (index, category) => {
    setShowMenu({ status: !showMenu.status, index: index, category: category });
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
      case "threat-entrance":
        setThreatEntrance((prev) => prev.filter((_, i) => i !== index));
        break;
      case "suppliers-power":
        setSuppliersPower((prev) => prev.filter((_, i) => i !== index));
        break;
      case "suppliers-buyer":
        setSuppliersBuyer((prev) => prev.filter((_, i) => i !== index));
        break;
      case "threat-substitute":
        setThreatSubstitute((prev) => prev.filter((_, i) => i !== index));
        break;
      case "industry-rivalry":
        setIndustryRivalry((prev) => prev.filter((_, i) => i !== index));
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
          <div key={index} className="pl-16 ">
            <p className="">{component.component_name}</p>
            <div className="pt-3">
              {suppliersPower.map((text, index) => (
                <div className="relative max-w-fit flex gap-2 mb-3" key={index}>
                  <span>{index + 1}</span>
                  <TextLabel
                    text={text}
                    index={index}
                    category={"suppliers-power"}
                  />
                  {showMenu.status &&
                    showMenu.index == index &&
                    showMenu.category == "suppliers-power" && (
                      <MenuDot
                        text={text}
                        index={index}
                        category={"suppliers-power"}
                      />
                    )}
                </div>
              ))}
            </div>
            <input
              value={suppliersPowerTextbox}
              onChange={(e) => setSuppliersPowerTextbox(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, "suppliers-power")}
              className="border-border-gray mt-3 ml-3 p-3 rounded-lg placeholder:text-placeholder-gray border outline-text-pink disabled:bg-[#EBEBEB]"
              placeholder="Enter Bargaining Power Of Suppliers"
              type="text"
              name="strength"
            />

            <div
              onClick={() => handleSuppliersPower(suppliersPowerTextbox)}
              className="flex pt-4 pl-10 p-6 gap-1"
            >
              <img src={plusIcon} className="" />
              <p className="">Add New</p>
            </div>
          </div>
        ))}
    </div>
  );
};

export default PortersFiveForces;
