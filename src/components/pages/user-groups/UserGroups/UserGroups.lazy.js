import React, { lazy, Suspense } from 'react';

const LazyUserGroups = lazy(() => import('./UserGroups'));

const UserGroups = props => (
  <Suspense fallback={null}>
    <LazyUserGroups {...props} />
  </Suspense>
);

export default UserGroups;
