import React, { lazy, Suspense } from 'react';

const LazyEditUserProfile = lazy(() => import('./EditUserProfile'));

const EditUserProfile = props => (
  <Suspense fallback={null}>
    <LazyEditUserProfile {...props} />
  </Suspense>
);

export default EditUserProfile;
