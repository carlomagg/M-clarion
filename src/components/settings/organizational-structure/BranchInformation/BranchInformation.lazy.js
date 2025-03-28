import React, { lazy, Suspense } from 'react';

const LazyBranchInformation = lazy(() => import('./BranchInformation'));

const BranchInformation = props => (
  <Suspense fallback={null}>
    <LazyBranchInformation {...props} />
  </Suspense>
);

export default BranchInformation;
