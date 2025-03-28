import React, { lazy, Suspense } from 'react';

const LazyPageTitle = lazy(() => import('./PageTitle'));

const PageTitle = props => (
  <Suspense fallback={null}>
    <LazyPageTitle {...props} />
  </Suspense>
);

export default PageTitle;
