import React, { lazy, Suspense } from 'react';

const LazyResetPasswordForm = lazy(() => import('./ResetPasswordForm'));

const ResetPasswordForm = props => (
  <Suspense fallback={null}>
    <LazyResetPasswordForm {...props} />
  </Suspense>
);

export default ResetPasswordForm;
