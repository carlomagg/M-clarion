import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import ProcessService from '../../../../../services/Process.service';
import { toggleShowAssignedProcess } from '../../../../../config/slices/globalSlice';
import { useMessage } from '../../../../../contexts/MessageContext.jsx';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const ProcessSelector = () => {
  const dispatch = useDispatch();
  const { dispatchMessage } = useMessage();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch all processes
  const { isLoading, data: processDataLog, error } = useQuery({
    queryKey: ['processeslog'],
    queryFn: () => ProcessService.getProcessLog(),
  });

  // Filter processes based on search term (name, id, or type)
  const filteredProcesses = React.useMemo(() => {
    if (!processDataLog?.Processes) return [];
    
    const searchLower = (searchTerm || '').toLowerCase();
    
    return processDataLog.Processes.filter(process => {
      if (!process) return false;
      
      const name = (process.name || '').toLowerCase();
      const id = (process.id || '').toString().toLowerCase();
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

  const handleProcessSelect = (process) => {
    if (!process?.id) return;
    dispatch(
      toggleShowAssignedProcess({
        type: process.type || '',
        title: process.name || '',
        id: process.id
      })
    );
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
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

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
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
      <div className="mt-8 flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
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
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {filteredProcesses?.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6 mt-4">
          <div className="flex items-center">
            <p className="text-sm text-gray-700">
              Showing{' '}
              <span className="font-medium">{startIndex + 1}</span>
              {' '}-{' '}
              <span className="font-medium">
                {Math.min(startIndex + itemsPerPage, filteredProcesses.length)}
              </span>{' '}
              of{' '}
              <span className="font-medium">{filteredProcesses.length}</span>{' '}
              results
            </p>
          </div>
          <div className="flex items-center space-x-2">
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
                  : 'bg-[#E91E63] text-white hover:bg-pink-700'
              } transition-colors duration-200`}
            >
              <span className="mr-2">Next</span>
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessSelector; 