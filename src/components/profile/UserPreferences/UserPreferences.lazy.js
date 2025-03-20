import React, { lazy, Suspense } from 'react';

const LazyUserPreferences = lazy(() => import('./UserPreferences'));

const UserPreferences = props => (
  <Suspense fallback={null}>
    <LazyUserPreferences {...props} />
  </Suspense>
);

export default UserPreferences;
