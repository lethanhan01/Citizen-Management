import { createBrowserRouter } from "react-router-dom";
import { lazy } from 'react'
import RequireAuth from "@/components/RequireAuth";

// Layouts
import AppLayout from "@/layouts/AppLayout.tsx";
import PublicLayout from "@/layouts/PublicLayout.tsx";

//Pages - Public
const Home = lazy(() => import("../pages/Home.tsx"));
const Login = lazy(() => import("../pages/Login.tsx"));
const NotFound = lazy(() => import("../pages/NotFound.tsx"));

//Pages - Main
const Dashboard = lazy(() => import("../pages/Dashboard.tsx"));
const Profile = lazy(() => import("../pages/profile/Profile.tsx"));

//Pages - Citizens
const CitizenList = lazy(() => import("../pages/citizens/CitizenList.tsx"));
const CitizenDetail = lazy(() => import("../pages/citizens/CitizenDetail.tsx"));
const HouseholdList = lazy(() => import("../pages/citizens/HouseholdList.tsx"));
const HouseholdDetail = lazy(() => import("../pages/citizens/HouseholdDetail.tsx"));

//Pages - Services - Residential
const TempResidence = lazy(() => import("../pages/services/residential/TempResidence.tsx"));
const TempAbsence = lazy(() => import("../pages/services/residential/TempAbsence.tsx"));

//Pages - Services - People
const AddNewArrival = lazy(() => import("../pages/services/people/AddNewArrival.tsx"));
const UpdatePerson = lazy(() => import("../pages/services/people/UpdatePerson.tsx"));

//Pages - Services - Household
const SplitHousehold = lazy(() => import("../pages/services/household/SplitHousehold.tsx"));
const ChangeOwner = lazy(() => import("../pages/services/household/ChangeOwner.tsx"));
const ChangeAddress = lazy(() => import("../pages/services/household/ChangeAddress.tsx"));
const HouseholdHistory = lazy(() => import("../pages/services/household/HouseholdHistory.tsx"));

//Pages - Fees
const FixedFees = lazy(() => import("../pages/fees/FixedFees.tsx"));
const DonationCampaigns = lazy(() => import("../pages/fees/DonationCampaigns.tsx"));

//Pages - Settings
const AccountList = lazy(() => import("../pages/settings/AccountList.tsx"));
const AddAccount = lazy(() => import("../pages/settings/AddAccount.tsx"));

// Demo popup khi vào page không đủ quyền, dùng .../demo/auth-popup vào đuôi link
const AuthPopupDemo = lazy(() => import("../pages/AuthPopupDemo.tsx"));

//Router
const router = createBrowserRouter([
    {
        element: <RequireAuth />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: '/dashboard', element: <Dashboard /> },
              { path: '/profile', element: <Profile /> },
      
              // Citizens
              { path: '/citizens', element: <CitizenList /> },
              { path: '/citizens/:id', element: <CitizenDetail /> },
              { path: '/households', element: <HouseholdList /> },
              { path: '/households/:id', element: <HouseholdDetail /> },
      
              // Services - Residential
              { path: '/services/temp-residence', element: <TempResidence /> },
              { path: '/services/temp-absence', element: <TempAbsence /> },
      
              // Services - People
              { path: '/services/add-new-arrival', element: <AddNewArrival /> },
              { path: '/services/update-person', element: <UpdatePerson /> },
      
              // Services - Household
              { path: '/services/household/split', element: <SplitHousehold /> },
              { path: '/services/household/change-owner', element: <ChangeOwner /> },
              { path: '/services/household/change-address', element: <ChangeAddress /> },
              { path: '/services/household/history', element: <HouseholdHistory /> },
      
              // Fees
              { path: '/fees/fixed', element: <FixedFees /> },
              { path: '/fees/donations', element: <DonationCampaigns /> },
      
              // Settings
              { path: '/settings/accounts', element: <AccountList /> },
              { path: '/settings/add-account', element: <AddAccount /> },

              // Demo
              { path: '/demo/auth-popup', element: <AuthPopupDemo /> },
            ],
          },
        ],
      },
      
    {
        //Route Công khai (không có Sidebar + TopBar)
        element: <PublicLayout />,
        children: [
            { path: '/', element: <Home /> },
            { path: '/login', element: <Login /> },
        ],
    },
    {
        //Route cho trang 404 (Not Found)
        path: '*',
        element: <NotFound />,
    },
]);

export default router;





