import React, { lazy, Suspense } from 'react';

const LazyAddState = lazy(() => import('./AddState'));

const AddState = props => (
  <Suspense fallback={null}>
    <LazyAddState {...props} />
  </Suspense>
);

export default AddState;
