import React, { lazy, Suspense } from 'react';

const LazyAddActiveDirectoryReview = lazy(() => import('./AddActiveDirectoryReview'));

const AddActiveDirectoryReview = props => (
  <Suspense fallback={null}>
    <LazyAddActiveDirectoryReview {...props} />
  </Suspense>
);

export default AddActiveDirectoryReview;
