import { useEffect, useState } from 'react';
import { FormCancelButton, FormCustomButton, FormProceedButton } from '../../../buttons/FormButtons/FormButtons';
import styles from './RiskAnalysisForm.module.css';
import RiskEvaluationHeatMap, { RiskHeatmapContext } from '../components/RiskEvaluationHeatMap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { impactFocusesOptions, impactScoresOptions, likelihoodScoresOptions, riskAnalysisOptions, useSaveRiskAnalysisToDraft, useUpdateRiskAnalysis } from '../../../../../queries/risks/risk-queries';
import SelectDropdown from '../../../dropdowns/SelectDropdown/SelectDropdown';
import useDispatchMessage from '../../../../../hooks/useDispatchMessage';
import RiskRating from '../components/RiskRating';
import LikelihoodSelector from '../components/LikelihoodSelector';
import ImpactSelector from '../components/ImpactSelector';
import { riskBoundariesOptions } from '../../../../../queries/risks/risk-boundaries';
import { riskMatrixSizeOptions } from '../../../../../queries/risks/risk-likelihood-matrix';

function RiskAnalysisForm({}) {
    const [searchParams, setSearchParams] = useSearchParams();
    const riskID = searchParams.get('id');
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        inherent_likelihood_score: '',
        inherent_impact_score: '',
        inherent_risk_rating: '',
        impact_focus_id: ''
    });

    // update risk rating when likelihood or impact score changes
    useEffect(() => {
        const likelihood = formData.inherent_likelihood_score;
        const impact = formData.inherent_impact_score;

        if (likelihood && impact) {
            setFormData({...formData, inherent_risk_rating: Number(likelihood) * Number(impact)});
        }
    }, [formData.inherent_likelihood_score, formData.inherent_impact_score]);

    // queries
    const [riskAnalysisQuery, likelihoodScoresQuery, impactScoresQuery, impactFocusesQuery, riskBoundariesQuery, riskMatrixSizeQuery] = useQueries({
        queries: [riskAnalysisOptions(riskID), likelihoodScoresOptions(), impactScoresOptions(), impactFocusesOptions(), riskBoundariesOptions(), riskMatrixSizeOptions()]
    });

    // update form data with risk analysis details if it exists
    useEffect(() => {
        if (riskAnalysisQuery.data) {
            const details = riskAnalysisQuery.data;
            setFormData({
                inherent_likelihood_score: details.inherent_risk_likelihood_score,
                inherent_impact_score: details.inherent_risk_impact_score,
                inherent_risk_rating: details.inherent_risk_rating.score,
                impact_focus_id: details.impact_focus?.id
            });
            // setIsAnalysisExisting(true);
        }
    }, [riskAnalysisQuery.data]);

    // mutations
    const {isPending: isUpdatingRiskAnalysis, mutate: updateRiskAnalysis} = useUpdateRiskAnalysis(riskID, {onSuccess, onError, onSettled});
    const {isPending: isSavingAnalysisToDraft, mutate: saveAnalysisToDraft} = useSaveRiskAnalysisToDraft(riskID, {onSuccess: onDraftSuccess, onError});

    const queryClient = useQueryClient();
    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        let text = isUpdatingRiskAnalysis ? 'Updating Risk Analysis' : 'Saving Risk Analysis To Draft';
        (isUpdatingRiskAnalysis || isSavingAnalysisToDraft) && dispatchMessage('processing', text);
    }, [isUpdatingRiskAnalysis, isSavingAnalysisToDraft]);

    async function onSuccess(data) {
        await queryClient.invalidateQueries({queryKey: ['risks']});
        dispatchMessage('success', data.message);
    }
    async function onDraftSuccess(data) {
        dispatchMessage('success', data.message);
    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message);
    }
    function onSettled(data, error) {
        // set newly created risk id and proceed to next step if successful
        if (!error) {
            // will only navigate to next step if analysis in newly added
            navigate(`/risks/register/treatment-plan?id=${riskID}`);
        }
    }

    function handleChange(e) {
        setFormData({
            ...formData, [e.target.name]: e.target.value
        })
    }

    function handleNextClicked() {
        updateRiskAnalysis({data: formData});
    }

    function handleSaveToDraftClicked() {
        saveAnalysisToDraft({data: formData});
    }

    const isLoading = riskAnalysisQuery.isLoading || likelihoodScoresQuery.isLoading || impactScoresQuery.isLoading || impactFocusesQuery.isLoading || riskBoundariesQuery.isLoading || riskMatrixSizeQuery.isLoading;

    const error = likelihoodScoresQuery.error || impactScoresQuery.error || impactFocusesQuery.error || riskBoundariesQuery.error || riskMatrixSizeQuery.error;

    const riskAnalysisError = riskAnalysisQuery.error;

    if (isLoading) {
        return <div>Loading...</div>
    }

    if (error || (riskAnalysisError && riskAnalysisError.response.staus !== 404)) {
        // error exists and it is not a 'risk analysis not found' error
        return <div>error</div>
    }

    const likelihoodScores = likelihoodScoresQuery.data;
    const impactScores = impactScoresQuery.data;
    const impactFocuses = impactFocusesQuery.data.map(f => ({id: f.id, text: f.name}));
    const riskBoundaries = riskBoundariesQuery.data;
    const matrixSize = riskMatrixSizeQuery.data;

    return (
        <form className='bg-white rounded-lg border border-[#CCC] p-6 flex flex-col gap-6'>
            <div className='flex flex-col gap-6'>
                <div>
                    <h4 className='text-sm bg-[#FFDDEE] rounded-full py-1 px-2 font-medium text-text-pink inline-block'>RISK ID: {riskID}</h4>
                    <div className='mt-3 flex flex-col gap-6'>
                        <section className='flex flex-col gap-6'>
                            <Row>
                                <LikelihoodSelector likelihoodScores={likelihoodScores} selectedLikelihood={formData.inherent_likelihood_score} onSetLikelihood={(l) => setFormData({...formData, inherent_likelihood_score: l})} />
                                <ImpactSelector impactScores={impactScores} selectedImpact={formData.inherent_impact_score} onSetImpact={(i) => setFormData({...formData, inherent_impact_score: i})} />
                            </Row>
                            <div className='flex flex-col gap-3 w-1/2'>
                                <ImpactFocusDropdown focuses={impactFocuses} selected={formData.impact_focus_id} onChange={handleChange} />
                            </div>
                            <Row>
                                {/* <Field {...{type: 'textbox', label: 'Single Lass Expert', plactholder: 'Enter lass expert', height: 100}} /> */}
                            </Row>
                            <div className='flex flex-col gap-3 items-start'>
                                <h4 className='font-semibold'>Inherent Risk Flag</h4>
                                <RiskRating riskRating={formData.inherent_risk_rating} />
                                <div>
                                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem dolorum esse, porro voluptate vel laudantium.</p>
                                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem dolorum esse, porro voluptate vel laudantium.</p>
                                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem dolorum esse, porro voluptate vel laudantium.</p>
                                </div>
                            </div>
                        </section>
                        <section>
                            <RiskHeatmapContext.Provider value={{levels: riskBoundaries, size: matrixSize}}>
                                <RiskEvaluationHeatMap selected={[{likelihood: formData.inherent_likelihood_score, impact: formData.inherent_impact_score}]} title='Evaluation' />
                            </RiskHeatmapContext.Provider>
                        </section>
                    </div>
                </div>
            </div>
            <div className='flex gap-3'>
                <FormCancelButton text={'Discard'} />
                <FormCustomButton text={'Previous'} onClick={() => navigate(-1)} />
                <FormCustomButton disabled={isSavingAnalysisToDraft} text={isSavingAnalysisToDraft ? 'Saving To Draft' : 'Save To Draft'} onClick={handleSaveToDraftClicked} />
                <FormProceedButton disabled={isUpdatingRiskAnalysis} text={isUpdatingRiskAnalysis ? 'Saving...' : 'Save'} onClick={handleNextClicked} />
            </div>
        </form>
    )
}

function ImpactFocusDropdown({focuses, selected, onChange}) {
    const [isCollapsed, setIsCollapsed] = useState(true);
    return (
        <SelectDropdown label={'Impact Focus'} placeholder={'Select impact focus'} items={focuses} name={'impact_focus_id'} selected={selected} onSelect={onChange} isCollapsed={isCollapsed} onToggleCollpase={setIsCollapsed} />
    );
}

function Row({children}) {
    return (
        <div className='flex gap-6'>
            {children}        
        </div>
    );
}

export default RiskAnalysisForm;