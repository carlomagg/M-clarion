import React, { lazy, Suspense } from 'react';

const LazyUnitInformation = lazy(() => import('./UnitInformation'));

const UnitInformation = props => (
  <Suspense fallback={null}>
    <LazyUnitInformation {...props} />
  </Suspense>
);

export default UnitInformation;
