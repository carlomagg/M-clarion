import React from 'react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ProcessDashboard = () => {
  // Process Status Data
  const processStatusData = {
    labels: ['Active', 'Inactive', 'Pending', 'Overdue'],
    datasets: [{
      data: [20, 20, 20, 40],
      backgroundColor: ['#f97316', '#f8a5c2', '#94a3b8', '#3b82f6'],
      borderWidth: 0,
    }]
  };

  // Priority Level Data
  const priorityData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [{
      data: [40, 40, 20],
      backgroundColor: ['#ef4444', '#f97316', '#22c55e'],
      borderWidth: 0,
    }]
  };

  // Business Unit Data
  const businessUnitData = {
    labels: ['Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5', 'Unit 6', 'Unit 7', 'Unit 8', 'Others'],
    datasets: [{
      data: [8.3, 8.3, 8.3, 8.3, 8.3, 8.3, 8.3, 8.3, 8.3],
      backgroundColor: [
        '#f8a5c2', '#f97316', '#22c55e', '#3b82f6', 
        '#a855f7', '#ec4899', '#64748b', '#0ea5e9', '#6b7280'
      ],
      borderWidth: 0,
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          boxWidth: 6,
          padding: 20,
        }
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

  return (
    <div className="p-6 space-y-6">
      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Processes */}
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium">Total number of process: 120</h3>
          </div>
          <Pie data={processStatusData} options={chartOptions} />
        </div>

        {/* Priority Distribution */}
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium">Process distribution by priority level</h3>
          </div>
          <Pie data={priorityData} options={chartOptions} />
        </div>

        {/* Business Unit Distribution */}
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium">Process distribution by business unit</h3>
          </div>
          <Pie data={businessUnitData} options={chartOptions} />
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
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
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
        </div>

        <div className="relative">
          {/* Timeline chart would go here - This would require additional implementation */}
          <div className="h-96 flex items-center justify-center text-gray-500">
            Timeline chart implementation required
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessDashboard; 