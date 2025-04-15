import React, { lazy, Suspense } from 'react';

const LazyAddNewUserReview = lazy(() => import('./AddNewUserReview'));

const AddNewUserReview = props => (
  <Suspense fallback={null}>
    <LazyAddNewUserReview {...props} />
  </Suspense>
);

export default AddNewUserReview;
