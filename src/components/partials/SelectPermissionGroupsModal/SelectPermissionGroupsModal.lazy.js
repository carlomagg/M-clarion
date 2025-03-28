import React, { lazy, Suspense } from 'react';

const LazySelectPermissionGroupsModal = lazy(() => import('./SelectPermissionGroupsModal'));

const SelectPermissionGroupsModal = props => (
  <Suspense fallback={null}>
    <LazySelectPermissionGroupsModal {...props} />
  </Suspense>
);

export default SelectPermissionGroupsModal;
