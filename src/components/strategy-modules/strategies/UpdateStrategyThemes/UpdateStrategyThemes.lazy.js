import React, { lazy, Suspense } from 'react';

const LazyUpdateStrategyThemes = lazy(() => import('./UpdateStrategyThemes'));

const UpdateStrategyThemes = props => (
  <Suspense fallback={null}>
    <LazyUpdateStrategyThemes {...props} />
  </Suspense>
);

export default UpdateStrategyThemes;
