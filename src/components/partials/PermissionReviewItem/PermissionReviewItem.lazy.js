import React, { lazy, Suspense } from 'react';

const LazyPermissionReviewItem = lazy(() => import('./PermissionReviewItem'));

const PermissionReviewItem = props => (
  <Suspense fallback={null}>
    <LazyPermissionReviewItem {...props} />
  </Suspense>
);

export default PermissionReviewItem;
