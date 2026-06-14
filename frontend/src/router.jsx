import {lazy} from "react";
import {createBrowserRouter} from "react-router-dom";

import {checkAuthLoader, protectedAuthLoader} from "./utils/helpers/auth.js";
import BaseLayout from "./pages/dashboard/BaseLayout/BaseLayout.jsx";
import AuthBaseLayout from "./pages/authentication/BaseLayout/AuthBaseLayout.jsx";
import SuspenseWrapper from "./examples/Loader/index.jsx";

// Lazy load authentication pages
const LoginPage = lazy(() => import("./pages/authentication/login/index.jsx"));

// Lazy load dashboard pages
const Dashboard = lazy(() => import("./pages/dashboard/index.jsx"));
const DashboardNew = lazy(() => import("./pages/dashboardNew/Dashboard.jsx"));
const DepartmentsPage = lazy(() => import("./pages/organization/departments/index.jsx"));
const MembersPage = lazy(() => import("./pages/organization/members/index.jsx"));
const ProjectsPage = lazy(() => import("./pages/organization/projects/index.jsx"));
const MarketingPage = lazy(() => import("./pages/marketing-page/MarketingPage.jsx"));
const DashboardNewPage = lazy(() => import("./pages/dashboardNew/Dashboard.jsx"));



const router = createBrowserRouter([
    {
        path: "/marketing-page",
        element: <MarketingPage/>,
    },
    {
        path: "/dashboard-new",
        element: <DashboardNewPage/>,
    },

    {
        path: "/",
        element: <AuthBaseLayout/>,
        loader: checkAuthLoader,
        children: [
            {index: true, element: SuspenseWrapper(LoginPage)},
            {path: "login", element: SuspenseWrapper(LoginPage)},
        ],
    },
    {
        path: "/dashboard",
        element: <BaseLayout/>,
        loader: protectedAuthLoader,
        children: [
            {index: true, element: SuspenseWrapper(Dashboard)},
        ],
    },
    {
        path: "/organization",
        element: <BaseLayout/>,
        loader: protectedAuthLoader,
        children: [
            {path: "departments", element: SuspenseWrapper(DepartmentsPage)},
            {path: "members", element: SuspenseWrapper(MembersPage)},
            {path: "projects", element: SuspenseWrapper(ProjectsPage)},
        ],
    },
]);

export default router;
