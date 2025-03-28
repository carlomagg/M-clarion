import React, { lazy, Suspense } from 'react';

const LazyReviewEmailAddressesForm = lazy(() => import('./ReviewEmailAddressesForm'));

const ReviewEmailAddressesForm = props => (
  <Suspense fallback={null}>
    <LazyReviewEmailAddressesForm {...props} />
  </Suspense>
);

export default ReviewEmailAddressesForm;
