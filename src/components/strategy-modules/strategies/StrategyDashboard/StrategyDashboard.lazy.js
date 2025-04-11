import React, { lazy, Suspense } from 'react';

const LazyStrategyDashboard = lazy(() => import('./StrategyDashboard'));

const StrategyDashboard = props => (
  <Suspense fallback={null}>
    <LazyStrategyDashboard {...props} />
  </Suspense>
);

export default StrategyDashboard;
