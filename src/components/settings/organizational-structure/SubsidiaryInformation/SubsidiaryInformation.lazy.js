import React, { lazy, Suspense } from 'react';

const LazySubsidiaryInformation = lazy(() => import('./SubsidiaryInformation'));

const SubsidiaryInformation = props => (
  <Suspense fallback={null}>
    <LazySubsidiaryInformation {...props} />
  </Suspense>
);

export default SubsidiaryInformation;
