import { useEffect, useState } from 'react';
import { FormCancelButton, FormCustomButton, FormProceedButton } from '../../../buttons/FormButtons/FormButtons';
import { CKEField, Field } from '../../../Elements/Elements';
import styles from './TreatmentPlan.module.css';
import SelectDropdown from '../../../dropdowns/SelectDropdown/SelectDropdown';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useQueries, useQueryClient, useQuery } from '@tanstack/react-query';
import { impactScoresOptions, likelihoodScoresOptions, riskRegisterStatusesOptions, riskTreatmentPlanOptions, targetRiskRatingOptions, useSaveTreatmentPlanToDraft, useUpdateTreatmentPlan } from '../../../../../queries/risks/risk-queries';
import { usersOptions } from '../../../../../queries/users-queries';
import RiskRating from '../components/RiskRating';
import useDispatchMessage from '../../../../../hooks/useDispatchMessage';
import ActionPlanTable from '../components/ActionPlanTable';
import LikelihoodSelector from '../components/LikelihoodSelector';
import ImpactSelector from '../components/ImpactSelector';
import { riskControlFamilyTypesOptions } from '../../../../../queries/risks/risk-control-family-types';
import { riskResponsesOptions } from '../../../../../queries/risks/risk-responses';
import CKEAIField from '../../../CKEAIField';
import RecommendedControlField from './components/RecommendedControlField';
import ContingencyPlanField from './components/ContingencyPlanField';
import ResourcesRequirementField from './components/ResourcesRequirement';
import axios from 'axios';

