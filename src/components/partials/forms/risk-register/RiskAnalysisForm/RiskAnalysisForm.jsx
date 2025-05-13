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

function RiskAnalysisForm({mode, currentRiskId, onRiskIdChange}) {
    const [searchParams, setSearchParams] = useSearchParams();
    const params = useParams();
    // Use currentRiskId from props if available, otherwise fallback to URL params
    const riskID = mode === 'update' ? params.id : (currentRiskId || searchParams.get('id'));
    const navigate = useNavigate();
    const dispatchMessage = useDispatchMessage();
    const queryClient = useQueryClient();

    // Update the parent component with the current risk ID if needed
    useEffect(() => {
        if (riskID && onRiskIdChange) {
            onRiskIdChange(riskID);
        }
    }, [riskID, onRiskIdChange]);

    // Add validation for riskID
    useEffect(() => {
        if (!riskID) {
            dispatchMessage('error', 'Risk ID is required');
            navigate('/risks/register/identification');
        }
    }, [riskID, navigate, dispatchMessage]);

    // Initialize form data from sessionStorage if available
    const [formData, setFormData] = useState(() => {
        const savedData = sessionStorage.getItem(`risk_analysis_${riskID}`);
        if (savedData && riskID) {
            try {
                const parsedData = JSON.parse(savedData);
                console.log('Loaded saved analysis data from session storage:', parsedData);
                
                // Handle potential API format field names in the saved data
                const processedData = {
                    ...parsedData,
                    // Ensure we have the expected field names for our form
                    inherent_likelihood_score: parsedData.inherent_likelihood_score || parsedData.inherent_risk_likelihood_score || '',
                    inherent_impact_score: parsedData.inherent_impact_score || parsedData.inherent_risk_impact_score || '',
                    inherent_risk_rating: parsedData.inherent_risk_rating || '',
                    residual_risk_likelihood_score: parsedData.residual_risk_likelihood_score || '',
                    residual_risk_impact_score: parsedData.residual_risk_impact_score || '',
                    residual_risk_rating: parsedData.residual_risk_rating || ''
                };
                
                console.log('Processed saved analysis data:', processedData);
                return processedData;
            } catch (e) {
                console.error('Error parsing saved analysis data:', e);
            }
        }
        
        // Default form data if nothing is saved
        return {
            inherent_likelihood_score: '',
            inherent_impact_score: '',
            inherent_risk_rating: '',
            impact_focus_id: '',
            // Still keep residual risk in the data structure for API compatibility
            // but don't display it in the UI
            residual_risk_likelihood_score: '',
            residual_risk_impact_score: '',
            residual_risk_rating: '',
        };
    });
    
    // Save form data to sessionStorage whenever it changes
    useEffect(() => {
        if (riskID) {
            // Simply save the exact form data without adding extra fields
            // This ensures the Review step sees exactly what was entered
            console.log('Saving analysis data to sessionStorage:', formData);
            sessionStorage.setItem(`risk_analysis_${riskID}`, JSON.stringify(formData));
        }
    }, [formData, riskID]);

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

    // update form data with risk analysis details if they exist
    useEffect(() => {
        if (riskAnalysisQuery.data) {
            const details = riskAnalysisQuery.data;
            
            // Log the received data for debugging
            console.log('Loading risk analysis data - raw response:', details);
            
            // Calculate inherent risk rating, ensuring we have valid numbers
            let inherentRiskRating = 0;
            if (details.inherent_risk_likelihood_score !== null && details.inherent_risk_impact_score !== null &&
                !isNaN(Number(details.inherent_risk_likelihood_score)) && !isNaN(Number(details.inherent_risk_impact_score))) {
                inherentRiskRating = Number(details.inherent_risk_likelihood_score) * Number(details.inherent_risk_impact_score);
            }
            
            // Calculate residual risk rating, ensuring we have valid numbers
            let residualRiskRating = 0;
            if (details.residual_risk_likelihood_score !== null && details.residual_risk_impact_score !== null &&
                !isNaN(Number(details.residual_risk_likelihood_score)) && !isNaN(Number(details.residual_risk_impact_score))) {
                residualRiskRating = Number(details.residual_risk_likelihood_score) * Number(details.residual_risk_impact_score);
            } else if (inherentRiskRating > 0) {
                // For new records, set residual risk = inherent risk initially
                residualRiskRating = inherentRiskRating;
            }
            
            console.log('Processed risk analysis data:', {
                inherent: {
                    likelihood: details.inherent_risk_likelihood_score,
                    impact: details.inherent_risk_impact_score,
                    rating: inherentRiskRating
                },
                residual: {
                    likelihood: details.residual_risk_likelihood_score || details.inherent_risk_likelihood_score,
                    impact: details.residual_risk_impact_score || details.inherent_risk_impact_score,
                    rating: residualRiskRating
                },
                impactFocus: details.impact_focus?.id
            });
            
            // Check if data from sessionStorage is more complete than API data
            const sessionData = sessionStorage.getItem(`risk_analysis_${riskID}`);
            let shouldUseSessionData = false;
            
            if (sessionData) {
                try {
                    const parsedSessionData = JSON.parse(sessionData);
                    // Use sessionStorage data if it has more fields filled in
                    if ((parsedSessionData.inherent_likelihood_score && !details.inherent_risk_likelihood_score) ||
                        (parsedSessionData.inherent_impact_score && !details.inherent_risk_impact_score) ||
                        (parsedSessionData.impact_focus_id && !details.impact_focus?.id)) {
                        console.log('Using more complete session data instead of API data');
                        shouldUseSessionData = true;
                        
                        // Merge API data and session data, prioritizing session data
                        const mergedData = {
                            ...details,
                            inherent_risk_likelihood_score: parsedSessionData.inherent_likelihood_score || details.inherent_risk_likelihood_score,
                            inherent_risk_impact_score: parsedSessionData.inherent_impact_score || details.inherent_risk_impact_score,
                            inherent_risk_rating: parsedSessionData.inherent_risk_rating || inherentRiskRating,
                            impact_focus_id: parsedSessionData.impact_focus_id || details.impact_focus?.id,
                            residual_risk_likelihood_score: parsedSessionData.residual_risk_likelihood_score || details.residual_risk_likelihood_score,
                            residual_risk_impact_score: parsedSessionData.residual_risk_impact_score || details.residual_risk_impact_score,
                            residual_risk_rating: parsedSessionData.residual_risk_rating || residualRiskRating
                        };
                        
                        setFormData(mergedData);
                        return;
                    }
                } catch (e) {
                    console.error('Error parsing session data:', e);
                }
            }
            
            if (!shouldUseSessionData) {
                // Set form data with thorough null/undefined checks
                setFormData({
                    inherent_likelihood_score: details.inherent_risk_likelihood_score || '',
                    inherent_impact_score: details.inherent_risk_impact_score || '',
                    inherent_risk_rating: inherentRiskRating || '',
                    impact_focus_id: details.impact_focus?.id || '',
                    // Preserve existing residual risk values if they exist, otherwise copy from inherent risk
                    residual_risk_likelihood_score: details.residual_risk_likelihood_score || details.inherent_risk_likelihood_score || '',
                    residual_risk_impact_score: details.residual_risk_impact_score || details.inherent_risk_impact_score || '',
                    residual_risk_rating: residualRiskRating || '',
                });
            }
        }
    }, [riskAnalysisQuery.data, riskID]);

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
                // Ensure the riskID is in sessionStorage for consistency
                if (riskID) {
                    sessionStorage.setItem('current_risk_id', riskID);
                }
                
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
        // Only ensure the inherent risk rating is calculated correctly
        // Don't add any extra fields that aren't needed for the API
        const preparedData = {
            ...formData,
            inherent_risk_rating: formData.inherent_likelihood_score && formData.inherent_impact_score ? 
                Number(formData.inherent_likelihood_score) * Number(formData.inherent_impact_score) : 
                formData.inherent_risk_rating
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
        
        // Force an update to sessionStorage with the complete data before submitting
        // This ensures the review step will have access to this data
        if (riskID) {
            console.log('RiskAnalysisForm - Force saving complete data to sessionStorage before API call');
            sessionStorage.setItem(`risk_analysis_${riskID}`, JSON.stringify(dataToSubmit));
        }
        
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
        
        // Force an update to sessionStorage with the complete data before submitting
        // This ensures the review step will have access to this data
        if (riskID) {
            console.log('RiskAnalysisForm - Force saving complete data to sessionStorage before draft save');
            sessionStorage.setItem(`risk_analysis_${riskID}`, JSON.stringify(dataToSubmit));
        }
        
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
                <FormProceedButton disabled={isUpdatingRiskAnalysis} text={isUpdatingRiskAnalysis ? 'Saving...' : 'Next'} onClick={handleNextClicked} />
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