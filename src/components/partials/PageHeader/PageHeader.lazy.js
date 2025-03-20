import React, { lazy, Suspense } from 'react';

const LazyPageHeader = lazy(() => import('./PageHeader'));

const PageHeader = props => (
  <Suspense fallback={null}>
    <LazyPageHeader {...props} />
  </Suspense>
);

export default PageHeader;
