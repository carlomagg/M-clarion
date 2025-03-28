import React, { useState } from "react";
import plusIcon from "../../../../assets/icons/plus.svg";
import { PiDotsThreeVerticalBold } from "react-icons/pi";
import "react-quill/dist/quill.snow.css"; // Import Quill styles
import { useDispatch } from "react-redux";
import { toggleFormShow } from "../../../../config/slices/globalSlice";
import useModelComponent from "../../../../hooks/useModelComponent";
import AnalysisService from "../../../../services/Analysis.service";

const BcgMetrics = ({ id, strategyId }) => {
  const [bcgComponents, setBcgComponents] = useState({
    Stars: [],
    QuestionMarks: [],
    CashCows: [],
    Dogs: [],
  });

  const [starsTextbox, setStarsTextbox] = useState();
  const [questionMarksTextbox, setQuestionMarksTextbox] = useState();
  const [cashCowsTextbox, setCashCowsTextbox] = useState();
  const [dogsTextbox, setDogsTextbox] = useState();

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
        case "Stars":
          handleStars(component_id, starsTextbox);
          break;
        case "Question Marks":
          handleQuestionMarks(component_id, questionMarksTextbox);
          break;
        case "Cash Cows":
          handleCashCows(component_id, cashCowsTextbox);
          break;
        case "Dogs":
          handleDogs(component_id, dogsTextbox);
          break;

        default:
          break;
      }
    }
  };

  // ::: Handle Input box For Each Component ::: //
  const handleBcgBox = (component, e) => {
    console.log("target:", e.target.value);
    switch (component) {
      case "Stars":
        setStarsTextbox(e.target.value);
        break;
      case "Question Marks":
        setQuestionMarksTextbox(e.target.value);
        break;
      case "Cash Cow":
        setCashCowsTextbox(e.target.value);
        break;
      case "Dogs":
        setDogsTextbox(e.target.value);
        break;

      default:
        break;
    }
  };
  // ::: Get Default Text Input Value ::: //
  const getInputValue = (component) => {
    switch (component) {
      case "Stars":
        return starsTextbox;
      case "QuestionMarks":
        return questionMarksTextbox;
      case "CashCows":
        return cashCowsTextbox;
      case "Dogs":
        return dogsTextbox;

      default:
        break;
    }
  };

  console.log(starsTextbox);
  // ::: Add New Button ::: //
  const handleAddNewButton = (component, e) => {
    switch (component) {
      case "Stars":
        handleStars(e.target.value);
        break;
      case "Question Marks":
        handleQuestionMarks(e.target.value);
      case "Cash Cows":
        handleCashCows(e.target.value);
      case "Dogs":
        handleDogs(e.target.value);

      default:
        break;
    }
  };

  //::: handling model components ::: //
  const handleStars = async (component_id, text) => {
    console.log(component_id, text);
    if (text == undefined) return;
    setBcgComponents((prevComponents) => ({
      ...prevComponents,
      ["Stars"]: [...prevComponents["Stars"], text],
    }));
    setStarsTextbox("");
    const res = await AnalysisService.addModelContent(
      strategyId,
      component_id,
      text
    );
    console.log(res);
  };

  const handleQuestionMarks = async (component_id, text) => {
    console.log(component_id, text);
    if (text == undefined) return;
    setBcgComponents((prevComponents) => ({
      ...prevComponents,
      ["QuestionMarks"]: [...prevComponents["QuestionMarks"], text],
    }));
    setQuestionMarksTextbox("");
    const res = await AnalysisService.addModelContent(
      strategyId,
      component_id,
      text
    );
    console.log(res);
  };

  const handleCashCows = async (component_id, text) => {
    console.log(component_id, text);
    if (text == undefined) return;
    setBcgComponents((prevComponents) => ({
      ...prevComponents,
      ["CashCows"]: [...prevComponents["CashCows"], text],
    }));
    setCashCowsTextbox("");
    const res = await AnalysisService.addModelContent(
      strategyId,
      component_id,
      text
    );
    console.log(res);
  };

  const handleDogs = async (component_id, text) => {
    console.log(component_id, text);
    if (text == undefined) return;
    setBcgComponents((prevComponents) => ({
      ...prevComponents,
      ["Dogs"]: [...prevComponents["Dogs"], text],
    }));
    setDogsTextbox("");
    const res = await AnalysisService.addModelContent(
      strategyId,
      component_id,
      text
    );
    console.log(res);
  };

  // Handle Delete
  const handleDelete = (index, category) => {
    switch (category) {
      case "Stars":
        setBcgComponents((prevComponents) => ({
          ...prevComponents,
          Stars: prevComponents.Stars.filter((_, i) => i !== index),
        }));
        break;
      case "Question Marks":
        setBcgComponents((prevComponents) => ({
          ...prevComponents,
          QuestionMarks: prevComponents.QuestionMarks.filter(
            (_, i) => i !== index
          ),
        }));
        break;
      case "Cash Cows":
        setBcgComponents((prevComponents) => ({
          ...prevComponents,
          CashCows: prevComponents.CashCows.filter((_, i) => i !== index),
        }));
        break;
      case "Dogs":
        setBcgComponents((prevComponents) => ({
          ...prevComponents,
          Dogs: prevComponents.Dogs.filter((_, i) => i !== index),
        }));
        break;

      default:
        break;
    }
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
                {bcgComponents[component.component_name.replace(" ", "")]?.map(
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
                onChange={(e) => handleBcgBox(component.component_name, e)}
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

export default BcgMetrics;
