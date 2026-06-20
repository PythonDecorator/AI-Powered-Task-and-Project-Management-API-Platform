import {RouterProvider} from "react-router-dom";
import {QueryClientProvider} from "@tanstack/react-query";
import CssBaseline from "@mui/material/CssBaseline";
import router from "./router.jsx";
import ModalContextProvider from "./store/ModalContextProvider.jsx";
import QueryContextProvider from "./store/QueryParamsContextProvider.jsx";
import AppTheme from "./pages/shared-theme/AppTheme.jsx";
import {queryClient} from "./utils/helpers/http.js";

const AppContent = () => {
    return (
        <AppTheme>
            <CssBaseline enableColorScheme/>
            <QueryClientProvider client={queryClient}>
                <ModalContextProvider>
                    <QueryContextProvider>
                        <RouterProvider router={router}/>
                    </QueryContextProvider>
                </ModalContextProvider>
            </QueryClientProvider>
        </AppTheme>
    );
};

const App = () => {
    return (
        <AppContent/>
    );
};

export default App;
