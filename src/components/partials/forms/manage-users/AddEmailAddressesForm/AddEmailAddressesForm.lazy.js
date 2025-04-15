import React, { lazy, Suspense } from 'react';

const LazyAddEmailAddressesForm = lazy(() => import('./AddEmailAddressesForm'));

const AddEmailAddressesForm = props => (
  <Suspense fallback={null}>
    <LazyAddEmailAddressesForm {...props} />
  </Suspense>
);

export default AddEmailAddressesForm;
