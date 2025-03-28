import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { PiDotsThreeVerticalBold } from "react-icons/pi";
import ProcessService from "../../../../../services/Process.service";

const ProcessQueue = () => {
  const [title, setTitle] = useState("");
  const [processType, setProcessType] = useState("");
  // const [processQueue, setProcessQueue] = useState([]);
  const [data, setData] = useState([]);

  const {
    isLoading,
    data: processQueue,
    error,
    refetch,
  } = useQuery({
    queryKey: ["processqueue"],
    queryFn: () => ProcessService.getProcessDraft(),
  });

  return (
    <div className="mt-8 bg-white shadow-md rounded-lg gap-4">
      <h2 className="text-xl font-semibold pt-8 p-3">
        My Incidence Queue ({data.length})
      </h2>
      {/* className="w-full text-left border-collapse */}
      <table className="w-full border rounded-md">
        <thead>
          <tr className=" ">
            <th className="py-2 px-4 border-b">ID</th>
            <th className="py-2 px-4 border-b">Title</th>
            <th className="py-2 px-4 border-b">Type</th>
            <th className="py-2 px-4 border-b">Status</th>
            <th className="py-2 px-4 border-b">Version</th>
          </tr>
        </thead>
        <tbody>
          {processQueue &&
            processQueue?.Processes?.map((process) => (
              <tr className=" p-4" key={process.id}>
                <td className="py-2 px-4 border-b ">{process.id}</td>
                <td className="py-2 px-4 border-b">{process.name}</td>
                {/* <td className="py-2 px-4 border-b">{process.priority}</td> */}
                <td className="py-2 px-4 border-b">{process.type}</td>
                <td className="py-2 px-4 border-b">{process.status}</td>
                <td className="py-2 px-4 border-b">{process.version}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProcessQueue;
