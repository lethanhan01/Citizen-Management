import { createBrowserRouter } from "react-router-dom";
import { lazy } from 'react'

// Layouts
import AppLayout from "@/layouts/AppLayout.tsx";
import PublicLayout from "@/layouts/PublicLayout.tsx";

//Pages
const Dashboard = lazy(() => import("../pages/Dashboard.tsx"));
const Login = lazy(() => import("../pages/Login.tsx"));
const Home = lazy(() => import("../pages/Home.tsx"));
const NotFound = lazy(() => import("../pages/NotFound.tsx"));

//Router
const router = createBrowserRouter([
    {
        //Route Ứng dụng (với Sidebar + TopBar)
        element: <AppLayout />,
        children: [
            {
                path: '/dashboard',
                element: <Dashboard />,
            },
        ],
    },
    {
        //Route Công khai (không có Sidebar + TopBar)
        element: <PublicLayout />,
        children: [
            {
                path: '/',
                element: <Home />,
            },
            {
                path: '/login',
                element: <Login />,
            },
        ],
    },
    {
        //Route cho trang 404 (Not Found)
        path: '*',
        element: <NotFound />,
    },
]);

export default router;