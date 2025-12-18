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
    <div className="flex h-screen w-full bg-background">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col w-full min-h-0">
        {/* TOP BAR */}
        <TopBar />

        {/* PAGE CONTENT */}
        <main className="flex-1 p-8 text-foreground overflow-auto min-h-0">
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





