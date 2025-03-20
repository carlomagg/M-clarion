import React, { useState } from "react";
import plusIcon from "../../../../assets/icons/plus.svg";
import { PiDotsThreeVerticalBold } from "react-icons/pi";
import "react-quill/dist/quill.snow.css"; // Import Quill styles
import { useDispatch } from "react-redux";
import { toggleFormShow } from "../../../../config/slices/globalSlice";
import useModelComponent from "../../../../hooks/useModelComponent";
import AnalysisService from "../../../../services/Analysis.service";

const AnsoffMatrics = ({ id, strategyId }) => {
  const [ansoffComponents, setAnsoffComponents] = useState({
    MarketPenetration: [],
    ProductDevelopment: [],
    MarketDevelopment: [],
    Diversification: [],
    Environmental: [],
    Legal: [],
  });

  const [marketPenetrationTextbox, setMarketPenetrationTextbox] = useState();
  const [productDevelopmentTextbox, setProductDevelopmentTextbox] = useState();
  const [marketDevelopmentTextbox, setMarketDevelopmentTextbox] = useState();
  const [diversificationTextbox, setDiversificationTextbox] = useState();
  const [environmentalTextbox, setEnvironmentalTextbox] = useState();
  const [legalTextbox, setLegalTextbox] = useState();

  const dispatch = useDispatch();

  const { modelComponents } = useModelComponent(id);

  const [showMenu, setShowMenu] = useState({
    status: false,
    index: 0,
    category: "",
  });

  // ::: Trigger on Enter Key ::: //

  const handleKeyDown = (event, component) => {
    const category = component.component_name;
    console.log(category);
    const { component_id } = component;
    console.log(strategyId);
    if (event.key === "Enter") {
      if (strategyId == "") {
        alert("Please select a strategy");
        return;
      }
      switch (category) {
        case "Market Penetration":
          handleMarketPenetration(component_id, marketPenetrationTextbox);
          break;
        case "Product Development":
          handleProductDevelopment(component_id, productDevelopmentTextbox);
          break;
        case "Market Development":
          handleMarketDevelopment(component_id, marketDevelopmentTextbox);
          break;
        case "Diversification":
          handleDiversification(component_id, diversificationTextbox);
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
  const handleAnsoffBox = (component, e) => {
    console.log("target:", e.target.value);
    switch (component) {
      case "Market Penetration":
        setMarketPenetrationTextbox(e.target.value);
        break;
      case "Product Development":
        setProductDevelopmentTextbox(e.target.value);
      case "Market Development":
        setMarketDevelopmentTextbox(e.target.value);
        break;
      case "Diversification":
        setDiversificationTextbox(e.target.value);
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
      case "MarketPenetration":
        return marketPenetrationTextbox;
      case "ProductDevelopment":
        return productDevelopmentTextbox;
      case "MarketDevelopment":
        return marketDevelopmentTextbox;
      case "Diversification":
        return diversificationTextbox;
      case "environmental":
        return environmentalTextbox;
      case "legal":
        return legalTextbox;

      default:
        break;
    }
  };

  console.log(marketPenetrationTextbox);
  // ::: Add New Button ::: //
  const handleAddNewButton = (component, e) => {
    switch (component) {
      case "Market Penetration":
        handleMarketPenetration(e.target.value);
        break;
      case "Product Development":
        handleProductDevelopment(e.target.value);
        break;
      case "Market Development":
        handleMarketDevelopment(e.target.value);
        break;
      case "Diversification":
        handleDiversification(e.target.value);
        break;
      case "Environmental":
        handleEnvironmental(e.target.value);
        break;
      case "Legal":
        handleLegal(e.target.value);
        break;

      default:
        break;
    }
  };

  //::: handling model components ::: //
  const handleMarketPenetration = async (component_id, text) => {
    console.log(component_id, text);
    if (text == undefined) return;
    setAnsoffComponents((prevComponents) => ({
      ...prevComponents,
      ["MarketPenetration"]: [...prevComponents["MarketPenetration"], text],
    }));
    setMarketPenetrationTextbox("");
    const res = await AnalysisService.addModelContent(
      strategyId,
      component_id,
      text
    );
    console.log(res);
  };

  const handleProductDevelopment = async (component_id, text) => {
    if (text == undefined) return;
    setAnsoffComponents((prevComponents) => ({
      ...prevComponents,
      ["ProductDevelopment"]: [...prevComponents["ProductDevelopment"], text],
    }));
    setProductDevelopmentTextbox("");
    const res = await AnalysisService.addModelContent(
      strategyId,
      component_id,
      text
    );
  };

  const handleMarketDevelopment = async (component_id, text) => {
    if (text == undefined) return;
    setAnsoffComponents((prevComponents) => ({
      ...prevComponents,
      ["MarketDevelopment"]: [...prevComponents["MarketDevelopment"], text],
    }));
    setMarketDevelopmentTextbox("");
    const res = await AnalysisService.addModelContent(
      strategyId,
      component_id,
      text
    );
  };
  const handleDiversification = async (component_id, text) => {
    if (text == undefined) return;
    setAnsoffComponents((prevComponents) => ({
      ...prevComponents,
      ["Diversification"]: [...prevComponents["Diversification"], text],
    }));
    setDiversificationTextbox("");
    const res = await AnalysisService.addModelContent(
      strategyId,
      component_id,
      text
    );
    console.log(res);
  };

  const handleEnvironmental = async (component_id, text) => {
    if (text == undefined) return;
    setAnsoffComponents((prevComponents) => ({
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
    setAnsoffComponents((prevComponents) => ({
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

  // Handle Delete
  const handleDelete = (index, category) => {
    switch (category) {
      case "Market Penetration":
        setAnsoffComponents((prevComponents) => ({
          ...prevComponents,
          MarketPenetration: prevComponents.MarketPenetration.filter(
            (_, i) => i !== index
          ),
        }));
        break;
      case "Product Development":
        setAnsoffComponents((prevComponents) => ({
          ...prevComponents,
          ProductDevelopment: prevComponents.ProductDevelopment.filter(
            (_, i) => i !== index
          ),
        }));
        break;
      case "Market Development":
        setAnsoffComponents((prevComponents) => ({
          ...prevComponents,
          MarketDevelopment: prevComponents.MarketDevelopment.filter(
            (_, i) => i !== index
          ),
        }));
        break;
      case "Diversification":
        setAnsoffComponents((prevComponents) => ({
          ...prevComponents,
          Diversification: prevComponents.Diversification.filter(
            (_, i) => i !== index
          ),
        }));
        break;

      default:
        break;
    }
  };

  //::: ActionTriggers ::: //
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

  const MenuDot = ({ index, category }) => (
    <div className="absolute top-0 -right-[90px] justify-center items-center w-[90px] h-[100px] bg-white border shadow-md cursor-pointer border-[#676767] text-black  flex  rounded-lg ">
      <ul>
        <li
          onClick={() => dispatch(toggleFormShow())}
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
                {ansoffComponents[
                  component.component_name.replace(" ", "")
                ]?.map((text, index) => (
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
                ))}
              </div>

              <input
                value={getInputValue(component.component_name)}
                onChange={(e) => handleAnsoffBox(component.component_name, e)}
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

export default AnsoffMatrics;
