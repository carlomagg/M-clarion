import React, { lazy, Suspense } from 'react';

const LazyHelpGuide = lazy(() => import('./HelpGuide'));

const HelpGuide = props => (
  <Suspense fallback={null}>
    <LazyHelpGuide {...props} />
  </Suspense>
);

export default HelpGuide;
