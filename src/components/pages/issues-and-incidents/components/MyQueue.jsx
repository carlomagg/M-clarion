import React, { useState } from "react";
import { PiDotsThreeVerticalBold } from "react-icons/pi";

const MyQueue = () => {
  const data = [
    {
      id: "BQ1234",
      title: "Lorem ipsum dolor sit.",
      priority: "Critical",
      type: "Lorem",
      status: "Draft",
      severity: "Severe",
      reported: "12/2/2024",
      area: "Incidence Area",
    },
    {
      id: "BQ1235",
      title: "Lorem ipsum dolor sit.",
      priority: "Low",
      type: "Lorem",
      status: "Draft",
      severity: "Severe",
      reported: "12/2/2024",
      area: "Incidence Area",
    },
    {
      id: "BQ1236",
      title: "Lorem ipsum dolor sit.",
      priority: "Medium",
      type: "Lorem",
      status: "Draft",
      severity: "Minor",
      reported: "12/2/2024",
      area: "Incidence Area",
    },
    // ... Add more rows as needed
  ];

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-4">
        My Incidence Queue ({data.length})
      </h2>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-4 py-2 font-medium text-gray-600">ID</th>
            <th className="px-4 py-2 font-medium text-gray-600">Title</th>
            <th className="px-4 py-2 font-medium text-gray-600">Priority</th>
            <th className="px-4 py-2 font-medium text-gray-600">Type</th>
            <th className="px-4 py-2 font-medium text-gray-600">Status</th>
            <th className="px-4 py-2 font-medium text-gray-600">Severity</th>
            <th className="px-4 py-2 font-medium text-gray-600">Reported</th>
            <th className="px-4 py-2 font-medium text-gray-600">
              Incidence Area
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={index}
              className="hover:bg-gray-50 border-b border-gray-200"
            >
              <td className="px-4 py-2 text-pink-500 font-semibold">
                {item.id}
              </td>
              <td className="px-4 py-2">{item.title}</td>
              <td className="px-4 py-2">{item.priority}</td>
              <td className="px-4 py-2">{item.type}</td>
              <td className="px-4 py-2">
                <span className="inline-block bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs">
                  {item.status}
                </span>
              </td>
              <td className="px-4 py-2">{item.severity}</td>
              <td className="px-4 py-2">{item.reported}</td>
              <td className="px-4 py-2">{item.area}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MyQueue;
