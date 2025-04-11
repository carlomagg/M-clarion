import React, { lazy, Suspense } from 'react';

const LazyAddCity = lazy(() => import('./AddCity'));

const AddCity = props => (
  <Suspense fallback={null}>
    <LazyAddCity {...props} />
  </Suspense>
);

export default AddCity;
