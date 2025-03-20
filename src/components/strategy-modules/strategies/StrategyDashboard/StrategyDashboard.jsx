import styles from './StrategyDashboard.module.css';

import PageHeader from '../../../partials/PageHeader/PageHeader';
import PageTitle from '../../../partials/PageTitle/PageTitle';
import { CategoryScale } from 'chart.js';
import Chart from 'chart.js/auto';
import OverviewWrapper from './components/OverviewWrapper';
import TotalStrategyHealth from './components/cards/TotalStrategyHealth';
import CurrentObjectiveHealth from './components/cards/CurrentObjectiveHealth';
import CurrentInitiativeHealth from './components/cards/CurrentInitiativeHealth';
import CurrentTacticHealth from './components/cards/CurrentTacticHealth';
import CurrentMetricHealth from './components/cards/CurrentMetricHealth';
import OrganizationalProgressChart from './components/cards/OrganizationProgressChart';
import InitiativesTable from './components/cards/InitiativesTable';
import ProgressChart from './components/cards/InitiativesGanttChart';
import { createContext, useEffect, useState } from 'react';
import StrategySelector from './components/StrategySelector';
import BudgetSpendWrapper from './components/BudgetSpendWrapper';
import ComponentProgressWrapper from './components/ComponentsProgressWrapper';

Chart.register(CategoryScale);

function StrategyDashboard() {
    const [selectedStrategy, setSelectedStrategy] = useState(null);

    return (
        <div className='p-10 pt-4 max-w-7xl flex flex-col gap-6'>
            <PageTitle title={'Page title'} />
            <PageHeader />
            <div className='flex flex-col gap-6'> {/* main content container */}
                <StrategySelector selectedStrategy={selectedStrategy} onSetStrategy={setSelectedStrategy} />
                <OverviewWrapper />
                {
                    selectedStrategy !== null &&
                    <StrategyContext.Provider value={{
                        strategyId: selectedStrategy
                        }}>
                        <div className='flex gap-6'>
                            <div className='flex-1 max-w-80 flex flex-col gap-6'>
                                <TotalStrategyHealth />
                                <CurrentObjectiveHealth />
                                <CurrentInitiativeHealth />
                                <CurrentTacticHealth />
                                <CurrentMetricHealth />
                                <BudgetSpendWrapper />
                            </div>
                            <div className='flex-1 flex flex-col gap-6 overflow-x-auto'>
                                <OrganizationalProgressChart />
                                <ProgressChart />
                                <InitiativesTable />
                                <ComponentProgressWrapper />
                            </div>
                        </div>
                    </StrategyContext.Provider>
                }
            </div>
        </div>
    )
}

export const StrategyContext = createContext(null);

export default StrategyDashboard;