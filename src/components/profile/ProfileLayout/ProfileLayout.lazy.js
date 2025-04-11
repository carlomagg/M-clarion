import React, { lazy, Suspense } from 'react';

const LazySettingsLayout = lazy(() => import('./SettingsLayout'));

const SettingsLayout = props => (
  <Suspense fallback={null}>
    <LazySettingsLayout {...props} />
  </Suspense>
);

export default SettingsLayout;
