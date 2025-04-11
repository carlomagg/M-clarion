import { useState } from "react";
import { Card } from "../Elements";
import { useQuery } from "@tanstack/react-query";
import { controlRateByPeriodOptions } from "../../../../../../queries/risks/dashboard";
import { Bar } from "react-chartjs-2";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import DashboardWidgetLoadingIndicator from "../../../../../partials/skeleton-loading-indicators/DashboardWidgetIndicator";
import { Error } from "../Error";

export default function ControlRateByPeriodCard() {
    const [period, setPeriod] = useState('Month');

    // query
    const {isLoading, error, data} = useQuery(controlRateByPeriodOptions(period.toLowerCase()));

    if (isLoading) {
        return <DashboardWidgetLoadingIndicator classes={'p-6'} height={400} />;
    }
    if (error) {
        return <Error classes={'p-6'} />
    }

    const labels = [];
    const counts = [];
    const lowData = [];
    const mediumData = [];
    const highData = [];
    const criticalData = [];

    const isEmpty = data.message;

    if (!isEmpty) {
        data.quarterly_data.forEach(quarter => {
            labels.push(quarter.quarter);
            counts.push(quarter.risk_count);
            // lowData.push(low);
            // mediumData.push(medium);
            // highData.push(high);
            // criticalData.push(critical);
        });
    }

    return (
        <Card title="Control Rate By Period" selectedPeriod={period} onSelectPeriod={setPeriod} classes="p-4 w-full" options={[]}>
            {
                isEmpty ?
                <div className="italic text-text-gray text-sm">{data.message}</div> :
                <>
                    <div className="h-[500px]">
                        <Bar 
                        data={{
                            labels: labels,
                            datasets: [
                                {
                                    data: counts,
                                },
                                // {
                                //     label: 'Low',
                                //     data: lowData,
                                //     backgroundColor: '#17A865',
                                // },
                                // {
                                //     label: 'Medium',
                                //     data: mediumData,
                                //     backgroundColor: '#7BD148',
                                // },
                                // {
                                //     label: 'High',
                                //     data: highData,
                                //     backgroundColor: '#F68D2B',
                                // },
                                // {
                                //     label: 'Critical',
                                //     data: criticalData,
                                //     backgroundColor: '#FB382255',
                                // },
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
                    {/* <div className='overflow-x-auto w-full'>
                        <div className='w-[1000px] p-6 rounded-lg text-[#3B3B3B] text-sm'>
                            <header className='px-4 border-b border-b-[#B7B7B7] flex gap-4'>
                                <span className='py-4 flex-[.5_0]'>#</span>
                                <span className='py-4 flex-[1_0]'>Risk ID</span>
                                <span className='py-4 flex-[3_0]'>Title</span>
                                <span className='py-4 flex-[.5_0]'>Rating</span>
                                <span className='py-4 flex-[1_0]'>Category</span>
                                <span className='py-4 flex-[1_0]'>Status</span>
                                <span className='py-4 flex-[1_0]'>Owner</span>
                                <span className='py-4 flex-[.5_0]'></span>
                            </header>
                            <ul className='flex flex-col'>
                                {
                                    risks.map((risk, i) => {
                                        return (
                                            <li key={i}>
                                                <TableRecord record={{...risk, sn: i+1}} type='risk' />
                                            </li>
                                        );
                                    })
                                }
                            </ul>
                        </div>
                    </div> */}
                </>
            }
            
        </Card>
    );
}