import React, { lazy, Suspense } from 'react';

const LazyUserGroupMembers = lazy(() => import('./UserGroupMembers'));

const UserGroupMembers = props => (
  <Suspense fallback={null}>
    <LazyUserGroupMembers {...props} />
  </Suspense>
);

export default UserGroupMembers;
