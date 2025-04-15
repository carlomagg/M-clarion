import React, { lazy, Suspense } from 'react';

const LazyExpertGuides = lazy(() => import('./ExpertGuides'));

const ExpertGuides = props => (
  <Suspense fallback={null}>
    <LazyExpertGuides {...props} />
  </Suspense>
);

export default ExpertGuides;
