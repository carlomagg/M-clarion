import React, { lazy, Suspense } from 'react';

const LazyAddMultipleUsersReview = lazy(() => import('./AddMultipleUsersReview'));

const AddMultipleUsersReview = props => (
  <Suspense fallback={null}>
    <LazyAddMultipleUsersReview {...props} />
  </Suspense>
);

export default AddMultipleUsersReview;
