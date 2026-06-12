import {RouterProvider} from "react-router-dom";
import {QueryClientProvider} from "@tanstack/react-query";
import {ThemeProvider} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import router from "./router.jsx";
import ModalContextProvider from "./store/ModalContextProvider.jsx";
import CustomTabsContextProvider from "./store/CustomTabsContextProvider.jsx";
import QueryContextProvider from "./store/context/QueryParamsContextProvider.jsx";
import {useController, ControllerProvider} from "./store/context/index.jsx";
import lightTheme from "./assets/theme/index.js";
import darkTheme from "./assets/theme-dark/index.js";
import {queryClient} from "./utils/apis.js";

const AppContent = () => {
    const [controller] = useController();
    const theme = controller.darkMode ? darkTheme : lightTheme;

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <QueryClientProvider client={queryClient}>
                <ModalContextProvider>
                    <CustomTabsContextProvider>
                        <QueryContextProvider>
                            <RouterProvider router={router}/>
                        </QueryContextProvider>
                    </CustomTabsContextProvider>
                </ModalContextProvider>
            </QueryClientProvider>
        </ThemeProvider>
    );
};

const App = () => {
    return (
        <ControllerProvider>
            <AppContent />
        </ControllerProvider>
    );
};

export default App;
