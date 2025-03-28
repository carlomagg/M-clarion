import React, { lazy, Suspense } from 'react';

const LazyHelpCategories = lazy(() => import('./HelpCategories'));

const HelpCategories = props => (
  <Suspense fallback={null}>
    <LazyHelpCategories {...props} />
  </Suspense>
);

export default HelpCategories;
