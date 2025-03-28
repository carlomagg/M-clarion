import { Line } from "react-chartjs-2";
import React from 'react';

export function CircularProgress({ value, small = false}) {

    const size = small ? 75 : 200;
    const strokeWidth = small ? 10 : 20;
    const trackColor = '#cccccc';
    const progressColor = '#7086FD'; 
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
        <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        xmlns="http://www.w3.org/2000/svg"
        >
        {/* Track (background circle) */}
        <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={progressColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transform: 'rotate(-90deg)',  transformOrigin: 'center' }}
        />
        {/* Text in the center */}
        <text
            x="50%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
            fontSize={Math.max(size * 0.1, 14)}
            fill="#3B3B3B"
            style={{ transform: 'rotate(0)',  transformOrigin: 'center' }}
        >
            {`${value}%`}
        </text>
        </svg>
    );
};

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

export function AreaChart({data, fillContainer = false}) {
    const { targets, values } = data;
    function getBackroundColor(ctx) {
        const chart = ctx.chart;
        const { ctx: canvasCtx, chartArea, data } = chart;

        if (!chartArea) {
            return null; // Wait until chart is initialized
        }

        // Create a horizontal gradient (left to right)
        const gradient = canvasCtx.createLinearGradient(
          chartArea.left,
          0,
          chartArea.right,
          0
        );

        const dataset = data.datasets[1].data; // "Actual" dataset
        const labels = data.labels; // x-axis labels
        const scaleX = chart.scales.x; // x-axis scale
        const scaleY = chart.scales.y; // y-axis scale

        // Loop through data points to compare values
        for (let i = 0; i < dataset.length; i++) {
            const actualValue = dataset[i];
            const targetValue = targets[i];

            // Determine color based on comparison
            const color = actualValue > targetValue
                ? '#12DD2A40' // Green if above
                : '#DD121540'; // Red if below

            // Normalize the x-axis position
            const pixelPosition = scaleX.getPixelForValue(labels[i]);
            const normalizedPosition = (pixelPosition - chartArea.left) / chartArea.width;

            // Ensure the position is within the valid range [0.0, 1.0]
            const clampedPosition = Math.min(Math.max(normalizedPosition, 0), 1);

            // Add gradient stop
            gradient.addColorStop(clampedPosition, color);
        }

        return gradient;
    }

    return (
        <Line
            data={{
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [
                    {
                        label: 'Target',
                        data: targets,
                        borderWidth: 1,
                        borderColor: '#868686',
                        pointStyle: 'circle',
                        pointRadius: 4,
                        pointBackgroundColor: '#7C7C7C',
                        pointBorderWidth: 6,
                        pointBorderColor: '#7C7C7C77'
                    },
                    {
                        label: 'Actual',
                        fill: true,
                        data: values,
                        tension: 0.4,
                        borderWidth: 1,
                        borderColor: '#DD127A',
                        pointStyle: 'circle',
                        pointRadius: 4,
                        pointBackgroundColor: '#DD127A',
                        pointBorderWidth: 6,
                        pointBorderColor: '#DD127A77',
                        backgroundColor: getBackroundColor
                    }
                ]
            }}
            options={{
                animation: false,
                maintainAspectRatio: !fillContainer,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxHeight: 8,
                            boxWidth: 8
                        }
                    },
                }
            }}
        />
    );
}