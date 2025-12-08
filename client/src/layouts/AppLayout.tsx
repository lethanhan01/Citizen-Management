import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '@/components/ErrorFallback';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import ThemeToggleButton from '@/components/ThemeToggleButton';

const LoadingFallback = () => <div>Đang tải trang...</div>;

const AppLayout = () => {
  return (
    <div className="flex min-h-screen w-full bg-fourth dark:bg-first">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col w-full">
        {/* TOP BAR */}
        <TopBar />

        {/* PAGE CONTENT */}
        <main className="flex-1 p-8 text-first dark:text-fourth overflow-auto">
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Suspense fallback={<LoadingFallback />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>

      {/* THEME TOGGLE BUTTON (FIXED) */}
      <ThemeToggleButton />
    </div>
  );
};

export default AppLayout;
