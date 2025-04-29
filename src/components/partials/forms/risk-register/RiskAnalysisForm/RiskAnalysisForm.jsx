import { useEffect, useState } from 'react';
import { FormCancelButton, FormCustomButton, FormProceedButton } from '../../../buttons/FormButtons/FormButtons';
import styles from './RiskAnalysisForm.module.css';
import RiskEvaluationHeatMap, { RiskHeatmapContext } from '../components/RiskEvaluationHeatMap';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { impactFocusesOptions, impactScoresOptions, likelihoodScoresOptions, riskAnalysisOptions, useSaveRiskAnalysisToDraft, useUpdateRiskAnalysis } from '../../../../../queries/risks/risk-queries';
import SelectDropdown from '../../../dropdowns/SelectDropdown/SelectDropdown';
import useDispatchMessage from '../../../../../hooks/useDispatchMessage';
import RiskRating from '../components/RiskRating';
import LikelihoodSelector from '../components/LikelihoodSelector';
import ImpactSelector from '../components/ImpactSelector';
import { riskBoundariesOptions } from '../../../../../queries/risks/risk-boundaries';
import { riskMatrixSizeOptions } from '../../../../../queries/risks/risk-likelihood-matrix';

function RiskAnalysisForm({mode}) {
    const [searchParams, setSearchParams] = useSearchParams();
    const params = useParams();
    const riskID = mode === 'update' ? params.id : searchParams.get('id');
    const navigate = useNavigate();
    const dispatchMessage = useDispatchMessage();
    const queryClient = useQueryClient();

    // Add validation for riskID
    useEffect(() => {
        if (!riskID) {
            dispatchMessage('error', 'Risk ID is required');
            navigate('/risks/register/identification');
        }
    }, [riskID, navigate, dispatchMessage]);

    const [formData, setFormData] = useState({
        inherent_likelihood_score: '',
        inherent_impact_score: '',
        inherent_risk_rating: '',
        impact_focus_id: '',
        // Still keep residual risk in the data structure for API compatibility
        // but don't display it in the UI
        residual_risk_likelihood_score: '',
        residual_risk_impact_score: '',
        residual_risk_rating: '',
    });

    // update inherent risk rating when likelihood or impact score changes
    useEffect(() => {
        const likelihood = formData.inherent_likelihood_score;
        const impact = formData.inherent_impact_score;

        if (likelihood && impact) {
            const inherentRiskRating = Number(likelihood) * Number(impact);
            
            // Only update the inherent risk rating
            setFormData(prevData => ({
                ...prevData, 
                inherent_risk_rating: inherentRiskRating,
            }));
        }
    }, [formData.inherent_likelihood_score, formData.inherent_impact_score]);

    // queries
    const [riskAnalysisQuery, likelihoodScoresQuery, impactScoresQuery, impactFocusesQuery, riskBoundariesQuery, riskMatrixSizeQuery] = useQueries({
        queries: [
            riskAnalysisOptions(riskID, { enabled: !!riskID }), 
            likelihoodScoresOptions(), 
            impactScoresOptions(), 
            impactFocusesOptions(), 
            riskBoundariesOptions(), 
            riskMatrixSizeOptions()
        ]
    });

    // update form data with risk analysis details if it exists
    useEffect(() => {
        if (riskAnalysisQuery.data) {
            const details = riskAnalysisQuery.data;
            // Parse the inherent risk rating value
            let inherentRiskRating = '';
            if (details.inherent_risk_rating) {
                if (typeof details.inherent_risk_rating === 'object' && details.inherent_risk_rating.score !== undefined) {
                    inherentRiskRating = details.inherent_risk_rating.score;
                } else {
                    inherentRiskRating = details.inherent_risk_rating;
                }
            } else if (details.inherent_risk_likelihood_score && details.inherent_risk_impact_score) {
                inherentRiskRating = Number(details.inherent_risk_likelihood_score) * Number(details.inherent_risk_impact_score);
            }
            
            // Parse the residual risk rating value
            let residualRiskRating = '';
            if (details.residual_risk_rating) {
                if (typeof details.residual_risk_rating === 'object' && details.residual_risk_rating.score !== undefined) {
                    residualRiskRating = details.residual_risk_rating.score;
                } else {
                    residualRiskRating = details.residual_risk_rating;
                }
            } else if (details.residual_risk_likelihood_score && details.residual_risk_impact_score) {
                residualRiskRating = Number(details.residual_risk_likelihood_score) * Number(details.residual_risk_impact_score);
            }
            
            // For new records, set residual risk = inherent risk initially
            if (!residualRiskRating && inherentRiskRating) {
                residualRiskRating = inherentRiskRating;
            }
            
            console.log('Loading risk analysis data:', {
                inherent: {
                    likelihood: details.inherent_risk_likelihood_score,
                    impact: details.inherent_risk_impact_score,
                    rating: inherentRiskRating
                },
                residual: {
                    likelihood: details.residual_risk_likelihood_score || details.inherent_risk_likelihood_score,
                    impact: details.residual_risk_impact_score || details.inherent_risk_impact_score,
                    rating: residualRiskRating
                }
            });
            
            setFormData({
                inherent_likelihood_score: details.inherent_risk_likelihood_score,
                inherent_impact_score: details.inherent_risk_impact_score,
                inherent_risk_rating: inherentRiskRating,
                impact_focus_id: details.impact_focus?.id,
                // Preserve existing residual risk values if they exist, otherwise copy from inherent risk
                residual_risk_likelihood_score: details.residual_risk_likelihood_score || details.inherent_risk_likelihood_score,
                residual_risk_impact_score: details.residual_risk_impact_score || details.inherent_risk_impact_score,
                residual_risk_rating: residualRiskRating,
            });
        }
    }, [riskAnalysisQuery.data]);

    // mutations
    const {isPending: isUpdatingRiskAnalysis, mutate: updateRiskAnalysis} = useUpdateRiskAnalysis(riskID, {onSuccess, onError, onSettled});
    const {isPending: isSavingAnalysisToDraft, mutate: saveAnalysisToDraft} = useSaveRiskAnalysisToDraft(riskID, {onSuccess: onDraftSuccess, onError});

    useEffect(() => {
        if (isUpdatingRiskAnalysis) {
            console.log('RiskAnalysisForm - Dispatching processing message: Updating risk analysis...');
            dispatchMessage('processing', 'Updating risk analysis...');
        } else if (isSavingAnalysisToDraft) {
            console.log('RiskAnalysisForm - Dispatching processing message: Saving risk analysis to draft...');
            dispatchMessage('processing', 'Saving risk analysis to draft...');
        }
    }, [isUpdatingRiskAnalysis, isSavingAnalysisToDraft, dispatchMessage]);

    async function onSuccess(data) {
        await queryClient.invalidateQueries({queryKey: ['risks']});
        console.log('RiskAnalysisForm - Dispatching success message:', data.message);
        dispatchMessage('success', data.message);
    }
    async function onDraftSuccess(data) {
        console.log('RiskAnalysisForm - Dispatching draft success message:', data.message);
        dispatchMessage('success', data.message);
        // No automatic navigation after saving to draft, so user can see the success message
    }
    function onError(error) {
        console.log('RiskAnalysisForm - Error occurred:', error);
        let errorMessage = 'An error occurred while processing your request.';
        
        // Try to extract a more specific error message if available
        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        console.log('RiskAnalysisForm - Dispatching error message:', errorMessage);
        dispatchMessage('failed', errorMessage);
    }
    function onSettled(data, error) {
        // set newly created risk id and proceed to next step if successful
        if (!error) {
            // Add a short delay before navigation to allow success message to display
            setTimeout(() => {
                // will only navigate to next step if analysis in newly added
                navigate(`/risks/register/treatment-plan?id=${riskID}`);
            }, 1500); // 1.5 second delay
        }
    }

    function handleChange(e) {
        setFormData({
            ...formData, [e.target.name]: e.target.value
        })
    }

    function prepareDataForSubmission() {
        // Ensure the inherent risk rating is calculated correctly
        const preparedData = {
            ...formData,
            inherent_risk_rating: formData.inherent_likelihood_score && formData.inherent_impact_score ? 
                Number(formData.inherent_likelihood_score) * Number(formData.inherent_impact_score) : 
                formData.inherent_risk_rating,
        };
        
        // For new submissions, set initial residual risk values to match inherent risk
        if (!formData.residual_risk_likelihood_score || !formData.residual_risk_impact_score) {
            preparedData.residual_risk_likelihood_score = formData.inherent_likelihood_score;
            preparedData.residual_risk_impact_score = formData.inherent_impact_score;
            preparedData.residual_risk_rating = preparedData.inherent_risk_rating;
        }
        
        return preparedData;
    }

    function handleNextClicked() {
        const dataToSubmit = prepareDataForSubmission();
        
        console.log('RiskAnalysisForm - Submitting risk analysis:', dataToSubmit);
        
        // Send the data to the API
        try {
            updateRiskAnalysis({data: dataToSubmit});
            console.log('RiskAnalysisForm - Update request sent');
        } catch (error) {
            console.error('RiskAnalysisForm - Error sending update request:', error);
            onError(error);
        }
    }

    function handleSaveToDraftClicked() {
        const dataToSubmit = prepareDataForSubmission();
        
        console.log('RiskAnalysisForm - Saving to draft:', dataToSubmit);
        
        // Save to draft
        try {
            saveAnalysisToDraft({data: dataToSubmit});
            console.log('RiskAnalysisForm - Save to draft request sent');
        } catch (error) {
            console.error('RiskAnalysisForm - Error sending save to draft request:', error);
            onError(error);
        }
    }

    const isLoading = riskAnalysisQuery.isLoading || likelihoodScoresQuery.isLoading || impactScoresQuery.isLoading || impactFocusesQuery.isLoading || riskBoundariesQuery.isLoading || riskMatrixSizeQuery.isLoading;

    const error = likelihoodScoresQuery.error || impactScoresQuery.error || impactFocusesQuery.error || riskBoundariesQuery.error || riskMatrixSizeQuery.error;

    const riskAnalysisError = riskAnalysisQuery.error;

    if (isLoading) {
        return <div className="p-10 bg-white rounded-lg border border-[#CCC] flex justify-center items-center">
            <p>Loading risk analysis data...</p>
        </div>
    }

    if (error || (riskAnalysisError && riskAnalysisError.response && riskAnalysisError.response.status !== 404)) {
        // error exists and it is not a 'risk analysis not found' error
        return <div className="p-10 bg-white rounded-lg border border-[#CCC] flex flex-col gap-4">
            <h3 className="text-red-600 font-semibold">Error Loading Risk Analysis</h3>
            <p>There was an error loading the risk analysis data. Please try again or contact support.</p>
            <p className="text-sm text-gray-600">Error details: {error ? error.message : riskAnalysisError ? (riskAnalysisError.message || JSON.stringify(riskAnalysisError)) : 'Unknown error'}</p>
        </div>
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
                                <h4 className='font-normal'>Inherent Risk Flag</h4>
                                <RiskRating riskRating={formData.inherent_risk_rating} />
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