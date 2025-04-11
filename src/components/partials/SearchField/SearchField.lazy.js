import React, { lazy, Suspense } from 'react';

const LazySearchField = lazy(() => import('./SearchField'));

const SearchField = props => (
  <Suspense fallback={null}>
    <LazySearchField {...props} />
  </Suspense>
);

export default SearchField;
