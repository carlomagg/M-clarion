import { useEffect, useRef, useState } from 'react';
import { FormCancelButton, FormCustomButton, FormProceedButton } from '../../../buttons/FormButtons/FormButtons';
import styles from './RiskReview.module.css';
import plusIcon from '../../../../../assets/icons/plus.svg';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { impactScoresOptions, likelihoodScoresOptions, riskAnalysisOptions, riskApprovalStatusesOptions, riskApproversOptions, riskEventsOptions, riskFollowUpsOptions, riskIdentificationOptions, riskRegisterStatusesOptions, riskTreatmentPlanOptions, useUpdateWhoToApprove } from '../../../../../queries/risks/risk-queries';
import { usersOptions } from '../../../../../queries/users-queries';
import useDispatchMessage from '../../../../../hooks/useDispatchMessage';
import { Section } from './components/Elements';
import DetailsContent from './components/DetailsContent';
import AnalysisContent from './components/AnalysisContent';
import ControlDetailsContent from './components/ControlDetailsContent';
import RiskEventsContent from './components/RiskEventContent';
import RiskIndicatorsTable from './components/RiskIndicatorsContent';
import FollowUpHistoryContent from './components/FollowUpContent';
import ApprovalContent from './components/ApprovalContent';
import WhoToApproveContent from './components/WhoToApproveContent';
import useUser from '../../../../../hooks/useUser';
import axios from 'axios';
import processService from '../../../../../services/Process.service';

// Set to false for production environment
const SHOW_DEBUG_INFO = false;

// ProcessService is already exported as a singleton instance, no need to initialize it
// const processService = new ProcessService(); // <-- This line was causing the error

