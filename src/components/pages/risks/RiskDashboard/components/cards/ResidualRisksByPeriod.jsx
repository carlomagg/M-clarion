import { useState } from "react";
import { Card } from "../Elements";
import { useQuery } from "@tanstack/react-query";
import { residualRiskByPeriodOptions } from "../../../../../../queries/risks/dashboard";
import { Bar } from "react-chartjs-2";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import DashboardWidgetLoadingIndicator from "../../../../../partials/skeleton-loading-indicators/DashboardWidgetIndicator";
import { Error } from "../Error";

export default function ResidualRisksByPeriodCard() {
    const [period, setPeriod] = useState('Month');

    // query
    const {isLoading, error, data} = useQuery(residualRiskByPeriodOptions(period.toLowerCase()));

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

    Object.entries(data).forEach(([key, {low, medium, high, critical}]) => {
        labels.push(key);
        lowData.push(low);
        mediumData.push(medium);
        highData.push(high);
        criticalData.push(critical);
    });

    return (
        <Card title="Residual Risk By Period" selectedPeriod={period} onSelectPeriod={setPeriod} classes="p-4 w-full" options={[]}>
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
                    ]
                }}
                options={{
                    maintainAspectRatio: false,
                    maxBarThickness: 16,
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
                            anchor: 'end',  // Position of the label
                            align: 'end',  // Align the label
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