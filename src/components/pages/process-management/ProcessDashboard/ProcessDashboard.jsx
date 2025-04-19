import React from 'react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { EllipsisVerticalIcon, ClockIcon, ChartBarIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import PageHeader from '../../../partials/PageHeader/PageHeader';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import DashboardWidgetLoadingIndicator from '../../../partials/skeleton-loading-indicators/DashboardWidgetIndicator';
import Error from '../../../partials/Error/Error';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

const ProcessDashboard = () => {
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

  // Business Unit Data
  const businessUnitData = {
    labels: ['Biz Unit 1', 'Biz Unit 2', 'Biz Unit 3', 'Biz Unit 4', 'Biz Unit 5', 'Biz Unit 6', 'Biz Unit 7', 'Biz Unit 8', 'Others'],
    datasets: [{
      data: [8.3, 8.3, 8.3, 8.3, 8.3, 8.3, 8.3, 8.3, 8.3],
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
          size: 14
        },
        formatter: (value) => {
          if (value === 0) return '';  // Hide zero value labels
          return value.toFixed(1) + '%';
        },
        anchor: 'center',
        align: 'center',
        offset: 0
      }
    },
    elements: {
      arc: {
        borderWidth: 3,
        borderColor: '#ffffff'
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
    switch (status) {
      case 'completed': return 'bg-green-400';
      case 'overdue': return 'bg-red-400';
      case 'at-risk': return 'bg-yellow-400';
      case 'in-progress': return 'bg-blue-400';
      default: return 'bg-gray-300';
    }
  };

  return (
    <>
      <PageHeader />
      <div className="p-6 space-y-6">
        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Processes */}
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
                  <div className="absolute inset-0">
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
              <div className="absolute inset-0">
                <Pie data={priorityData} options={chartOptions} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="bg-white p-2 rounded-full shadow-sm transform -translate-x-12">
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
              <div className="absolute inset-0">
                <Pie data={businessUnitData} options={chartOptions} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="bg-white p-2 rounded-full shadow-sm transform -translate-x-12">
                  <BuildingOfficeIcon className="h-10 w-10 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Processes Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="flex justify-between items-center p-4 border-b">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium">Processes requiring attention:</h3>
              <select className="text-sm border-gray-300 rounded-md">
                <option>5</option>
              </select>
            </div>
            <EllipsisVerticalIcon className="h-5 w-5 text-gray-400 cursor-pointer" />
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {processes.map((process, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-pink-600 bg-pink-100 rounded-md text-sm">{process.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{process.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{process.priority}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-green-600 bg-green-100 rounded-md text-sm">{process.status}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{process.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <EllipsisVerticalIcon className="h-5 w-5 text-gray-400 cursor-pointer" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t flex justify-between items-center">
            <button className="text-sm text-gray-600">Previous Page</button>
            <div className="flex space-x-2">
              <span className="px-3 py-1 bg-pink-100 text-pink-600 rounded-md">1</span>
              <span className="px-3 py-1 text-gray-600">2</span>
              <span className="px-3 py-1 text-gray-600">3</span>
            </div>
            <button className="text-sm text-gray-600">Next Page</button>
          </div>
        </div>

        {/* Workflow Tasks Overview */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium">Workflow tasks overview:</h3>
              <select className="text-sm border-gray-300 rounded-md">
                <option>Process Name</option>
              </select>
            </div>
            <EllipsisVerticalIcon className="h-5 w-5 text-gray-400 cursor-pointer" />
          </div>

          <div className="relative">
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
                  {tasks.map((task, index) => (
                    <div key={index} className="flex items-center min-h-[2rem]">
                      <div className="w-48 flex-shrink-0 text-sm">{task.name}</div>
                      <div className="flex-1 relative">
                        <div 
                          className={`absolute h-8 ${getStatusColor(task.status)} rounded`}
                          style={{
                            left: `${((task.startQuarter - 1) / 4) * 100}%`,
                            width: `${((task.endQuarter - task.startQuarter + 1) / 4) * 100}%`,
                            top: '0'
                          }}
                        >
                          <span className="absolute inset-0 flex items-center justify-center text-xs text-white">
                            {task.duration}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline Legend */}
              <div className="flex items-center justify-end space-x-4 mt-4 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-xs">Completed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <span className="text-xs">Over Due</span>
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
          </div>
        </div>
      </div>
    </>
  );
};

export default ProcessDashboard; 