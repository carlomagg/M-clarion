import React, { lazy, Suspense } from 'react';

const LazyManageUsers = lazy(() => import('./ManageUsers'));

const ManageUsers = props => (
  <Suspense fallback={null}>
    <LazyManageUsers {...props} />
  </Suspense>
);

export default ManageUsers;