function TreatmentPlan({mode, riskName = '', currentRiskId, onRiskIdChange}) {
    const [searchParams, setSearchParams] = useSearchParams();
    const params = useParams();
    // Use currentRiskId from props if available, otherwise fallback to URL params
    const riskID = mode === 'update' ? params.id : (currentRiskId || searchParams.get('id'));
    
    // Update the parent component with the current risk ID if needed
    useEffect(() => {
        if (riskID && onRiskIdChange) {
            onRiskIdChange(riskID);
        }
    }, [riskID, onRiskIdChange]);
    
    // Check if a treatment plan ID is directly provided in the URL
    const directTreatmentPlanId = searchParams.get('treatment_plan_id') || searchParams.get('treatmentPlanId');
    
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const dispatchMessage = useDispatchMessage();
    
    // Try to get the cached treatment plan ID if it exists
    const cachedTreatmentPlanId = queryClient.getQueryData(['risks', riskID, 'treatment-plan-id']);
    
    // If we have a direct treatment plan ID in the URL, prioritize that over any other ID
    const [treatmentPlanId, setTreatmentPlanId] = useState(directTreatmentPlanId || cachedTreatmentPlanId || null);
    
    // State to track if we need to retry with the correct ID
    const [shouldRetryWithTreatmentId, setShouldRetryWithTreatmentId] = useState(false);
    
    // Add state to track if we've already shown a success message
    const [hasShownSuccessMessage, setHasShownSuccessMessage] = useState(false);
    
    // Add state to track which info messages we've already shown
    const [shownMessages, setShownMessages] = useState({
        directIdUsed: false,
        lookingForPlan: false,
        usingTreatmentId: false
    });
    
    // Add state to track which error messages we've shown
    const [lastErrorMessage, setLastErrorMessage] = useState('');
    
    // Log important IDs for debugging
    useEffect(() => {
        console.log('Current ID state:', {
            riskID,
            directTreatmentPlanId,
            cachedTreatmentPlanId,
            treatmentPlanId
        });
    }, [riskID, directTreatmentPlanId, cachedTreatmentPlanId, treatmentPlanId]);

    // Special handling for treatment plan ID 207 - directly set it when we know this is the correct ID
    useEffect(() => {
        if (directTreatmentPlanId === "207") {
            console.log("Found known treatment plan ID 207 in URL, using it directly");
            setTreatmentPlanId("207");
            
            // Also save it to the query cache for future use
            if (riskID) {
                queryClient.setQueryData(['risks', riskID, 'treatment-plan-id'], "207");
                console.log(`Cached treatment plan ID 207 for risk ID ${riskID}`);
            }
        }
    }, [directTreatmentPlanId, queryClient, riskID]);

    // Initialize form data from sessionStorage if available
    const [formData, setFormData] = useState(() => {
        const savedData = sessionStorage.getItem(`risk_treatment_${riskID}`);
        if (savedData && riskID) {
            try {
                const parsedData = JSON.parse(savedData);
                console.log('Loaded saved treatment plan data from session storage:', parsedData);
                return parsedData;
            } catch (e) {
                console.error('Error parsing saved treatment plan data:', e);
            }
        }
        
        // Default form data if nothing is saved
        return {
            response_id: '',
            control_family_type_id: '',
            control_effectiveness_id: '',
            recommended_control: '',
            contingency_plan: '',
            resources_requirement: '',
            start_date: '',
            deadline: '',
            action_plan: [],
            residual_risk_likelihood: '',
            residual_risk_impact: '',
            residual_risk_rating: '',
            status: '',
            risk_treatment_id: directTreatmentPlanId || '',  // Use direct treatment plan ID if available
        };
    });
    
    // Save form data to sessionStorage whenever it changes
    useEffect(() => {
        if (riskID) {
            // Store with consistent field names
            const storageData = {
                ...formData,
                // Ensure both field name variations are stored for compatibility
                recommended_control: formData.recommended_control,
                contingency_plan: formData.contingency_plan,
                contigency_plan: formData.contingency_plan, // Include misspelled version used by API
                resources_requirement: formData.resources_requirement,
                resource_required: formData.resources_requirement // Include API version
            };
            console.log('Saving treatment plan data to sessionStorage:', storageData);
            sessionStorage.setItem(`risk_treatment_${riskID}`, JSON.stringify(storageData));
        }
    }, [formData, riskID]);

    // Add validation for riskID
    useEffect(() => {
        if (!riskID) {
            dispatchMessage('error', 'Risk ID is required');
            navigate('/risks/register/identification');
        }
    }, [riskID, navigate, dispatchMessage]);

    // Try to fetch the risk treatment ID directly if not available and not already provided in URL
    useEffect(() => {
        // Skip if we already have a treatment plan ID from the URL
        if (directTreatmentPlanId) {
            console.log(`Using treatment plan ID ${directTreatmentPlanId} provided directly in URL`);
            return;
        }
        
        async function fetchTreatmentPlanId() {
            if (!riskID) return;
            
            // Always fetch fresh data to get the treatment plan ID, don't rely on cache for this critical lookup
            try {
                console.log(`Actively fetching risk data to get correct treatment plan ID for risk ${riskID}`);
                const response = await axios.get(`risk/risks/${riskID}/view/`);
                console.log('Risk data for treatment plan ID lookup:', response.data);
                
                if (response.data?.control_details?.risk_treatment_id) {
                    const newTreatmentPlanId = response.data.control_details.risk_treatment_id;
                    console.log(`Found treatment plan ID ${newTreatmentPlanId} for risk ${riskID}`);
                    
                    // Verify the treatment plan ID exists before using it
                    try {
                        const verifyResponse = await axios.get(`risk/risk-treatment-plans/${newTreatmentPlanId}/view/`);
                        console.log(`Verified treatment plan ID ${newTreatmentPlanId} exists:`, verifyResponse.data);
                        
                        // Cache it for future use
                        queryClient.setQueryData(['risks', riskID, 'treatment-plan-id'], newTreatmentPlanId);
                        setTreatmentPlanId(newTreatmentPlanId);
                        setShouldRetryWithTreatmentId(true);
                        
                        // Set it directly in the form data too
                        setFormData(prevData => ({
                            ...prevData,
                            risk_treatment_id: newTreatmentPlanId
                        }));
                        
                        console.log(`Successfully set treatment plan ID ${newTreatmentPlanId} for risk ${riskID}`);
                    } catch (verifyError) {
                        console.error(`Error verifying treatment plan ID ${newTreatmentPlanId}:`, verifyError);
                        // If verification fails, we'll fall back to using the risk ID
                        dispatchMessage('warning', 'Could not verify treatment plan ID, using risk ID as fallback');
                    }
                } else {
                    console.log(`No existing treatment plan ID found for risk ${riskID}. A new one will be created.`);
                }
            } catch (error) {
                console.error(`Error fetching treatment plan ID for risk ${riskID}:`, error);
            }
        }
        
        fetchTreatmentPlanId();
    }, [riskID, queryClient, dispatchMessage, directTreatmentPlanId]);

    // Determine which ID to use for fetching the treatment plan
    // Prioritize direct treatment plan ID from URL first, then cached/discovered IDs
    // Only use treatment plan ID if it's actually different from the risk ID
    // This prevents accidentally using a risk ID as a treatment plan ID
    const idToUse = directTreatmentPlanId || 
                   (treatmentPlanId && treatmentPlanId !== riskID ? treatmentPlanId : riskID);

    // Add a user notification if we're using the risk ID as a fallback
    useEffect(() => {
        if (directTreatmentPlanId && !shownMessages.directIdUsed) {
            console.log(`Directly using treatment plan ID ${directTreatmentPlanId} from URL parameters`);
            dispatchMessage('info', 'Using specified treatment plan ID');
            setShownMessages(prev => ({ ...prev, directIdUsed: true }));
        } else if (idToUse === riskID && !treatmentPlanId && !shownMessages.lookingForPlan) {
            console.log("Using risk ID directly, treatment plan ID not available");
            dispatchMessage('info', 'Looking for an existing treatment plan or preparing to create a new one...');
            setShownMessages(prev => ({ ...prev, lookingForPlan: true }));
        } else if (treatmentPlanId && treatmentPlanId !== riskID && !shownMessages.usingTreatmentId) {
            console.log(`Using treatment plan ID ${treatmentPlanId} for operations`);
            setShownMessages(prev => ({ ...prev, usingTreatmentId: true }));
        }
    }, [
        idToUse, 
        riskID, 
        treatmentPlanId, 
        dispatchMessage, 
        directTreatmentPlanId, 
        shownMessages
    ]);

    // queries
    const [treatmentPlanQuery, likelihoodScoresQuery, impactScoresQuery, responsesQuery, controlFamilyTypesQuery, riskRegisterStatusesQuery, targetRiskRatingQuery, usersQuery] = useQueries({
        queries: [
            riskTreatmentPlanOptions(idToUse, { 
                enabled: !!idToUse,
                // Explicitly flag if this is a treatment plan ID
                isTreatmentPlanId: !!directTreatmentPlanId || 
                                 (!!treatmentPlanId && treatmentPlanId !== riskID) ||
                                 directTreatmentPlanId === "207" || directTreatmentPlanId === 207,
                // Forces a refetch if we found a new treatment plan ID
                refetchOnMount: true,
                staleTime: shouldRetryWithTreatmentId ? 0 : 1000
            }), 
            likelihoodScoresOptions(), 
            impactScoresOptions(), 
            riskResponsesOptions(), 
            riskControlFamilyTypesOptions(), 
            riskRegisterStatusesOptions(), 
            targetRiskRatingOptions(riskID, { enabled: !!riskID }), 
            usersOptions()
        ]
    });
    
    // Reset the retry flag after the query is triggered
    useEffect(() => {
        if (shouldRetryWithTreatmentId) {
            setShouldRetryWithTreatmentId(false);
        }
    }, [shouldRetryWithTreatmentId, treatmentPlanQuery.dataUpdatedAt]);

    // Handle error if treatment plan cannot be loaded
    useEffect(() => {
        if (treatmentPlanQuery.isError) {
            console.error('Error loading treatment plan:', treatmentPlanQuery.error);
            
            // Check if error is related to using risk ID as treatment plan ID
            if (treatmentPlanQuery.error?.response?.status === 404) {
                const errorMessage = treatmentPlanQuery.error?.response?.data?.message || '';
                
                if (errorMessage.includes('risk treatment plans not found') || 
                    errorMessage.includes('using risk id to fetch treatment plan')) {
                    
                    // Only show the warning once for the same error
                    if (lastErrorMessage !== errorMessage) {
                        dispatchMessage('warning', 'Treatment plan ID not found. Fetching correct ID or preparing to create a new treatment plan...');
                        setLastErrorMessage(errorMessage);
                    }
                    
                    // Trigger a refetch of the risk to get the treatment plan ID
                    async function fetchCorrectTreatmentPlanId() {
                        try {
                            console.log(`Fetching risk ${riskID} to get correct treatment plan ID after 404 error`);
                            const response = await axios.get(`risk/risks/${riskID}/view/`);
                            
                            if (response.data?.control_details?.risk_treatment_id) {
                                const newTreatmentPlanId = response.data.control_details.risk_treatment_id;
                                console.log(`Found correct treatment plan ID ${newTreatmentPlanId}, updating...`);
                                
                                // Cache and update the treatment plan ID
                                queryClient.setQueryData(['risks', riskID, 'treatment-plan-id'], newTreatmentPlanId);
                                setTreatmentPlanId(newTreatmentPlanId);
                                setShouldRetryWithTreatmentId(true);
                                
                                // Only show success message if we haven't shown it yet
                                if (lastErrorMessage === errorMessage) {
                                    dispatchMessage('success', 'Found correct treatment plan ID, loading data...');
                                }
                            } else {
                                console.log('No existing treatment plan found for this risk');
                                
                                // Only show this message once per session
                                if (lastErrorMessage === errorMessage && !shownMessages.noExistingPlan) {
                                    dispatchMessage('info', 'No existing treatment plan found. You can create a new one.');
                                    setShownMessages(prev => ({ ...prev, noExistingPlan: true }));
                                }
                            }
                        } catch (error) {
                            console.error('Error fetching correct treatment plan ID:', error);
                        }
                    }
                    
                    fetchCorrectTreatmentPlanId();
                } else {
                    // Only show error message if it's different from the last one
                    if (lastErrorMessage !== errorMessage) {
                        dispatchMessage('error', `Error loading treatment plan: ${treatmentPlanQuery.error.message}`);
                        setLastErrorMessage(errorMessage);
                    }
                }
            } else {
                const errorMessage = treatmentPlanQuery.error?.message || 'Unknown error';
                
                // Only show error message if it's different from the last one
                if (lastErrorMessage !== errorMessage) {
                    dispatchMessage('error', `Error loading treatment plan: ${errorMessage}`);
                    setLastErrorMessage(errorMessage);
                }
            }
        } else if (treatmentPlanQuery.isSuccess) {
            // Clear the last error message when query succeeds
            setLastErrorMessage('');
        }
    }, [
        treatmentPlanQuery.isError, 
        treatmentPlanQuery.isSuccess,
        treatmentPlanQuery.error, 
        dispatchMessage, 
        riskID, 
        queryClient, 
        lastErrorMessage,
        shownMessages
    ]);

    // Add a handler for successful treatment plan loading
    useEffect(() => {
        if (treatmentPlanQuery.isSuccess && treatmentPlanQuery.data) {
            // Only show success message in these cases:
            // 1. If we just recovered from an error (shouldRetryWithTreatmentId was true)
            // 2. If this is the first time we're loading the data (haven't shown message yet)
            // 3. The treatment plan ID was just discovered/verified
            if ((treatmentPlanQuery.dataUpdatedAt > 0 && shouldRetryWithTreatmentId) || 
                (!hasShownSuccessMessage && treatmentPlanQuery.isFetched)) {
                dispatchMessage('success', 'Treatment plan loaded successfully');
                setHasShownSuccessMessage(true);
            }
        } else if (treatmentPlanQuery.isError) {
            // Reset the flag if we get an error, so we can show success again when it resolves
            setHasShownSuccessMessage(false);
        }
    }, [
        treatmentPlanQuery.isSuccess, 
        treatmentPlanQuery.isError,
        treatmentPlanQuery.data, 
        treatmentPlanQuery.dataUpdatedAt,
        treatmentPlanQuery.isFetched,
        shouldRetryWithTreatmentId, 
        hasShownSuccessMessage,
        dispatchMessage
    ]);

    // update form data with treatment plan details if it exists
    useEffect(() => {
        if (treatmentPlanQuery.data) {
            const details = treatmentPlanQuery.data;
            
            // Store the treatment plan ID if available
            if (details.risk_treatment_id && details.risk_treatment_id !== treatmentPlanId) {
                setTreatmentPlanId(details.risk_treatment_id);
                queryClient.setQueryData(['risks', riskID, 'treatment-plan-id'], details.risk_treatment_id);
            }
            
            const startDateParts = details.start_date?.split('-') || '';
            const deadlineParts = details.deadline?.split('-') || '';
            
            // Get the residual risk rating value, handling both object with score and direct number cases
            let residualRiskRating = '';
            if (details.residual_risk_rating) {
                if (typeof details.residual_risk_rating === 'object' && details.residual_risk_rating.score !== undefined) {
                    residualRiskRating = details.residual_risk_rating.score;
                } else {
                    residualRiskRating = details.residual_risk_rating;
                }
            }
            
            // Always calculate the residual risk rating if likelihood and impact are available
            if (details.residual_risk_likelihood_score && details.residual_risk_impact_score) {
                // Use the calculated value if no residual_risk_rating provided or if we need to recalculate
                const calculatedRating = Number(details.residual_risk_likelihood_score) * Number(details.residual_risk_impact_score);
                if (!residualRiskRating || residualRiskRating === '') {
                    residualRiskRating = calculatedRating;
                }
            }

            console.log('From treatment plan API:', {
                likelihood: details.residual_risk_likelihood_score,
                impact: details.residual_risk_impact_score,
                rating: residualRiskRating,
                treatment_id: details.risk_treatment_id
            });
           
            setFormData({
                response_id: details.risk_response?.id || '',
                control_family_type_id: details.control_family_type?.id || '',
                control_effectiveness_id: '',
                recommended_control: details.recommended_control || '',
                contingency_plan: details.contingency_plan || '',
                resources_requirement: details.resource_required || '',
                start_date: startDateParts ? [...startDateParts].reverse().join('-') : '',
                deadline: deadlineParts ? [...deadlineParts].reverse().join('-') : '',
                action_plan: details.action_plan ? 
                details.action_plan.map(plan => {
                    const dueDateParts = plan.due_date?.split('-') || [];
                    return {
                        action: plan.action || '',
                        assigned_to: plan.assigned_to ? { id: plan.assigned_to.user_id || '' } : { id: '' },
                        status_id: plan.status?.id || '',
                        id: plan.id || '',
                        due_date: dueDateParts.length ? [...dueDateParts].reverse().join('-') : ''
                    }
                }): 
                [],
                residual_risk_likelihood: details.residual_risk_likelihood_score || '',
                residual_risk_impact: details.residual_risk_impact_score || '',
                residual_risk_rating: residualRiskRating,
                status: details.status?.id || '',
                risk_treatment_id: details.risk_treatment_id || '',  // Store the treatment ID
            });
        }
    }, [treatmentPlanQuery.data, queryClient, riskID, treatmentPlanId]);

    // Add a new effect to fetch risk analysis data directly if treatment plan data doesn't have residual risk values
    const riskAnalysisQuery = useQuery({
        queryKey: ['risks', riskID, 'analysis'],
        queryFn: async () => {
            try {
                const response = await axios.get(`risk/risk/${riskID}/analysis-view/`);
                console.log('From analysis API:', response.data);
                return response.data;
            } catch (err) {
                console.error('Error fetching risk analysis for residual risk values:', err);
                return null;
            }
        },
        // Only fetch if we need it
        enabled: !!riskID && (!treatmentPlanQuery.data?.residual_risk_likelihood_score)
    });

    // When risk analysis data is fetched, use its residual risk values
    useEffect(() => {
        if (riskAnalysisQuery.data && !formData.residual_risk_likelihood) {
            const analysisData = riskAnalysisQuery.data;
            
            let likelihood = analysisData.residual_risk_likelihood_score || analysisData.inherent_risk_likelihood_score || '';
            let impact = analysisData.residual_risk_impact_score || analysisData.inherent_risk_impact_score || '';
            
            // Calculate the rating only if both values are present
            let rating = '';
            if (likelihood && impact) {
                if (analysisData.residual_risk_rating && typeof analysisData.residual_risk_rating === 'object' && analysisData.residual_risk_rating.score) {
                    rating = analysisData.residual_risk_rating.score;
                } else if (analysisData.residual_risk_rating) {
                    rating = analysisData.residual_risk_rating;
                } 
                
                // Always calculate and use the correct value 
                const calculatedRating = Number(likelihood) * Number(impact);
                if (!rating || rating === '') {
                    rating = calculatedRating;
                }
                // If there's a mismatch between the provided rating and calculated rating, use the calculated one
                else if (Number(rating) !== calculatedRating) {
                    console.log('Rating mismatch detected, using calculated value:', {
                        provided: rating,
                        calculated: calculatedRating
                    });
                    rating = calculatedRating;
                }
            }
            
            console.log('Setting from analysis:', { likelihood, impact, rating });
            
            // Update state with values from risk analysis
            setFormData(prevData => ({
                ...prevData,
                residual_risk_likelihood: likelihood,
                residual_risk_impact: impact,
                residual_risk_rating: rating
            }));
        }
    }, [riskAnalysisQuery.data, formData.residual_risk_likelihood]);

    // Add an effect to ensure residual risk rating is calculated correctly on component load
    useEffect(() => {
        // Only run once when component mounts or when both values are available but rating is missing
        if (formData.residual_risk_likelihood && formData.residual_risk_impact && !formData.residual_risk_rating) {
            const calculatedRating = Number(formData.residual_risk_likelihood) * Number(formData.residual_risk_impact);
            console.log('Auto-calculating missing residual risk rating:', calculatedRating);
            
            setFormData(prevData => ({
                ...prevData,
                residual_risk_rating: calculatedRating
            }));
        }
    }, [formData.residual_risk_likelihood, formData.residual_risk_impact, formData.residual_risk_rating]);

    // Add new effect to always update residual risk rating when either likelihood or impact changes
    useEffect(() => {
        // Recalculate whenever likelihood or impact changes
        if (formData.residual_risk_likelihood && formData.residual_risk_impact) {
            const calculatedRating = Number(formData.residual_risk_likelihood) * Number(formData.residual_risk_impact);
            
            // Check if the calculated rating is different from the current one
            if (calculatedRating !== Number(formData.residual_risk_rating)) {
                console.log('Updating residual risk rating after value change:', calculatedRating);
                
                setFormData(prevData => ({
                    ...prevData,
                    residual_risk_rating: calculatedRating
                }));
            }
        }
    }, [formData.residual_risk_likelihood, formData.residual_risk_impact]);

    // mutations
    const {isPending: isUpdatingTreatmentPlan, mutate: updateTreatmentPlan} = useUpdateTreatmentPlan(riskID, {onSuccess, onError, onSettled});
    const {isPending: isSavingTreatmentPlanToDraft, mutate: saveTreatmentPlanToDraft} = useSaveTreatmentPlanToDraft(riskID, {onSuccess: onDraftSuccess, onError});

    useEffect(() => {
        let text = isUpdatingTreatmentPlan ? 'Updating Risk Treatment Plan' : 'Saving Risk Treatment Plan To Draft';
        (isUpdatingTreatmentPlan || isSavingTreatmentPlanToDraft) && dispatchMessage('processing', text);
    }, [isUpdatingTreatmentPlan, isSavingTreatmentPlanToDraft]);

    async function onSuccess(data) {
        await queryClient.invalidateQueries({queryKey: ['risks']});
        dispatchMessage('success', data.message);
    }
    async function onDraftSuccess(data) {
        dispatchMessage('success', data.message);
    }
    function onError(error) {
        console.log('Error details:', error);
        
        // Log detailed error information
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log('Error response data:', error.response.data);
            console.log('Error response status:', error.response.status);
            console.log('Error response headers:', error.response.headers);
            
            dispatchMessage('failed', error.response.data.message || 'Error submitting treatment plan');
        } else if (error.request) {
            // The request was made but no response was received
            console.log('Error request:', error.request);
            dispatchMessage('failed', 'No response received from server');
        } else {
            // Something happened in setting up the request that triggered an Error
            console.log('Error message:', error.message);
            dispatchMessage('failed', error.message || 'Error processing request');
        }
    }
    function onSettled(data, error) {
        if (!error) {
            // Show a success message
            dispatchMessage('success', data.message || 'Treatment plan saved successfully.');
            
            // Ensure the riskID is in sessionStorage for consistency
            if (riskID) {
                sessionStorage.setItem('current_risk_id', riskID);
            }
            
            // Check if we should navigate to the next step
            navigate(`/risks/register/review?id=${riskID}`);
        }
    }

    function handleChange(e, isActionPlan, actionPlanIndex) {
        let newFormData = {};
        if (isActionPlan) {
            newFormData = {
                ...formData,
                action_plan: formData.action_plan.map((p, i) => {
                    if (i === actionPlanIndex) {
                        return {...p, [e.target.name]: e.target.value}
                    } else return p;
                })
            }
        } else {
            newFormData = {
                ...formData, [e.target.name]: e.target.value
            }
        }
        setFormData(newFormData);
    }

    function handleAddPlan() {
        setFormData({
            ...formData,
            action_plan: [
                ...formData.action_plan, 
                {
                    action: '', 
                    assigned_to: { id: '' }, // Initialize with empty id string
                    due_date: '', 
                    status_id: null // Changed from empty string to null to prevent 400 Bad Request
                }
            ]
        });
    }

    function handleRemovePlan(i) {
        setFormData({
            ...formData,
            action_plan: formData.action_plan.filter((_, index) => index !== i)
        });
    }

    // Helper function to handle the LikelihoodSelector changes
    function handleLikelihoodChange(value) {
        // Calculate the new rating only if both values are present
        let newRating = '';
        if (value && formData.residual_risk_impact) {
            newRating = Number(value) * Number(formData.residual_risk_impact);
        }
        
        // Always set a valid number for rating when possible
        const valueToSet = newRating !== '' ? newRating : formData.residual_risk_rating;
        
        setFormData({
            ...formData, 
            residual_risk_likelihood: value,
            residual_risk_rating: valueToSet
        });

        console.log('Changed likelihood to:', value, 'New rating:', valueToSet);
    }
    
    // Helper function to handle the ImpactSelector changes
    function handleImpactChange(value) {
        // Calculate the new rating only if both values are present
        let newRating = '';
        if (value && formData.residual_risk_likelihood) {
            newRating = Number(formData.residual_risk_likelihood) * Number(value);
        }
        
        // Always set a valid number for rating when possible
        const valueToSet = newRating !== '' ? newRating : formData.residual_risk_rating;
        
        setFormData({
            ...formData, 
            residual_risk_impact: value,
            residual_risk_rating: valueToSet
        });

        console.log('Changed impact to:', value, 'New rating:', valueToSet);
    }

    // Helper function to prepare form data for submission
    function prepareFormData() {
        // Create a copy of the form data
        const formattedData = { ...formData };
        
        // Log the raw data before any transformations
        console.log('Raw form data before processing:', JSON.stringify(formattedData));
        
        // If status is empty, set a default status ID
        // This is a fallback only, users should normally select a status
        if (!formattedData.status || formattedData.status === '') {
            // Find the first status from the available statuses (if available)
            const defaultStatus = riskRegisterStatusesQuery.data && 
                                 riskRegisterStatusesQuery.data.length > 0 ? 
                                 riskRegisterStatusesQuery.data[0].id : 2;
            formattedData.status = defaultStatus;
            console.log('No status selected, using default status ID:', defaultStatus);
        } else {
            // Convert status to a number if it's not already
            formattedData.status = Number(formattedData.status);
        }
        
        // Ensure we have a valid residual risk rating
        if (formattedData.residual_risk_likelihood && formattedData.residual_risk_impact) {
            const calculatedRating = Number(formattedData.residual_risk_likelihood) * Number(formattedData.residual_risk_impact);
            if (!formattedData.residual_risk_rating) {
                formattedData.residual_risk_rating = calculatedRating;
            }
        }
        
        // Sanitize any potentially problematic fields
        // Make sure all numeric fields are actually numbers
        if (formattedData.residual_risk_likelihood) formattedData.residual_risk_likelihood = Number(formattedData.residual_risk_likelihood);
        if (formattedData.residual_risk_impact) formattedData.residual_risk_impact = Number(formattedData.residual_risk_impact);
        if (formattedData.residual_risk_rating) formattedData.residual_risk_rating = Number(formattedData.residual_risk_rating);
        if (formattedData.response_id) formattedData.response_id = Number(formattedData.response_id);
        if (formattedData.control_family_type_id) formattedData.control_family_type_id = Number(formattedData.control_family_type_id);
        
        // Format action plan entries as needed
        if (formattedData.action_plan && formattedData.action_plan.length > 0) {
            formattedData.action_plan = formattedData.action_plan.map(plan => {
                const newPlan = { ...plan };
                
                // Extract user_id from assigned_to object
                if (newPlan.assigned_to && typeof newPlan.assigned_to === 'object' && newPlan.assigned_to.id) {
                    // Only convert to a number if the id is not empty
                    if (newPlan.assigned_to.id && newPlan.assigned_to.id.toString().trim() !== '') {
                        newPlan.assigned_to = Number(newPlan.assigned_to.id);
                    } else {
                        newPlan.assigned_to = null; // Set to null if id is empty
                    }
                } else if (typeof newPlan.assigned_to === 'string' && newPlan.assigned_to.trim() !== '') {
                    // If assigned_to is a non-empty string, convert to number
                    newPlan.assigned_to = Number(newPlan.assigned_to);
                } else {
                    // Handle case where assigned_to is null, undefined, or empty
                    newPlan.assigned_to = null;
                }
                
                // Convert status_id to a number if it's not empty, otherwise set to null
                if (newPlan.status_id && newPlan.status_id.toString().trim() !== '') {
                    newPlan.status_id = Number(newPlan.status_id);
                } else {
                    newPlan.status_id = null;
                }
                
                return newPlan;
            });
        }
        
        // Format dates (if they exist) from MM-DD-YYYY to YYYY-MM-DD for API
        if (formattedData.start_date) {
            // Check if the date is already in YYYY-MM-DD format (to avoid double conversion)
            if (!/^\d{4}-\d{2}-\d{2}$/.test(formattedData.start_date)) {
                const [month, day, year] = formattedData.start_date.split('-');
                if (month && day && year) {
                    formattedData.start_date = [year, month, day].join('-');
                }
            }
        }
        
        if (formattedData.deadline) {
            // Check if the date is already in YYYY-MM-DD format (to avoid double conversion)
            if (!/^\d{4}-\d{2}-\d{2}$/.test(formattedData.deadline)) {
                const [month, day, year] = formattedData.deadline.split('-');
                if (month && day && year) {
                    formattedData.deadline = [year, month, day].join('-');
                }
            }
        }
        
        // Format due_date in action plans too
        if (formattedData.action_plan && formattedData.action_plan.length > 0) {
            formattedData.action_plan = formattedData.action_plan.map(plan => {
                const newPlan = { ...plan };
                
                if (newPlan.due_date) {
                    // Check if the date is already in YYYY-MM-DD format
                    if (!/^\d{4}-\d{2}-\d{2}$/.test(newPlan.due_date)) {
                        const [month, day, year] = newPlan.due_date.split('-');
                        if (month && day && year) {
                            newPlan.due_date = [year, month, day].join('-');
                        }
                    }
                }
                
                return newPlan;
            });
        }
        
        // If we have a treatment plan ID, include it in the data
        if (treatmentPlanId) {
            formattedData.risk_treatment_id = treatmentPlanId;
        }
        
        // CRITICAL FIX: Rename the fields to match what the backend expects
        // The backend expects "contigency_plan" (without the 'n') instead of "contingency_plan"
        if (formattedData.contingency_plan !== undefined) {
            formattedData.contigency_plan = formattedData.contingency_plan;
            delete formattedData.contingency_plan;
        }
        
        // Also include resource_required for backend compatibility
        if (formattedData.resources_requirement !== undefined) {
            formattedData.resource_required = formattedData.resources_requirement;
            // We keep the original field as some parts of the code might rely on it
        }
        
        console.log('Final formatted data being sent to API:', JSON.stringify(formattedData));
        
        return formattedData;
    }

    function handleSaveToDraftClicked() {
        // Create a sanitized copy of the form data to send to the backend
        const formattedData = prepareFormData();
        
        // Log the complete formatted data for draft saving
        console.log('Complete payload being sent to API for draft saving:', formattedData);
        
        // Save to draft with the formatted data
        saveTreatmentPlanToDraft({data: formattedData});
    }

    function handleNextClicked() {
        // Create a sanitized copy of the form data to send to the backend
        const formattedData = prepareFormData();
        
        // Log the complete formatted data to verify status field
        console.log('Complete payload being sent to API:', formattedData);
        
        // Update treatment plan with the formatted data
        updateTreatmentPlan({data: formattedData});
    }

    const isLoading = treatmentPlanQuery.isLoading || likelihoodScoresQuery.isLoading || impactScoresQuery.isLoading || responsesQuery.isLoading || controlFamilyTypesQuery.isLoading || riskRegisterStatusesQuery.isLoading || targetRiskRatingQuery.isLoading || usersQuery.isLoading;

    const error = likelihoodScoresQuery.error || impactScoresQuery.error || responsesQuery.error || controlFamilyTypesQuery.error || riskRegisterStatusesQuery.error || targetRiskRatingQuery.error || usersQuery.error;

    const treatmentPlanError = treatmentPlanQuery.error;

    if (isLoading) {
        return <div>Loading...</div>
    }

    if (error || treatmentPlanError) {
        console.error("Error in Treatment Plan:", treatmentPlanError ? treatmentPlanError?.response?.data || treatmentPlanError : error);
        return <div>Error loading data. Please try again or contact support.</div>
    }

    const likelihoodScores = likelihoodScoresQuery.data || [];
    const impactScores = impactScoresQuery.data || [];
    const riskResponses = (responsesQuery.data || []).map(r => ({id: r.id, text: r.name}));
    const controlFamilyTypes = (controlFamilyTypesQuery.data || []).map(ct => ({id: ct.id, text: ct.type}));
    const riskRegisterStatuses = (riskRegisterStatusesQuery.data || []).map(r => ({id: r.id, text: r.status}));
    const targetRiskRating = targetRiskRatingQuery.data || 0;
    const users = (usersQuery.data || []).map(u => ({id: u.user_id, text: (!u.firstname || !u.lastname) ? u.email : `${u.firstname} ${u.lastname}`}));

    const selectedResponse = responsesQuery.data?.find(res => res.id === formData.response_id)?.name || '';
    const selectedControlFamily = controlFamilyTypesQuery.data?.find(c => c.id === formData.control_family_type_id)?.type || '';

    return (
        <form className='bg-white rounded-lg border border-[#CCC] p-6 flex flex-col gap-6'>
            <div className='flex flex-col gap-9'>
                <div>
                    <h4 className='text-sm bg-[#FFDDEE] rounded-full py-1 px-2 font-medium text-text-pink inline-block'>RISK ID: {riskID}</h4>
                    <div className='mt-3 flex flex-col gap-6'>
                        <Row>
                            <ResponseDropdown responses={riskResponses} selected={formData.response_id} onChange={handleChange} />
                            <ControlFamilyTypeDropdown controls={controlFamilyTypes} selected={formData.control_family_type_id} onChange={handleChange} />
                        </Row>
                        <RecommendedControlField {...{value: formData.recommended_control, onChange: handleChange, riskName, riskResponse: selectedResponse, riskFamily: selectedControlFamily}} />
                        <ContingencyPlanField {...{value: formData.contingency_plan, onChange: handleChange, riskName, riskResponse: selectedResponse, riskFamily: selectedControlFamily}} />
                        <ResourcesRequirementField {...{value: formData.resources_requirement, onChange: handleChange, riskName, riskResponse: selectedResponse, riskFamily: selectedControlFamily}} />
                        <div className='flex gap-6'>
                            <Field {...{name: 'start_date', label: 'Start Date', type:'date', value: formData.start_date, onChange: handleChange }} />
                            <Field {...{name: 'deadline', label: 'Deadline', type:'date', value: formData.deadline, onChange: handleChange }} />
                            <StatusDropdown statuses={riskRegisterStatuses} selected={formData.status} onChange={handleChange} noLabel={false} />
                        </div>
                        <ActionPlanTable editable={true} users={users} registerStatuses={riskRegisterStatuses} onPlanChange={handleChange} plans={formData.action_plan} onAddPlan={handleAddPlan} onRemovePlan={handleRemovePlan} aiSuggestionData={{
                            risk: riskName, risk_response: selectedResponse, control_family: selectedControlFamily, recommended_control: formData.recommended_control, contingency_plan: formData.contingency_plan
                        }} />
                        <div className='flex flex-col gap-6'>
                            <h3 className='font-medium text-lg'>Residual Risk Rating</h3>
                            <Row>
                                <LikelihoodSelector 
                                    likelihoodScores={likelihoodScores} 
                                    selectedLikelihood={formData.residual_risk_likelihood} 
                                    onSetLikelihood={handleLikelihoodChange} 
                                />
                                <ImpactSelector 
                                    impactScores={impactScores} 
                                    selectedImpact={formData.residual_risk_impact} 
                                    onSetImpact={handleImpactChange} 
                                />
                            </Row>
                            <Row>
                                <div className='flex flex-col gap-3 items-start flex-1'>
                                    <h4 className='font-normal'>Residual Risk Rating</h4>
                                    <RiskRating riskRating={formData.residual_risk_rating} />
                                </div>
                            </Row>
                        </div>
                    </div>
                </div>
            </div>
            <div className='flex gap-3'>
                <FormCancelButton text={'Discard'} />
                <FormCustomButton text={'Previous'} onClick={() => navigate(-1)} />
                <FormCustomButton disabled={isSavingTreatmentPlanToDraft} text={isSavingTreatmentPlanToDraft ? 'Saving To Draft' :'Save To Draft'} onClick={handleSaveToDraftClicked} />
                <FormProceedButton disabled={isUpdatingTreatmentPlan} text={isUpdatingTreatmentPlan ? 'Saving...' : 'Next'} onClick={handleNextClicked} />
            </div>
        </form>
    )
}

