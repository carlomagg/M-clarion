import React, { lazy, Suspense } from 'react';

const LazyDivisionInformation = lazy(() => import('./DivisionInformation'));

const DivisionInformation = props => (
  <Suspense fallback={null}>
    <LazyDivisionInformation {...props} />
  </Suspense>
);

export default DivisionInformation;
