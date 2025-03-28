import React, { lazy, Suspense } from 'react';

const LazyEditUserPermissions = lazy(() => import('./EditUserPermissions'));

const EditUserPermissions = props => (
  <Suspense fallback={null}>
    <LazyEditUserPermissions {...props} />
  </Suspense>
);

export default EditUserPermissions;
