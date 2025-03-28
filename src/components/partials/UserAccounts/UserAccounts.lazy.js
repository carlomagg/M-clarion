import React, { lazy, Suspense } from 'react';

const LazyUserAccounts = lazy(() => import('./UserAccounts'));

const UserAccounts = props => (
  <Suspense fallback={null}>
    <LazyUserAccounts {...props} />
  </Suspense>
);

export default UserAccounts;
