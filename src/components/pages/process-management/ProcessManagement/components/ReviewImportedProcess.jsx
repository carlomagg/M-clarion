import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import ProcessService from "../../../../../services/Process.service";
import { CheckCircleIcon, InformationCircleIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

const ReviewImportedProcess = ({ setActiveTab }) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch all processes for the view
  const { isLoading, error, data: processDataLog } = useQuery({
    queryKey: ["processeslog"],
    queryFn: () => ProcessService.getProcessLog(),
    refetchOnMount: true, // Ensure we get fresh data
  });

  const handleBack = () => {
    // Go back to import screen
    setActiveTab("Import Process");
  };

  if (isLoading) {
    return (
      <div className="bg-white mt-4 p-7 pt-4 border border-[#CCC] w-full flex justify-center items-center h-60 rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white mt-4 p-7 pt-4 border border-[#CCC] w-full flex flex-col items-center h-60 rounded-lg">
        <p className="text-red-500 mb-4">Error loading processes: {error.message}</p>
        <div className="flex gap-3">
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("Import Process");
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Back to Import
          </a>
          <a 
            href="/process-management/log"
            className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600"
          >
            Go to Process Catalog
          </a>
        </div>
      </div>
    );
  }

  const processes = processDataLog?.Processes || [];
  
  // Sort processes to show newest first (assuming id is incremental)
  const sortedProcesses = [...processes].sort((a, b) => b.id - a.id);
  
  // Pagination logic
  const totalPages = Math.ceil(sortedProcesses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProcesses = sortedProcesses.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="bg-white mt-4 p-7 pt-4 border border-[#CCC] w-full flex flex-col gap-6 rounded-lg relative">
      {/* Back button */}
      <a 
        href="#" 
        onClick={(e) => {
          e.preventDefault();
          setActiveTab("Import Process");
        }}
        className="absolute top-4 left-4 flex items-center text-gray-600 hover:text-pink-500"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-1" />
        <span className="text-sm">Back to Import</span>
      </a>

      <div className="flex items-center justify-between mt-6">
        <h2 className="text-lg font-semibold">Imported Processes</h2>
        <div className="flex items-center text-green-600 gap-2">
          <CheckCircleIcon className="h-6 w-6" />
          <span>Import Completed Successfully</span>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
        <InformationCircleIcon className="h-6 w-6 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium text-blue-800">Processes Added to Catalog</h3>
          <p className="text-blue-700 text-sm">
            All imported processes have been added to your main process catalog. You can view, edit, or manage them from the Process Catalog page.
          </p>
        </div>
      </div>

      {processes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No processes found. Please import processes first.</p>
        </div>
      ) : (
        <>
          {/* Process Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border-b text-left">ID</th>
                  <th className="py-2 px-4 border-b text-left">Process Name</th>
                  <th className="py-2 px-4 border-b text-left">Description</th>
                  <th className="py-2 px-4 border-b text-left">Type</th>
                  <th className="py-2 px-4 border-b text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProcesses.map((process) => (
                  <tr key={process.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{process.id}</td>
                    <td className="py-2 px-4 border-b font-medium">{process.name}</td>
                    <td className="py-2 px-4 border-b">{process.description || "No description"}</td>
                    <td className="py-2 px-4 border-b">{process.type || "Not specified"}</td>
                    <td className="py-2 px-4 border-b">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        process.status === "Active" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {process.status || "Draft"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-500">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, processes.length)} of {processes.length} processes
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded ${
                      currentPage === page
                        ? "bg-pink-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <div className="flex justify-between mt-4">
        <a 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            setActiveTab("Import Process");
          }}
          className="px-4 py-2 bg-white border border-pink-500 text-pink-500 rounded hover:bg-pink-50"
        >
          Import More Processes
        </a>
        <a 
          href="/process-management/log"
          className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
        >
          View All Processes in Catalog
        </a>
      </div>
    </div>
  );
};

export default ReviewImportedProcess;
