import React, { lazy, Suspense } from 'react';

const LazyRiskAnalysisForm = lazy(() => import('./RiskAnalysisForm'));

const RiskAnalysisForm = props => (
  <Suspense fallback={null}>
    <LazyRiskAnalysisForm {...props} />
  </Suspense>
);

export default RiskAnalysisForm;
