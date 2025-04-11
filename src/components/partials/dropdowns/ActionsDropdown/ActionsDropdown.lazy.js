import React, { lazy, Suspense } from 'react';

const LazyActionsDropdown = lazy(() => import('./ActionsDropdown'));

const ActionsDropdown = props => (
  <Suspense fallback={null}>
    <LazyActionsDropdown {...props} />
  </Suspense>
);

export default ActionsDropdown;
