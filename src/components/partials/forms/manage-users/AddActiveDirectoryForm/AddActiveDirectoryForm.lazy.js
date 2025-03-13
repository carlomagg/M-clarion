import React, { lazy, Suspense } from 'react';

const LazyAddActiveDirectoryForm = lazy(() => import('./AddActiveDirectoryForm'));

const AddActiveDirectoryForm = props => (
  <Suspense fallback={null}>
    <LazyAddActiveDirectoryForm {...props} />
  </Suspense>
);

export default AddActiveDirectoryForm;
