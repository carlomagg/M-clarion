import React, { lazy, Suspense } from 'react';

const LazyAddCountry = lazy(() => import('./AddCountry'));

const AddCountry = props => (
  <Suspense fallback={null}>
    <LazyAddCountry {...props} />
  </Suspense>
);

export default AddCountry;
