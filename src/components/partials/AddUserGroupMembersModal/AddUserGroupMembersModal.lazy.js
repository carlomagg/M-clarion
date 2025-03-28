import React, { lazy, Suspense } from 'react';

const LazyAddUserGroupMembersModal = lazy(() => import('./AddUserGroupMembersModal'));

const AddUserGroupMembersModal = props => (
  <Suspense fallback={null}>
    <LazyAddUserGroupMembersModal {...props} />
  </Suspense>
);

export default AddUserGroupMembersModal;
