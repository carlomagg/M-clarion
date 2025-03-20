import React, { lazy, Suspense } from 'react';

const LazyManageRiskIndicators = lazy(() => import('./ManageRiskIndicators'));

const ManageRiskIndicators = props => (
  <Suspense fallback={null}>
    <LazyManageRiskIndicators {...props} />
  </Suspense>
);

export default ManageRiskIndicators;
