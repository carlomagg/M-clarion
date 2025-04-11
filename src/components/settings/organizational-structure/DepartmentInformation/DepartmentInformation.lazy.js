import React, { lazy, Suspense } from 'react';

const LazyDepartmentInformation = lazy(() => import('./DepartmentInformation'));

const DepartmentInformation = props => (
  <Suspense fallback={null}>
    <LazyDepartmentInformation {...props} />
  </Suspense>
);

export default DepartmentInformation;
