import React, { lazy, Suspense } from 'react';

const LazyVerifyOTPForm = lazy(() => import('./VerifyOTPForm'));

const VerifyOTPForm = props => (
  <Suspense fallback={null}>
    <LazyVerifyOTPForm {...props} />
  </Suspense>
);

export default VerifyOTPForm;
