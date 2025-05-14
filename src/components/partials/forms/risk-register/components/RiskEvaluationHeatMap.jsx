import { createContext, useContext } from 'react';
import './riskheatmap.css'

// return range of numbers from start to end (inclusive)
const range = (start, end) => Array.from({ length: end - start + 1 }, (_, i) => start + i);

export default function RiskEvaluationHeatMap({selected, title = ''}) {
    const { size = 5 } = useContext(RiskHeatmapContext);
    const scores = range(1,size);
    const reversedScores = [...scores].reverse();
    
    return (
        <div className="heatmap-container grid">
            {title && <div className='evaluation-label font-medium text-lg'>{title}</div>}
            <div className='likelihood-label font-semibold text-lg rotate-180 text-center'>Likelihood</div>
            <div className='impact-label font-semibold text-lg text-center'>Impact</div>
            <div className='heatmap-box'>
                <div className='y-axis flex flex-col gap-1'>
                    {reversedScores.map(label => <span key={label} className='flex-1 grid place-items-center'>{label}</span>)}
                </div>
                <div className='x-axis flex gap-1'>
                    {scores.map(label => <span key={label} className='flex-1 grid place-items-center'>{label}</span>)}
                </div>
                <div 
                    className='heatmap'
                    style={{
                        gridTemplateColumns: `repeat(${size}, minmax(5rem, 1fr))`,
                        gridTemplateRows: `repeat(${size}, minmax(5rem, 1fr))`,
                    }}
                >
                    {
                        reversedScores.map((likelihood) => {
                            return scores.map((impact) => {
                                return <Tile key={`${likelihood}-${impact}`} likelihood={likelihood} impact={impact} selected={selected} />
                            })
                        })
                    }
                </div>
            </div>
        </div>
    );
}

function Tile({likelihood, impact, selected}) {
    const weight = likelihood * impact;
    const { levels } = useContext(RiskHeatmapContext);
    const tileLevel = levels.find(level => weight >= level.lower_bound && weight <= level.higher_bound);
    
    // Check for both 'color' and 'colour' properties to handle different spelling conventions
    const color = tileLevel?.color || tileLevel?.colour || '#fff';

    const isSelected = selected.some(s => likelihood === s.likelihood && impact === s.impact);

    return (
        <div style={{backgroundColor: color}} className='flex rounded flex-col gap-1 items-center justify-center'>
            {weight}
            {
                isSelected &&
                <span style={{color}} className='bg-white text-sm font-medium py-1 px-2 rounded-full whitespace-nowrap'>Risk Level</span>
            }
        </div>
    );
}

// heatmap context
export const RiskHeatmapContext = createContext(null);