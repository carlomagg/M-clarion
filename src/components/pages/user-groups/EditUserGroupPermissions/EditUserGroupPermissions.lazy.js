import React, { lazy, Suspense } from 'react';

const LazyEditUserGroupPermissions = lazy(() => import('./EditUserGroupPermissions'));

const EditUserGroupPermissions = props => (
  <Suspense fallback={null}>
    <LazyEditUserGroupPermissions {...props} />
  </Suspense>
);

export default EditUserGroupPermissions;
