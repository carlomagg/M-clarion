import React, { lazy, Suspense } from 'react';

const LazyAddUserGroupInfoForm = lazy(() => import('./AddUserGroupInfoForm'));

const AddUserGroupInfoForm = props => (
  <Suspense fallback={null}>
    <LazyAddUserGroupInfoForm {...props} />
  </Suspense>
);

export default AddUserGroupInfoForm;
