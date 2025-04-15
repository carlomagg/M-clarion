import React, { useEffect, useState } from "react";
import dashIcon from "../../../../assets/icons/dash-icon.svg";
import { PiDotsThreeVerticalBold } from "react-icons/pi";
import { useQuery } from "@tanstack/react-query";
import AnalysisService from "../../../../services/Analysis.service";

const AnalysisView = ({ view }) => {
  const [loading, setLoading] = useState();
  const [analysisData, setAnalysisData] = useState([]);
  const strategyId = view;

  const getAllAnalysis = async () => {
    setLoading(true);
    try {
      if (strategyId) {
        const res = await AnalysisService.getAnalysisView(strategyId);
        const analysisArray = Object.entries(res.analysis_data).map(
          ([key, value]) => ({
            key,
            value,
          })
        );
        setAnalysisData(analysisArray);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getAllAnalysis();
  }, [view]);

  // console.log(analysisData);

  return (
    <div className="w-full mx-auto  mt-5 shadow-md  bg-white rounded p-6">
      <h1 className="font-[600] text-[22px] leading-7">Analysis view</h1>
      {analysisData.length ? (
        analysisData.map((item, index) => (
          <div key={index}>
            <div className="flex bg-[#DADADA] justify-between py-2 px-4 mt-5">
              <h2 className="text-lg  text-[#3B3B3B] font-semibold">
                {item.key}
              </h2>
              <PiDotsThreeVerticalBold className="cursor-pointer text-black" />
            </div>
            {/* content */}
            {item.value.components.map((contentItem, index) => (
              <div key={index} className="py-6 gap-4 flex ml-5">
                <span className="font-bold py-3 text-[#DD127A]">
                  <img src={dashIcon} />
                </span>
                <h3 className="text-md mb-2 ">{contentItem.component}</h3>

                <ul className="list-none mt-2 ">
                  {contentItem.contents.map((analysisContent, index) => (
                    <li
                      key={index}
                      className="flex  items-center justify-between"
                    >
                      <div className="flex pr-5  ">
                        <span className="text-green-500 mr-2">•</span>
                        <p>{analysisContent.analysis_content}</p>
                      </div>
                      {/* Dots Menu Icon */}
                      {/* <PiDotsThreeVerticalBold className=" text-black font-bold cursor-pointer ml-10" /> */}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))
      ) : (
        <div className="mt-4">
          <p>No Analysis View for this Strategy</p>
        </div>
      )}
    </div>
  );
};

export default AnalysisView;
