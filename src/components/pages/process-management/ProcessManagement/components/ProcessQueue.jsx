import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { PiDotsThreeVerticalBold } from "react-icons/pi";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import ProcessService from "../../../../../services/Process.service";

const ProcessQueue = () => {
  const [title, setTitle] = useState("");
  const [processType, setProcessType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const {
    isLoading,
    data: processQueue,
    error,
    refetch,
  } = useQuery({
    queryKey: ["processqueue"],
    queryFn: () => ProcessService.getProcessDraft(),
  });

  // Pagination logic
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading process queue</div>;
  }

  const processes = processQueue?.Processes || [];
  const totalPages = Math.ceil(processes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProcesses = processes.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="mt-8 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold p-4 border-b">
        My Process Queue ({processes.length})
      </h2>
      <div className="p-4">
        <table className="w-full border rounded-md">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-left">ID</th>
              <th className="py-2 px-4 border-b text-left">Title</th>
              <th className="py-2 px-4 border-b text-left">Type</th>
              <th className="py-2 px-4 border-b text-left">Status</th>
              <th className="py-2 px-4 border-b text-left">Version</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProcesses.map((process) => (
              <tr className="hover:bg-gray-50" key={process.id}>
                <td className="py-2 px-4 border-b">{process.id}</td>
                <td className="py-2 px-4 border-b">{process.name}</td>
                <td className="py-2 px-4 border-b">{process.type}</td>
                <td className="py-2 px-4 border-b">{process.status}</td>
                <td className="py-2 px-4 border-b">{process.version}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {processes.length > itemsPerPage && (
          <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
            <div className="flex justify-between w-full">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(startIndex + itemsPerPage, processes.length)}
                </span> of{' '}
                <span className="font-medium">{processes.length}</span> results
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-3 py-2 rounded-md ${
                    currentPage === 1
                      ? 'bg-pink-100 text-pink-300 cursor-not-allowed'
                      : 'bg-[#E91E63] text-white hover:bg-pink-700'
                  } transition-colors duration-200`}
                >
                  <ChevronLeftIcon className="w-5 h-5 mr-2" />
                  <span>Previous</span>
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-3 py-2 rounded-md ${
                    currentPage === totalPages
                      ? 'bg-pink-100 text-pink-300 cursor-not-allowed'
                      : 'bg-[#FD3DB5] text-white hover:bg-[#FD3DB5]/90'
                  } transition-colors duration-200`}
                >
                  <span className="mr-2">Next</span>
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessQueue;
