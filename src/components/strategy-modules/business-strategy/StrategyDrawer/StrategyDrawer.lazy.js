import React, { lazy, Suspense } from 'react';

const LazyStrategyDrawer = lazy(() => import('./StrategyDrawer'));

const StrategyDrawer = props => (
  <Suspense fallback={null}>
    <LazyStrategyDrawer {...props} />
  </Suspense>
);

export default StrategyDrawer;
