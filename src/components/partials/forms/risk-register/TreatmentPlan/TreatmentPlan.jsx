import { useEffect, useState } from 'react';
import { FormCancelButton, FormCustomButton, FormProceedButton } from '../../../buttons/FormButtons/FormButtons';
import { CKEField, Field } from '../../../Elements/Elements';
import styles from './TreatmentPlan.module.css';
import SelectDropdown from '../../../dropdowns/SelectDropdown/SelectDropdown';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueries, useQueryClient } from '@tanstack/react-query';
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

function TreatmentPlan({onSetCurrentStep, riskName = ''}) {
    const [searchParams, setSearchParams] = useSearchParams();
    const riskID = searchParams.get('id');
    const navigate = useNavigate();

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

    // update risk rating when likelihood or impact score changes
    useEffect(() => {
        const likelihood = formData.residual_risk_likelihood;
        const impact = formData.residual_risk_impact;

        if (likelihood && impact) {
            setFormData({...formData, residual_risk_rating: Number(likelihood) * Number(impact)});
        }
    }, [formData.residual_risk_likelihood, formData.residual_risk_impact]);

    // queries
    const [treatmentPlanQuery, likelihoodScoresQuery, impactScoresQuery, responsesQuery, controlFamilyTypesQuery, riskRegisterStatusesQuery, targetRiskRatingQuery, usersQuery] = useQueries({
        queries: [riskTreatmentPlanOptions(riskID), likelihoodScoresOptions(), impactScoresOptions(), riskResponsesOptions(), riskControlFamilyTypesOptions(), riskRegisterStatusesOptions(), targetRiskRatingOptions(riskID), usersOptions()]
    });

    // update form data with treatment plan details if it exists
    useEffect(() => {
        if (treatmentPlanQuery.data) {
            const details = treatmentPlanQuery.data;
            const startDateParts = details.start_date?.split('-') || '';
            const deadlineParts = details.deadline?.split('-') || '';
           
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
                    const dueDateParts = plan.due_date?.split('-');
                    return {action: plan.action, assigned_to: plan.assigned_to, status_id: plan.status.id, id: plan.id, due_date: [...dueDateParts].reverse().join('-')}
                }): 
                [],
                residual_risk_likelihood: details.residual_risk_likelihood_score || '',
                residual_risk_impact: details.residual_risk_impact_score || '',
                residual_risk_rating: details.residual_risk_rating || '',
            });
        }
    }, [treatmentPlanQuery.data])

    // mutations
    const {isPending: isUpdatingTreatmentPlan, mutate: updateTreatmentPlan} = useUpdateTreatmentPlan(riskID, {onSuccess, onError, onSettled});
    const {isPending: isSavingTreatmentPlanToDraft, mutate: saveTreatmentPlanToDraft} = useSaveTreatmentPlanToDraft(riskID, {onSuccess: onDraftSuccess, onError});

    const queryClient = useQueryClient();
    const dispatchMessage = useDispatchMessage();
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
            // will only navigate to next step if treatment plan in newly added
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
            action_plan: [...formData.action_plan, {action: '', assigned_to: '', due_date: '', status_id: ''}]
        });
    }

    function handleRemovePlan(i) {
        setFormData({
            ...formData,
            action_plan: formData.action_plan.filter((_, index) => index !== i)
        });
    }

    function handleSaveToDraftClicked() {
        saveTreatmentPlanToDraft({data: formData});
    }
    function handleNextClicked() {
        updateTreatmentPlan({data: formData});
    }

    const isLoading = treatmentPlanQuery.isLoading || likelihoodScoresQuery.isLoading || impactScoresQuery.isLoading || responsesQuery.isLoading || controlFamilyTypesQuery.isLoading || riskRegisterStatusesQuery.isLoading || targetRiskRatingQuery.isLoading || usersQuery.isLoading;

    const error = likelihoodScoresQuery.error || impactScoresQuery.error || responsesQuery.error || controlFamilyTypesQuery.error || riskRegisterStatusesQuery.error || targetRiskRatingQuery.error || usersQuery.error;

    const treatmentPlanError = treatmentPlanQuery.error;

    if (isLoading) {
        return <div>Loading...</div>
    }

    if (error || (treatmentPlanError && treatmentPlanError.respone.status !== 404)) {
        return <div>error</div>
    }

    const likelihoodScores = likelihoodScoresQuery.data;
    const impactScores = impactScoresQuery.data;
    const riskResponses = responsesQuery.data.map(r => ({id: r.id, text: r.name}));
    const controlFamilyTypes = controlFamilyTypesQuery.data.map(ct => ({id: ct.id, text: ct.type}));
    const riskRegisterStatuses = riskRegisterStatusesQuery.data.map(r => ({id: r.id, text: r.status}));
    const targetRiskRating = targetRiskRatingQuery.data;
    const users = usersQuery.data.map(u => ({id: u.user_id, text: (!u.firstname || !u.lastname) ? u.email : `${u.firstname} ${u.lastname}`}));

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
                                <LikelihoodSelector likelihoodScores={likelihoodScores} selectedLikelihood={formData.residual_risk_likelihood} onSetLikelihood={(l) => setFormData({...formData, residual_risk_likelihood: l})} />
                                <ImpactSelector impactScores={impactScores} selectedImpact={formData.residual_risk_impact} onSetImpact={(i) => setFormData({...formData, residual_risk_impact: i})} />
                            </Row>
                            <Row>
                                <div className='flex flex-col gap-3 items-start flex-1'>
                                    <h4 className='font-semibold'>Residual Risk Rating</h4>
                                    <RiskRating riskRating={formData.residual_risk_rating} />
                                    {/* <div>
                                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem dolorum esse, porro voluptate vel laudantium.</p>
                                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem dolorum esse, porro voluptate vel laudantium.</p>
                                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem dolorum esse, porro voluptate vel laudantium.</p>
                                    </div> */}
                                </div>
                                <div className='flex flex-col gap-3 items-start flex-1'>
                                    <h4 className='font-semibold'>Target Risk Rating</h4>
                                    <RiskRating riskRating={targetRiskRating} />
                                </div>
                            </Row>
                        </div>
                    </div>
                </div>
            </div>
            <div className='flex gap-3'>
                <FormCancelButton text={'Discard'} />
                <FormCustomButton text={'Previous'} onClick={() => onSetCurrentStep('Risk Analysis')} />
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