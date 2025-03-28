import React, { lazy, Suspense } from 'react';

const LazyNotificationBar = lazy(() => import('./NotificationBar'));

const NotificationBar = props => (
  <Suspense fallback={null}>
    <LazyNotificationBar {...props} />
  </Suspense>
);

export default NotificationBar;
