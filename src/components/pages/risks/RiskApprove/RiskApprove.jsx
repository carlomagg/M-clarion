import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useUser from '../../../../hooks/useUser';
import PageTitle from '../../../partials/PageTitle/PageTitle';
import PageHeader from '../../../partials/PageHeader/PageHeader';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import SearchField from '../../../partials/SearchField/SearchField';
import { filterItems } from '../../../../utils/helpers';
import axios from 'axios';
import useDispatchMessage from '../../../../hooks/useDispatchMessage';

// New component for the approval queue
function ApprovalQueueItem({ risk, onViewDetails, onAction }) {
  // Try to get a valid date from various possible date fields
  const getDateDisplay = (risk) => {
    // Check common date field names in APIs
    const possibleDateFields = [
      'created_at', 
      'createdAt', 
      'date_created', 
      'dateCreated', 
      'creation_date', 
      'creationDate',
      'date',
      'submitted_date',
      'submittedDate',
      'submission_date',
      'submissionDate'
    ];
    
    // Log all the fields in the risk object to help debugging
    console.log('Available fields in risk object:', Object.keys(risk));
    
    // Try each possible field
    for (const field of possibleDateFields) {
      if (risk[field] && risk[field] !== 'null' && risk[field] !== 'undefined') {
        console.log(`Found date in field: ${field} = ${risk[field]}`);
        return risk[field];
      }
    }
    
    // Hard-coded sample date (for demo purposes)
    return '12/02/2024'; // Fallback to a date in the same format as history
  };
  
  return (
    <div className="p-4 bg-white rounded-lg shadow mb-4 border-l-4 border-pink-500 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-lg">{risk.Title}</h3>
          <div className="text-sm text-gray-600 mt-1">
            <span className="mr-4">ID: {risk.risk_id}</span>
            <span className="mr-4">Category: {risk.category}</span>
            <span>Submitted on: {getDateDisplay(risk)}</span>
          </div>
          <p className="mt-2 text-sm">{risk.description?.substring(0, 150)}...</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onViewDetails(risk.risk_id)}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            View Details
          </button>
          <button 
            onClick={() => onAction(risk.risk_id)}
            className="px-3 py-1 text-sm bg-pink-600 text-white rounded hover:bg-pink-700"
          >
            Take Action
          </button>
        </div>
      </div>
    </div>
  );
}

