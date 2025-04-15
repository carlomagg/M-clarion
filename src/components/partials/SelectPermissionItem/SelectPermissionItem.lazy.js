import React, { lazy, Suspense } from 'react';

const LazySelectPermissionItem = lazy(() => import('./SelectPermissionItem'));

const SelectPermissionItem = props => (
  <Suspense fallback={null}>
    <LazySelectPermissionItem {...props} />
  </Suspense>
);

export default SelectPermissionItem;
