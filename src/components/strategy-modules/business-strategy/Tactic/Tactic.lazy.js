import React, { lazy, Suspense } from 'react';

const LazyTactic = lazy(() => import('./Tactic'));

const Tactic = props => (
  <Suspense fallback={null}>
    <LazyTactic {...props} />
  </Suspense>
);

export default Tactic;
