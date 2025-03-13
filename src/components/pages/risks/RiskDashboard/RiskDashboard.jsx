import styles from './RiskDashboard.module.css';

import PageHeader from '../../../partials/PageHeader/PageHeader';
import PageTitle from '../../../partials/PageTitle/PageTitle';
import { CategoryScale } from 'chart.js';
import Chart from 'chart.js/auto';
import CompletedRisksCard from './components/cards/CompletedRisksCard';
import TotalRisksCard from './components/cards/TotalRisksCard';
import HighRisksCard from './components/cards/HighRisksCard';
import OverdueRisksCard from './components/cards/OverdueRisksCard';
import AverageRiskSeverityCard from './components/cards/AverageRiskSeverityCard';
import CurrentRiskScoreCard from './components/cards/CurrentRiskScoreCard';
import CurrentRiskStatusCard from './components/cards/CurrentRiskStatusCard';
import RiskDistributionByRatingCard from './components/cards/RiskDistributionByRatingCard';
import RiskDistributionByCategoryCard from './components/cards/RiskDistributionByCategoryCard';
import ActionPlanBreakdownCard from './components/cards/ActionPlanBreakdownCard';
import ControlPerformanceCard from './components/cards/ControlPerformanceCard';
import NetLossCard from './components/cards/NetLossCard';
import TopTenRisksCard from './components/cards/TopTenRisksCard';
import LossEventsCard from './components/cards/LossEventsCard';
import InherentRisksByPeriodCard from './components/cards/InherentRisksByPeriodCard';
import ResidualRisksByPeriodCard from './components/cards/ResidualRisksByPeriod';
import HeatMapCard from './components/cards/HeatMapCard';
import TopRisksCard from './components/cards/TopRisksCard';
import RisksByCategoryCard from './components/cards/RisksByCategoryCard';
import TopLossEventsCard from './components/cards/TopLossEvents';
import ControlRateByPeriodCard from './components/cards/ControlRateByPeriodCard';

Chart.register(CategoryScale);

function RiskDashboard() {
    return (
        <div className='p-10 pt-4 max-w-7xl flex flex-col gap-6'>
            <PageTitle title={'Risk Dashboard'} />
            <PageHeader />
            <div className='flex flex-col gap-6'> {/* main content container */}
                <div className='flex gap-3'>
                    <TotalRisksCard />
                    <HighRisksCard />
                    <OverdueRisksCard />
                    <CompletedRisksCard />
                    <AverageRiskSeverityCard />
                </div>
                <div className='flex gap-6'>
                    <div className='flex-1 max-w-[400px] flex flex-col gap-6'>
                        <CurrentRiskScoreCard />
                        <CurrentRiskStatusCard />
                        <RiskDistributionByRatingCard />
                        <RiskDistributionByCategoryCard />
                        <ActionPlanBreakdownCard />
                        <ControlPerformanceCard />
                        <NetLossCard />
                        <TopTenRisksCard />
                        <LossEventsCard />
                        {/* <RiskTrendAndCostCard /> */}
                        <InherentRisksByPeriodCard />
                        <ResidualRisksByPeriodCard />
                    </div>
                    <div className='flex-1 flex flex-col gap-6 overflow-x-auto'>
                        <HeatMapCard />
                        <TopRisksCard />
                        <RisksByCategoryCard />
                        <TopLossEventsCard />
                        <ControlRateByPeriodCard />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RiskDashboard;