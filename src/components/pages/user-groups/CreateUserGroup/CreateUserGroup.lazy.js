import React, { lazy, Suspense } from 'react';

const LazyCreateUserGroup = lazy(() => import('./CreateUserGroup'));

const CreateUserGroup = props => (
  <Suspense fallback={null}>
    <LazyCreateUserGroup {...props} />
  </Suspense>
);

export default CreateUserGroup;
