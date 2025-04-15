import React, { lazy, Suspense } from 'react';

const LazyAddNewButton = lazy(() => import('./AddNewButton'));

const AddNewButton = props => (
  <Suspense fallback={null}>
    <LazyAddNewButton {...props} />
  </Suspense>
);

export default AddNewButton;
