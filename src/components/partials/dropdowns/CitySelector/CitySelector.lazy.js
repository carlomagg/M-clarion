import React, { lazy, Suspense } from 'react';

const LazyCitySelector = lazy(() => import('./CitySelector'));

const CitySelector = props => (
  <Suspense fallback={null}>
    <LazyCitySelector {...props} />
  </Suspense>
);

export default CitySelector;
