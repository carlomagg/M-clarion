import React, { lazy, Suspense } from 'react';

const LazyManageRiskClassification = lazy(() => import('./ManageRiskClassification'));

const ManageRiskClassification = props => (
  <Suspense fallback={null}>
    <LazyManageRiskClassification {...props} />
  </Suspense>
);

export default ManageRiskClassification;
