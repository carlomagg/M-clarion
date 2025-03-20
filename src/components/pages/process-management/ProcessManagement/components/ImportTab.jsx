import React, { useState } from "react";
import rightArrowIcon from "../../../../../assets/icons/small-right-arrow.svg";
import {
  FormCancelButton,
  FormCustomButton,
  FormProceedButton,
} from "../../../../partials/buttons/FormButtons/FormButtons";
import Review from "./Review";
import ProcessTab from "./ProcessTab";
import ReviewImportedProcess from "./ReviewImportedProcess";
import ImportProcess from "./ImportProcess";

const ImportTab = () => {
  const [activeTab, setActiveTab] = useState("Import Process");

  const tabToRender = () => {
    switch (activeTab) {
      case "Import Process":
        return <ImportProcess />;
      case "Review Imported Process":
        return <ReviewImportedProcess />;

      default:
        return null;
    }
  };

  return (
    <>
      <div className=" w-full p-6 mt-4 flex flex-col gap-4">
        <div className="bg-white p-1 rounded-lg border border-[#CCC]">
          <ul className="flex gap-6">
            <li
              className={`p-3  font-medium text-center text-sm rounded-md grow cursor-default ${
                activeTab === "Import Process"
                  ? "text-text-pink bg-text-pink/15"
                  : "text-[#656565] "
              }`}
              onClick={() => setActiveTab("Import Process")}
            >
              Import Process
            </li>
            <img src={rightArrowIcon} alt="" className="shrink" />
            <li
              className={`p-3  font-medium text-center text-sm rounded-md grow cursor-default ${
                activeTab === "Review Imported Process"
                  ? "text-text-pink bg-text-pink/15"
                  : "text-[#656565]    "
              }`}
              onClick={() => setActiveTab("Review Imported Process")}
            >
              Review Imported Process
            </li>
          </ul>
        </div>
        <div>{tabToRender()}</div>
      </div>
    </>
  );
};

export default ImportTab;
