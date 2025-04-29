import { useEffect, useState } from "react";

export default function ImpactSelector({impactScores, selectedImpact, onSetImpact}) {
    const [focusedScore, setFocusedScore] = useState(null);

    useEffect(() => {
        selectedImpact && setFocusedScore(selectedImpact);
    }, [selectedImpact]);

    const scores = impactScores.map(i => i.impact_score);
    const returnedParameters = impactScores.find(i => i.impact_score === focusedScore)?.parameters;
    
    // Filter parameters to only include unique ones and handle the special case
    let parameters = null;
    if (returnedParameters) {
        // Extract parameter texts
        const paramTexts = returnedParameters.map(p => p.parameter);
        
        // Filter out meaningless text fragments and empty strings
        const filteredParams = paramTexts.filter(text => {
            const trimmedText = text.trim();
            // Remove specific text fragments we want to exclude
            const excludedPhrases = ["er edt", "fsa", "fdsa"];
            if (excludedPhrases.some(phrase => trimmedText.includes(phrase))) {
                return false;
            }
            
            // Remove single words that are gibberish (like short random letters)
            const isGibberish = /^[a-z]{2,4}$/i.test(trimmedText);
            
            // Keep only substantive text (not empty, not just gibberish)
            return trimmedText !== "" && !isGibberish;
        });
        
        // Handle specific case of repetitive text
        const specialText = "Some processes need adjustment but manageable.";
        if (filteredParams.includes(specialText)) {
            // Create a unique set of parameters, filtering out special case
            const uniqueParams = [...new Set(filteredParams.filter(p => p !== specialText))];
            // Add the special text only once at the beginning
            parameters = [specialText, ...uniqueParams];
        } else {
            // Otherwise just ensure all parameters are unique
            parameters = [...new Set(filteredParams)];
        }
    }

    return (
        <div className='flex flex-col gap-3 flex-1'>
            <h4 className='font-normal'>Select Impact</h4>
            <ul className='flex gap-1'>
                {
                    scores.map(impact => {
                        return (
                            <li key={impact} className='flex-1'>
                                <button onMouseOver={() => setFocusedScore(impact)} onMouseOut={() => setFocusedScore(selectedImpact || null)} onClick={() => onSetImpact && onSetImpact(impact)} type="button" className={`rounded-md w-full h-16 grid place-items-center text-lg bg-[#D9D9D9] border-2 border-transparent hover:border-text-pink ${impact === selectedImpact && 'bg-text-pink text-white'}`}>{impact}</button>
                            </li>
                        );
                    })
                }
            </ul>
            <div>
                {
                    parameters ?
                    <ul className="font-normal text-gray-500">
                        {
                            parameters.map((p, i) => <li key={i} className="font-normal text-gray-500">{p}</li>)
                        }
                    </ul> :
                    <p className="italic text-text-gray">Hover on impact to see parameters</p>
                }
            </div>
        </div>
    );
}