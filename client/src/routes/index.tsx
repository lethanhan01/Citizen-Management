import { createBrowserRouter } from "react-router-dom";
import { lazy } from 'react'

// Layouts
import AppLayout from "@/layouts/AppLayout.tsx";
import PublicLayout from "@/layouts/PublicLayout.tsx";
import App from "@/App.tsx";

//Pages
const Dashboard = lazy(() => import("../pages/Dashboard.tsx"));
const Login = lazy(() => import("../pages/Login.tsx"));
const NotFound = lazy(() => import("../pages/NotFound.tsx"));

//Router
const router = createBrowserRouter([
    {
        //Route Ứng dụng
        element: <AppLayout />,
        children: [
            {
                path: '/',
                element: <App />,
            },
            {
                path: '/dashboard',
                element: <Dashboard />,
            },
        ],
    },
    {
        //Route Công khai
        element: <PublicLayout />,
        children: [
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