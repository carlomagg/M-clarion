import React, { lazy, Suspense } from 'react';

const LazyGrantUserPermsissionsForm = lazy(() => import('./GrantUserPermsissionsForm'));

const GrantUserPermsissionsForm = props => (
  <Suspense fallback={null}>
    <LazyGrantUserPermsissionsForm {...props} />
  </Suspense>
);

export default GrantUserPermsissionsForm;
