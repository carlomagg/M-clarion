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

function TreatmentPlan({mode, riskName = ''}) {
    const [searchParams, setSearchParams] = useSearchParams();
    const params = useParams();
    const riskID = mode === 'update' ? params.id : searchParams.get('id');
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const dispatchMessage = useDispatchMessage();

    const [formData, setFormData] = useState({
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
    });

    // Add validation for riskID
    useEffect(() => {
        if (!riskID) {
            dispatchMessage('error', 'Risk ID is required');
            navigate('/risks/register/identification');
        }
    }, [riskID, navigate, dispatchMessage]);

    // queries
    const [treatmentPlanQuery, likelihoodScoresQuery, impactScoresQuery, responsesQuery, controlFamilyTypesQuery, riskRegisterStatusesQuery, targetRiskRatingQuery, usersQuery] = useQueries({
        queries: [
            riskTreatmentPlanOptions(riskID, { enabled: !!riskID }), 
            likelihoodScoresOptions(), 
            impactScoresOptions(), 
            riskResponsesOptions(), 
            riskControlFamilyTypesOptions(), 
            riskRegisterStatusesOptions(), 
            targetRiskRatingOptions(riskID, { enabled: !!riskID }), 
            usersOptions()
        ]
    });

    // update form data with treatment plan details if it exists
    useEffect(() => {
        if (treatmentPlanQuery.data) {
            const details = treatmentPlanQuery.data;
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
                rating: residualRiskRating
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
            });
        }
    }, [treatmentPlanQuery.data]);

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
        console.log(error)
        dispatchMessage('failed', error.response.data.message);
    }
    function onSettled(data, error) {
        // set newly created risk id and proceed to next step if successful
        if (!error) {
            // Add a short delay before navigation to allow success message to display
            setTimeout(() => {
                // will only navigate to next step if treatment plan in newly added
                navigate(`/risks/register/review?id=${riskID}`);
            }, 1500); // 1.5 second delay
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
        
        // Ensure we have a valid residual risk rating
        if (formattedData.residual_risk_likelihood && formattedData.residual_risk_impact) {
            const calculatedRating = Number(formattedData.residual_risk_likelihood) * Number(formattedData.residual_risk_impact);
            if (!formattedData.residual_risk_rating) {
                formattedData.residual_risk_rating = calculatedRating;
            }
        }
        
        // Format action plan entries as needed
        if (formattedData.action_plan && formattedData.action_plan.length > 0) {
            formattedData.action_plan = formattedData.action_plan.map(plan => {
                const newPlan = { ...plan };
                
                // Extract user_id from assigned_to object
                if (newPlan.assigned_to && typeof newPlan.assigned_to === 'object' && newPlan.assigned_to.id) {
                    // Only convert to a number if the id is not empty
                    if (newPlan.assigned_to.id && newPlan.assigned_to.id.toString().trim() !== '') {
                        newPlan.user_id = Number(newPlan.assigned_to.id);
                    } else {
                        newPlan.user_id = null; // Set to null if id is empty
                    }
                    delete newPlan.assigned_to; // Remove the original assigned_to object
                } else if (typeof newPlan.assigned_to === 'string' && newPlan.assigned_to.trim() !== '') {
                    // If assigned_to is a non-empty string, convert to number for user_id
                    newPlan.user_id = Number(newPlan.assigned_to);
                    delete newPlan.assigned_to;
                } else {
                    // Handle case where assigned_to is null, undefined, or empty
                    newPlan.user_id = null;
                    delete newPlan.assigned_to;
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
            const [month, day, year] = formattedData.start_date.split('-');
            if (month && day && year) {
                formattedData.start_date = [year, month, day].join('-');
            }
        }
        
        if (formattedData.deadline) {
            const [month, day, year] = formattedData.deadline.split('-');
            if (month && day && year) {
                formattedData.deadline = [year, month, day].join('-');
            }
        }
        
        // Format due_date in action plans too
        if (formattedData.action_plan && formattedData.action_plan.length > 0) {
            formattedData.action_plan = formattedData.action_plan.map(plan => {
                const newPlan = { ...plan };
                
                if (newPlan.due_date) {
                    const [month, day, year] = newPlan.due_date.split('-');
                    if (month && day && year) {
                        newPlan.due_date = [year, month, day].join('-');
                    }
                }
                
                return newPlan;
            });
        }
        
        console.log('Submitting treatment plan with residual risk values:', {
            likelihood: formattedData.residual_risk_likelihood,
            impact: formattedData.residual_risk_impact,
            rating: formattedData.residual_risk_rating
        });
        
        return formattedData;
    }

    function handleSaveToDraftClicked() {
        // Create a sanitized copy of the form data to send to the backend
        const formattedData = prepareFormData();
        
        // Save to draft with the formatted data
        saveTreatmentPlanToDraft({data: formattedData});
    }

    function handleNextClicked() {
        // Create a sanitized copy of the form data to send to the backend
        const formattedData = prepareFormData();
        
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
                            {/* <StatusDropdown statuses={riskRegisterStatuses} /> */}
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
                <FormProceedButton disabled={isUpdatingTreatmentPlan} text={isUpdatingTreatmentPlan ? 'Saving...' : 'Save'} onClick={handleNextClicked} />
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