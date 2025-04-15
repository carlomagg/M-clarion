import { useState } from "react";
import { Card } from "../Elements";
import { useQuery } from "@tanstack/react-query";
import { riskTrendAndCostOptions } from "../../../../../../queries/risks/dashboard";
import { Bar } from "react-chartjs-2";
import ChartDataLabels from 'chartjs-plugin-datalabels';

export default function RiskTrendAndCostCard() {
    const [period, setPeriod] = useState('Month');

    // query
    const {isLoading, error, data} = useQuery(riskTrendAndCostOptions(period.toLowerCase()));

    if (isLoading) return <div>Loading</div>
    if (error) return <div>error</div>

    const labels = [];
    const lowData = [];
    const mediumData = [];
    const highData = [];
    const criticalData = [];
    const lossEventsData = [];
    const costOfControlData = [];

    Object.entries(data).forEach(([key, {low, medium, high, critical, lossEvent, costOfControl}]) => {
        labels.push(key);
        lowData.push(low);
        mediumData.push(medium);
        highData.push(high);
        criticalData.push(critical);
        lossEventsData.push(lossEvent);
        costOfControlData.push(costOfControl);
    });

    return (
        <Card title="Risk Trend & Cost of Control" selectedPeriod={period} onSelectPeriod={setPeriod} classes="p-4 w-full" options={[]}>
            <div>
                <div className="px-4 text-[#000]/70 text-xs space-y-1">
                    <p>15 Total Incidents</p>
                    <p>15 Total Unresolved Incidents</p>
                    <p>$156,367,348 Total Loss</p>
                </div>
                <div className="h-[500px]">
                    <Bar 
                    data={{
                        labels: labels,
                        datasets: [
                            {
                                label: 'Low',
                                data: lowData,
                                backgroundColor: '#17A86555',
                            },
                            {
                                label: 'Medium',
                                data: mediumData,
                                backgroundColor: '#7BD14855',
                            },
                            {
                                label: 'High',
                                data: highData,
                                backgroundColor: '#F68D2B55',
                            },
                            {
                                label: 'Critical',
                                data: criticalData,
                                backgroundColor: '#FB382255',
                            },
                            {
                                label: 'Loss events',
                                data: lossEventsData,
                                type: 'line',
                                backgroundColor: '#00000040',
                                borderColor: '#4C53FF',
                                pointStyle: 'rectRot',
                                radius: 5,
                                yAxisID: 'y1',
                            },
                            {
                                label: 'Cost of control',
                                data: costOfControlData,
                                type: 'line',
                                backgroundColor: '#00000040',
                                borderColor: '#000',
                                pointStyle: 'rectRot',
                                radius: 5,
                                yAxisID: 'y2',
                            },
                        ]
                    }}
                    options={{
                        maintainAspectRatio: false,
                        maxBarThickness: 16,
                        scales: {
                            x: {stacked: true},
                            y: {
                                type: 'linear',
                                position: 'left',
                                stacked: true,  // For the bar charts
                            },
                            y1: {
                                type: 'linear',
                                position: 'left',
                                max: 25,
                                display: false
                            },
                            y2: {
                                type: 'linear',
                                position: 'right',
                                max: 25,
                                display: false,
                            }
                        },
                        animation: false,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: {

                                    boxHeight: 8,
                                    boxWidth: 8
                                }
                            },
                            datalabels: {
                                anchor: 'center',  // Position of the label
                                align: 'center',  // Align the label
                                color: '#000',   // Text color
                                font: {
                                    size: 14
                                },
                                formatter: (value, context) => {
                                    if (context.dataset.label === 'Loss events' || context.dataset.label === 'Cost of cntrol') return '';
                                    return value;
                                }
                            }
                        }
                    }}
                    plugins={[ChartDataLabels]}
                    />
                </div>
            </div>
        </Card>
    );
}