import React, { lazy, Suspense } from 'react';

const LazyHelpCategoryTopics = lazy(() => import('./HelpCategoryTopics'));

const HelpCategoryTopics = props => (
  <Suspense fallback={null}>
    <LazyHelpCategoryTopics {...props} />
  </Suspense>
);

export default HelpCategoryTopics;
