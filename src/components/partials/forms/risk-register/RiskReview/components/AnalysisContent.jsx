import ImpactSelector from "../../components/ImpactSelector";
import LikelihoodSelector from "../../components/LikelihoodSelector";
import RiskRating from "../../components/RiskRating";
import { Row } from "./Elements";

export default function AnalysisContent({riskAnalysis, likelihoodScores, impactScores}) {
    // Debug what data we're receiving
    console.log('Analysis content - raw data:', riskAnalysis);

    // Check if we have any data at all
    const hasData = riskAnalysis && Object.keys(riskAnalysis).length > 0;
    
    // IMPORTANT: Use EXACTLY the same field names as in the form
    // Don't try to calculate or transform - just use what was entered
    const inherentLikelihoodScore = riskAnalysis?.inherent_likelihood_score || '';
    const inherentImpactScore = riskAnalysis?.inherent_impact_score || '';
    const inherentRiskRating = riskAnalysis?.inherent_risk_rating || 0;
    
    // For residual risk - use directly what's in the data
    const residualLikelihoodScore = riskAnalysis?.residual_risk_likelihood_score || '';
    const residualImpactScore = riskAnalysis?.residual_risk_impact_score || '';
    const residualRiskRating = riskAnalysis?.residual_risk_rating || 0;
    
    // Get impact focus name directly from the data
    const impactFocusName = riskAnalysis?.impact_focus?.name || 
                          (riskAnalysis?.impact_focus_id ? `ID: ${riskAnalysis.impact_focus_id}` : 'Not specified');
    
    // Log exactly what we're displaying
    console.log('Analysis content - displaying these exact values:', {
        inherentLikelihoodScore,
        inherentImpactScore,
        inherentRiskRating,
        residualLikelihoodScore,
        residualImpactScore, 
        residualRiskRating,
        impactFocusName
    });
    
    return (
        <div className='flex flex-col gap-9'>
            {!hasData ? (
                <div className="p-4 bg-yellow-50 rounded border border-yellow-200 text-center">
                    <p className="text-yellow-700">No risk analysis data available to display.</p>
                    <p className="text-sm text-gray-600 mt-2">Please ensure you've completed the Risk Analysis step.</p>
                </div>
            ) : (
                <div className='flex flex-col gap-6'>
                    <div className='space-y-6'>
                        <h4 className='text-lg font-medium'>
                            Inherent Risk
                        </h4>
                        <Row>
                            <LikelihoodSelector likelihoodScores={likelihoodScores} selectedLikelihood={inherentLikelihoodScore} />
                            <ImpactSelector impactScores={impactScores} selectedImpact={inherentImpactScore} />
                        </Row>
                        <div className='flex flex-col gap-3 items-start'>
                            <h4 className='font-normal'>Inherent Risk Flag</h4>
                            <RiskRating riskRating={inherentRiskRating} />
                        </div>
                        <div className='flex flex-col gap-3 w-1/2'>
                            <h4 className="font-medium">Impact Focus</h4>
                            <p>{impactFocusName}</p>
                        </div>
                    </div>
                    <div className='space-y-6'>
                        <h4 className='text-lg font-medium'>
                            Residual Risk
                        </h4>
                        <Row>
                            <LikelihoodSelector likelihoodScores={likelihoodScores} selectedLikelihood={residualLikelihoodScore} />
                            <ImpactSelector impactScores={impactScores} selectedImpact={residualImpactScore} />
                        </Row>
                        <Row>
                            <div className='flex flex-col gap-3 items-start flex-1'>
                                <h4 className='font-normal'>Residual Risk Rating</h4>
                                <RiskRating riskRating={residualRiskRating} />
                            </div>
                        </Row>
                    </div>
                </div>
            )}
        </div>
    );
}