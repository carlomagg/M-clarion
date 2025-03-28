import React, { lazy, Suspense } from 'react';

const LazyControlEffectiveness = lazy(() => import('./ControlEffectiveness'));

const ControlEffectiveness = props => (
  <Suspense fallback={null}>
    <LazyControlEffectiveness {...props} />
  </Suspense>
);

export default ControlEffectiveness;
