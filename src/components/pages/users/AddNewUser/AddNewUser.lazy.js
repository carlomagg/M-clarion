import React, { lazy, Suspense } from 'react';

const LazyAddNewUser = lazy(() => import('./AddNewUser'));

const AddNewUser = props => (
  <Suspense fallback={null}>
    <LazyAddNewUser {...props} />
  </Suspense>
);

export default AddNewUser;
