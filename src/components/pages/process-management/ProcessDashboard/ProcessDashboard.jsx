import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { EllipsisVerticalIcon, ClockIcon, ChartBarIcon, BuildingOfficeIcon, TableCellsIcon, ChartBarSquareIcon, ChevronLeftIcon, ChevronRightIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import PageHeader from '../../../partials/PageHeader/PageHeader';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import DashboardWidgetLoadingIndicator from '../../../partials/skeleton-loading-indicators/DashboardWidgetIndicator';
import Error from '../../../partials/Error/Error';
import ProcessService from '../../../../services/Process.service';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

const ProcessDashboard = () => {
  const navigate = useNavigate();
  // State for available processes and selected process
  const [selectedProcessId, setSelectedProcessId] = useState(null);
  const [processOptions, setProcessOptions] = useState([]);
  // State for view mode (timeline or table)
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' or 'table'
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  // State for processes requiring attention pagination
  const [attentionPage, setAttentionPage] = useState(1);
  const [attentionItemsPerPage, setAttentionItemsPerPage] = useState(5);

  // Fetch all process IDs
  const { 
    isLoading: isProcessOptionsLoading, 
    error: processOptionsError, 
    data: processOptionsData 
  } = useQuery({
    queryKey: ['processOptions'],
    queryFn: () => ProcessService.getAllProcessIds()
  });

  // Set default process ID when options are loaded
  useEffect(() => {
    if (processOptionsData && processOptionsData.length > 0 && !selectedProcessId) {
      setSelectedProcessId(processOptionsData[0].id);
    }
  }, [processOptionsData, selectedProcessId]);

  // Define status colors mapping
  const statusColors = {
    'ACTIVE': '#f97316',    // Orange for active
    'INACTIVE': '#94a3b8',  // Gray for inactive
    'DRAFT': '#3b82f6'      // Blue for draft
  };

  // Process Status Data from API
  const { isLoading, error, data: processData } = useQuery({
    queryKey: ['processStatus'],
    queryFn: async () => {
      const response = await axios.get('/process/process-definitions/total-processes/');
      return response.data;
    }
  });

  // Priority Level Data from API
  const { data: priorityLevelData } = useQuery({
    queryKey: ['processPriority'],
    queryFn: async () => {
      const response = await axios.get('/process/process-definitions/processes-priority-percentage/');
      return response.data;
    }
  });

  // Business Unit Data from API
  const { 
    isLoading: isBusinessUnitLoading, 
    error: businessUnitError, 
    data: businessUnitApiData 
  } = useQuery({
    queryKey: ['processBusinessUnit'],
    queryFn: async () => {
      const response = await axios.get('/process/process-definitions/processes-unit-percentage/');
      return response.data;
    }
  });

  // Task Overview Data from API
  const { 
    isLoading: isTaskOverviewLoading, 
    error: taskOverviewError, 
    data: taskOverviewData 
  } = useQuery({
    queryKey: ['processTaskOverview', selectedProcessId],
    queryFn: () => ProcessService.getProcessTaskOverview(selectedProcessId),
    enabled: !!selectedProcessId
  });

  // Processes Requiring Attention Data
  const { 
    isLoading: isAttentionProcessesLoading, 
    error: attentionProcessesError, 
    data: attentionProcessesData
  } = useQuery({
    queryKey: ['processesRequiringAttention', attentionPage, attentionItemsPerPage],
    queryFn: async () => {
      console.log(`Fetching processes requiring attention with count=${attentionItemsPerPage}, page=${attentionPage}`);
      const result = await ProcessService.getProcessesRequiringAttention(attentionItemsPerPage, attentionPage);
      console.log('API Response:', result);
      return result;
    }
  });

  // Transform API data for the process status chart
  const processStatusData = {
    labels: processData?.status_distribution.map(item => item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase()) || [],
    datasets: [{
      data: processData?.status_distribution.map(item => item.percentage) || [],
      backgroundColor: processData?.status_distribution.map(item => statusColors[item.status]) || [],
      borderWidth: 3,
      borderColor: '#ffffff',
      spacing: 2,
    }]
  };

  // Transform API data for the priority level chart
  const priorityData = {
    labels: priorityLevelData?.priority_distribution.map(item => item.priority_level.charAt(0).toUpperCase() + item.priority_level.slice(1).toLowerCase()) || [],
    datasets: [{
      data: priorityLevelData?.priority_distribution.map(item => item.percentage) || [],
      backgroundColor: ['#ef4444', '#f97316', '#22c55e', '#3b82f6'],
      borderWidth: 3,
      borderColor: '#ffffff',
      spacing: 2,
    }]
  };

  // Transform API data for the business unit chart
  const businessUnitData = {
    labels: businessUnitApiData?.unit_distribution.map(item => item.unit_name) || [],
    datasets: [{
      data: businessUnitApiData?.unit_distribution.map(item => item.percentage) || [],
      backgroundColor: [
        '#f8a5c2', '#f97316', '#22c55e', '#3b82f6', 
        '#a855f7', '#ec4899', '#64748b', '#0ea5e9', '#6b7280'
      ],
      borderWidth: 3,
      borderColor: '#ffffff',
      spacing: 2,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    layout: {
      padding: 20
    },
    plugins: {
      legend: {
        position: 'right',
        align: 'center',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 6,
          padding: 15,
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        enabled: false
      },
      datalabels: {
        color: '#000000',
        font: {
          weight: 'bold',
          size: 11
        },
        formatter: (value) => {
          if (value === 0) return '';  // Hide zero value labels
          return value.toFixed(1) + '%';
        },
        anchor: 'center',
        align: 'center',
        offset: 0,
        display: function(context) {
          return context.dataset.data[context.dataIndex] > 0;
        },
        textAlign: 'center'
      }
    },
    elements: {
      arc: {
        borderWidth: 3,
        borderColor: '#ffffff'
      }
    }
  };

  // Create specific options for the priority chart to make it larger
  const priorityChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    radius: '100%',  // Changed back to 100% to match the first chart
    layout: {
      padding: 0
    },
    plugins: {
      legend: {
        position: 'right',
        align: 'center',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 6,
          padding: 15,
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        enabled: false
      },
      datalabels: {
        color: '#000000',
        font: {
          weight: 'bold',
          size: 11
        },
        formatter: (value) => {
          if (value === 0) return '';
          return value.toFixed(1) + '%';
        },
        anchor: 'center',
        align: 'center',
        offset: 0,
        display: function(context) {
          return context.dataset.data[context.dataIndex] > 0;
        },
        textAlign: 'center'
      }
    }
  };

  const processes = [
    { id: 'BQ1234', title: 'Lorem ipsum dolor sit.', priority: 'Critical', status: 'Ongoing', type: 'Lorem' },
    { id: 'BQ1234', title: 'Lorem ipsum dolor sit.', priority: 'Critical', status: 'Ongoing', type: 'Lorem' },
    { id: 'BQ1234', title: 'Lorem ipsum dolor sit.', priority: 'Low', status: 'Ongoing', type: 'Lorem' },
    { id: 'BQ1234', title: 'Lorem ipsum dolor sit.', priority: 'Low', status: 'Ongoing', type: 'Lorem' },
    { id: 'BQ1234', title: 'Lorem ipsum dolor sit.', priority: 'Medium', status: 'Ongoing', type: 'Lorem' },
  ];

  const tasks = [
    { name: 'Task Name', duration: '35 days', status: 'completed', startQuarter: 1, endQuarter: 1, position: 0.3 },
    { name: 'Task Name', duration: '35 days', status: 'overdue', startQuarter: 1, endQuarter: 1, position: 0.4 },
    { name: 'Task Name', duration: '35 days', status: 'at-risk', startQuarter: 1, endQuarter: 2, position: 0.6 },
    { name: 'Task Name', duration: '35 days', status: 'in-progress', startQuarter: 1, endQuarter: 2, position: 0.7 },
    { name: 'Task Name', duration: '35 days', status: 'in-progress', startQuarter: 2, endQuarter: 3, position: 0.2 },
    { name: 'Task Name', duration: '35 days', status: 'pending', startQuarter: 2, endQuarter: 3, position: 0.4 },
    { name: 'Task Name', duration: '35 days', status: 'pending', startQuarter: 3, endQuarter: 3, position: 0.6 },
    { name: 'Task Name', duration: '35 days', status: 'pending', startQuarter: 3, endQuarter: 4, position: 0.8 },
    { name: 'Task Name', duration: '42 days', status: 'pending', startQuarter: 3, endQuarter: 4, position: 0.9 },
    { name: 'Task Name', duration: '35 days', status: 'pending', startQuarter: 4, endQuarter: 4, position: 1 },
  ];

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-300';
    
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-400';
      case 'overdue': return 'bg-red-400';
      case 'at-risk': return 'bg-yellow-400';
      case 'in-progress': return 'bg-blue-400';
      default: return 'bg-gray-300';
    }
  };

  // Calculate days difference between start date and now
  const getDaysSinceStart = (startDate) => {
    if (!startDate) return 0;
    
    const start = new Date(startDate);
    const today = new Date();
    const diffTime = Math.abs(today - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Calculate progress percentage based on days since start and days required
  const calculateProgress = (startDate, daysRequired) => {
    const daysSinceStart = getDaysSinceStart(startDate);
    const progressPercentage = Math.min((daysSinceStart / daysRequired) * 100, 100);
    return progressPercentage.toFixed(0);
  };

  // Handle task row click
  const handleTaskClick = (taskId) => {
    navigate(`/process/task/${selectedProcessId}/${taskId}`);
  };

  // Handle pagination
  const getPaginatedTasks = () => {
    if (!taskOverviewData?.tasks) return [];
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return taskOverviewData.tasks.slice(startIndex, endIndex);
  };

  const totalPages = taskOverviewData?.tasks ? Math.ceil(taskOverviewData.tasks.length / itemsPerPage) : 0;

  // Reset pagination when process changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedProcessId]);

  return (
    <>
      <PageHeader page="Process Dashboard" />
      <div className="grid grid-cols-1 gap-8 px-4 md:px-6 pb-12">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* First row of widgets (3 pie charts) */}
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium">Total number of process: {processData?.total_processes || 0}</h3>
              <EllipsisVerticalIcon className="h-5 w-5 text-gray-400 cursor-pointer" />
            </div>
            <div className="relative h-80">
              {isLoading ? (
                <DashboardWidgetLoadingIndicator classes={'p-4'} height={200} />
              ) : error ? (
                <Error classes={'p-4'} />
              ) : (
                <>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Pie data={processStatusData} options={chartOptions} />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="bg-white p-2 rounded-full shadow-sm transform -translate-x-12">
                      <ClockIcon className="h-10 w-10 text-gray-400" />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Priority Distribution */}
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium">Process distribution by priority level</h3>
              <EllipsisVerticalIcon className="h-5 w-5 text-gray-400 cursor-pointer" />
            </div>
            <div className="relative h-80">
              <div className="absolute inset-0 flex items-center justify-center">
                <Pie data={priorityData} options={priorityChartOptions} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="bg-white p-2 rounded-full shadow-sm transform -translate-x-20">
                  <ChartBarIcon className="h-10 w-10 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Business Unit Distribution */}
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium">Process distribution by business unit</h3>
              <EllipsisVerticalIcon className="h-5 w-5 text-gray-400 cursor-pointer" />
            </div>
            <div className="relative h-80">
              {isBusinessUnitLoading ? (
                <DashboardWidgetLoadingIndicator classes={'p-4'} height={200} />
              ) : businessUnitError ? (
                <Error classes={'p-4'} />
              ) : (
                <>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Pie data={businessUnitData} options={chartOptions} />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="bg-white p-2 rounded-full shadow-sm transform -translate-x-12">
                      <BuildingOfficeIcon className="h-10 w-10 text-gray-400" />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Processes Requiring Attention */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden col-span-1 xl:col-span-3">
            <div className="bg-white p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-medium">Processes requiring attention:</h3>
                <select 
                  className="text-sm border-gray-300 rounded-md"
                  value={attentionItemsPerPage}
                  onChange={(e) => {
                    const newCount = Number(e.target.value);
                    console.log(`Setting new count: ${newCount}`);
                    setAttentionItemsPerPage(newCount);
                    setAttentionPage(1); // Reset to first page when changing items per page
                  }}
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                </select>
              </div>
              <EllipsisVerticalIcon className="h-5 w-5 text-gray-400 cursor-pointer" />
            </div>

            {isAttentionProcessesLoading ? (
              <DashboardWidgetLoadingIndicator />
            ) : attentionProcessesError ? (
              <Error error={attentionProcessesError} />
            ) : (
              <div className="p-4">
                <div className="overflow-x-auto">
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
                          Priority
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {attentionProcessesData?.data && attentionProcessesData.data.length > 0 ? (
                        attentionProcessesData.data.map((process) => (
                          <tr key={process.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 text-pink-600 bg-pink-100 rounded-md text-sm">{process.id}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{process.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {process.priority ? (
                                <span className="text-sm">{process.priority}</span>
                              ) : (
                                <span className="text-gray-500">Not set</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 text-green-600 bg-green-100 rounded-md text-sm">{process.status}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{process.type}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <button 
                                onClick={() => navigate(`/process-management/${process.id}/view`)}
                                className="text-blue-500 hover:text-blue-700 font-medium"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                            No processes requiring attention
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {attentionProcessesData?.data && attentionProcessesData.data.length > 0 && (
                  <div className="flex justify-between items-center mt-4 pt-4 border-t">
                    <button 
                      onClick={() => setAttentionPage(prev => Math.max(prev - 1, 1))}
                      disabled={attentionPage === 1}
                      className={`flex items-center text-sm font-medium px-4 py-2 rounded ${attentionPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-white bg-pink-500 hover:bg-pink-600 shadow-sm'}`}
                    >
                      <ChevronLeftIcon className="h-4 w-4 mr-1" />
                      Previous
                    </button>
                    <div className="text-sm text-gray-600">
                      Page {attentionPage}
                      {attentionProcessesData.total_count && (
                        <span className="ml-2 text-gray-500">
                          ({attentionProcessesData.total_count} processes)
                          </span>
                      )}
                    </div>
                    <button 
                      onClick={() => setAttentionPage(prev => prev + 1)}
                      disabled={!attentionProcessesData?.data || attentionProcessesData.data.length < attentionItemsPerPage}
                      className={`flex items-center text-sm font-medium px-4 py-2 rounded ${!attentionProcessesData?.data || attentionProcessesData.data.length < attentionItemsPerPage ? 'text-gray-400 cursor-not-allowed' : 'text-white bg-pink-500 hover:bg-pink-600 shadow-sm'}`}
                    >
                      Next
                      <ChevronRightIcon className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Workflow Tasks Overview */}
          <div className="bg-white rounded-lg shadow p-4 col-span-1 xl:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-medium">Workflow tasks overview:</h3>
                {isProcessOptionsLoading ? (
                  <div className="text-sm text-gray-500">Loading processes...</div>
                ) : processOptionsError ? (
                  <div className="text-sm text-red-500">Error loading processes</div>
                ) : (
                  <select 
                    className="text-sm border-gray-300 rounded-md min-w-[200px]"
                    value={selectedProcessId || ''}
                    onChange={(e) => setSelectedProcessId(Number(e.target.value))}
                    disabled={isProcessOptionsLoading || processOptionsData?.length === 0}
                  >
                    {processOptionsData?.length === 0 && (
                      <option value="">No processes available</option>
                    )}
                    
                    {processOptionsData?.map(process => (
                      <option key={process.id} value={process.id}>
                        Process: {process.id} - {process.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setViewMode('timeline')}
                  className={`p-1 rounded-md ${viewMode === 'timeline' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                  title="Timeline View"
                >
                  <ChartBarSquareIcon className="h-5 w-5 text-gray-600" />
                </button>
                <button 
                  onClick={() => setViewMode('table')}
                  className={`p-1 rounded-md ${viewMode === 'table' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                  title="Table View"
                >
                  <TableCellsIcon className="h-5 w-5 text-gray-600" />
                </button>
                <EllipsisVerticalIcon className="h-5 w-5 text-gray-400 cursor-pointer ml-1" />
              </div>
            </div>

            <div className="relative">
              {!selectedProcessId ? (
                <div className="border rounded-lg p-4 flex items-center justify-center h-48 text-gray-500">
                  Please select a process to view its tasks
                </div>
              ) : isTaskOverviewLoading ? (
                <DashboardWidgetLoadingIndicator classes={'p-4'} height={200} />
              ) : taskOverviewError ? (
                <Error classes={'p-4'} />
              ) : viewMode === 'timeline' ? (
                <div className="border rounded-lg p-4">
                  {/* Timeline Header */}
                  <div className="flex border-b pb-2 mb-4">
                    <div className="w-48 flex-shrink-0">Task Name</div>
                    <div className="flex-1 grid grid-cols-4 gap-4">
                      <div className="text-center">Q1</div>
                      <div className="text-center">Q2</div>
                      <div className="text-center">Q3</div>
                      <div className="text-center">Q4</div>
                    </div>
                  </div>

                  {/* Timeline Grid */}
                  <div className="relative">
                    {/* Vertical Grid Lines */}
                    <div className="absolute inset-0 grid grid-cols-4 gap-4 pointer-events-none">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="border-l border-gray-200 h-full"></div>
                      ))}
                    </div>

                    {/* Current Date Line */}
                    <div className="absolute h-full w-px bg-red-500" style={{ left: '45%', zIndex: 10 }}></div>

                    {/* Tasks */}
                    <div className="relative space-y-4">
                      {getPaginatedTasks().map((task, index) => {
                        // Calculate task position based on start date for visualization
                        // This is a simplified calculation - in a real app, you'd use actual dates to position tasks
                        const startMonth = task.ptask_start_date ? new Date(task.ptask_start_date).getMonth() : 0;
                        const startQuarter = Math.floor(startMonth / 3) + 1;
                        
                        // Estimate end quarter based on days required
                        const endMonth = task.ptask_start_date ? 
                          new Date(new Date(task.ptask_start_date).setDate(
                            new Date(task.ptask_start_date).getDate() + (task.days_required || 30)
                          )).getMonth() : 3;
                        const endQuarter = Math.floor(endMonth / 3) + 1;
                        
                        // Generate a position value between 0 and 1 for vertical placement
                        const position = (index % 10) / 10 + 0.1;
                        
                        return (
                          <div 
                            key={index} 
                            className="flex items-center min-h-[2rem] cursor-pointer" 
                            onClick={() => handleTaskClick(task.ptask_id)}
                          >
                            <div className="w-48 flex-shrink-0 text-sm">{task.ptask_name}</div>
                            <div className="flex-1 relative">
                              <div 
                                className={`absolute h-8 ${getStatusColor(task.ptask_status)} rounded`}
                                style={{
                                  left: `${((startQuarter - 1) / 4) * 100}%`,
                                  width: `${((endQuarter - startQuarter + 1) / 4) * 100}%`,
                                  top: '0'
                                }}
                              >
                                <span className="absolute inset-0 flex items-center justify-center text-xs text-white">
                                  {task.days_required ? `${task.days_required} days` : 'No duration'}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      
                      {(!taskOverviewData?.tasks || taskOverviewData.tasks.length === 0) && (
                        <div className="text-center py-4 text-gray-500">
                          No tasks available for this process
                        </div>
                      )}
                    </div>
                  </div>

                  {taskOverviewData?.tasks && taskOverviewData.tasks.length > itemsPerPage && (
                    <div className="flex justify-between items-center mt-4 pt-4 border-t">
                      <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`flex items-center text-sm font-medium px-4 py-2 rounded ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-white bg-pink-500 hover:bg-pink-600 shadow-sm'}`}
                      >
                        <ChevronLeftIcon className="h-4 w-4 mr-1" />
                        Previous
                      </button>
                      <div className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                        <span className="ml-2 text-gray-500">
                          ({taskOverviewData.tasks.length} tasks)
                        </span>
                      </div>
                      <button 
                        onClick={() => setCurrentPage(prev => prev < totalPages ? prev + 1 : prev)}
                        disabled={currentPage === totalPages}
                        className={`flex items-center text-sm font-medium px-4 py-2 rounded ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-white bg-pink-500 hover:bg-pink-600 shadow-sm'}`}
                      >
                        Next
                        <ChevronRightIcon className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                  )}

                  {/* Timeline Legend */}
                  <div className="flex items-center justify-end space-x-4 mt-4 pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-xs">Completed</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <span className="text-xs">Overdue</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <span className="text-xs">At Risk</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                      <span className="text-xs">In Progress</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                      <span className="text-xs">Pending</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-px h-4 bg-red-500"></div>
                      <span className="text-xs">Current date</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border rounded-lg p-4">
                  {/* Task Overview Table */}
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Task Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Start Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Days Required
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Progress
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getPaginatedTasks().map((task, index) => (
                        <tr 
                          key={index} 
                          onClick={() => handleTaskClick(task.ptask_id)}
                          className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {task.ptask_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.ptask_status)}`}>
                              {task.ptask_status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {task.ptask_start_date ? new Date(task.ptask_start_date).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {task.days_required || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className={`h-2.5 rounded-full ${task.ptask_status === 'completed' ? 'bg-green-400' : 'bg-blue-400'}`} 
                                style={{ width: `${calculateProgress(task.ptask_start_date, task.days_required)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs mt-1 block">
                              {calculateProgress(task.ptask_start_date, task.days_required)}% Complete
                            </span>
                          </td>
                        </tr>
                      ))}
                      
                      {(!taskOverviewData?.tasks || taskOverviewData.tasks.length === 0) && (
                        <tr>
                          <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                            No tasks available for this process
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {taskOverviewData?.tasks && taskOverviewData.tasks.length > itemsPerPage && (
                    <div className="flex justify-between items-center mt-4 pt-4 border-t">
                      <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`flex items-center text-sm font-medium px-4 py-2 rounded ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-white bg-pink-500 hover:bg-pink-600 shadow-sm'}`}
                      >
                        <ChevronLeftIcon className="h-4 w-4 mr-1" />
                        Previous
                      </button>
                      <div className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                        <span className="ml-2 text-gray-500">
                          ({taskOverviewData.tasks.length} tasks)
                        </span>
                      </div>
                      <button 
                        onClick={() => setCurrentPage(prev => prev < totalPages ? prev + 1 : prev)}
                        disabled={currentPage === totalPages}
                        className={`flex items-center text-sm font-medium px-4 py-2 rounded ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-white bg-pink-500 hover:bg-pink-600 shadow-sm'}`}
                      >
                        Next
                        <ChevronRightIcon className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                  )}

                  {/* Task Status Legend */}
                  <div className="flex items-center justify-end space-x-4 mt-4 pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-xs">Completed</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <span className="text-xs">Overdue</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <span className="text-xs">At Risk</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                      <span className="text-xs">In Progress</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                      <span className="text-xs">Pending</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProcessDashboard; 