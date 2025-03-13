import React, { lazy, Suspense } from 'react';

const LazyManageRiskAppetite = lazy(() => import('./ManageRiskAppetite'));

const ManageRiskAppetite = props => (
  <Suspense fallback={null}>
    <LazyManageRiskAppetite {...props} />
  </Suspense>
);

export default ManageRiskAppetite;