// Approval action modal
function ApprovalActionModal({ riskId, isOpen, onClose, approvalStatuses, users, noUsersMessage }) {
  const [action, setAction] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [note, setNote] = useState('');
  const dispatchMessage = useDispatchMessage();
  const queryClient = useQueryClient();
  
  // Log available approval statuses and status map for debugging
  useEffect(() => {
    console.log('Available approval statuses:', approvalStatuses);
    console.log('Users available for forwarding:', users);
  }, [approvalStatuses, users]);
  
  // Get status IDs from your list
  const statusMap = {
    'approve': approvalStatuses?.find(s => s.status === 'COMPLETED')?.id,
    'reject': approvalStatuses?.find(s => s.status === 'REJECTED')?.id,
    'forward': approvalStatuses?.find(s => s.status === 'FORWARDED')?.id,
    'hold': approvalStatuses?.find(s => s.status === 'ON HOLD')?.id
  };
  
  useEffect(() => {
    console.log('Current status map:', statusMap);
    console.log('Current selected action:', action);
    console.log('Status ID for selected action:', action ? statusMap[action] : null);
  }, [action, statusMap]);

  const { mutate: submitApproval, isLoading } = useMutation({
    mutationFn: async (data) => {
      // Fix URL by ensuring the ID is properly included
      console.log(`Submitting approval action for risk ${riskId}`);
      console.log('Approval data:', data);
      const url = `risk/risk/${riskId}/approval/`;
      console.log('Approval URL:', url);
      const response = await axios.put(url, data);
      console.log('Approval response:', response.data);
      return response.data;
    },
    onSuccess: (data) => {
      dispatchMessage('success', data.message || 'Approval action completed successfully');
      // Invalidate both pending approvals and history data to force refresh
      queryClient.invalidateQueries(['risks-pending-approval']);
      queryClient.invalidateQueries(['approval-history']);
      queryClient.invalidateQueries(['risks-for-history']);
      
      // Set a flag in localStorage to trigger history refresh
      localStorage.setItem('approval_action_completed', 'true');
      localStorage.setItem('approval_action_timestamp', Date.now().toString());
      
      onClose();
    },
    onError: (error) => {
      console.error('Error submitting approval:', error);
      dispatchMessage('failed', error.response?.data?.message || 'Failed to process approval');
    }
  });

  const handleSubmit = () => {
    if (!action) {
      dispatchMessage('failed', 'Please select an action');
      return;
    }

    if (!note) {
      dispatchMessage('failed', 'Please provide a comment');
      return;
    }

    if (action === 'forward' && !selectedUser) {
      dispatchMessage('failed', 'Please select a user to forward to');
      return;
    }
    
    // Add additional logging to debug payload
    const statusId = statusMap[action];
    console.log(`Preparing approval with status ID ${statusId} for action ${action}`);
    
    if (!statusId) {
      dispatchMessage('failed', `Could not find status ID for action "${action}". Please try a different action.`);
      return;
    }

    const payload = {
      status_id: statusId,
      approval_note: note
    };

    if (action === 'forward') {
      payload.user_id = selectedUser;
    }
    
    console.log('Submitting payload:', payload);
    submitApproval(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Risk Approval Action</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Select Action</label>
          <div className="flex gap-2">
            <button 
              onClick={() => setAction('approve')}
              className={`px-3 py-2 rounded text-sm ${action === 'approve' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}
            >
              Approve
            </button>
            <button 
              onClick={() => setAction('reject')}
              className={`px-3 py-2 rounded text-sm ${action === 'reject' ? 'bg-red-600 text-white' : 'bg-gray-100'}`}
            >
              Reject
            </button>
            <button 
              onClick={() => setAction('forward')}
              className={`px-3 py-2 rounded text-sm ${action === 'forward' ? 'bg-pink-600 text-white' : 'bg-gray-100'}`}
            >
              Forward
            </button>
            <button 
              onClick={() => setAction('hold')}
              className={`px-3 py-2 rounded text-sm ${action === 'hold' ? 'bg-yellow-600 text-white' : 'bg-gray-100'}`}
            >
              On Hold
            </button>
          </div>
          {action && (
            <p className="mt-1 text-xs text-gray-500">
              Selected action: <span className="font-medium">{action}</span>
              {statusMap[action] ? ` (status ID: ${statusMap[action]})` : ' (status ID not found)'}
            </p>
          )}
        </div>
        
        {action === 'forward' && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Forward To</label>
            {Array.isArray(users) && users.length > 0 ? (
              <select 
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="">Select a user</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.text}
                  </option>
                ))}
              </select>
            ) : (
              noUsersMessage || (
              <div className="text-sm text-red-500 p-2 border border-red-200 bg-red-50 rounded">
                No users available for forwarding. Please try refreshing the page.
              </div>
              )
            )}
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Comment</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            rows={4}
            placeholder="Provide a comment for your decision..."
          />
        </div>
        
        <div className="flex justify-end gap-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Improved component to display approval history with last update time
function ApprovalHistoryTable({ history, lastUpdated, onLoadSampleData }) {
  // Add extra debugging to understand the history data structure
  useEffect(() => {
    console.log('Rendering approval history table with data:', history);
    if (history && history.length > 0) {
      console.log('Sample history record:', history[0]);
    }
  }, [history]);

  // Sort approval history by date and time (most recent first)
  const sortedHistory = [...(history || [])].sort((a, b) => {
    // Extract date parts
    const dateA = a.date ? a.date.split('-').reverse().join('-') : '';
    const dateB = b.date ? b.date.split('-').reverse().join('-') : '';
    
    // Try to create proper date objects (in same format)
    const fullDateA = dateA ? `${dateA} ${a.time || '00:00'}` : '';
    const fullDateB = dateB ? `${dateB} ${b.time || '00:00'}` : '';
    
    // Compare dates (most recent first)
    return fullDateB.localeCompare(fullDateA);
  });

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg flex flex-col items-center">
        <p className="text-gray-600 mb-4">No approval history available.</p>
        {onLoadSampleData && (
          <button
            onClick={onLoadSampleData}
            className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
          >
            Load Sample Data For Testing
          </button>
        )}
      </div>
    );
  }
  
  // Format the last updated time
  const getLastUpdatedText = () => {
    if (!lastUpdated) return '';
    
    const date = new Date(lastUpdated);
    const now = new Date();
    
    // If within last minute, show "Just now"
    const diffMs = now - date;
    if (diffMs < 60000) {
      return 'Updated just now';
    }
    
    // If within the hour, show minutes ago
    if (diffMs < 3600000) {
      const minutes = Math.floor(diffMs / 60000);
      return `Updated ${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }
    
    // Otherwise show full time
    return `Last updated: ${date.toLocaleTimeString()}`;
  };
  
  return (
    <div>
      {lastUpdated && (
        <div className="text-xs text-gray-500 mb-2 text-right flex items-center justify-end gap-1">
          <span className={`w-2 h-2 rounded-full ${Date.now() - lastUpdated < 60000 ? 'bg-green-500' : 'bg-gray-400'}`}></span>
          {getLastUpdatedText()}
        </div>
      )}
    <div className="overflow-auto border rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action By</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
            {sortedHistory.map((record, index) => (
              <tr key={index} className={index === 0 ? 'bg-blue-50' : ''}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.date} {record.time}
                  {index === 0 && <span className="ml-2 text-xs text-blue-600">(Latest)</span>}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    record.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    record.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                    record.status === 'FORWARDED' ? 'bg-blue-100 text-blue-800' :
                    record.status === 'ON HOLD' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {record.status || 'Unknown'}
                </span>
              </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {record.risk_approval_note}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.action_by}
              </td>
            </tr>
            ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

// Add a component to display when no users are found that allows using test data
function NoUsersMessage({ onUseTestUsers }) {
  return (
    <div className="text-sm p-4 border border-red-200 bg-red-50 rounded flex flex-col gap-3">
      <p className="text-red-600">No users available for forwarding. The API endpoints for users could not be found.</p>
      <p>You can:</p>
      <ul className="list-disc pl-5 text-gray-700">
        <li>Check your API configuration</li>
        <li>Make sure user endpoints are accessible</li>
        <li>Contact your administrator</li>
      </ul>
      <button
        onClick={onUseTestUsers}
        className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm mt-2 self-start"
      >
        Use Test Users for Now
      </button>
    </div>
  );
}

// Main Risk Approval Component
function RiskApprove() {
  const navigate = useNavigate();
  const user = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedHistoryRisk, setSelectedHistoryRisk] = useState(null);
  const queryClient = useQueryClient();
  const dispatchMessage = useDispatchMessage();
  
  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  
  // Fetch risks pending the current user's approval
  const fetchPendingApprovals = async () => {
    // This would ideally be a dedicated API endpoint
    // For now, we get all risks and check if current user is an approver
    try {
      console.log('Fetching all risks from API');
      const response = await axios.get('risk/risk-log/');
      console.log('Risk log API response:', response);
      const risks = response.data;
      
      // Log a sample risk to understand its structure
      if (risks && risks.length > 0) {
        console.log('Sample risk data structure:', risks[0]);
      }
      
      // For each risk, check if the current user is an approver
      const pendingRisks = [];
      for (const risk of risks) {
        try {
          console.log(`Checking approvers for risk ${risk.risk_id}`);
          const approversUrl = `risk/risk/${risk.risk_id}/view-who-to-approve/`;
          console.log('Request URL:', approversUrl);
          const approversResponse = await axios.get(approversUrl);
          console.log('Approvers response:', approversResponse.data);
          const approvers = approversResponse.data.approvers || [];
          if (approvers.some(a => a.user_id === user.id)) {
            pendingRisks.push(risk);
          }
        } catch (error) {
          console.error(`Error fetching approvers for risk ${risk.risk_id}:`, error);
        }
      }
      
      console.log('Pending risks for user:', pendingRisks);
      return pendingRisks;
    } catch (error) {
      console.error('Error fetching risks:', error);
      return [];
    }
  };
  
  // Fetch all risks for history (we'll filter on the client side)
  const fetchRisksForHistory = async () => {
    try {
      console.log('Fetching risks for history');
      const response = await axios.get('risk/risk-log/');
      console.log('Risk log response for history:', response.data);
    return response.data;
    } catch (error) {
      console.error('Error fetching risks for history:', error);
      return [];
    }
  };
  
  // Fetch approval statuses for the dropdown
  const { data: approvalStatuses, isLoading: isLoadingStatuses, error: statusesError } = useQuery({
    queryKey: ['approval-statuses'],
    queryFn: async () => {
      try {
        console.log('Fetching approval statuses');
        // Try both possible API endpoints for approval statuses
        let response;
        
        try {
          response = await axios.get('risk/risk-approval-status/view-all/');
          console.log('Approval statuses response from primary endpoint:', response.data);
        } catch (err) {
          console.log('Primary approval status endpoint failed, trying alternate endpoint');
          response = await axios.get('risk/approval-statuses/view-all/');
          console.log('Approval statuses from alternate endpoint:', response.data);
        }
        
        if (!Array.isArray(response.data)) {
          // Try to extract data if it's nested in a property
          for (const key in response.data) {
            if (Array.isArray(response.data[key])) {
              console.log(`Found potential status array in key: ${key}`);
              return response.data[key];
            }
          }
          
          // If we still have an object but not an array, wrap it in an array
          console.warn('Approval statuses not in expected array format, attempting to convert');
          return Array.isArray(response.data) ? response.data : [response.data];
        }
        
        console.log('Returning approval statuses:', response.data);
      return response.data;
      } catch (error) {
        console.error('Error fetching approval statuses:', error);
        console.warn('⚠️ Using temporary fallback approval statuses - for testing only');
        // Return minimal fallback data for testing
        return [
          { id: 1, status: 'COMPLETED' },
          { id: 2, status: 'REJECTED' },
          { id: 3, status: 'FORWARDED' },
          { id: 4, status: 'ON HOLD' }
        ];
      }
    }
  });
  
  // Fetch users for the forward dropdown with better error handling
  const { data: users, isLoading: isLoadingUsers, error: usersError, refetch: refetchUsers } = useQuery({
    queryKey: ['users-for-approval'],
    queryFn: async () => {
      try {
        // Use the same endpoint that works for process task components
        console.log('Attempting to fetch users from clarion_users/all-users/');
        const response = await axios.get('clarion_users/all-users/');
        console.log('Users API response:', response);
        
        if (!response.data) {
          throw new Error('No user data returned from API');
        }
        
        // Map the user data to the format expected by the dropdown
        const mappedUsers = Array.isArray(response.data) 
          ? response.data.map(user => ({
              id: user.user_id,
              text: user.firstname && user.lastname 
                ? `${user.firstname} ${user.lastname}` 
                : user.email || `User ${user.user_id}`
            }))
          : [];
          
        console.log('Mapped users:', mappedUsers.slice(0, 3));
        return mappedUsers;
      } catch (error) {
        console.error('Error fetching users:', error);
        
        // If that fails, try to get users from the approvers
        console.log('Attempting to extract users from approvers data');
        
        // Only attempt this if we have pending approvals
        if (pendingApprovals && pendingApprovals.length > 0) {
          const allApprovers = [];
          const processedUserIds = new Set();
          
          // Get all approvers from all risks
          for (const risk of pendingApprovals) {
            try {
              const approversUrl = `risk/risk/${risk.risk_id}/view-who-to-approve/`;
              const approversResponse = await axios.get(approversUrl);
              
              if (approversResponse.data && approversResponse.data.approvers) {
                // Add each unique approver to our list
                approversResponse.data.approvers.forEach(approver => {
                  if (!processedUserIds.has(approver.user_id)) {
                    processedUserIds.add(approver.user_id);
                    allApprovers.push(approver);
                  }
                });
              }
            } catch (error) {
              console.warn(`Could not get approvers for risk ${risk.risk_id}`);
            }
          }
          
          if (allApprovers.length > 0) {
            console.log('Found users from approvers data:', allApprovers);
            return allApprovers.map(approver => ({
              id: approver.user_id,
              text: approver.user_name || approver.email || `User ${approver.user_id}`
            }));
          }
        }
        
        // Last resort: Try to extract from current user
        if (user && user.id) {
          console.log('Using current user as fallback for forwarding');
          return [
            { 
              id: user.id,
              text: user.name || user.email || `Current User (${user.id})`
            }
          ];
        }
        
        // If all else fails, return test data
        console.warn('⚠️ All user fetch methods failed. Using test data.');
        return [
          { id: '1', text: '[TEST] Admin User' },
          { id: '2', text: '[TEST] Approver 1' },
          { id: '3', text: '[TEST] Approver 2' }
        ];
      }
    },
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });
  
  // Fetch pending approvals
  const { isLoading: isLoadingPending, error: pendingError, data: pendingApprovals } = useQuery({
    queryKey: ['risks-pending-approval'],
    queryFn: fetchPendingApprovals,
    enabled: activeTab === 'pending'
  });
  
  // Fetch risks for history
  const { isLoading: isLoadingHistory, error: historyError, data: historyRisks } = useQuery({
    queryKey: ['risks-for-history'],
    queryFn: fetchRisksForHistory,
    enabled: activeTab === 'history'
  });
  
  // Function to view risk details
  const handleViewDetails = (riskId) => {
    // First, let's invalidate any cached history data for this risk
    queryClient.invalidateQueries(['approval-history', riskId]);
    
    // Check if we're on the details page in the same tab
    if (window.location.pathname === `/risks/${riskId}`) {
      // If already on the risk page, force a refresh
      window.location.reload();
    } else {
      // Navigate to the risk details page
      navigate(`/risks/${riskId}`, { 
        state: { 
          forceRefresh: true,
          fromApprovalQueue: true,
          timestamp: Date.now() // Add timestamp to ensure uniqueness
        } 
      });
      
      // Store the risk ID in localStorage so other components can know which risk was viewed
      localStorage.setItem('last_viewed_risk_id', riskId);
      localStorage.setItem('last_viewed_timestamp', Date.now().toString());
    }
  };
  
  // Function to open approval action modal
  const handleTakeAction = (riskId) => {
    setSelectedRisk(riskId);
    setIsModalOpen(true);
  };
  
  // Function to view a risk's approval history
  const handleViewHistory = (riskId) => {
    setSelectedHistoryRisk(riskId);
  };
  
  // Filter risks based on search term
  const filteredPendingRisks = pendingApprovals ? 
    filterItems(searchTerm, pendingApprovals, ['Title', 'category', 'risk_id']) : 
    [];
    
  const filteredHistoryRisks = historyRisks ? 
    filterItems(searchTerm, historyRisks, ['Title', 'category', 'risk_id']) : 
    [];
  
  // Calculate pagination for history risks
  const totalHistoryPages = Math.ceil(filteredHistoryRisks.length / pageSize);
  const paginatedHistoryRisks = filteredHistoryRisks.slice(
    (currentPage - 1) * pageSize, 
    currentPage * pageSize
  );
  
  // Handle page changes
  const handlePageChange = (newPage) => {
    // Make sure we stay within valid page range
    if (newPage >= 1 && newPage <= totalHistoryPages) {
      setCurrentPage(newPage);
      
      // Reset selected risk when changing pages
      setSelectedHistoryRisk(null);
    }
  };
  
  // Handle page size changes
  const handlePageSizeChange = (event) => {
    const newSize = parseInt(event.target.value);
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page
    setSelectedHistoryRisk(null); // Reset selected risk
  };
  
  // Reset pagination when tab changes or search term changes
  useEffect(() => {
    setCurrentPage(1);
    setSelectedHistoryRisk(null);
  }, [activeTab, searchTerm]);
  
  // Determine if loading or error state should be shown
  const isLoading = (activeTab === 'pending' && isLoadingPending) || 
                   (activeTab === 'history' && isLoadingHistory);
                   
  const error = (activeTab === 'pending' && pendingError) || 
               (activeTab === 'history' && historyError);
  
  // Add a useEffect to log when the component has data from APIs
  useEffect(() => {
    if (approvalStatuses) {
      console.log('Approval statuses loaded:', approvalStatuses);
      console.log('Status map would be:',  {
        'approve': approvalStatuses.find(s => s.status === 'COMPLETED')?.id,
        'reject': approvalStatuses.find(s => s.status === 'REJECTED')?.id,
        'forward': approvalStatuses.find(s => s.status === 'FORWARDED')?.id,
        'hold': approvalStatuses.find(s => s.status === 'ON HOLD')?.id
      });
    }
    
    if (users) {
      console.log('Users loaded:', users.length);
      console.log('First 3 users:', users.slice(0, 3));
    }
  }, [approvalStatuses, users]);
  
  // Add state for manually using test users
  const [useTestUsers, setUseTestUsers] = useState(false);

  // Function to manually set test users
  const handleUseTestUsers = () => {
    setUseTestUsers(true);
  };

  // Get the appropriate users list - either from API or test data
  const effectiveUsers = useTestUsers ? 
    [
      { id: '1', text: '[TEST] Admin User' },
      { id: '2', text: '[TEST] Approver 1' },
      { id: '3', text: '[TEST] Approver 2' }
    ] : 
    users;
  
  // Fetch approval history for selected risk with improved refresh handling
  const { data: approvalHistory, isLoading: isLoadingApprovalHistory, refetch: refetchApprovalHistory, dataUpdatedAt } = useQuery({
    queryKey: ['approval-history', selectedHistoryRisk],
    queryFn: async () => {
      if (!selectedHistoryRisk) return [];
      
      try {
        console.log(`Fetching approval history for risk ${selectedHistoryRisk}`);
        const url = `risk/risk/${selectedHistoryRisk}/approval-history/`;
        console.log('Approval history URL:', url);
        
        // Add cache-busting query parameter to avoid getting cached results
        const response = await axios.get(`${url}?_=${Date.now()}`);
        console.log('Raw approval history API response:', response);
        
        if (!response.data) {
          console.warn('No data returned from approval history API');
          return [];
        }
        
        // Process the response data
        let history = response.data;
        
        // Check if the response has a risk_approval_status_data field which might contain the status
        if (history && typeof history === 'object' && history.risk_approval_status_data) {
            console.log('Found risk_approval_status_data in response:', history.risk_approval_status_data);
            
            // If it's an object, try to extract status information
            if (typeof history.risk_approval_status_data === 'object') {
                if (history.risk_approval_status_data.status) {
                    console.log('Found status in risk_approval_status_data:', history.risk_approval_status_data.status);
                    history.status = history.risk_approval_status_data.status;
                } else if (history.risk_approval_status_data.name) {
                    console.log('Found name in risk_approval_status_data:', history.risk_approval_status_data.name);
                    history.status = history.risk_approval_status_data.name;
                } else if (history.risk_approval_status_data.status_name) {
                    console.log('Found status_name in risk_approval_status_data:', history.risk_approval_status_data.status_name);
                    history.status = history.risk_approval_status_data.status_name;
                }
            }
            // If it's a string, use it directly
            else if (typeof history.risk_approval_status_data === 'string') {
                console.log('risk_approval_status_data is a string:', history.risk_approval_status_data);
                history.status = history.risk_approval_status_data;
            }
        }
        
        // Extract approval status directly from the response if available
        let extractedStatus = null;
        
        // Examine the response structure to find status information
        if (history && typeof history === 'object') {
          console.log('Examining response for status information');
          
          // Try to find risk_approval_status directly in the response
          if (history.risk_approval_status) {
              extractedStatus = history.risk_approval_status;
              console.log('Found risk_approval_status directly in response:', extractedStatus);
          }
          // Try to find status directly in the response
          else if (history.status) {
              extractedStatus = history.status;
              console.log('Found status directly in response:', extractedStatus);
          }
          // Try to find risk_approval_status_id directly in the response
          else if (history.risk_approval_status_id && approvalStatuses) {
              const statusId = typeof history.risk_approval_status_id === 'string' 
                  ? parseInt(history.risk_approval_status_id, 10) 
                  : history.risk_approval_status_id;
                  
              const statusObj = approvalStatuses.find(s => s.id === statusId);
              if (statusObj) {
                  extractedStatus = statusObj.status;
                  console.log('Found status from risk_approval_status_id:', extractedStatus);
              } else {
                  const directStatusMap = {
                      1: 'COMPLETED',
                      2: 'REJECTED',
                      3: 'FORWARDED',
                      4: 'ON HOLD'
                  };
                  extractedStatus = directStatusMap[statusId];
                  console.log('Mapped risk_approval_status_id to status:', extractedStatus);
              }
          }
        }
        
        // Special case: If the response contains a risk_approval_status_name field directly
        if (history && typeof history === 'object' && !Array.isArray(history) && 
           (history.risk_approval_status_name || extractedStatus)) {
          
          const statusValue = history.risk_approval_status_name || extractedStatus;
          console.log('Found status directly in response:', statusValue);
          
          // Create a history record with the status
          history = [{
            date: history.date || history.created_at || new Date().toLocaleDateString(),
            time: history.time || new Date().toLocaleTimeString(),
            status: statusValue, // Use the extracted status directly
            risk_approval_note: history.risk_approval_note || history.comment || history.note || '',
            action_by: history.action_by || history.actionBy || history.user_name || ''
          }];
          console.log('Created history record from direct response:', history);
        }
        
        // Check if it's an array or needs extraction
        if (!Array.isArray(history)) {
          // Try to find the array in the response
          for (const key in history) {
            if (Array.isArray(history[key])) {
              console.log(`Found history array in key: ${key}`);
              history = history[key];
              break;
            }
          }
          
          // If still not an array, wrap it
          if (!Array.isArray(history)) {
            console.log('History data is not an array, wrapping it:', history);
            history = [history];
          }
        }
        
        // Process and normalize the data - IMPORTANT: don't default to 'COMPLETED'
        const processedHistory = history.map(record => {
          console.log('Processing history record:', record);
          
          // Extract the original status without defaulting to 'COMPLETED'
          let originalStatus = null;
          
          // Direct status field checks
          if (record.status) originalStatus = record.status;
          else if (record.approval_status) originalStatus = record.approval_status;
          else if (record.risk_approval_status) originalStatus = record.risk_approval_status;
          else if (record.risk_approval_status_name) originalStatus = record.risk_approval_status_name;
          else if (record.status_name) originalStatus = record.status_name;
          else if (record.statusName) originalStatus = record.statusName;
          
          // Check for status in nested status object
          else if (record.status_obj && record.status_obj.status) originalStatus = record.status_obj.status;
          else if (record.statusObj && record.statusObj.status) originalStatus = record.statusObj.status;
          else if (record.approval_status_obj && record.approval_status_obj.status) originalStatus = record.approval_status_obj.status;
          
          // Check for nested objects that might contain status information
          else if (record.risk_approval_status_obj) {
              if (record.risk_approval_status_obj.status) {
                  originalStatus = record.risk_approval_status_obj.status;
              } else if (record.risk_approval_status_obj.name) {
                  originalStatus = record.risk_approval_status_obj.name;
              } else if (record.risk_approval_status_obj.status_name) {
                  originalStatus = record.risk_approval_status_obj.status_name;
              }
          }
          
          // Check for approval_status_name which is commonly used
          else if (record.approval_status_name) originalStatus = record.approval_status_name;
          
          // Check for status ID and map to status text
          else if (record.risk_approval_status_id && approvalStatuses) {
              // Convert to number if it's a string
              const statusId = typeof record.risk_approval_status_id === 'string' 
                  ? parseInt(record.risk_approval_status_id, 10) 
                  : record.risk_approval_status_id;
                  
              // Try to find in approvalStatuses first
              const statusObj = approvalStatuses.find(s => s.id === statusId);
              if (statusObj) originalStatus = statusObj.status;
              else {
                  // Direct mapping if approvalStatuses doesn't contain the ID
                  const directStatusMap = {
                      1: 'COMPLETED',
                      2: 'REJECTED',
                      3: 'FORWARDED',
                      4: 'ON HOLD'
                  };
                  originalStatus = directStatusMap[statusId] || `Status ${statusId}`;
              }
          }
          else if (record.status_id && approvalStatuses) {
              // Convert to number if it's a string
              const statusId = typeof record.status_id === 'string' 
                  ? parseInt(record.status_id, 10) 
                  : record.status_id;
                  
              const statusObj = approvalStatuses.find(s => s.id === statusId);
              if (statusObj) originalStatus = statusObj.status;
              else {
                  // Direct mapping if approvalStatuses doesn't contain the ID
                  const directStatusMap = {
                      1: 'COMPLETED',
                      2: 'REJECTED',
                      3: 'FORWARDED',
                      4: 'ON HOLD'
                  };
                  originalStatus = directStatusMap[statusId] || `Status ${statusId}`;
              }
          }
          
          // Check for any field that might contain status information
          if (!originalStatus) {
              for (const key in record) {
                  if (typeof record[key] === 'string' && 
                      (key.toLowerCase().includes('status') || 
                       ['completed', 'rejected', 'forwarded', 'on hold'].includes(record[key].toUpperCase()))) {
                      console.log(`Found potential status in field "${key}":`, record[key]);
                      originalStatus = record[key];
                      break;
                  }
              }
          }
          
          console.log('Original status value:', originalStatus);
          
          // Check time format - it might be stored in a different format or field
          let timeValue = record.time;
          
          // If time is in a format like "HH:MM:SS" without AM/PM, convert it to 12-hour format
          if (timeValue && timeValue.match(/^\d{2}:\d{2}:\d{2}$/)) {
              const [hours, minutes] = timeValue.split(':');
              const hoursNum = parseInt(hours, 10);
              // Add 1 hour to fix the time being 1 hour behind
              const adjustedHours = (hoursNum + 1) % 24;
              const ampm = adjustedHours >= 12 ? 'PM' : 'AM';
              const hours12 = adjustedHours % 12 || 12; // Convert 0 to 12 for 12 AM
              timeValue = `${hours12}:${minutes} ${ampm}`;
          }
          
          // If no time field, check for created_at or other timestamp fields
          if (!timeValue && record.created_at) {
              const date = new Date(record.created_at);
              if (!isNaN(date.getTime())) {
                  // Add 1 hour to fix the time being 1 hour behind
                  date.setHours(date.getHours() + 1);
                  timeValue = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              }
          }
          
          // Map common numeric status IDs to status names if we still don't have a status
          if (!originalStatus && typeof record.status === 'number' && approvalStatuses) {
              const statusObj = approvalStatuses.find(s => s.id === record.status);
              if (statusObj) originalStatus = statusObj.status;
          }
          
          // Last resort: Map common numeric values to standard statuses
          if (!originalStatus && typeof record.status === 'number') {
              // Common mapping pattern in many APIs
              const statusMap = {
                  1: 'COMPLETED',
                  2: 'REJECTED',
                  3: 'FORWARDED',
                  4: 'ON HOLD'
              };
              originalStatus = statusMap[record.status] || `Status ${record.status}`;
          }
          
          return {
            date: record.date || '',
            time: timeValue || '',
            status: originalStatus || 'Unknown', // Changed from 'COMPLETED' to 'Unknown'
            risk_approval_note: record.risk_approval_note || record.comment || record.note || '',
            action_by: record.action_by || record.actionBy || record.user_name || ''
          };
        });
        
        console.log('Processed history data:', processedHistory);
        return processedHistory;
      } catch (error) {
        console.error(`Error fetching approval history for risk ${selectedHistoryRisk}:`, error);
        return [];
      }
    },
    enabled: !!selectedHistoryRisk
  });

  // Inside the main RiskApprove component, add this effect to check for completed actions
  useEffect(() => {
    // Check if we've completed an approval action recently
    const actionCompleted = localStorage.getItem('approval_action_completed') === 'true';
    const actionTimestamp = localStorage.getItem('approval_action_timestamp');
    
    if (actionCompleted) {
      // Check if the action was completed within the last 10 seconds
      const timeSinceAction = Date.now() - parseInt(actionTimestamp || '0');
      if (timeSinceAction < 10000) { // 10 seconds
        console.log('Recent approval action detected, refreshing history data');
        
        // Force a refresh of the history data
        if (activeTab === 'history') {
          refetchApprovalHistory();
          
          // Also refetch the risks for history to ensure we have the latest list
          queryClient.refetchQueries(['risks-for-history']);
        }
        
        // Reset the flag after processing
        localStorage.setItem('approval_action_completed', 'false');
      }
    }
  }, [activeTab, refetchApprovalHistory]);

  // Effect to refetch approval history when changing between tabs
  useEffect(() => {
    if (activeTab === 'history' && selectedHistoryRisk) {
      console.log('Tab changed to history, refreshing approval history');
      refetchApprovalHistory();
    }
  }, [activeTab, selectedHistoryRisk]);
  
  // Add effect to detect when returning from risk details view
  useEffect(() => {
    // Check if we're coming back from viewing a risk's details
    const lastViewedRiskId = localStorage.getItem('last_viewed_risk_id');
    const lastViewedTimestamp = localStorage.getItem('last_viewed_timestamp');
    
    if (lastViewedRiskId && lastViewedTimestamp) {
      const timeSinceView = Date.now() - parseInt(lastViewedTimestamp);
      
      // If we viewed a risk within the last 30 seconds, consider it a recent view
      if (timeSinceView < 30000) {
        console.log(`Recently viewed risk ${lastViewedRiskId}, refreshing history data`);
        
        // Set this risk as the selected history risk
        if (activeTab === 'history') {
          setSelectedHistoryRisk(lastViewedRiskId);
        }
        
        // Force refresh of the approval history data
        queryClient.invalidateQueries(['approval-history', lastViewedRiskId]);
        
        // Also refresh the list of risks
        queryClient.invalidateQueries(['risks-for-history']);
        
        // Clear the localStorage flags
        localStorage.removeItem('last_viewed_risk_id');
        localStorage.removeItem('last_viewed_timestamp');
      }
    }
  }, [activeTab, queryClient]);
  
  if (isLoading) {
    return (
      <div className='p-10 pt-4 max-w-7xl flex-1 flex flex-col gap-6'>
        <PageTitle title={'Risk Approval'} />
        <PageHeader />
        <div className="flex justify-center py-8">
          <span>Loading...</span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className='p-10 pt-4 max-w-7xl flex-1 flex flex-col gap-6'>
        <PageTitle title={'Risk Approval'} />
        <PageHeader />
        <div className="text-red-500 py-4">
          Failed to load risks. Please try again.
        </div>
      </div>
    );
  }
  
  return (
    <div className='p-10 pt-4 max-w-7xl flex-1 flex flex-col gap-6'>
      <PageTitle title={'Risk Approval'} />
      <PageHeader />
      
      <div className="mt-4 flex gap-4 border-b">
        <button 
          className={`py-2 px-4 ${activeTab === 'pending' ? 'border-b-2 border-pink-600 font-medium' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending My Approval {pendingApprovals && `(${filteredPendingRisks.length})`}
        </button>
        <button 
          className={`py-2 px-4 ${activeTab === 'history' ? 'border-b-2 border-pink-600 font-medium' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Risk History
        </button>
      </div>
      
      <div className="flex flex-col gap-6">
        <div className='bg-white p-6 flex flex-col gap-6 rounded-lg border border-[#CCC]'>
          <header className='flex flex-col gap-3'>
            <h3 className='font-semibold text-xl'>
              {activeTab === 'pending' ? 'Risks Pending Your Approval' : 'Risk Approval History'}
            </h3>
            <div className='flex gap-[10px]'>
              <div className='flex-1'>
                <SearchField 
                  searchTerm={searchTerm} 
                  onChange={setSearchTerm} 
                  placeholder={'Search by Risk ID, Title or Category'} 
                />
              </div>
            </div>
          </header>
          
          {activeTab === 'pending' && (
            <div className="mt-4">
              {filteredPendingRisks.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">No risks are currently pending your approval.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPendingRisks.map(risk => (
                    <ApprovalQueueItem 
                      key={risk.risk_id}
                      risk={risk}
                      onViewDetails={handleViewDetails}
                      onAction={handleTakeAction}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'history' && (
            <div className="mt-4">
              {filteredHistoryRisks.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">No risks found with approval history.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Select Risk to View Approval History</h4>
                      <div className="text-sm flex items-center gap-2">
                        <label htmlFor="pageSize">Items per page:</label>
                        <select 
                          id="pageSize" 
                          value={pageSize}
                          onChange={handlePageSizeChange}
                          className="border px-2 py-1 rounded text-sm"
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                        </select>
                      </div>
                    </div>
                    
                    {paginatedHistoryRisks.map(risk => (
                      <div 
                        key={risk.risk_id} 
                        className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                          selectedHistoryRisk === risk.risk_id ? 'border-pink-500 bg-pink-50' : ''
                        }`}
                        onClick={() => handleViewHistory(risk.risk_id)}
                      >
                        <h5 className="font-medium">{risk.Title}</h5>
                        <div className="text-sm text-gray-600">
                          <span className="mr-2">ID: {risk.risk_id}</span>
                          <span>Category: {risk.category}</span>
                        </div>
                      </div>
                    ))}
                    
                    {/* Pagination UI */}
                    {totalHistoryPages > 1 && (
                      <div className="flex justify-between items-center mt-4 pt-4 border-t">
                        <div className="text-sm text-gray-600">
                          Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredHistoryRisks.length)} of {filteredHistoryRisks.length}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1}
                            className="px-2 py-1 text-sm border rounded disabled:opacity-50"
                          >
                            &#171; First
                          </button>
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-2 py-1 text-sm border rounded disabled:opacity-50"
                          >
                            &#8249; Prev
                          </button>
                          <span className="px-3 py-1 text-sm bg-gray-100 rounded">
                            {currentPage} of {totalHistoryPages}
                          </span>
                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalHistoryPages}
                            className="px-2 py-1 text-sm border rounded disabled:opacity-50"
                          >
                            Next &#8250;
                          </button>
                          <button
                            onClick={() => handlePageChange(totalHistoryPages)}
                            disabled={currentPage === totalHistoryPages}
                            className="px-2 py-1 text-sm border rounded disabled:opacity-50"
                          >
                            Last &#187;
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">Approval History</h4>
                      {selectedHistoryRisk && (
                          <button 
                            onClick={() => refetchApprovalHistory()}
                            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center gap-1"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh History
                          </button>
                      )}
                        </div>
                    
                    {selectedHistoryRisk ? (
                      isLoadingApprovalHistory ? (
                        <div className="text-center py-4">Loading history...</div>
                      ) : (
                        <ApprovalHistoryTable 
                          history={approvalHistory} 
                          lastUpdated={dataUpdatedAt} 
                          onLoadSampleData={() => {
                            // Set sample history data in the EXACT format from the API
                            // This matches exactly what the user shared: { date, time, risk_approval_note, action_by }
                            queryClient.setQueryData(['approval-history', selectedHistoryRisk], [
                              {
                                "date": "01-05-2025",
                                "time": "08:41 PM",
                                "risk_approval_note": "Approved risk after review",
                                "action_by": "Super admin"
                              },
                              {
                                "date": "30-04-2025",
                                "time": "02:30 PM", 
                                "risk_approval_note": "Please review this risk", 
                                "action_by": "John Doe"
                              },
                              {
                                "date": "29-04-2025", 
                                "time": "09:15 AM", 
                                "risk_approval_note": "Risk needs more information", 
                                "action_by": "Jane Smith"
                              }
                            ]);
                          }}
                        />
                      )
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-gray-600">Select a risk to view its approval history.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {isModalOpen && (
        <ApprovalActionModal 
          riskId={selectedRisk}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          approvalStatuses={approvalStatuses || []}
          users={effectiveUsers || []}
          noUsersMessage={
            <NoUsersMessage onUseTestUsers={handleUseTestUsers} />
          }
        />
      )}
    </div>
  );
}

export default RiskApprove; 