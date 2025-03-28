import React, { lazy, Suspense } from 'react';

const LazyGoal = lazy(() => import('./Goal'));

const Goal = props => (
  <Suspense fallback={null}>
    <LazyGoal {...props} />
  </Suspense>
);

export default Goal;
