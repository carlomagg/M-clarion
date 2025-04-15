import React, { lazy, Suspense } from 'react';

const LazyOptionsDropdown = lazy(() => import('./OptionsDropdown'));

const OptionsDropdown = props => (
  <Suspense fallback={null}>
    <LazyOptionsDropdown {...props} />
  </Suspense>
);

export default OptionsDropdown;
