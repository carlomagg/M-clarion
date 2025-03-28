import { Doughnut } from "react-chartjs-2";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { DoughnutController } from "chart.js";
import { useState } from "react";

export function DoughnutChart({data, bgUrl, title}) {
    console.log(data, title)
    const [excludedIndices, setExcludedIndices] = useState(new Set());
    const labels = [], dataset = [];
    Object.keys(data).forEach(key => {
        labels.push(key);
        dataset.push(data[key]);
    });
    // const {labels, dataset} = data;
    const sumOfPortions = dataset.reduce((a,b,i) => {
        if (!excludedIndices.has(i)) return a + b;
        else return a + 0
    }, 0);
    
    return (
        <Doughnut style={{backgroundImage: `url(${bgUrl})`}} className={`bg-no-repeat bg-[30%_50%] bg-[length:85px]`} 
            data={{
                labels: labels,
                datasets: [
                    {
                        backgroundColor: ['#344BFD', '#F4A79D', '#F68D2B', '#F4A79D', '#eb1'],
                        // label: title,
                        data: dataset,
                        radius: 100
                    }
                ]
            }}
            options={{
                animation: false,
                layout: {
                    padding: 0
                },
                plugins: {
                    legend: {
                        onClick: function (e, item, legend) {
                            const {index} = item;
                            const newSet = new Set(excludedIndices);
                            excludedIndices.has(index) ? newSet.delete(index) : newSet.add(index);
                            setExcludedIndices(newSet);
                            DoughnutController.overrides.plugins.legend.onClick(e, item,legend);
                        },
                        position: "right",
                        labels: {
                            boxWidth: 8,
                            boxHeight: 8,
                            padding: 16,
                            usePointStyle: true,
                            pointStyle: 'circle',
                        },
                    },
                    datalabels: {
                        anchor: 'end',  // Position of the label
                        align: 'start',  // Align the label
                        color: '#000',   // Text color
                        font: {
                            weight: 'bolder',
                            size: 13
                        },
                        formatter: (value, context) => {
                            if (Number(value) === 0) return '';
                            return `${((value/sumOfPortions) * 100).toFixed(1)} %`;
                        }
                    }
                }
            }}
            plugins={[ChartDataLabels]}
        />
    );
}

export function GaugeChart ({ value = 0 }) {
    const radius = 100;
    const strokeWidth = 30;
    const needleExtension = 10;
    const min = 0;
    const max = 100;
    const segments = [
        { color: '#17A865', range: [0, 25] },     // green
        { color: '#7BD148', range: [25, 50] },    // light green
        { color: '#FFC25B', range: [50, 75] },   // yellow
        { color: '#FB3822', range: [75, 100] }    // red
    ]
    
    // Calculate total size needed with padding
    const padding = Math.max(strokeWidth, needleExtension) + 10; // Extra 10px buffer
    const totalWidth = (radius * 2) + (padding * 2);
    const totalHeight = radius + strokeWidth + needleExtension + padding;
    
    // Calculate angles for the arc
    const startAngle = -180;
    const endAngle = 0;
    const angleRange = endAngle - startAngle;
    
    // Calculate the current value's angle
    const valueScale = (value - min) / (max - min);
    const valueAngle = startAngle + (angleRange * valueScale);
    
    // Create the arc path
    const createArc = (start, end) => {
        const startRad = (start * Math.PI) / 180;
        const endRad = (end * Math.PI) / 180;
        
        const x1 = radius + radius * Math.cos(startRad);
        const y1 = radius + radius * Math.sin(startRad);
        const x2 = radius + radius * Math.cos(endRad);
        const y2 = radius + radius * Math.sin(endRad);
        
        const largeArc = end - start <= 180 ? 0 : 1;
        
        return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
    };
    
    // Calculate segment paths
    const segmentPaths = segments.map(segment => {
        const segmentStart = ((segment.range[0] - min) / (max - min)) * angleRange + startAngle;
        const segmentEnd = ((segment.range[1] - min) / (max - min)) * angleRange + startAngle;
        return {
            path: createArc(segmentStart, segmentEnd),
            color: segment.color
        };
    });
    
    // Calculate needle points
    const needleRad = (valueAngle * Math.PI) / 180;
    
    // Calculate points for needle with extension
    const innerRadius = radius - (strokeWidth / 2 + needleExtension);
    const outerRadius = radius + (strokeWidth / 2 + needleExtension);
    const needleInnerX = radius + innerRadius * Math.cos(needleRad);
    const needleInnerY = radius + innerRadius * Math.sin(needleRad);
    const needleOuterX = radius + outerRadius * Math.cos(needleRad);
    const needleOuterY = radius + outerRadius * Math.sin(needleRad);

    return (
        <div className="flex justify-center items-center w-full">
            <svg 
                width={totalWidth} 
                height={totalHeight} 
                viewBox={`0 0 ${totalWidth} ${totalHeight}`}
            >
                <g transform={`translate(${padding},${padding})`}>
                    {/* Background arc */}
                    <path
                        d={createArc(startAngle, endAngle)}
                        fill="none"
                        stroke="#e0e0e0"
                        strokeWidth={strokeWidth}
                    />
                    
                    {/* Colored segments */}
                    {segmentPaths.map((segment, i) => (
                        <path
                            key={i}
                            d={segment.path}
                            fill="none"
                            stroke={segment.color}
                            strokeWidth={strokeWidth}
                        />
                    ))}
                    
                    {/* Needle */}
                    <line
                        x1={needleInnerX}
                        y1={needleInnerY}
                        x2={needleOuterX}
                        y2={needleOuterY}
                        stroke="black"
                        strokeWidth="3"
                    />
                    
                    {/* Value text in center */}
                    <text
                        x={radius}
                        y={radius - 10}
                        textAnchor="middle"
                        fontSize="30"
                        fontWeight="bold"
                    >
                        {value}
                    </text>
                </g>
            </svg>
        </div>
    );
};