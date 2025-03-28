import React, { lazy, Suspense } from 'react';

const LazyForgotPasswordForm = lazy(() => import('./ForgotPasswordForm'));

const ForgotPasswordForm = props => (
  <Suspense fallback={null}>
    <LazyForgotPasswordForm {...props} />
  </Suspense>
);

export default ForgotPasswordForm;
