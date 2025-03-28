import React, { lazy, Suspense } from 'react';

const LazyLocation = lazy(() => import('./Location'));

const Location = props => (
  <Suspense fallback={null}>
    <LazyLocation {...props} />
  </Suspense>
);

export default Location;
