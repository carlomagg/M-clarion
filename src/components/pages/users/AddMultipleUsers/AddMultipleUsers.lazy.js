import React, { lazy, Suspense } from 'react';

const LazyAddMultipleUsers = lazy(() => import('./AddMultipleUsers'));

const AddMultipleUsers = props => (
  <Suspense fallback={null}>
    <LazyAddMultipleUsers {...props} />
  </Suspense>
);

export default AddMultipleUsers;
