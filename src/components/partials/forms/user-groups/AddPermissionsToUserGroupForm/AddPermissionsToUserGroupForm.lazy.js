import React, { lazy, Suspense } from 'react';

const LazyAddPermissionsToUserGroupForm = lazy(() => import('./AddPermissionsToUserGroupForm'));

const AddPermissionsToUserGroupForm = props => (
  <Suspense fallback={null}>
    <LazyAddPermissionsToUserGroupForm {...props} />
  </Suspense>
);

export default AddPermissionsToUserGroupForm;
