import React, { lazy, Suspense } from 'react';

const LazyCKEditor = lazy(() => import('./CKEditor'));

const CKEditor = props => (
  <Suspense fallback={null}>
    <LazyCKEditor {...props} />
  </Suspense>
);

export default CKEditor;
