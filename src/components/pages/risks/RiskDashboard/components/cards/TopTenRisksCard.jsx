import { useState } from "react";
import { Card } from "../Elements";
import { useQuery } from "@tanstack/react-query";
import { topTenRisksOptions } from "../../../../../../queries/risks/dashboard";
import { Bar } from "react-chartjs-2";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import DashboardWidgetLoadingIndicator from "../../../../../partials/skeleton-loading-indicators/DashboardWidgetIndicator";
import { Error } from "../Error";

export default function TopTenRisksCard() {
    const [period, setPeriod] = useState('Month');

    // query
    const {isLoading, error, data} = useQuery(topTenRisksOptions(period.toLowerCase()));

    if (isLoading) {
        return <DashboardWidgetLoadingIndicator classes={'p-4'} height={200} />;
    }
    if (error) {
        return <Error classes={'p-4'} />
    }

    const labels = [];
    const inherentData = [];
    const residualData = [];

    data.forEach(risk => {
        labels.unshift(risk.risk_id);
        inherentData.unshift(risk.inherent_risk);
        residualData.unshift(risk.residual_risk);
    });

    return (
        <Card title="Top 10 Risks" selectedPeriod={period} onSelectPeriod={setPeriod} classes="p-4 w-full" options={[]}>
            <div className="h-[500px]">
                <Bar 
                data={{
                    labels: labels,
                    datasets: [
                        {
                            label: 'Inherent Risk',
                            data: inherentData
                        },
                        {
                            label: 'Residual Risk',
                            data: residualData
                        }
                    ]
                }}
                options={{
                    layout: {padding: 20},
                    maintainAspectRatio: false,
                    maxBarThickness: 10,
                    animation: false,
                    indexAxis: 'y',
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                boxHeight: 8,
                                boxWidth: 8
                            }
                        },
                        datalabels: {
                            anchor: 'end',  // Position of the label
                            align: 'end',  // Align the label
                            color: '#000',   // Text color
                            font: {
                                size: 12
                            },
                            formatter: (value, context) => {
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