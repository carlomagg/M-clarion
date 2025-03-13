import { useState } from "react";
import { Card } from "../Elements";
import { useQuery } from "@tanstack/react-query";
import { lossEventSeverityOptions } from "../../../../../../queries/risks/dashboard";
import { Bar } from "react-chartjs-2";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import DashboardWidgetLoadingIndicator from "../../../../../partials/skeleton-loading-indicators/DashboardWidgetIndicator";
import { Error } from "../Error";

export default function LossEventsCard() {
    const [period, setPeriod] = useState('Month');

    // query
    const {isLoading, error, data} = useQuery(lossEventSeverityOptions(period.toLowerCase()));

    if (isLoading) {
        return <DashboardWidgetLoadingIndicator classes={'p-4'} height={200} />;
    }
    if (error) {
        return <Error classes={'p-4'} />
    }

    const labels = [];
    const lowData = [];
    const mediumData = [];
    const highData = [];
    const criticalData = [];
    const netLossData = [];

    const isEmpty = data.message;

    if (!isEmpty) {
        Object.entries(data).forEach(([key, {low, medium, high, critical, netLoss}]) => {
            labels.push(key);
            lowData.push(low);
            mediumData.push(medium);
            highData.push(high);
            criticalData.push(critical);
            netLossData.push(netLoss);
        });
    }
    
    return (
        <Card title="No. Of Loss Events, Severity & Net Loss" selectedPeriod={period} onSelectPeriod={setPeriod} classes="p-4 w-full" options={[]}>
            {
                isEmpty ?
                <div className="italic text-text-gray text-sm">{data.message}</div> :
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
                                backgroundColor: '#17A865',
                            },
                            {
                                label: 'Medium',
                                data: mediumData,
                                backgroundColor: '#7BD148',
                            },
                            {
                                label: 'High',
                                data: highData,
                                backgroundColor: '#F68D2B',
                            },
                            {
                                label: 'Critical',
                                data: criticalData,
                                backgroundColor: '#FB382255',
                            },
                            {
                                label: 'Net loss',
                                data: netLossData,
                                type: 'line',
                                backgroundColor: '#00000040',
                                borderColor: '#F00FA4',
                                pointStyle: 'rectRot',
                                radius: 5,
                            },
                        ]
                    }}
                    options={{
                        maintainAspectRatio: false,
                        maxBarThickness: 16,
                        scales: {
                            x: {stacked: true},
                            y: {stacked: true}
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
                                    if (context.dataset.label === 'Net loss') return '';
                                    return value;
                                }
                            }
                        }
                    }}
                    plugins={[ChartDataLabels]}
                    />
                </div>
            </div>
            }
        </Card>
    );
}