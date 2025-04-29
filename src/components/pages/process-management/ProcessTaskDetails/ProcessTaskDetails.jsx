import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeftIcon, CheckCircleIcon, ExclamationCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import ProcessService from '../../../../services/Process.service';
import PageHeader from '../../../partials/PageHeader/PageHeader';
import DashboardWidgetLoadingIndicator from '../../../partials/skeleton-loading-indicators/DashboardWidgetIndicator';
import Error from '../../../partials/Error/Error';

const ProcessTaskDetails = () => {
  const { processId, taskId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine the return path based on where the user came from
  const goBack = () => {
    // Check if we have location state with information about where to go back
    if (location.state && location.state.from === 'dashboard') {
      navigate('/process-management/dashboard');
    } else {
      // Default to process management log (catalog)
      navigate('/process-management');
    }
  };

  // Fetch task details
  const { 
    isLoading, 
    error, 
    data: taskData 
  } = useQuery({
    queryKey: ['processTask', processId, taskId],
    queryFn: async () => {
      // We would ideally have a dedicated API endpoint for this
      // For now, fetch the entire task overview and filter for the specific task
      const response = await ProcessService.getProcessTaskOverview(processId);
      const task = response.tasks.find(t => t.ptask_id.toString() === taskId);
      
      if (!task) {
        throw new Error('Task not found');
      }
      
      return task;
    },
    enabled: !!processId && !!taskId
  });

  // Calculate days elapsed since start date
  const calculateDaysElapsed = (startDate) => {
    if (!startDate) return 0;
    
    const start = new Date(startDate);
    const today = new Date();
    const diffTime = Math.abs(today - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Calculate progress percentage
  const calculateProgress = (startDate, daysRequired) => {
    const daysElapsed = calculateDaysElapsed(startDate);
    const progressPercentage = Math.min((daysElapsed / daysRequired) * 100, 100);
    return progressPercentage.toFixed(0);
  };

  // Get status indicator
  const getStatusIndicator = (status) => {
    if (!status) return null;
    
    switch (status.toLowerCase()) {
      case 'completed':
        return (
          <div className="flex items-center text-green-500">
            <CheckCircleIcon className="h-5 w-5 mr-1" />
            <span>Completed</span>
          </div>
        );
      case 'overdue':
        return (
          <div className="flex items-center text-red-500">
            <ExclamationCircleIcon className="h-5 w-5 mr-1" />
            <span>Overdue</span>
          </div>
        );
      case 'at-risk':
        return (
          <div className="flex items-center text-yellow-500">
            <ExclamationCircleIcon className="h-5 w-5 mr-1" />
            <span>At Risk</span>
          </div>
        );
      case 'in-progress':
        return (
          <div className="flex items-center text-blue-500">
            <ClockIcon className="h-5 w-5 mr-1" />
            <span>In Progress</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center text-gray-500">
            <ClockIcon className="h-5 w-5 mr-1" />
            <span>Pending</span>
          </div>
        );
    }
  };

  return (
    <>
      <PageHeader />
      <div className="p-6">
        {/* Back button with pink arrow and text matching pagination buttons */}
        <button
          onClick={goBack}
          className="flex items-center mb-6 px-4 py-2 rounded text-white bg-pink-500 hover:bg-pink-600 shadow-sm"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back
        </button>

        {isLoading ? (
          <DashboardWidgetLoadingIndicator classes={'p-4'} height={400} />
        ) : error ? (
          <Error classes={'p-4'} message={error.message} />
        ) : taskData ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="border-b pb-4 mb-6">
              <h1 className="text-2xl font-bold text-gray-900">{taskData.ptask_name}</h1>
              <p className="text-gray-500">Process ID: {processId} • Task ID: {taskId}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h2 className="text-lg font-medium mb-4">Task Details</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    {getStatusIndicator(taskData.ptask_status)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p>{taskData.ptask_start_date ? new Date(taskData.ptask_start_date).toLocaleDateString() : 'Not started'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Days Required</p>
                    <p>{taskData.days_required || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Days Elapsed</p>
                    <p>{calculateDaysElapsed(taskData.ptask_start_date)}</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-medium mb-4">Progress</h2>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="mb-2 flex justify-between">
                    <span className="text-sm font-medium">Completion</span>
                    <span className="text-sm font-medium">{calculateProgress(taskData.ptask_start_date, taskData.days_required)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
                    <div 
                      className={`h-4 rounded-full ${taskData.ptask_status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`} 
                      style={{ width: `${calculateProgress(taskData.ptask_start_date, taskData.days_required)}%` }}
                    ></div>
                  </div>

                  {taskData.ptask_status === 'in-progress' && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-sm">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <ExclamationCircleIcon className="h-5 w-5 text-yellow-400" />
                        </div>
                        <div className="ml-3">
                          <p className="text-yellow-700">
                            This task is in progress. It has been running for {calculateDaysElapsed(taskData.ptask_start_date)} days out of the required {taskData.days_required} days.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {taskData.ptask_status === 'completed' && (
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 text-sm">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <CheckCircleIcon className="h-5 w-5 text-green-400" />
                        </div>
                        <div className="ml-3">
                          <p className="text-green-700">
                            This task has been completed successfully.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Additional information could be added here */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-medium mb-4">Notes</h2>
              <p className="text-gray-600">
                No additional notes for this task.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-center text-gray-500">Task not found</p>
          </div>
        )}
      </div>
    </>
  );
};

export default ProcessTaskDetails; 