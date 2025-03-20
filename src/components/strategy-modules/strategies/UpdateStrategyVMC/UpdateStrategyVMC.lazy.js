import React, { lazy, Suspense } from 'react';

const LazyUpdateStrategyVMC = lazy(() => import('./UpdateStrategyVMC'));

const UpdateStrategyVMC = props => (
  <Suspense fallback={null}>
    <LazyUpdateStrategyVMC {...props} />
  </Suspense>
);

export default UpdateStrategyVMC;
