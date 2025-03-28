import React, { useState } from "react";
import PageHeader from "../../../partials/PageHeader/PageHeader";
import chevronLeft from "../../../../assets/icons/chevron-left.svg";
import PageTitle from "../../../partials/PageTitle/PageTitle";
import Stepper from "../../../partials/Stepper/Stepper";
import BasicInformation from "../components/BasicInformation";
import rightArrowIcon from "../../../../assets/icons/small-right-arrow.svg";
import Impact from "../components/Impact";
import Evidence from "../components/Evidence";
import ActionPlan from "../components/ActionPlan";
import Review from "../components/Review";
import MyQueue from "../components/MyQueue";
// import aiIcon from "../../../../assets/icons/ai-icon.svg";

const Index = () => {
  const [activeTab, setActiveTab] = useState("Basic Information");
  const [selectedTab, setSelectedTab] = useState("");

  const tabToRender = () => {
    switch (activeTab) {
      case "Basic Information":
        return <BasicInformation />;
      case "Impact":
        return <Impact />;
      case "Evidence":
        return <Evidence />;
      case "Action Plan":
        return <ActionPlan />;
      case "Review ":
        return <Review />;

      default:
        return null;
    }
  };

  return (
    <>
      <div className="p-10 pt-4 max-w-7xl flex flex-col gap-6">
        <PageTitle title={"Page title"} />
        <PageHeader />

        {/* main content container */}
        <div className="mt-4 flex flex-col gap-6">
          <div className="bg-white p-1 rounded-lg border border-[#CCC]">
            <ul className="flex gap-6">
              <li
                className={`p-3  font-medium text-center text-sm rounded-md grow cursor-default ${
                  activeTab === "Basic Information"
                    ? "text-text-pink bg-text-pink/15"
                    : "text-[#656565]"
                }`}
                onClick={() => setActiveTab("Basic Information")}
              >
                Basic Information
              </li>
              <img src={rightArrowIcon} alt="" className="shrink" />

              <li
                className={`p-3 font-medium text-center text-sm rounded-md grow cursor-default ${
                  activeTab === "Impact"
                    ? "text-text-pink bg-text-pink/15"
                    : "text-[#656565]"
                }`}
                onClick={() => setActiveTab("Impact")}
              >
                Impact
              </li>
              <img src={rightArrowIcon} alt="" className="shrink" />

              <li
                className={`p-3 font-medium text-center text-sm rounded-md grow cursor-default ${
                  activeTab === "Evidence"
                    ? "text-text-pink bg-text-pink/15"
                    : "text-[#656565]"
                }`}
                onClick={() => setActiveTab("Evidence")}
              >
                Evidence
              </li>
              <img src={rightArrowIcon} alt="" className="shrink" />

              <li
                className={`p-3 font-medium text-center text-sm rounded-md grow cursor-default ${
                  activeTab === "Action Plan"
                    ? "text-text-pink bg-text-pink/15"
                    : "text-[#656565]"
                }`}
                onClick={() => setActiveTab("Action Plan")}
              >
                Action Plan
              </li>
              <img src={rightArrowIcon} alt="" className="shrink" />
              <li
                className={`p-3 font-medium text-center text-sm rounded-md grow cursor-default ${
                  activeTab === "Review"
                    ? "text-text-pink bg-text-pink/15"
                    : "text-[#656565]"
                }`}
                onClick={() => setActiveTab("Review")}
              >
                Review
              </li>
            </ul>
          </div>
        </div>
        <div>
          <div>{tabToRender()}</div>
        </div>
        <div className="">
          <MyQueue />
        </div>
      </div>
    </>
  );
};

export default Index;
