import { useEffect, useState } from "react";

export default function ImpactSelector({impactScores, selectedImpact, onSetImpact}) {
    const [focusedScore, setFocusedScore] = useState(null);

    useEffect(() => {
        selectedImpact && setFocusedScore(selectedImpact);
    }, [selectedImpact]);

    const scores = impactScores.map(i => i.impact_score);
    const returnedParameters = impactScores.find(i => i.impact_score === focusedScore)?.parameters;
    const parameters = returnedParameters ? returnedParameters.map(p => p.parameter) : null;

    return (
        <div className='flex flex-col gap-3 flex-1'>
            <h4 className='font-medium'>Select Impact</h4>
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
                    <ul>
                        {
                            parameters.map((p, i) => <li key={i}>{p}</li>)
                        }
                    </ul> :
                    <p className="italic text-text-gray">Hover on impact to see parameters</p>
                }
            </div>
        </div>
    );
}