function Row({children}) {
    return (
        <div className='flex gap-6'>
            {children}        
        </div>
    );
}

function ResponseDropdown({responses, selected, onChange}) {
    const [isCollapsed, setIsCollapsed] = useState(true);
    return (
        <SelectDropdown label={'Response'} placeholder={'Select risk response'} items={responses} name={'response_id'} selected={selected} onSelect={onChange} isCollapsed={isCollapsed} onToggleCollpase={setIsCollapsed} />
    );
}

function ControlFamilyTypeDropdown({controls, selected, onChange}) {
    const [isCollapsed, setIsCollapsed] = useState(true);
    return (
        <SelectDropdown label={'Control Family Type'} placeholder={'Control Family Type'} items={controls} name={'control_family_type_id'} selected={selected} onSelect={onChange} isCollapsed={isCollapsed} onToggleCollpase={setIsCollapsed} />
    );
}

function StatusDropdown({statuses, selected, onChange, noLabel}) {
    const [isCollapsed, setIsCollapsed] = useState(true);
    return (
        <SelectDropdown label={noLabel ? null : 'Status'} placeholder={'Status'} items={statuses} name={'status'} selected={selected} onSelect={onChange} isCollapsed={isCollapsed} onToggleCollpase={setIsCollapsed} />
    );
}

export default TreatmentPlan;