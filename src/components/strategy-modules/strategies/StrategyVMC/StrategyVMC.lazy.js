import React, { lazy, Suspense } from 'react';

const LazyStrategyVMC = lazy(() => import('./StrategyVMC'));

const StrategyVMC = props => (
  <Suspense fallback={null}>
    <LazyStrategyVMC {...props} />
  </Suspense>
);

export default StrategyVMC;
