import { useEffect, useState } from "react";

export default function LikelihoodSelector({likelihoodScores, selectedLikelihood, onSetLikelihood}) {
    const [focusedScore, setFocusedScore] = useState(null);

    useEffect(() => {
        selectedLikelihood && setFocusedScore(selectedLikelihood);
    }, [selectedLikelihood]);

    const scores = likelihoodScores.map(l => l.score);
    const criteria = likelihoodScores.find(l => l.score === focusedScore)?.criteria;
    return (
        <div className='flex flex-col gap-3 flex-1'>
            <h4 className='font-normal'>Select Likelihood</h4>
            <ul className='flex gap-1'>
                {
                    scores.map(likelihood => {
                        return (
                            <li key={likelihood} className='flex-1'>
                                <button onMouseOver={() => setFocusedScore(likelihood)} onMouseOut={() => setFocusedScore(selectedLikelihood || null)} onClick={() => onSetLikelihood && onSetLikelihood(likelihood)} type="button" className={`rounded-md w-full h-16 grid place-items-center text-lg bg-[#D9D9D9] border-2 border-transparent hover:border-text-pink ${likelihood === selectedLikelihood && 'bg-text-pink text-white'}`}>{likelihood}</button>
                            </li>
                        );
                    })
                }
            </ul>
            <div>
                {
                    criteria ?
                    <p className="font-normal text-gray-500">{criteria}</p> :
                    <p className="italic text-text-gray">Hover on likelihood to see criteria</p>
                }
            </div>
        </div>
    );
}