import React, { useContext, useState } from "react";
import { Card, PeriodsDropdown, Widget } from "../Elements";
import OptionsDropdown from "../../../../../partials/dropdowns/OptionsDropdown/OptionsDropdown";
import { useQuery } from "@tanstack/react-query";
import { initiativeGanttChartOptions } from "../../../../../../queries/strategies/dashboard";
import { StrategyContext } from "../../StrategyDashboard";
import DashboardWidgetLoadingIndicator from "../../../../../partials/skeleton-loading-indicators/DashboardWidgetIndicator";
import { Error } from "../Error";

export default function ProgressChart() {
    const [filters, setFilters] = useState([]);
    const [period, setPeriod] = useState('Month');
    const { strategyId } = useContext(StrategyContext);

    // queries
    const {isLoading, error, data} = useQuery(initiativeGanttChartOptions(strategyId, period.toLowerCase()));

    if (isLoading) {
        return <DashboardWidgetLoadingIndicator classes={'p-4'} height={400} />;
    }
    if (error) {
        return <Error classes={'p-4'} />
    }

    console.log(data)

    const initiatives = [
        { name: "Initiative 1", startDate: "2023-08-01", endDate: "2024-08-01", status: "Overdue" },
        { name: "Initiative 2", startDate: "2024-02-01", endDate: "2024-12-15", status: "At Risk" },
        { name: "Initiative 3", startDate: "2024-05-01", endDate: "2024-11-01", status: "Completed" },
        { name: "Initiative 4", startDate: "2024-09-01", endDate: "2025-12-01", status: "Pending" },
        { name: "Initiative 5", startDate: "2024-03-01", endDate: "2024-08-01", status: "Overdue" },
        { name: "Initiative 6", startDate: "2024-05-12", endDate: "2024-11-15", status: "At Risk" },
        { name: "Initiative 7", startDate: "2024-01-01", endDate: "2025-01-01", status: "Completed" },
        { name: "Initiative 8", startDate: "2024-09-01", endDate: "2025-12-01", status: "Pending" },
    ];

    const filteredInitiatives = initiatives.filter(initiative => !filters.includes(initiative.status));

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    const chartWidth = 800; // Full SVG width
    const yAxisOffset = 70; // Reduced space for Y-axis labels
    const yearStart = new Date(`${currentYear}-01-01`).getTime();
    const yearEnd = new Date(`${currentYear}-12-31`).getTime();
    const barHeight = 20;
    const barSpacing = 30;
    const chartHeight = yAxisOffset + filteredInitiatives.length * barSpacing;

    // Helper to calculate X position
    const calculateXPosition = (date) => {
        const time = new Date(date).getTime();
        if (time < yearStart) return yAxisOffset;
        if (time > yearEnd) return chartWidth - yAxisOffset;
        return (
        ((time - yearStart) / (yearEnd - yearStart)) *
            (chartWidth - 2 * yAxisOffset) +
        yAxisOffset
        );
    };

    const colors = {
        'Completed': '#3DEB57', // green
        'Overdue': '#FD7D7D', // red
        'At Risk': '#FFCE7C', // yellow
        'Pending': '#9E9E9E' // grey
    };

    // Bar color logic
    const getBarColor = (status) => {
        return colors[status] || '#000';
    };

    function handleFilter(status) {
        if (filters.includes(status)) {
            setFilters(filters.filter(f => f !== status));
        } else {
            setFilters([...filters, status]);
        }
    }

    return (
        <Card title={"Initiatives"} classes="gap-4 p-6" filterableByPeriod={true} selectedPeriod={period} onSelectPeriod={setPeriod} options={[]}>
            <div className="overflow-x-auto pb-4">
                <div style={{ width: `${chartWidth}px`, margin: "0 auto" }}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={chartWidth}
                    height={chartHeight}
                    // style={{ background: "#fff", border: "1px solid #ddd" }}
                >
                    {/* X-axis */}
                    <line
                    x1={yAxisOffset}
                    y1={chartHeight - yAxisOffset / 2}
                    x2={chartWidth - yAxisOffset}
                    y2={chartHeight - yAxisOffset / 2}
                    stroke="#000"
                    strokeWidth="1"
                    />
                    {/* Y-axis */}
                    <line
                    x1={yAxisOffset}
                    y1={yAxisOffset / 2}
                    x2={yAxisOffset}
                    y2={chartHeight - yAxisOffset / 2}
                    stroke="#000"
                    strokeWidth="1"
                    />

                    {/* Vertical grid lines and X-axis labels */}
                    {["Q1", "Q2", "Q3", "Q4"].map((label, i) => {
                    const x = yAxisOffset + ((i + 1) * (chartWidth - 2 * yAxisOffset)) / 4;
                    return (
                        <g key={label}>
                        <line
                            x1={x}
                            y1={yAxisOffset / 2}
                            x2={x}
                            y2={chartHeight - yAxisOffset / 2}
                            stroke="#e0e0e0"
                            strokeDasharray="4"
                        />
                        <text
                            x={x}
                            y={chartHeight - yAxisOffset / 2 + 20}
                            fontSize="12"
                            fill="#000"
                            textAnchor="middle"
                        >
                            {label}
                        </text>
                        </g>
                    );
                    })}

                    {/* Horizontal grid lines */}
                    {filteredInitiatives.map((_, i) => {
                    const y = yAxisOffset / 2 + (i + 1) * barSpacing;
                    return (
                        i !== filteredInitiatives.length - 1 && (
                        <line
                            key={i}
                            x1={yAxisOffset}
                            y1={y}
                            x2={chartWidth - yAxisOffset}
                            y2={y}
                            stroke="#e0e0e0"
                            strokeDasharray="4"
                        />
                        )
                    );
                    })}

                    {/* Y-axis labels */}
                    {filteredInitiatives.map((initiative, i) => (
                    <text
                        key={initiative.name}
                        x={yAxisOffset - 10}
                        y={yAxisOffset / 2 + (i + 0.5) * barSpacing}
                        fontSize="12"
                        fill="#000"
                        textAnchor="end"
                        alignmentBaseline="middle"
                    >
                        {initiative.name}
                    </text>
                    ))}

                    {/* Bars */}
                    {filteredInitiatives.map((initiative, i) => {
                    const xStart = calculateXPosition(initiative.startDate);
                    const xEnd = calculateXPosition(initiative.endDate);
                    return (
                            <rect
                            key={i}
                            className="cursor-pointer"
                            x={xStart}
                            y={yAxisOffset / 2 + (i + 0.5) * barSpacing - barHeight / 2}
                            width={Math.max(0, xEnd - xStart)}
                            height={barHeight}
                            fill={getBarColor(initiative.status)}
                            >
                            <title>
                                    {`Start Date: ${initiative.startDate}\nEnd Date: ${initiative.endDate}`}
                                </title> 
                            </rect>
                    );
                    })}

                    {/* Current date line */}
                    <line
                    x1={calculateXPosition(currentDate.toISOString())}
                    y1={yAxisOffset / 2}
                    x2={calculateXPosition(currentDate.toISOString())}
                    y2={chartHeight - yAxisOffset / 2}
                    stroke="#DD127A"
                    strokeWidth="2"
                    >
                        <title>
                            {`Current Date: ${currentDate.toISOString()}`}
                        </title>
                    </line>
                </svg>

                {/* Legend */}
                <div className="flex gap-2 w-fit m-auto mt-2">
                    <LegendLabel text={'Completed'} color={colors['Completed']} onClick={() => handleFilter('Completed')} isCanceled={filters.includes('Completed')} />
                    <LegendLabel text={'Overdue'} color={colors['Overdue']} onClick={() => handleFilter('Overdue')} isCanceled={filters.includes('Overdue')} />
                    <LegendLabel text={'At Risk'} color={colors['At Risk']} onClick={() => handleFilter('At Risk')} isCanceled={filters.includes('At Risk')} />
                    <LegendLabel text={'Pending'} color={colors['Pending']} onClick={() => handleFilter('Pending')} isCanceled={filters.includes('Pending')} />
                    <LegendLabel text={'Current date'} color={'#DD127A'} onClick={() => {}} />
                </div>
                </div>
            </div>
        </Card>
    );
};

function LegendLabel({text, color, onClick, isCanceled}) {
    return (
        <button onClick={onClick} type="button" className={`text-xs text-[#000000B2] flex gap-1 items-center ${isCanceled ? 'line-through' : ''}`}>
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4.5" y="4.5" width="7" height="7" fill={color} stroke="white"/>
            </svg>
            {text}
        </button>
    );
}