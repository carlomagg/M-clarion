import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import ProcessService from '../../../../services/Process.service';
import { toggleShowAssignedProcess } from '../../../../config/slices/globalSlice';
import { useMessage } from '../../../../contexts/MessageContext';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import ProcessAssignment from '../ProcessManagement/components/ProcessAssignment';

const ProcessSelector = () => {
  const dispatch = useDispatch();
  const { dispatchMessage } = useMessage();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const itemsPerPage = 10;
  const location = useLocation();
  const navigate = useNavigate();
  const fromRiskLog = location.state?.fromRiskLog || false;

  // Fetch all processes
  const { isLoading, data: processDataLog, error } = useQuery({
    queryKey: ['processeslog'],
    queryFn: () => ProcessService.getProcessLog(),
  });

  // Filter processes based on search term with safe null checks
  const filteredProcesses = React.useMemo(() => {
    if (!processDataLog?.Processes) return [];
    
    const searchLower = (searchTerm || '').toLowerCase();
    
    return processDataLog.Processes.filter(process => {
      if (!process) return false;
      
      const name = (process.name || '').toLowerCase();
      const id = process.id ? process.id.toString().toLowerCase() : '';
      const type = (process.type || '').toLowerCase();
      
      if (!searchLower) return true; // Show all when no search term
      
      return name.includes(searchLower) || 
             id.includes(searchLower) || 
             type.includes(searchLower);
    });
  }, [processDataLog?.Processes, searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil((filteredProcesses?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProcesses = filteredProcesses?.slice(startIndex, startIndex + itemsPerPage) || [];

  console.log(`Current page: ${currentPage}, Items per page: ${itemsPerPage}, Total items: ${filteredProcesses?.length}`);
  console.log(`Showing items from ${startIndex + 1} to ${Math.min(startIndex + itemsPerPage, filteredProcesses?.length || 0)}`);

  const handleProcessSelect = (process) => {
    if (!process?.id) return;
    dispatch(
      toggleShowAssignedProcess({
        type: process.type || '',
        title: process.name || '',
        id: process.id
      })
    );
    setShowAssignmentForm(true);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      console.log(`Page changed to: ${newPage}`);
    }
  };

  const handleBack = () => {
    // Check if we came from Risk Log
    if (fromRiskLog) {
      navigate('/risks');
    } else {
      // We're coming from the main menu -> Process Management
      navigate('/process-management/log');
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="text-center text-red-600 p-4">
      Error loading processes. Please try again later.
    </div>
  );

  // If assignment form is showing, render the ProcessAssignment component
  if (showAssignmentForm) {
    return <ProcessAssignment fromRiskLog={fromRiskLog} />;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Select Process to Assign</h2>
        
        {/* Search input */}
        <div className="w-1/3">
          <input
            type="text"
            placeholder="Search by name, ID, or type..."
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            value={searchTerm || ''}
            onChange={(e) => {
              setSearchTerm(e.target.value || '');
              setCurrentPage(1); // Reset to first page when searching
            }}
          />
        </div>
      </div>

      {/* Process Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedProcesses.map((process) => (
              <tr key={process?.id || 'unknown'} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{process?.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{process?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{process?.type}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    process?.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {process?.status || 'Unknown'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleProcessSelect(process)}
                    className="text-pink-600 hover:text-pink-900 font-medium hover:underline"
                  >
                    Assign Process
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(!filteredProcesses?.length || filteredProcesses.length === 0) && (
          <div className="text-center text-gray-500 py-8">
            No processes found matching your search.
          </div>
        )}

        {/* Pagination */}
        {filteredProcesses?.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(startIndex + itemsPerPage, filteredProcesses.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredProcesses.length}</span> results
                  <span className="ml-2 text-xs text-gray-500">(10 per page)</span>
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-md border ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                {/* Page numbers */}
                {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                  // Show appropriate page numbers around current page
                  let pageNum = index + 1;
                  if (totalPages > 5 && currentPage > 3) {
                    pageNum = currentPage - 3 + index;
                    if (pageNum > totalPages) pageNum = totalPages - (4 - index);
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border rounded-md ${
                        currentPage === pageNum
                          ? 'bg-pink-500 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-md border ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Back button at the bottom */}
      <div className="mt-6">
        <button
          onClick={handleBack}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default ProcessSelector; 