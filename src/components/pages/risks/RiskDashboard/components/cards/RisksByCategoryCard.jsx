import { useState } from "react";
import { Card } from "../Elements";
import { useQuery } from "@tanstack/react-query";
import { risksByCategory } from "../../../../../../queries/risks/dashboard";
import { Bar } from "react-chartjs-2";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import DashboardWidgetLoadingIndicator from "../../../../../partials/skeleton-loading-indicators/DashboardWidgetIndicator";
import { Error } from "../Error";

export default function RisksByCategoryCard() {
    const [period, setPeriod] = useState('Month');

    // query
    const {isLoading, error, data} = useQuery(risksByCategory(period.toLowerCase()));

    if (isLoading) {
        return <DashboardWidgetLoadingIndicator classes={'p-6'} height={400} />;
    }
    if (error) {
        return <Error classes={'p-6'} />
    }

    const labels = [];
    const counts = []
    const lowData = [];
    const mediumData = [];
    const highData = [];
    const criticalData = [];
    const lossEventData = [];
    const netLossData = [];
    const costOfControlData = [];

    
    data.forEach(risk => {
        labels.push(risk.category_name);
        counts.push(risk.risk_count)
        // lowData.push(low);
        // mediumData.push(medium);
        // highData.push(high);
        // criticalData.push(critical);
        // lossEventData.push(lossEvent);
        // netLossData.push(netLoss);
        // costOfControlData.push(costOfControl);
    });

    return (
        <Card title="Risk By Category" selectedPeriod={period} onSelectPeriod={setPeriod} classes="p-4 w-full" options={[]}>
            <div className="h-[500px]">
                <Bar 
                data={{
                    labels: labels,
                    // datasets: [
                    //     {
                    //         label: 'Low',
                    //         data: lowData,
                    //         backgroundColor: '#17A86577',
                    //     },
                    //     {
                    //         label: 'Medium',
                    //         data: mediumData,
                    //         backgroundColor: '#7BD14877',
                    //     },
                    //     {
                    //         label: 'High',
                    //         data: highData,
                    //         backgroundColor: '#F68D2B77',
                    //     },
                    //     {
                    //         label: 'Critical',
                    //         data: criticalData,
                    //         backgroundColor: '#FB382255',
                    //     },
                    //     {
                    //         label: 'Loss event',
                    //         data: lossEventData,
                    //         type: 'line',
                    //         backgroundColor: '#00000040',
                    //         borderColor: '#4C53FF',
                    //         pointStyle: 'rectRot',
                    //         radius: 5,
                    //         yAxisID: 'y1'
                    //     },
                    //     {
                    //         label: 'Net loss',
                    //         data: netLossData,
                    //         type: 'line',
                    //         backgroundColor: '#00000040',
                    //         borderColor: '#F00FA4',
                    //         pointStyle: 'rectRot',
                    //         radius: 5,
                    //         yAxisID: 'y2'
                    //     },
                    //     {
                    //         label: 'Cost of control',
                    //         data: costOfControlData,
                    //         type: 'line',
                    //         backgroundColor: '#00000040',
                    //         borderColor: '#000000',
                    //         pointStyle: 'rectRot',
                    //         radius: 5,
                    //         yAxisID: 'y3'
                    //     },
                    // ]
                    datasets: [{data: counts}]
                }}
                options={{
                    maintainAspectRatio: false,
                    maxBarThickness: 16,
                    animation: false,
                    scales: {
                        x: {stacked: true},
                        y: {stacked: true},
                        y1: {
                            type: 'linear',
                            position: 'left',
                            max: 50,
                            display: false
                        },
                        y2: {
                            type: 'linear',
                            position: 'right',
                            max: 50,
                            display: false,
                        },
                        y3: {
                            type: 'linear',
                            position: 'right',
                            max: 50,
                            display: false,
                        }
                    },
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
                                if (context.dataset.label === 'Net loss') return '';
                                return value;
                            }
                        }
                    }
                }}
                plugins={[ChartDataLabels]}
                />
            </div>
        </Card>
    );
}