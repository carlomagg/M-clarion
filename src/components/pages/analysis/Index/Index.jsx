import React, { useEffect, useState } from "react";
import PageHeader from "../../../partials/PageHeader/PageHeader";
import LinkButton from "../../../partials/buttons/LinkButton/LinkButton";
import AnalysisView from "../components/AnalysisView";
import AiSuggestions from "../components/AiSuggestions";
import Swot from "../components/Swot";
import Pestle from "../components/Pestle";

import { IoCloseCircleSharp } from "react-icons/io5";
import Soar from "../components/Soar";
import Virio from "../components/Virio";
import AnsoffMatrics from "../components/AnsoffMatrics";
import Mckinsley from "../components/Mckinsley";
import BcgMetrics from "../components/BcgMetrics";
import PortersFiveForces from "../components/PortersFiveForces";
import EditForm from "../components/EditForm";
import { useSelector } from "react-redux";
import axios from "axios";
import { get } from "lockr";
import { ACCESS_TOKEN_NAME } from "../../../../utils/consts";
import { strategiesOptions } from "../../../../queries/strategies/strategy-queries";
import { useQuery } from "@tanstack/react-query";

function Index() {
  // const [isOpen, setIsOpen] = useState(false);
  // const strategies = ["2024 Strategy and KPIs", "Strategy 2", "Strategy ABC"];

  const { formShow } = useSelector((state) => state.global);
  const {
    data: strategies,
    isLoading: strategyLoading,
    isError,
  } = useQuery(strategiesOptions());

  const [selectedStrategy, setSelectedStrategy] = useState();
  const [analysisDropdown, setAnalysisDropdown] = useState(false);
  const [analysisView, setAnalysisView] = useState("SWOT Analysis");
  const [selectedAnalysisTools, setSelectedAnalysisTools] = useState([
    "SWOT Analysis",
  ]);

  const [analysisToolsId, setAnalysisToolsId] = useState();

  const [analysisTools, setAnalysisTools] = useState();

  const toggleAnalysisDropdown = () => {
    setAnalysisDropdown(!analysisDropdown);
  };
  const updateSelectedStrategy = () => {
    if (!strategyLoading) {
      setSelectedStrategy(strategies[0].id);
    }
  };
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  const handleComponentViewer = (view) => {
    setSelectedAnalysisTools((prev) => {
      if (!prev.includes(view.analysis_model)) {
        return [...prev, view.analysis_model];
      }
      return prev;
    });
    setAnalysisToolsId(view.analysis_model_id);
    setAnalysisView(view.analysis_model);
  };

  const removeAnalysisView = (view) => {
    setSelectedAnalysisTools((prevItems) =>
      prevItems.filter((item) => item !== view)
    );
  };

  const analysisviewToRender = () => {
    if (analysisView == "SWOT Analysis") {
      return <Swot strategyId={selectedStrategy} id={analysisToolsId} />;
    }
    if (analysisView == "PESTEL Analysis") {
      return <Pestle strategyId={selectedStrategy} id={analysisToolsId} />;
    }
    if (analysisView == "SOAR Analysis") {
      return <Soar strategyId={selectedStrategy} id={analysisToolsId} />;
    }
    if (analysisView == "VRIO Analysis") {
      return <Virio strategyId={selectedStrategy} id={analysisToolsId} />;
    }
    if (analysisView == "Ansoff Matrix") {
      return (
        <AnsoffMatrics strategyId={selectedStrategy} id={analysisToolsId} />
      );
    }
    if (analysisView == "McKinsey 7S Framework") {
      return <Mckinsley strategyId={selectedStrategy} id={analysisToolsId} />;
    }
    if (analysisView == "BCG Matrix") {
      return <BcgMetrics strategyId={selectedStrategy} id={analysisToolsId} />;
    }
    if (analysisView == "Porter`s Five Forces") {
      return (
        <PortersFiveForces strategyId={selectedStrategy} id={analysisToolsId} />
      );
    }
  };

  const chevron = (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.35853 8.75857C6.58356 8.53361 6.88873 8.40723 7.20693 8.40723C7.52513 8.40723 7.8303 8.53361 8.05533 8.75857L12.0069 12.7102L15.9585 8.75857C16.1849 8.53998 16.488 8.41903 16.8026 8.42176C17.1173 8.4245 17.4182 8.5507 17.6407 8.77319C17.8632 8.99568 17.9894 9.29665 17.9921 9.61129C17.9949 9.92593 17.8739 10.229 17.6553 10.4554L12.8553 15.2554C12.6303 15.4803 12.3251 15.6067 12.0069 15.6067C11.6887 15.6067 11.3836 15.4803 11.1585 15.2554L6.35853 10.4554C6.13357 10.2303 6.00719 9.92517 6.00719 9.60697C6.00719 9.28877 6.13357 8.9836 6.35853 8.75857Z"
        fill="#000"
      />
    </svg>
  );

  const getAnalysisTools = async () => {
    try {
      const tools = await axios.get(
        "strategy/models/view-all/"
      );
      setAnalysisTools(tools.data.analysis_models);
    } catch (error) {}
  };
  useEffect(() => {
    updateSelectedStrategy();
  }, [strategies]);

  useEffect(() => {
    getAnalysisTools();
  }, []);

  return (
    <div className=" w-full flex justify-between gap-4">
      <div className="p-5 pt-4 flex flex-col flex-1  gap-6">
        {/* p-10 */}
        {/* min-h-[600px]  */}
        <PageHeader>
          <div className="flex gap-3 items-center">
            <LinkButton text={"Import"} />
            <LinkButton text={"Export"} />
          </div>
        </PageHeader>
        <div className="flex flex-col  ">
          <div className="w-full flex flex-col ">
            <div className={`max-w-full ${!formShow ? "flex" : "hidden"}`}>
              <StrategyDropdown
                {...{
                  strategies,
                  selectedStrategy,
                  setSelectedStrategy,
                  strategyLoading,
                }}
              />

              <div className="relative ml-3 ">
                <button
                  onClick={toggleAnalysisDropdown}
                  className="bg-white p-3 flex rounded-lg items-center"
                >
                  Analysis Tools
                  {chevron}
                </button>
                {analysisDropdown && (
                  <div className="absolute z-20  mt-2  rounded-md shadow-lg bg-white ">
                    {/* origin-top-right right-0  ring-1 ring-black ring-opacity-5*/}
                    <ul className="mt-2 absolute top-full w-max left-0 bg-white overflow-hidden border border-[#D5D5D5] rounded-lg ">
                      {/* p-3 cursor-pointer border-border-gray */}

                      {analysisTools.map((tool, index) => (
                        <li
                          key={index}
                          onClick={() => handleComponentViewer(tool)}
                          className="p-3 whitespace-nowrap border-b border-[#D5D5D5] last:border-b-0 hover:bg-gray-100"

                          // block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100
                        >
                          {tool.analysis_model}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {/* Analysis header */}
              <div className="flex ml-3 items-center gap-4 bg-white p-2 rounded-md max-w-[400px]  overflow-auto ">
                {/* overflow-y-hidden max-w-[350px]*/}
                {selectedAnalysisTools.map((item, index) => (
                  <div
                    key={index}
                    className={`${
                      item == analysisView
                        ? "bg-[#DD127A26] text-[#DD127A]"
                        : "text-[#131212]"
                    }  h-7 rounded-md px-4 font-[500] text-[14px] leading-[28px] flex items-center gap-2`}
                  >
                    {item != analysisView && (
                      <IoCloseCircleSharp
                        className="cursor-pointer"
                        onClick={() => removeAnalysisView(item)}
                      />
                    )}
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* component viewer */}
            <div>
              <div className={`${!formShow ? "flex" : "hidden"}`}>
                {analysisviewToRender()}
              </div>
              {formShow && <EditForm />}
            </div>
          </div>
          {/* Analysis View */}
          <div className={`${!formShow ? "flex" : "hidden"}`}>
            {/* mt-auto */}
            <AnalysisView view={selectedStrategy} />
          </div>
        </div>
      </div>
      {/* Ai suggestions */}
      <div className="min-w-[366px]">
        <AiSuggestions model={analysisView} />
      </div>
    </div>
  );
}
function StrategyDropdown({
  strategies,
  strategyLoading,
  selectedStrategy,
  setSelectedStrategy,
}) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  function handleStrategySelect(e) {
    setSelectedStrategy(e.target.value);
    setIsCollapsed(true);
  }

  return (
    <div className="cursor-pointer w-max">
      <select
        onClick={() => {
          setIsCollapsed(!isCollapsed);
        }}
        className="flex gap-2 items-center rounded-lg p-3 outline-none"
        value={selectedStrategy}
        onChange={handleStrategySelect}
      >
        {/* <option value="">Choose Strategy</option> */}
        {!strategyLoading &&
          strategies.map((strategy, index) => (
            <option key={index} value={strategy.id}>
              {strategy.name}
            </option>
          ))}
      </select>
    </div>
  );
}

export default Index;
