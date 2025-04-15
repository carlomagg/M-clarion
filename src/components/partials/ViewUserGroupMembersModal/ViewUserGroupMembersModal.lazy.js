import React, { lazy, Suspense } from 'react';

const LazyViewUserGroupMembersModal = lazy(() => import('./ViewUserGroupMembersModal'));

const ViewUserGroupMembersModal = props => (
  <Suspense fallback={null}>
    <LazyViewUserGroupMembersModal {...props} />
  </Suspense>
);

export default ViewUserGroupMembersModal;
