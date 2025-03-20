import React, { lazy, Suspense } from 'react';

const LazyFormButtons = lazy(() => import('./FormButtons'));

const FormButtons = props => (
  <Suspense fallback={null}>
    <LazyFormButtons {...props} />
  </Suspense>
);

export default FormButtons;
