import React, { lazy, Suspense } from 'react';

const LazyAddUserDetailsForm = lazy(() => import('./AddUserDetailsForm'));

const AddUserDetailsForm = props => (
  <Suspense fallback={null}>
    <LazyAddUserDetailsForm {...props} />
  </Suspense>
);

export default AddUserDetailsForm;
