import React, { lazy, Suspense } from 'react';

const LazyStrategyThemes = lazy(() => import('./StrategyThemes'));

const StrategyThemes = props => (
  <Suspense fallback={null}>
    <LazyStrategyThemes {...props} />
  </Suspense>
);

export default StrategyThemes;
