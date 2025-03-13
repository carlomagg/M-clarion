import React, { lazy, Suspense } from 'react';

const LazyStepper = lazy(() => import('./Stepper'));

const Stepper = props => (
  <Suspense fallback={null}>
    <LazyStepper {...props} />
  </Suspense>
);

export default Stepper;
