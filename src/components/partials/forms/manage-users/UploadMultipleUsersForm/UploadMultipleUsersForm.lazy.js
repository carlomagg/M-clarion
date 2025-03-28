import React, { lazy, Suspense } from 'react';

const LazyUploadMultipleUsersForm = lazy(() => import('./UploadMultipleUsersForm'));

const UploadMultipleUsersForm = props => (
  <Suspense fallback={null}>
    <LazyUploadMultipleUsersForm {...props} />
  </Suspense>
);

export default UploadMultipleUsersForm;
