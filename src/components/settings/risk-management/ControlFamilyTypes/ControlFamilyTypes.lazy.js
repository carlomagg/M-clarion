import React, { lazy, Suspense } from 'react';

const LazyControlFamilyTypes = lazy(() => import('./ControlFamilyTypes'));

const ControlFamilyTypes = props => (
  <Suspense fallback={null}>
    <LazyControlFamilyTypes {...props} />
  </Suspense>
);

export default ControlFamilyTypes;
