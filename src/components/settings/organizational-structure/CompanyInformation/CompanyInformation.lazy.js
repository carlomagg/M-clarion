import React, { lazy, Suspense } from 'react';

const LazyCompanyInformation = lazy(() => import('./CompanyInformation'));

const CompanyInformation = props => (
  <Suspense fallback={null}>
    <LazyCompanyInformation {...props} />
  </Suspense>
);

export default CompanyInformation;
