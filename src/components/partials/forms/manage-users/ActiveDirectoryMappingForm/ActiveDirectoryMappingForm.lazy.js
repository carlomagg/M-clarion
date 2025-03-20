import React, { lazy, Suspense } from 'react';

const LazyActiveDirectoryMappingForm = lazy(() => import('./ActiveDirectoryMappingForm'));

const ActiveDirectoryMappingForm = props => (
  <Suspense fallback={null}>
    <LazyActiveDirectoryMappingForm {...props} />
  </Suspense>
);

export default ActiveDirectoryMappingForm;
