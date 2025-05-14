import styles from './ManageSchedules.module.css';
import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import BackButton from '../../components/BackButton';

// Custom notification component
const Notification = ({ message, type, onClose, onConfirm = null }) => {
  const bgColor = type === 'error' ? 'bg-red-100 border-red-300 text-red-800' : 
                 type === 'success' ? 'bg-green-100 border-green-300 text-green-800' : 
                 type === 'warning' ? 'bg-yellow-100 border-yellow-300 text-yellow-800' :
                 'bg-blue-100 border-blue-300 text-blue-800';
                 
  return (
    <div className={`${bgColor} p-3 rounded-md border mb-4 flex justify-between items-center`}>
      <span>{message}</span>
      <div className="flex gap-2">
        {onConfirm && (
          <button 
            onClick={onConfirm}
            className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
          >
            Confirm
          </button>
        )}
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-lg"
        >
          ×
        </button>
      </div>
    </div>
  );
};

// API functions
const fetchNotificationSchedules = async () => {
  try {
    console.log('Fetching notification schedules...');
    const response = await axios.get('/clarion_users/notification-schedules/view-all/');
    console.log('Notification schedules response DATA:', response.data);
    
    // Debug logging to inspect actual structure
    const firstItem = Array.isArray(response.data) && response.data.length > 0 ? response.data[0] : null;
    console.log('First item structure:', firstItem);
    if (firstItem) {
      console.log('First item keys:', Object.keys(firstItem));
    }
    
    // Handle different response formats
    if (response.data && typeof response.data === 'object') {
      // If response is wrapped in a property
      if (response.data.notification_schedules) {
        return response.data.notification_schedules.map(item => ({
          ...item,
          id: item.schedule_id || item.id || item.notification_id
        }));
      } 
      // If response is an array directly
      else if (Array.isArray(response.data)) {
        return response.data.map(item => ({
          ...item,
          id: item.schedule_id || item.id || item.notification_id
        }));
      }
      // If response has data property 
      else if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data.map(item => ({
          ...item,
          id: item.schedule_id || item.id || item.notification_id
        }));
      }
      // Return empty array as fallback
      return [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching notification schedules:', error);
    throw error;
  }
};

const createNotificationSchedule = async (data) => {
  try {
    console.log('Creating notification schedule with data:', data);
    const response = await axios.post('/clarion_users/notification-schedules/', data);
    console.log('Create notification schedule response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating notification schedule:', error);
    throw error;
  }
};

const updateNotificationSchedule = async ({ id, data }) => {
  try {
    console.log(`Updating notification schedule with ID ${id} with data:`, data);
    if (!id) {
      throw new Error('Cannot update notification schedule: ID is undefined');
    }
    const response = await axios.put(`/clarion_users/notification-schedules/${id}/update/`, data);
    console.log('Update notification schedule response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating notification schedule:', error);
    throw error;
  }
};

const deleteNotificationSchedule = async (id) => {
  try {
    console.log(`Deleting notification schedule with ID ${id}`);
    if (!id) {
      throw new Error('Cannot delete notification schedule: ID is undefined');
    }
    const response = await axios.delete(`/clarion_users/notification-schedules/${id}/delete/`);
    console.log('Delete notification schedule response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting notification schedule:', error);
    throw error;
  }
};

function ManageSchedules() {
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    notification_start: 0,
    interval_days: 1
  });
  const [notification, setNotification] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  
  const queryClient = useQueryClient();
  
  // Show notification function
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };
  
  // Fetch notification schedules with refetch enabled
  const { data: schedules, isLoading, error, refetch } = useQuery({
    queryKey: ['notificationSchedules'],
    queryFn: fetchNotificationSchedules,
    onError: (err) => {
      showNotification(`Failed to load notification schedules: ${err.message}`, 'error');
    },
    refetchOnWindowFocus: true,
    staleTime: 10000 // Consider data stale after 10 seconds
  });
  
  // Effect to refetch data when component mounts or when mutations happen
  useEffect(() => {
    // Refetch on mount
    refetch();
  }, [refetch]);
  
  // Create mutation
  const createMutation = useMutation({
    mutationFn: createNotificationSchedule,
    onSuccess: () => {
      showNotification('Notification schedule created successfully', 'success');
      queryClient.invalidateQueries(['notificationSchedules']);
      refetch(); // Explicitly refetch after creation
      handleCloseModal();
    },
    onError: (err) => {
      showNotification(`Failed to create notification schedule: ${err.message}`, 'error');
    }
  });
  
  // Update mutation
  const updateMutation = useMutation({
    mutationFn: updateNotificationSchedule,
    onSuccess: () => {
      showNotification('Notification schedule updated successfully', 'success');
      queryClient.invalidateQueries(['notificationSchedules']);
      refetch(); // Explicitly refetch after update
      handleCloseModal();
    },
    onError: (err) => {
      showNotification(`Failed to update notification schedule: ${err.message}`, 'error');
    }
  });
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteNotificationSchedule,
    onSuccess: () => {
      showNotification('Notification schedule deleted successfully', 'success');
      queryClient.invalidateQueries(['notificationSchedules']);
      refetch(); // Explicitly refetch after deletion
      setDeleteConfirmation(null); // Clear the delete confirmation
    },
    onError: (err) => {
      showNotification(`Failed to delete notification schedule: ${err.message}`, 'error');
      setDeleteConfirmation(null); // Clear the delete confirmation even on error
    }
  });
  
  const handleCreateSchedule = () => {
    setSelectedSchedule(null);
    setFormData({
      notification_start: 0,
      interval_days: 1
    });
    setIsEditModalOpen(true);
  };
  
  const handleEditSchedule = (schedule) => {
    console.log('Editing schedule:', schedule);
    
    // Extract id using schedule_id as first priority
    const scheduleId = schedule.schedule_id || schedule.id || 
                     schedule.notification_id || 
                     (schedule.notification_schedule && schedule.notification_schedule.id);
    
    if (!scheduleId) {
      console.warn('Schedule is missing ID:', schedule);
      showNotification('Cannot edit schedule: Missing schedule ID', 'error');
      return;
    }
    
    // Make sure we have the correct schedule data
    const formValues = {
      notification_start: parseInt(schedule.notification_start || 0),
      interval_days: parseInt(schedule.interval_days || 1)
    };
    
    setSelectedSchedule({
      ...schedule,
      id: scheduleId
    });
    
    console.log('Setting form data for edit:', formValues);
    setFormData(formValues);
    setIsEditModalOpen(true);
  };
  
  const handleDeleteSchedule = (scheduleId) => {
    console.log('Deleting schedule with ID:', scheduleId);
    
    // Double-check if scheduleId is invalid, undefined, or null
    if (!scheduleId || scheduleId === 'undefined' || scheduleId === 'null') {
      console.warn('Attempted to delete schedule with invalid ID:', scheduleId);
      showNotification('Cannot delete schedule: Invalid schedule ID', 'error');
      return;
    }
    
    // Set delete confirmation instead of using window.confirm
    setDeleteConfirmation({
      id: scheduleId,
      message: 'Are you sure you want to delete this notification schedule?'
    });
  };
  
  const confirmDelete = () => {
    if (deleteConfirmation && deleteConfirmation.id) {
      // Convert to string just in case
      deleteMutation.mutate(String(deleteConfirmation.id));
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form data
    const notification_start = parseInt(formData.notification_start);
    const interval_days = parseInt(formData.interval_days);
    
    if (isNaN(notification_start) || notification_start < 0) {
      showNotification('Notification start day must be a positive number', 'error');
      return;
    }
    
    if (isNaN(interval_days) || interval_days < 1) {
      showNotification('Interval days must be at least 1', 'error');
      return;
    }
    
    const validatedData = {
      notification_start,
      interval_days
    };
    
    if (selectedSchedule && (selectedSchedule.id || selectedSchedule.schedule_id)) {
      // Use schedule_id if available, fall back to id
      const scheduleId = String(selectedSchedule.schedule_id || selectedSchedule.id);
      console.log('Updating schedule with ID:', scheduleId, 'Data:', validatedData);
      
      updateMutation.mutate({ 
        id: scheduleId, 
        data: validatedData 
      });
    } else {
      console.log('Creating new schedule with data:', validatedData);
      createMutation.mutate(validatedData);
    }
  };
  
  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedSchedule(null);
    setFormData({
      notification_start: 0,
      interval_days: 1
    });
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  return (
    <div className="flex flex-col gap-4 h-full bg-white p-4 rounded-xl">
      <div className='flex items-center mb-2'>
        <BackButton />
        <h3 className='font-semibold text-xl ml-3'>Notification Schedules</h3>
      </div>
      
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}
      
      {deleteConfirmation && (
        <Notification 
          message={deleteConfirmation.message}
          type="warning"
          onClose={() => setDeleteConfirmation(null)}
          onConfirm={confirmDelete}
        />
      )}
      
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-600">Configure when notifications are sent to users</p>
        <button 
          onClick={handleCreateSchedule}
          className="flex items-center gap-1 px-2 py-1 bg-white text-black text-xs rounded border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <span className="font-bold text-lg leading-none text-[#EB5757]">+</span>
          <span>Add schedule</span>
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          <p><strong>Error loading notification schedules:</strong> {error?.message || "An unexpected error occurred"}</p>
        </div>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b text-left">ID</th>
                <th className="py-2 px-4 border-b text-left">Notification Start (days)</th>
                <th className="py-2 px-4 border-b text-left">Interval (days)</th>
                <th className="py-2 px-4 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(schedules) && schedules.length > 0 ? (
                schedules.map((schedule, index) => {
                  console.log(`Schedule at index ${index}:`, schedule);
                  
                  // Ensure we have an ID for the schedule - prioritize schedule_id
                  const scheduleId = schedule.schedule_id || schedule.id || schedule.notification_id;
                  
                  return (
                    <tr key={scheduleId || `schedule-${index}`} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b">{scheduleId}</td>
                      <td className="py-2 px-4 border-b">{schedule.notification_start}</td>
                      <td className="py-2 px-4 border-b">{schedule.interval_days}</td>
                      <td className="py-2 px-4 border-b">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => {
                              console.log('Edit button clicked for schedule:', schedule);
                              if (!scheduleId) {
                                console.warn('No ID found for schedule:', schedule);
                              }
                              handleEditSchedule({...schedule, id: scheduleId});
                            }}
                            className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => {
                              console.log('Delete button clicked for schedule:', schedule);
                              if (!scheduleId) {
                                console.warn('No ID found for schedule:', schedule);
                              }
                              handleDeleteSchedule(scheduleId);
                            }}
                            className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="py-8 px-4 text-center">
                    <div className="flex flex-col items-center">
                      <p className="text-gray-500">No notification schedules found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Edit/Create Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">
              {selectedSchedule ? 'Edit Notification Schedule' : 'Create Notification Schedule'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="notification_start">
                  Notification Start (days)
                </label>
                <input
                  type="number"
                  id="notification_start"
                  name="notification_start"
                  value={formData.notification_start}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Number of days after which notifications start</p>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 mb-2" htmlFor="interval_days">
                  Interval (days)
                </label>
                <input
                  type="number"
                  id="interval_days"
                  name="interval_days"
                  value={formData.interval_days}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Number of days between successive notifications</p>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  disabled={createMutation.isLoading || updateMutation.isLoading}
                >
                  {createMutation.isLoading || updateMutation.isLoading ? (
                    <span className="flex items-center">
                      <span className="animate-spin mr-2">⟳</span> Saving...
                    </span>
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageSchedules; 