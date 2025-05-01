import ImpactSelector from "../../components/ImpactSelector";
import LikelihoodSelector from "../../components/LikelihoodSelector";
import RiskRating from "../../components/RiskRating";
import { Row } from "./Elements";

export default function AnalysisContent({riskAnalysis, likelihoodScores, impactScores}) {
    const inherentLikelihoodScore = riskAnalysis.inherent_risk_likelihood_score;
    const inherentImpactScore = riskAnalysis.inherent_risk_impact_score;
    const residualLikelihoodScore = riskAnalysis.residual_risk_likelihood_score;
    const residualImpactScore = riskAnalysis.residual_risk_impact_score;
    // Get the residual risk rating directly from the riskAnalysis object if available
    const residualRiskRating = riskAnalysis.residual_risk_rating?.score || 
                              (residualLikelihoodScore && residualImpactScore ? 
                               Number(residualLikelihoodScore) * Number(residualImpactScore) : 
                               0);
    
    return (
        <div className='flex flex-col gap-9'>
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
                        <RiskRating riskRating={Number(inherentLikelihoodScore) * Number(inherentImpactScore)} />
                    </div>
                    <div className='flex flex-col gap-3 w-1/2'>
                        <h4 className="font-medium">Impact Focus</h4>
                        <p>{riskAnalysis.impact_focus?.name || 'Not specified'}</p>
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
        </div>
    );
}