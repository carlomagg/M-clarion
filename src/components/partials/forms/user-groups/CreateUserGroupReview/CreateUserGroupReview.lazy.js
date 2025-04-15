import React, { lazy, Suspense } from 'react';

const LazyCreateUserGroupReview = lazy(() => import('./CreateUserGroupReview'));

const CreateUserGroupReview = props => (
  <Suspense fallback={null}>
    <LazyCreateUserGroupReview {...props} />
  </Suspense>
);

export default CreateUserGroupReview;
