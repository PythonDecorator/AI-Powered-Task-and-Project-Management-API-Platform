import CssBaseline from "@mui/material/CssBaseline";
import { useEffect} from "react";
import {Outlet, useLocation} from "react-router-dom";
import {ThemeProvider} from "@mui/material/styles";

import themeDark from "../../../assets/theme-dark/index.js";
import theme from "../../../assets/theme/index.js";

import {setMiniSidenav, useController} from "../../../store/context/index.jsx";
import Sidenav from "../../../layouts/Sidenav/index.jsx";
import {Logo} from "../../../assets/theme/images/index.js";

const BaseLayout = () => {
    const [controller, dispatch] = useController();
    const { darkSidenav, darkMode} = controller;
    const location = useLocation();
    const {pathname} = location;

    useEffect(() => {
        function handleopenSidenav() {
            setMiniSidenav(dispatch, window.innerWidth < 1200);
        }
        window.addEventListener("resize", handleopenSidenav);
        handleopenSidenav();
        return () => window.removeEventListener("resize", handleopenSidenav);
    }, [dispatch]);

    // Setting page scroll to 0 when changing the route
    useEffect(() => {
        document.documentElement.scrollTop = 0;
        document.scrollingElement.scrollTop = 0;
    }, [pathname]);

    return (
        <ThemeProvider theme={darkMode ? themeDark : theme}>
            <CssBaseline/>
            <Sidenav
                color=""
                brand={darkSidenav || darkMode ? Logo : Logo}
                brandName=""
            />
            <Outlet/>
        </ThemeProvider>
    );
}


export default BaseLayout;