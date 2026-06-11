import { Outlet} from "react-router-dom";
import {ThemeProvider} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import "../../../assets/css/nucleo-icons.css";
import "../../../assets/css/nucleo-svg.css";

import themeDark from "../../../assets/theme-dark/index.js";
import theme from "../../../assets/theme/index.js";

import {useController} from "../../../store/context/index.jsx";

export default function AuthBaseLayout() {
    const [controller] = useController();
    const {darkMode} = controller;

    return (
        <ThemeProvider theme={darkMode ? themeDark : theme}>
            <CssBaseline/>
            <Outlet/>
        </ThemeProvider>
    );
}
