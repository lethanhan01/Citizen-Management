import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '@/components/ErrorFallback';


// import Sidebar from '../components/Sidebar'
// import Header from '../components/Header'

const LoadingFallback = () => <div>Đang tải trang...</div>;

const AppLayout = () => {
  return (
    <div className="app-container">
      {/* <Sidebar /> */}
      <main className="main-content">
        {/* <Header /> */}
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<LoadingFallback />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
};

export default AppLayout;
