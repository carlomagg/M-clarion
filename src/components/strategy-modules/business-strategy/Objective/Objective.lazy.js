import React, { lazy, Suspense } from 'react';

const LazyObjective = lazy(() => import('./Objective'));

const Objective = props => (
  <Suspense fallback={null}>
    <LazyObjective {...props} />
  </Suspense>
);

export default Objective;
