import React, { lazy, Suspense } from 'react';

const LazyAddActiveDirectory = lazy(() => import('./AddActiveDirectory'));

const AddActiveDirectory = props => (
  <Suspense fallback={null}>
    <LazyAddActiveDirectory {...props} />
  </Suspense>
);

export default AddActiveDirectory;
