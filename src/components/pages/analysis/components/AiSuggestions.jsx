import React, { useEffect, useState } from "react";
import "./AiColor.css";
import refreshIcon from "../../../../assets/icons/solar-refresh.svg";
import vIcon from "../../../../assets/icons/v-shape.svg";
import greaterIcon from "../../../../assets/icons/greater-icon.svg";
import AnalysisService from "../../../../services/Analysis.service";

const AiSuggestions = ({ model }) => {
  const [aiBox, setAiBox] = useState([]);
  const [suggestionBox, setSuggestionBox] = useState("");

  const AiSuggestion = async () => {
    const contentData = {
      model: model,
      suggestion: suggestionBox,
    };
    const result = await AnalysisService.addAiSuggestion(contentData);
    // const sections = result.split("\n\n").reduce((acc, section) => {
    //   const [title, ...content] = section.split("\n");
    //   acc[title.replace(":", "")] = content.map((item) => item.trim());
    //   return acc;
    // }, {});

    // const sections = result
    //   .trim()
    //   .split(",")
    //   .map((entry) => {
    //     const [key, value] = entry.split(": (");
    //     return {
    //       category: key.trim(),
    //       points: value
    //         .replace(").", "")
    //         .split(";")
    //         .map((point) => point.trim()),
    //     };
    //   });

    if (result) {
      // Split the text into lines
      const lines = result?.trim().split("\n");

      // Initialize an empty object to store the SWOT analysis
      const swotAnalysis = {};

      // Iterate over each line
      lines.forEach((line) => {
        // Split the line into key and value
        const [key, value] = line.split(":");

        // Remove the parentheses from the value
        const points = value
          ?.trim()
          .replace("(", "")
          .replace(")", "")
          .split(";");
        // if (Array.isArray(points)) {

        // }
        swotAnalysis[key?.trim().toLowerCase()] = points?.map((point) =>
          point?.trim()
        );
        // Add the key-value pair to the object
      });

      // Convert the object to an array of objects
      const swotAnalysisArray = Object.keys(swotAnalysis).map((key) => ({
        category: key,
        points: swotAnalysis[key],
      }));
      console.log("result", result);

      setAiBox(swotAnalysisArray);

      console.log("analysis", swotAnalysisArray);
    }

    // Print the result
  };
  const handleSuggestionBox = (e) => {
    setSuggestionBox(e.target.value);
  };
  const handleClick = () => {
    AiSuggestion();
    setSuggestionBox("");
  };

  useEffect(() => {
    AiSuggestion();
  }, [model]);

  return (
    <div className=" h-full max-w-[366px]">
      <div className="flex border-b  bg-white border-b-gray p-2 gap-3">
        <p className=" text-black font-semibold">AI suggestions</p>
        <button className="flex gap-2 bg-white text-black px-2 py-2 text-xs  gradient-border">
          <img src={refreshIcon} />
          Refresh
        </button>
      </div>
      {aiBox?.map((analysis, index) => (
        <div
          key={index}
          className="mt-1 p-2 border-b bg-white border-b-[#CCCCCC]"
        >
          <div className="flex gap-4 ">
            <img src={vIcon} alt="" />
            <p>{analysis.category}</p>
          </div>

          <div className=" ">
            {analysis.points?.map((point, index) => (
              <p
                key={index}
                type="text"
                className="my-2 gradient-border px-7 py-7 bg-[#E2E2E2]  "
              >
                {point}
              </p>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-white p-4 mt-1 flex gap-2">
        <input
          type="text"
          name="name"
          value={suggestionBox}
          onChange={handleSuggestionBox}
          placeholder="Suggest changes"
          className=" px-3 py-3 rounded-lg text-gray-500 w-full border-gray-500 border cursor-pointer"
        />
        <button
          onClick={handleClick}
          className="px-4 py-4 rounded-lg bg-[#E44195] border cursor-pointer"
        >
          <img src={greaterIcon} alt="" className="" />
        </button>
      </div>
    </div>
  );
};

export default AiSuggestions;
