import React, { lazy, Suspense } from 'react';

const LazyLinkButton = lazy(() => import('./LinkButton'));

const LinkButton = props => (
  <Suspense fallback={null}>
    <LazyLinkButton {...props} />
  </Suspense>
);

export default LinkButton;
