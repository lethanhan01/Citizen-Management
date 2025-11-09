import React, { Suspense } from 'react'
import { Outlet } from 'react-router-dom'

// import Sidebar from '../components/Sidebar'
// import Header from '../components/Header'

const LoadingFallback = () => <div>Đang tải trang...</div>;

const AppLayout = () => {
    return (
        <div className="app-layout">
            {/* <Sidebar /> */}
            <main className="main-content">
                {/* <Header /> */}
                <Suspense fallback={<LoadingFallback />}>
                    <Outlet />
                </Suspense>
            </main>
        </div>
    );
};

export default AppLayout;