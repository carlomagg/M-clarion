import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import ProcessService from '../../../../services/Process.service';
import { toggleShowAssignedProcess } from '../../../../config/slices/globalSlice';
import { useMessage } from '../../../../contexts/MessageContext.jsx';
import ProcessAssignment from '../ProcessManagement/components/ProcessAssignment';
import SelectDropdown from '../../../partials/dropdowns/SelectDropdown/SelectDropdown';
import PageTitle from '../../../partials/PageTitle/PageTitle';

const ProcessSelector = () => {
  const dispatch = useDispatch();
  const { dispatchMessage } = useMessage();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [selectedProcessId, setSelectedProcessId] = useState(null);
  const [isDropdownCollapsed, setIsDropdownCollapsed] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const fromRiskLog = location.state?.fromRiskLog || false;

  // Fetch all processes
  const { isLoading, data: processDataLog, error } = useQuery({
    queryKey: ['processeslog'],
    queryFn: () => ProcessService.getProcessLog(),
  });

  // Debug log to inspect the data
  console.log("Process data from API:", processDataLog);

  // Transform processes for dropdown format
  const processOptions = React.useMemo(() => {
    if (!processDataLog?.Processes) return [];
    
    // Debug log for processes
    console.log("Processes for dropdown:", processDataLog.Processes);
    
    return processDataLog.Processes.map(process => ({
      id: process.id,
      text: `${process.name || 'Unnamed Process'} (${process.type || 'No Type'})`
    }));
  }, [processDataLog?.Processes]);

  const handleProcessSelect = (event) => {
    const processId = event.target.value;
    if (!processId) return;
    
    console.log("Selected process ID:", processId);
    
    // Find the selected process from the data
    const selectedProcess = processDataLog?.Processes?.find(p => p.id === parseInt(processId));
    if (!selectedProcess) {
      dispatchMessage('error', 'Unable to find selected process');
      return;
    }
    
    console.log("Selected process object:", selectedProcess);
    
    // Update redux state
    dispatch(
      toggleShowAssignedProcess({
        type: selectedProcess.type || '',
        title: selectedProcess.name || '',
        id: selectedProcess.id
      })
    );
    setSelectedProcessId(processId);
    setShowAssignmentForm(true);
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
  
  const handleNavigate = (path) => {
    navigate(path);
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
    <div className="p-10 pt-4 w-full flex flex-col gap-6">
      {/* Custom breadcrumb */}
      <div className="h-6 bg-[#E5E5E5] text-[#3D3D3D] text-xs py-[2px] px-2 flex gap-2 self-start items-center rounded-[4px] mb-4">
        <span>Home- Process Management-process assignment</span>
      </div>
      
      <PageTitle title="Process Assignment" />
      
      {/* Header with back button */}
      <div className="h-9 flex relative justify-between mb-4">
        <div></div> {/* Empty div to maintain layout */}
        <button
          className="px-4 py-2 text-sm bg-pink-500 text-white rounded hover:bg-pink-600 transition-colors"
          onClick={handleBack}
        >
          Back
        </button>
      </div>
      
      <div className="mt-4 p-6 bg-white rounded-lg border border-[#CCC] w-full">
        <div className="mb-8">
          <p className="text-gray-600 mb-4">Please select a process from the dropdown below to proceed with the assignment:</p>
          
          <div className="w-full">
            {processOptions.length > 0 ? (
              <SelectDropdown
                name="process"
                placeholder="Select a process..."
                items={processOptions}
                onSelect={handleProcessSelect}
                selected={selectedProcessId}
                isCollapsed={isDropdownCollapsed}
                onToggleCollpase={setIsDropdownCollapsed}
              />
            ) : (
              <div className="text-orange-500 py-2">
                No processes available. Please add processes first.
              </div>
            )}
          </div>
        </div>
        
        <div className="text-sm text-gray-500 mt-4">
          Select a process to load the assignment form. You'll be able to specify business unit, 
          priority level, and other details on the next screen.
        </div>
      </div>
    </div>
  );
};

export default ProcessSelector; 