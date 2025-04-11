import React, { lazy, Suspense } from 'react';

const LazyPermissionReviewList = lazy(() => import('./PermissionReviewList'));

const PermissionReviewList = props => (
  <Suspense fallback={null}>
    <LazyPermissionReviewList {...props} />
  </Suspense>
);

export default PermissionReviewList;
