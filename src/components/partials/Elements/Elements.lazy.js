import React, { lazy, Suspense } from 'react';

const LazyElements = lazy(() => import('./Elements'));

const Elements = props => (
  <Suspense fallback={null}>
    <LazyElements {...props} />
  </Suspense>
);

export default Elements;
