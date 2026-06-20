import {lazy} from "react";
import {createBrowserRouter} from "react-router-dom";

import {checkAuthLoader, protectedAuthLoader} from "./utils/helpers/auth.js";
import SuspenseWrapper from "./components/Loader/index.jsx";
import NewAuthBaseLayout from "./pages/sign-in-side/NewAuthBaseLayout.jsx";
import NewBaseLayout from "./pages/dashboardNew/NewBaseLayout.jsx";

// Lazy load sign-in page
const SignInSidePage = lazy(() => import("./pages/sign-in-side/SignInSide.jsx"));
// Lazy load dashboard pages
const NewDashboard = lazy(() => import("./pages/dashboardNew/Dashboard.jsx"));
const DepartmentsPage = lazy(() => import("./pages/organization/departments/index.jsx"));
const MembersPage = lazy(() => import("./pages/organization/members/index.jsx"));
const ProjectsPage = lazy(() => import("./pages/organization/projects/index.jsx"));

const router = createBrowserRouter([
    {
        path: "/",
        element: <NewAuthBaseLayout/>,
        loader: checkAuthLoader,
        children: [
            {index: true, element: SuspenseWrapper(SignInSidePage)},
        ],
    },
    {
        path: "/dashboard",
        element: <NewBaseLayout/>,
        loader: protectedAuthLoader,
        children: [
            {index: true, element: SuspenseWrapper(NewDashboard)},
        ],
    },
    {
        path: "/organization",
        element: <NewBaseLayout/>,
        loader: protectedAuthLoader,
        children: [
            {path: "departments", element: SuspenseWrapper(DepartmentsPage)},
            {path: "members", element: SuspenseWrapper(MembersPage)},
            {path: "projects", element: SuspenseWrapper(ProjectsPage)},
        ],
    },
]);

export default router;
