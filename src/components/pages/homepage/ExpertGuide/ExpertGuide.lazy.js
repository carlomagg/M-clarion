import React, { lazy, Suspense } from 'react';

const LazyExpertGuide = lazy(() => import('./ExpertGuide'));

const ExpertGuide = props => (
  <Suspense fallback={null}>
    <LazyExpertGuide {...props} />
  </Suspense>
);

export default ExpertGuide;
