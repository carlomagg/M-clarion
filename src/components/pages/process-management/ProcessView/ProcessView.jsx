import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ProcessService from '../../../../services/Process.service';
import PageTitle from '../../../partials/PageTitle/PageTitle';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

function ProcessView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    isLoading,
    data,
    error
  } = useQuery({
    queryKey: ['process', id],
    queryFn: () => ProcessService.getProcessById(id),
  });

  if (isLoading) {
    return <div className="p-6">Loading process details...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        Error loading process details. {error.message}
      </div>
    );
  }

  // Get the first process from the Processes array
  const process = data?.Processes?.[0];

  if (!process) {
    return <div className="p-6 text-red-500">Process not found</div>;
  }

  // Safely get related processes
  const relatedProcesses = process?.['Related Processes'] || [];
  const hasRelatedProcesses = Array.isArray(relatedProcesses) && relatedProcesses.length > 0;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/process-management')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ChevronLeftIcon className="h-5 w-5 mr-1" />
          Back to Process Management
        </button>
      </div>
      <PageTitle title="Process Details" />
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        {/* Header Information */}
        <div className="flex items-center space-x-2 mb-6">
          <span className="text-pink-500 font-bold">PROCESS ID: {process.id}</span>
          <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded">
            Version {process.version}
          </span>
          <span className={`px-2 py-1 rounded ${
            process.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {process.status}
          </span>
          <span className={`px-2 py-1 rounded ${
            process.priority_level === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            Priority: {process.priority_level}
          </span>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-2">{process.name}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Process Type</label>
                <p className="mt-1">{process.type}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Created By</label>
                <p className="mt-1">{process.created_by}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tags</label>
                <p className="mt-1">{process.tags || 'No tags'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Company Unit</label>
                <p className="mt-1">{process.coy_unit || 'Not assigned'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Dependency</label>
                <p className="mt-1">{process.dependency || 'No dependencies'}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {process.description && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <div className="prose max-w-none bg-gray-50 p-4 rounded-md">
                {process.description}
              </div>
            </div>
          )}

          {/* Notes */}
          {process.notes && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <div 
                className="prose max-w-none bg-gray-50 p-4 rounded-md"
                dangerouslySetInnerHTML={{ __html: process.notes }}
              />
            </div>
          )}

          {/* Related Processes */}
          {hasRelatedProcesses && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Related Processes</label>
              <div className="bg-gray-50 p-4 rounded-md">
                <ul className="space-y-2">
                  {relatedProcesses.map((relatedProcess) => (
                    <li key={relatedProcess.process_id} className="flex items-center space-x-2">
                      <span className="text-gray-600">#{relatedProcess.process_id}</span>
                      <span>{relatedProcess.process_title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Tasks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tasks</label>
            <div className="prose max-w-none bg-gray-50 p-4 rounded-md">
              {process.tasks}
            </div>
          </div>

          {/* Flowcharts */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Flowcharts</label>
            <div className="prose max-w-none bg-gray-50 p-4 rounded-md">
              {process.flowcharts}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProcessView; 