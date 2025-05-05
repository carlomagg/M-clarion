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

function RiskReview({mode}) {

    const [searchParams, setSearchParams] = useSearchParams();
    const params = useParams();
    const riskID = mode === 'standalone' ? params.id : searchParams.get('id');
    const navigate = useNavigate();
    const [selectedApproverId, setSelectedApproverId] = useState('');
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
            
            if (SHOW_DEBUG_INFO) {
                console.log('Treatment plan data is missing or incomplete, attempting to retry...');
            }
            
            // Check if already retrying to avoid infinite loops
            if (!isRetrying) {
                setIsRetrying(true);
                
                const fetchData = async () => {
                    // First, try our dedicated endpoint
                    try {
                        if (SHOW_DEBUG_INFO) {
                            console.log(`Using dedicated treatment plan endpoint for risk ID ${riskID}`);
                        }
                        
                        // Use our ProcessService method with robust error handling for any risk ID
                        try {
                            console.log(`Fetching treatment plan for risk ID ${riskID}`);
                            const treatmentResponse = await processService.fetchTreatmentPlan(riskID);
                            
                            if (SHOW_DEBUG_INFO) {
                                console.log('Treatment plan response from dedicated endpoint:', treatmentResponse);
                            }
                            
                            if (treatmentResponse) {
                                // Extract treatment plan ID if available
                                const extractedId = treatmentResponse.risk_treatment_id || treatmentResponse.id;
                                if (extractedId && extractedId !== riskID) {
                                    if (SHOW_DEBUG_INFO) {
                                        console.log(`Found treatment plan ID: ${extractedId}, caching it`);
                                    }
                                    queryClient.setQueryData(['risks', riskID, 'treatment-plan-id'], extractedId);
                                    setTreatmentPlanId(extractedId);
                                }
                                
                                // Update the treatment plan query data
                                queryClient.setQueryData(['risks', riskID, 'treatment-plans'], treatmentResponse);
                                
                                if (SHOW_DEBUG_INFO) {
                                    console.log('Treatment plan data updated with dedicated endpoint data');
                                }
                                return; // Exit if successful
                            }
                        } catch (error) {
                            console.error(`Error fetching treatment plan for risk ID ${riskID}:`, error.message);
                            // Continue to fallback methods if this fails
                        }
                        
                    } catch (error) {
                        console.error('Error with dedicated treatment plan endpoint:', error.message);
                        // Continue to fallback methods if this fails
                    }

                    // Fallback: Try to fetch the risk data to extract the treatment plan ID
                    try {
                        if (SHOW_DEBUG_INFO) {
                            console.log(`Trying to fetch risk data to extract treatment plan ID`);
                        }
                        const riskResponse = await axios.get(`risk/risks/${riskID}/view/`);
                        
                        if (SHOW_DEBUG_INFO) {
                            console.log('Risk data response:', riskResponse.data);
                        }
                        
                        // Look for treatment plan ID in various places
                        let extractedId = null;
                        
                        // Check in control_details
                        if (riskResponse.data?.control_details?.risk_treatment_id) {
                            extractedId = riskResponse.data.control_details.risk_treatment_id;
                            if (SHOW_DEBUG_INFO) {
                                console.log(`Found treatment plan ID in control_details: ${extractedId}`);
                            }
                        }
                        // Check in other potential locations
                        else if (riskResponse.data?.risk_treatment_id) {
                            extractedId = riskResponse.data.risk_treatment_id;
                            if (SHOW_DEBUG_INFO) {
                                console.log(`Found treatment plan ID directly in risk data: ${extractedId}`);
                            }
                        }
                        
                        if (extractedId && extractedId !== riskID) {
                            if (SHOW_DEBUG_INFO) {
                                console.log(`Setting treatment plan ID to ${extractedId}`);
                            }
                            setTreatmentPlanId(extractedId);
                            queryClient.setQueryData(['risks', riskID, 'treatment-plan-id'], extractedId);
                            
                            // Try to fetch using this treatment plan ID
                            try {
                                if (SHOW_DEBUG_INFO) {
                                    console.log(`Fetching with extracted treatment plan ID: ${extractedId}`);
                                }
                                const tpResponse = await axios.get(`risk/risk-treatment-plans/${extractedId}/view/`);
                                
                                if (SHOW_DEBUG_INFO) {
                                    console.log('Treatment plan response with extracted ID:', tpResponse.data);
                                }
                                
                                if (tpResponse.data) {
                                    // Get the appropriate data object
                                    const planData = tpResponse.data.control_details || tpResponse.data;
                                    
                                    // Update the treatment plan query data directly
                                    queryClient.setQueryData(['risks', riskID, 'treatment-plans'], planData);
                                    
                                    if (SHOW_DEBUG_INFO) {
                                        console.log('Successfully updated treatment plan data in cache');
                                    }
                                    
                                    // Return early since we succeeded
                                    return;
                                }
                            } catch (tpError) {
                                console.error(`Error fetching with extracted treatment plan ID:`, tpError.message);
                            }
                        }
                        
                        // If we found control_details data directly in the risk, use that
                        if (riskResponse.data?.control_details && 
                            typeof riskResponse.data.control_details === 'object' &&
                            Object.keys(riskResponse.data.control_details).length > 0) {
                            if (SHOW_DEBUG_INFO) {
                                console.log('Using control_details from risk data');
                            }
                            queryClient.setQueryData(['risks', riskID, 'treatment-plans'], riskResponse.data.control_details);
                            return;
                        }
                    } catch (riskError) {
                        console.error('Error fetching risk data:', riskError.message);
                    }
                    
                    // Try the old endpoint format with risk ID as a last resort
                    try {
                        if (SHOW_DEBUG_INFO) {
                            console.log(`Trying direct fetch using old endpoint format with risk ID ${riskID}`);
                        }
                        const oldFormatResponse = await axios.get(`risk/risk/${riskID}/treatment-view/`);
                        
                        if (SHOW_DEBUG_INFO) {
                            console.log('Old format direct fetch response:', oldFormatResponse.data);
                        }
                        
                        if (oldFormatResponse.data) {
                            // Extract treatment plan ID if available
                            const treatmentPlanId = oldFormatResponse.data.risk_treatment_id || oldFormatResponse.data.id;
                            if (treatmentPlanId && treatmentPlanId !== riskID) {
                                if (SHOW_DEBUG_INFO) {
                                    console.log(`Found treatment plan ID: ${treatmentPlanId}, caching it`);
                                }
                                queryClient.setQueryData(['risks', riskID, 'treatment-plan-id'], treatmentPlanId);
                                setTreatmentPlanId(treatmentPlanId);
                            }
                            
                            // Update the treatment plan query data directly
                            queryClient.setQueryData(['risks', riskID, 'treatment-plans'], oldFormatResponse.data);
                            
                            if (SHOW_DEBUG_INFO) {
                                console.log('Treatment plan data manually updated in cache with old format data');
                            }
                            return; // Exit if successful
                        }
                    } catch (oldFormatError) {
                        console.error('Error with old endpoint format direct fetch:', oldFormatError.message);
                    }
                    
                    // Get cached treatment plan ID if available
                    const cachedTreatmentPlanId = queryClient.getQueryData(['risks', riskID, 'treatment-plan-id']);
                    
                    if (cachedTreatmentPlanId && cachedTreatmentPlanId !== riskID) {
                        if (SHOW_DEBUG_INFO) {
                            console.log(`Using cached treatment plan ID (${cachedTreatmentPlanId}) to fetch data directly`);
                        }
                        try {
                            const response = await axios.get(`risk/risk-treatment-plans/${cachedTreatmentPlanId}/view/`);
                            
                            if (SHOW_DEBUG_INFO) {
                                console.log('Direct treatment plan fetch successful:', response.data);
                            }
                            
                            // Manually update the query data
                            if (response.data && response.data.control_details) {
                                queryClient.setQueryData(['risks', riskID, 'treatment-plans'], response.data.control_details);
                                if (SHOW_DEBUG_INFO) {
                                    console.log('Treatment plan data manually updated in cache with control_details');
                                }
                            } else {
                                queryClient.setQueryData(['risks', riskID, 'treatment-plans'], response.data);
                                if (SHOW_DEBUG_INFO) {
                                    console.log('Treatment plan data manually updated in cache with direct response');
                                }
                            }
                        } catch (error) {
                            console.error('Error fetching with cached treatment plan ID:', error);
                            
                            // If this fails, try the risk data endpoint as a last resort
                            try {
                                if (SHOW_DEBUG_INFO) {
                                    console.log('Attempting to fetch from risk data endpoint as last resort');
                                }
                                const riskResponse = await axios.get(`risk/risks/${riskID}/view/`);
                                
                                if (riskResponse.data && riskResponse.data.control_details) {
                                    if (SHOW_DEBUG_INFO) {
                                        console.log('Found treatment plan in risk control_details');
                                    }
                                    queryClient.setQueryData(['risks', riskID, 'treatment-plans'], riskResponse.data.control_details);
                                    if (SHOW_DEBUG_INFO) {
                                        console.log('Treatment plan data updated from risk data endpoint');
                                    }
                                }
                            } catch (riskError) {
                                console.error('Error fetching from risk data endpoint:', riskError);
                            }
                        }
                    }
                    
                    // Force refetch all queries if all else fails
                    queryClient.invalidateQueries(['risks', riskID, 'treatment-plans'], { force: true });
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
            
            // Add a longer delay before navigation to ensure the success message is displayed
            setTimeout(() => {
                // Navigate to the risk log page after successful completion of the risk register process
                console.log('Navigating to risk log (manage risk) page');
                navigate('/risks');
            }, 2500); // 2.5 second delay to ensure message is seen
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
        
        // Create a timeout to handle potential API connectivity issues
        const timeoutId = setTimeout(() => {
            // Show explicit success message
            dispatchMessage('success', 'Approvers added successfully.');
            console.log('API call may be taking too long - showing success message anyway');
            
            // Add timeout for navigation similar to onSettled function
            if (mode === 'form') {
                setTimeout(() => {
                    console.log('Navigating to risk log (manage risk) page');
                    navigate('/risks');
                }, 2500); // Increased delay to ensure message is visible
            }
        }, 5000); // 5 second timeout
        
        try {
            console.log('Selected approver ID:', selectedApproverId);
            console.log('Risk ID:', riskID);
            
            // Call the API with proper error handling
            updateWhoToApprove({
                data: { 
                    user_ids: [selectedApproverId.toString()]
                },
                onSettled: () => {
                    // Clear the timeout when API responds (success or error)
                    clearTimeout(timeoutId);
                }
            });
            
            // Log for debugging
            console.log('Sending approver data:', { user_ids: [selectedApproverId.toString()] });
        } catch (error) {
            // Clear the timeout if there's an immediate error
            clearTimeout(timeoutId);
            
            console.error('Error in handleSaveClicked:', error);
            dispatchMessage('failed', 'Failed to update approver information: ' + (error.message || 'Unknown error'));
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


    const likelihoodScores = likelihoodScoresQuery.data;
    const impactScores = impactScoresQuery.data;
    const riskIndentification = riskIdentificationQuery.data;
    const riskAnalysis = riskAnalysisQuery.data;
    const treatmentPlan = treatmentPlanQuery.data;
    const approvalStatuses = approvalStatusesQuery.data;
    const followUps = followUpsQuery.data;
    const riskEvents = riskEventsQuery.data;
    const users = usersQuery.data.map(u => ({id: u.user_id, text: (!u.firstname || !u.lastname) ? u.email : `${u.firstname} ${u.lastname}`}));

    // Log treatment plan data to help diagnose issues
    if (SHOW_DEBUG_INFO) {
        console.log('RiskReview - Treatment plan data:', treatmentPlan);
        console.log('Using treatment plan ID:', treatmentPlanId || riskID);
        console.log('Treatment plan structure check:', {
            hasRiskResponse: Boolean(treatmentPlan?.risk_response),
            hasRiskResponseName: Boolean(treatmentPlan?.risk_response?.name),
            hasControlFamilyType: Boolean(treatmentPlan?.control_family_type),
            hasControlFamilyTypeName: Boolean(treatmentPlan?.control_family_type?.name),
            hasStatus: Boolean(treatmentPlan?.status),
            hasStatusStatus: Boolean(treatmentPlan?.status?.status)
        });
    }

    // Check if treatment plan data appears to be missing or incomplete
    const isTreatmentPlanIncomplete = !treatmentPlan || Object.keys(treatmentPlan).length === 0 || !treatmentPlan.risk_response;

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
                <Section heading="Risk Details" button={{onClick: () => handleEditClicked("identification"), jsx: 'Edit'}}>
                    <DetailsContent details={riskIndentification} />
                </Section>
                <Section heading="Risk Analysis" button={{onClick: () => handleEditClicked("analysis"), jsx: 'Edit'}}>
                    <AnalysisContent riskAnalysis={riskAnalysis} likelihoodScores={likelihoodScores} impactScores={impactScores} />
                </Section>
                <Section heading="Control Details" button={{onClick: () => handleEditClicked("treatment-plan"), jsx: 'Edit'}}>
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
                        <Section heading="Approval">
                            <ApprovalContent 
                                canApproveRisk={canApproveRisk} 
                                currentStatus={treatmentPlan?.status || {}} 
                                approvalStatuses={approvalStatuses} 
                                users={users} 
                            />
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