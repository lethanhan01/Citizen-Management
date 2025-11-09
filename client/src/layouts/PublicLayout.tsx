import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'

const LoadingFallback = () => <div>Đang tải...</div>;

const PublicLayout = () => {
    return (
        <div className="public-layout">
            <Suspense fallback={<LoadingFallback />}>
                <Outlet />
            </Suspense>
        </div>
    );
};

export default PublicLayout;