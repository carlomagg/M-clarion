import React, { lazy, Suspense } from 'react';

const LazyAddMultipleUsersDropdown = lazy(() => import('./AddMultipleUsersDropdown'));

const AddMultipleUsersDropdown = props => (
  <Suspense fallback={null}>
    <LazyAddMultipleUsersDropdown {...props} />
  </Suspense>
);

export default AddMultipleUsersDropdown;
