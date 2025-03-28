import React, { lazy, Suspense } from 'react';

const LazySelectDropdown = lazy(() => import('./SelectDropdown'));

const SelectDropdown = props => (
  <Suspense fallback={null}>
    <LazySelectDropdown {...props} />
  </Suspense>
);

export default SelectDropdown;