function RiskReview({mode, currentRiskId, onRiskIdChange, readOnly = false, approvalMode = false}) {

    const [searchParams, setSearchParams] = useSearchParams();
    const params = useParams();
    // Use currentRiskId from props if available, otherwise fallback to URL params
    const riskID = mode === 'standalone' ? params.id : (currentRiskId || searchParams.get('id'));
    
    // Update the parent component with the current risk ID when it becomes available
    useEffect(() => {
        if (riskID && onRiskIdChange) {
            onRiskIdChange(riskID);
        }
    }, [riskID, onRiskIdChange]);
    
    const navigate = useNavigate();
    
    // Initialize from sessionStorage if available for approval data
    const [selectedApproverId, setSelectedApproverId] = useState(() => {
        const savedData = sessionStorage.getItem(`risk_review_${riskID}`);
        if (savedData && riskID) {
            try {
                const parsedData = JSON.parse(savedData);
                console.log('Loaded saved review data from session storage:', parsedData);
                return parsedData.selectedApproverId || '';
            } catch (e) {
                console.error('Error parsing saved review data:', e);
            }
        }
        return '';
    });
    
    // Save review data to sessionStorage whenever it changes
    useEffect(() => {
        if (riskID) {
            sessionStorage.setItem(`risk_review_${riskID}`, JSON.stringify({
                selectedApproverId
            }));
        }
    }, [selectedApproverId, riskID]);
    
    const [canApproveRisk, setCanApproveRisk] = useState(false);
    const [isRetrying, setIsRetrying] = useState(false);
    const [treatmentPlanId, setTreatmentPlanId] = useState(null);
    const presentUser = useUser();
    const queryClient = useQueryClient();

    // queries
    const [likelihoodScoresQuery, impactScoresQuery, riskIdentificationQuery, riskAnalysisQuery, treatmentPlanQuery, riskApproversQuery, usersQuery, approvalStatusesQuery, followUpsQuery, riskEventsQuery] = useQueries({
        queries: [likelihoodScoresOptions(), impactScoresOptions(), riskIdentificationOptions(riskID), riskAnalysisOptions(riskID), riskTreatmentPlanOptions(treatmentPlanId || riskID), riskApproversOptions(riskID), usersOptions(), riskApprovalStatusesOptions(), riskFollowUpsOptions(riskID, {enabled: mode === 'standalone'}), riskEventsOptions(riskID, {enabled: mode === 'standalone'})]
    });

    // On initial load, check if we have a cached treatment plan ID
    useEffect(() => {
        // Try to get the cached treatment plan ID associated with this risk
        const cachedTreatmentPlanId = queryClient.getQueryData(['risks', riskID, 'treatment-plan-id']);
        if (cachedTreatmentPlanId && cachedTreatmentPlanId !== riskID) {
            if (SHOW_DEBUG_INFO) {
                console.log(`Found cached treatment plan ID (${cachedTreatmentPlanId}) for risk ID ${riskID}`);
            }
            setTreatmentPlanId(cachedTreatmentPlanId);
        }
    }, [riskID, queryClient]);

    useEffect(() => {
        const approvers = riskApproversQuery.data;
        if (approvers) {
            // Check if there are approvers and log for debugging
            console.log('Loaded approvers:', approvers);
            
            // Only set if there are approvers and the current value is empty
            if (approvers.length > 0) {
                // Make sure we're using the correct property for the user ID
                const firstApproverId = approvers[0].user_id;
                console.log('Setting selected approver ID to:', firstApproverId);
                setSelectedApproverId(firstApproverId);
            } else {
                console.log('No approvers found in data');
            }
        }

        if (mode === 'standalone' && approvers) {
            setCanApproveRisk(approvers.map(a => a.user_id).includes(presentUser.id));
        }
    }, [riskApproversQuery.data, mode, presentUser.id]);

    // Add retry logic for treatment plan data
    useEffect(() => {
        // If treatment plan query is completed but data is empty or incomplete
        if (!treatmentPlanQuery.isLoading && !treatmentPlanQuery.isFetching && 
            (!treatmentPlanQuery.data || Object.keys(treatmentPlanQuery.data).length === 0 || 
             !treatmentPlanQuery.data.risk_response)) {
            
            console.log('Treatment plan data is missing or incomplete, attempting to fetch with correct structure...');
            
            // Check if already retrying to avoid infinite loops
            if (!isRetrying) {
                setIsRetrying(true);
                
                const fetchData = async () => {
                    // Try direct API call to get the complete structure with control_details
                    try {
                        console.log(`Fetching complete treatment plan for risk ID ${riskID}`);
                        const response = await axios.get(`risk/risks/${riskID}/view/`);
                        
                        console.log('Complete risk data response:', response.data);
                        
                        // Check if response has the nested structure with control_details we need
                        if (response.data && response.data.control_details) {
                            console.log('Found control_details in risk data, using this for display');
                            
                            // Update the cache with the complete structure
                            queryClient.setQueryData(['risks', riskID, 'treatment-plans'], response.data);
                            
                            // Complete the retry
                            setIsRetrying(false);
                            return;
                        }
                        
                        // Try the direct treatment plan endpoint as fallback
                        const treatmentResponse = await axios.get(`risk/risk-treatment-plans/${riskID}/view/`);
                        console.log('Treatment plan direct fetch response:', treatmentResponse.data);
                        
                        if (treatmentResponse.data) {
                            // Make sure we update with the complete structure
                            queryClient.setQueryData(['risks', riskID, 'treatment-plans'], treatmentResponse.data);
                            setIsRetrying(false);
                            return;
                        }
                    } catch (error) {
                        console.error('Error fetching treatment plan data:', error);
                        setIsRetrying(false);
                    }
                };
                
                // Execute the fetch function
                fetchData();
            }
        } else {
            setIsRetrying(false);
        }
    }, [treatmentPlanQuery.data, treatmentPlanQuery.isLoading, treatmentPlanQuery.isFetching, riskID, queryClient, isRetrying]);

    // mutations
    const {isPending, mutate: updateWhoToApprove} = useUpdateWhoToApprove(riskID, {onSuccess, onError, onSettled});

    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        let text = 'Updating Who To Approve';
        (isPending) && dispatchMessage('processing', text);
    }, [isPending, dispatchMessage]);

    async function onSuccess(data) {
        await queryClient.invalidateQueries({queryKey: ['risks']});
        // Force a success message with a clear text even if the API doesn't return a message
        dispatchMessage('success', data.message || 'Approvers added successfully.');
    }
    
    function onError(error) {
        dispatchMessage('failed', error.response?.data?.message || 'An error occurred');
    }
    
    function onSettled(data, error) {
        // set newly created risk id and proceed to next step if successful
        if (!error && mode === 'form') {
            // Show an explicit success message first
            dispatchMessage('success', 'Approvers added successfully.');
            
            // Navigate immediately without delay
            console.log('Navigating to risk log (manage risk) page immediately');
            navigate('/risks');
        }
    }

    function handleEditClicked(section) {
        if (mode === 'form') {
            navigate(`/risks/register/${section}?id=${riskID}`);
        } else if (mode === 'standalone') {
            navigate(`update?section=${section}`);
        }
    }

    function handleSaveClicked() {
        // Add validation to check if an approver is selected
        if (!selectedApproverId) {
            dispatchMessage('failed', 'Please select an approver before saving');
            return;
        }
        
        // Show processing message
        dispatchMessage('processing', 'Updating Who To Approve');
        
        try {
            console.log('Selected approver ID:', selectedApproverId);
            console.log('Risk ID:', riskID);
            
            // Call the API but navigate immediately
            updateWhoToApprove({
                data: { 
                    user_ids: [selectedApproverId.toString()]
                },
                onSuccess: () => {
                    dispatchMessage('success', 'Approvers added successfully.');
                },
                onError: (error) => {
                    console.error('Error updating approvers:', error);
                    dispatchMessage('failed', error.response?.data?.message || 'Failed to update approvers');
                }
            });
            
            // For form mode, navigate immediately
            if (mode === 'form') {
                dispatchMessage('success', 'Approvers added successfully.');
                console.log('Navigating to risk log page immediately');
                navigate('/risks');
            }
        } catch (error) {
            console.error('Error in handleSaveClicked:', error);
            dispatchMessage('failed', 'Failed to update approver information: ' + (error.message || 'Unknown error'));
            
            // Even on error, navigate to risks page in form mode
            if (mode === 'form') {
                navigate('/risks');
            }
        }
    }

    function handleManualRefresh() {
        if (SHOW_DEBUG_INFO) {
            console.log('Manual refresh triggered by user');
        }
        // Reset retry state
        setIsRetrying(false);
        
        // Force refetch with the current treatment plan ID if available
        if (treatmentPlanId) {
            if (SHOW_DEBUG_INFO) {
                console.log(`Manual refresh using treatment plan ID: ${treatmentPlanId}`);
            }
            
            // Directly attempt to fetch from the treatment plan endpoint
            axios.get(`risk/risk-treatment-plans/${treatmentPlanId}/view/`)
                .then(response => {
                    if (SHOW_DEBUG_INFO) {
                        console.log('Manual refresh successful with treatment plan ID:', response.data);
                    }
                    
                    // Update the treatment plan data in the cache
                    const planData = response.data.control_details || response.data;
                    queryClient.setQueryData(['risks', riskID, 'treatment-plans'], planData);
                    
                    dispatchMessage('success', 'Data updated successfully');
                })
                .catch(error => {
                    console.error('Error in manual refresh:', error);
                    
                    // Force refetch all queries as fallback
                    queryClient.invalidateQueries(['risks', riskID, 'treatment-plans'], { force: true });
                    queryClient.invalidateQueries(['risks', riskID, 'identification'], { force: true });
                    queryClient.invalidateQueries(['risks', riskID, 'analysis'], { force: true });
                    
                    dispatchMessage('info', 'Refreshing data...');
                });
        } else {
            // Force refetch all queries
            queryClient.invalidateQueries(['risks', riskID, 'treatment-plans'], { force: true });
            queryClient.invalidateQueries(['risks', riskID, 'identification'], { force: true });
            queryClient.invalidateQueries(['risks', riskID, 'analysis'], { force: true });
            
            dispatchMessage('info', 'Refreshing data...');
        }
    }

    const indicators = [
        {
            name: 'Floor 12 personel', category: 'Financial', measure: 'Time', target: 12, threshold: 8, currentValues: [{current_value: 4, time_stamp: '12/2/2024, 9:45am', user: 'User'}, {current_value: 4, time_stamp: '12/2/2024, 9:45am', user: 'User'}, {current_value: 4, time_stamp: '12/2/2024, 9:45am', user: 'User'}], flag: 'Medium',
            description: 'Ultricies vel nibh. Sed volutpat lacus vitae gravida viverra. Fusce vel tempor elit. Proin tempus, magna id scelerisque vestibulum, nulla ex pharetra sapien, tempor posuere massa neque nec felis.', updateFrequency: 'Weekly', reportFrequency: 'Weekly', assignedResponsibility: 'Ibrahim'
        },
        {
            name: 'IT systems are unavailale', category: 'Operational', measure: 'Number', target: 12, threshold: 8, currentValues: [{current_value: 4, time_stamp: '12/2/2024, 9:45am', user: 'User'}, {current_value: 4, time_stamp: '12/2/2024, 9:45am', user: 'User'}, {current_value: 4, time_stamp: '12/2/2024, 9:45am', user: 'User'}], flag: 'Medium',
            description: 'Ultricies vel nibh. Sed volutpat lacus vitae gravida viverra. Fusce vel tempor elit. Proin tempus, magna id scelerisque vestibulum, nulla ex pharetra sapien, tempor posuere massa neque nec felis.', updateFrequency: 'Weekly', reportFrequency: 'Weekly', assignedResponsibility: 'Ibrahim'
        },
    ];

    const isLoading = likelihoodScoresQuery.isLoading || impactScoresQuery.isLoading || riskIdentificationQuery.isLoading || riskAnalysisQuery.isLoading || treatmentPlanQuery.isLoading || usersQuery.isLoading || riskApproversQuery.isLoading || approvalStatusesQuery.isLoading || followUpsQuery.isLoading || riskEventsQuery.isLoading;

    const error = likelihoodScoresQuery.error || impactScoresQuery.error || riskIdentificationQuery.error || riskAnalysisQuery.error || treatmentPlanQuery.error || usersQuery.error || riskApproversQuery.error || approvalStatusesQuery.error || followUpsQuery.error || riskEventsQuery.error;

    if (!riskID) return <div>No risk selected</div>
    
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-4">
                <div className="text-lg font-medium">Loading risk review data...</div>
                <div className="w-12 h-12 border-4 border-t-4 border-t-blue-500 border-gray-200 rounded-full animate-spin"></div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-4">
                <div className="text-lg font-medium text-red-600">Error loading risk data</div>
                <p className="text-gray-600">There was a problem loading the risk review data.</p>
                <button 
                    onClick={handleManualRefresh}
                    className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                >
                    Try Again
                </button>
            </div>
        );
    }

    // Get analysis data from API or sessionStorage
    function getAnalysisData() {
        console.log('Getting analysis data for review with risk ID:', riskID);
        
        // First try to get data from sessionStorage
        // This is the most reliable source for new risks
        try {
            const savedData = sessionStorage.getItem(`risk_analysis_${riskID}`);
            console.log('Session storage data available?', savedData ? 'Yes' : 'No');
            
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                console.log('Using session storage data for analysis:', parsedData);
                return parsedData;
            }
        } catch (e) {
            console.error('Error retrieving analysis data from sessionStorage:', e);
        }
        
        // Fallback to API data if sessionStorage is empty
        if (riskAnalysisQuery.data && Object.keys(riskAnalysisQuery.data).length > 0) {
            console.log('Using API data for analysis:', riskAnalysisQuery.data);
            return riskAnalysisQuery.data;
        }
        
        // Return empty object if nothing found
        console.log('No analysis data found, returning empty object');
        return {};
    }
    
    // Add a function to get treatment plan data from API or sessionStorage
    function getTreatmentPlanData() {
        // If API data exists, use that first
        if (treatmentPlanQuery.data && Object.keys(treatmentPlanQuery.data).length > 0) {
            const data = treatmentPlanQuery.data;
            
            // Log the retrieved data for debugging
            console.log('Treatment plan data from API:', data);
            
            // Check if the data has status information and standardize it
            if (!data.status && data.risk_approval_status) {
                // If status is missing but risk_approval_status exists, create a status object
                data.status = {
                    status: data.risk_approval_status,
                    id: data.risk_approval_status_id
                };
                console.log('Created status object from risk_approval_status:', data.status);
            }
            
            return data;
        }
        
        // Otherwise try to get from sessionStorage
        try {
            const savedData = sessionStorage.getItem(`risk_treatment_${riskID}`);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                console.log('Retrieved treatment plan data from sessionStorage:', parsedData);
                
                // Check if the data has status information and standardize it
                if (parsedData && !parsedData.status && parsedData.risk_approval_status) {
                    // If status is missing but risk_approval_status exists, create a status object
                    parsedData.status = {
                        status: parsedData.risk_approval_status,
                        id: parsedData.risk_approval_status_id
                    };
                    console.log('Created status object from risk_approval_status in sessionStorage data:', parsedData.status);
                }
                
                return parsedData;
            }
        } catch (e) {
            console.error('Error retrieving treatment plan data from sessionStorage:', e);
        }
        
        // Return empty object if nothing found
        return {};
    }

    // Update the variable declarations to use the new functions
    const likelihoodScores = likelihoodScoresQuery.data;
    const impactScores = impactScoresQuery.data;
    const riskIndentification = riskIdentificationQuery.data;
    const riskAnalysis = getAnalysisData();
    const treatmentPlan = getTreatmentPlanData();
    const approvalStatuses = approvalStatusesQuery.data;
    const followUps = followUpsQuery.data;
    const riskEvents = riskEventsQuery.data;
    const users = usersQuery.data?.map(u => ({id: u.user_id, text: (!u.firstname || !u.lastname) ? u.email : `${u.firstname} ${u.lastname}`})) || [];

    // Always log analysis and treatment plan data for debugging
    console.log('RiskReview - Risk Analysis data:', riskAnalysis);
    console.log('RiskReview - Analysis data keys:', Object.keys(riskAnalysis));
    console.log('RiskReview - Inherent scores:', {
        'inherent_likelihood_score': riskAnalysis.inherent_likelihood_score,
        'inherent_impact_score': riskAnalysis.inherent_impact_score,
        'inherent_risk_likelihood_score': riskAnalysis.inherent_risk_likelihood_score,
        'inherent_risk_impact_score': riskAnalysis.inherent_risk_impact_score,
    });
    console.log('RiskReview - Treatment Plan data:', treatmentPlan);

    // Check if treatment plan data appears to be missing or incomplete
    const isTreatmentPlanIncomplete = !treatmentPlan || Object.keys(treatmentPlan).length === 0 || !treatmentPlan.risk_response;

    // Check if we should show edit buttons based on readOnly prop
    const showEditButtons = !readOnly && !approvalMode;

    return (
        <div className='flex flex-col gap-6'>
            {isTreatmentPlanIncomplete && SHOW_DEBUG_INFO && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                Some treatment plan data appears to be missing. 
                                <button 
                                    className="ml-2 font-medium text-yellow-700 underline"
                                    onClick={handleManualRefresh}
                                >
                                    Refresh Data
                                </button>
                                <button 
                                    className="ml-2 font-medium text-blue-600 underline"
                                    onClick={() => handleEditClicked("treatment-plan")}
                                >
                                    Edit Treatment Plan
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            )}
            {isTreatmentPlanIncomplete && !SHOW_DEBUG_INFO && (
                <div className="flex justify-end mb-2">
                    <button 
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1 shadow-sm"
                        onClick={handleManualRefresh}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </div>
            )}
            <div className='flex flex-col gap-6'>
                <Section heading="Risk Details" button={showEditButtons ? {onClick: () => handleEditClicked("identification"), jsx: 'Edit'} : null}>
                    <DetailsContent details={riskIndentification} />
                </Section>
                <Section heading="Risk Analysis" button={showEditButtons ? {onClick: () => handleEditClicked("analysis"), jsx: 'Edit'} : null}>
                    {/* Debug data passed to AnalysisContent */}
                    {console.log("Passing to AnalysisContent:", {
                        hasData: riskAnalysis && Object.keys(riskAnalysis).length > 0,
                        data: riskAnalysis,
                        likelihoodScores: likelihoodScores,
                        impactScores: impactScores
                    })}
                    
                    {/* Show a debugging message for development if needed */}
                    {(riskAnalysis === null || Object.keys(riskAnalysis).length === 0) && (
                        <div className="text-amber-600 text-sm mb-2">
                            No risk analysis data found. Try refreshing or returning to the analysis step.
                        </div>
                    )}
                    
                    <AnalysisContent 
                        riskAnalysis={riskAnalysis} 
                        likelihoodScores={likelihoodScores} 
                        impactScores={impactScores} 
                    />
                </Section>
                <Section heading="Control Details" button={showEditButtons ? {onClick: () => handleEditClicked("treatment-plan"), jsx: 'Edit'} : null}>
                    {/* Log the treatment plan data for debugging */}
                    {console.log("Rendering ControlDetailsContent with data:", treatmentPlan)}
                    <ControlDetailsContent treatmentPlan={treatmentPlan} />
                </Section>
                {
                    mode === 'form' &&
                    <Section heading="Who To Approve">
                        <WhoToApproveContent users={users} selectedId={selectedApproverId} onSelectUser={setSelectedApproverId} />
                    </Section>
                }
                {
                    // the following content are only shown when the review is in view mode and not the fourth step of risk registration step
                    mode === 'standalone' &&
                    <>
                        <Section heading="Risk Events">
                            <RiskEventsContent riskEvents={riskEvents} />
                        </Section>
                        <Section heading="Risk Indicators">
                            <RiskIndicatorsTable indicators={indicators} />
                        </Section>
                        <Section heading="Follow Up History" >
                            <FollowUpHistoryContent followUps={followUps} />
                        </Section>
                        {/* Add debugging for approval data */}
                        {console.log('Debug - Treatment Plan Status Object:', treatmentPlan?.status)}
                        {console.log('Debug - Risk Approval Status:', treatmentPlan?.risk_approval_status)}
                        {console.log('Debug - Risk Approval Status ID:', treatmentPlan?.risk_approval_status_id)}
                        {console.log('Debug - Current Status being passed to ApprovalContent:', treatmentPlan?.status || 
                            (treatmentPlan?.risk_approval_status ? 
                                {status: treatmentPlan.risk_approval_status, id: treatmentPlan.risk_approval_status_id} : 
                                {}))}
                        {console.log('Debug - Available Approval Statuses:', approvalStatuses)}
                        <Section heading="Approval">
                            <ApprovalContent 
                                canApproveRisk={canApproveRisk || approvalMode} 
                                currentStatus={treatmentPlan?.status || 
                                    (treatmentPlan?.risk_approval_status ? 
                                        {status: treatmentPlan.risk_approval_status, id: treatmentPlan.risk_approval_status_id} : 
                                        {})} 
                                approvalStatuses={approvalStatuses} 
                                users={users} 
                            />
                            {/* Debug information for approval data */}
                            {SHOW_DEBUG_INFO && (
                                <div className="mt-4 p-4 border border-gray-300 rounded bg-gray-50">
                                    <h5 className="text-sm font-bold mb-2">Debug Info - Approval Data</h5>
                                    <div className="text-xs font-mono whitespace-pre-wrap">
                                        <p><strong>Treatment Plan Status:</strong> {JSON.stringify(treatmentPlan?.status || 'undefined')}</p>
                                        <p><strong>Risk Approval Status:</strong> {treatmentPlan?.risk_approval_status || 'undefined'}</p>
                                        <p><strong>Risk Approval Status ID:</strong> {treatmentPlan?.risk_approval_status_id || 'undefined'}</p>
                                        <p><strong>Current Status Object:</strong> {JSON.stringify(treatmentPlan?.status || 
                                            (treatmentPlan?.risk_approval_status ? 
                                                {status: treatmentPlan.risk_approval_status, id: treatmentPlan.risk_approval_status_id} : 
                                                {}), null, 2)}</p>
                                        <p><strong>Available Approval Statuses:</strong> {approvalStatuses ? approvalStatuses.length : 0} items</p>
                                        {approvalStatuses && approvalStatuses.length > 0 && (
                                            <div>
                                                <p>Status Options:</p>
                                                <ul>
                                                    {approvalStatuses.map((status, idx) => (
                                                        <li key={idx}>{status.id}: {status.status || status.name}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </Section>
                    </>
                }
            </div>
            {
                mode === 'form' &&
                <div className='flex gap-3'>
                    <FormCancelButton text={'Discard'} />
                    <FormCustomButton text={'Previous'} onClick={() => navigate(-1)} />
                    {/* <FormCustomButton text={'Save To Draft'} /> */}
                    <FormProceedButton text={'Save'} onClick={handleSaveClicked} />
                </div>
            }
            {
                mode === 'standalone' &&
                <div className='flex w-1/3'>
                    <FormCancelButton text={'Back'} />
                </div>
            }
        </div>
    )
}

export default RiskReview;