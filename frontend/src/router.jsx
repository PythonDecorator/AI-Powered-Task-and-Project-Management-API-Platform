import {lazy, Suspense} from "react";
import {createBrowserRouter} from "react-router-dom";

import Loader from "./examples/Loader/index.jsx";
import {checkAuthLoader, protectedAuthLoader} from "./utils/helpers/auth.js";
import BaseLayout from "./pages/dashboard/BaseLayout/BaseLayout.jsx";
import AuthBaseLayout from "./pages/authentication/BaseLayout/AuthBaseLayout.jsx";

// Lazy load authentication pages
const LoginPage = lazy(() => import("./pages/authentication/login/index.jsx"));

// Lazy load dashboard pages
const Dashboard = lazy(() => import("./pages/dashboard/index.jsx"));


// Helper function to wrap components with Suspense
const SuspenseWrapper = (Component) => (
    <Suspense fallback={<Loader/>}>
        <Component/>
    </Suspense>
);

const router = createBrowserRouter([
    {
        path: "/",
        element: <AuthBaseLayout/>,
        loader: checkAuthLoader,
        children: [
            {index: true, element: SuspenseWrapper(LoginPage)},
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
]);

export default router;
