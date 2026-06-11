import {createContext, useContext, useReducer, useMemo} from "react";
import PropTypes from "prop-types";

const initialState = {
    darkMode: false,
    openSidenav: true,
    openDialog: false,
    darkSidenav: true,
};

const ControllerContext = createContext(initialState)

ControllerContext.displayName = "ControllerContext";

function reducer(state, action) {
    switch (action.type) {
        case "OPEN_DIALOG": {
            return {...state, openDialog: action.value};
        }
        case "DARK_MODE": {
            return {...state, darkMode: action.value};
        }
        case "OPEN_SIDENAV": {
            return {...state, openSidenav: action.value};
        }
        default: {
            throw new Error(`Unhandled action type: ${action.type}`);
        }
    }
}

function ControllerProvider({children}) {
    const [controller, dispatch] = useReducer(reducer, initialState);
    const value = useMemo(() => [controller, dispatch], [controller, dispatch]);

    return <ControllerContext.Provider value={value}>{children}</ControllerContext.Provider>;
}

function useController() {
    const context = useContext(ControllerContext);

    if (!context) {
        throw new Error("useController should be used inside the ControllerContextProvider.");
    }

    return context;
}

ControllerProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

const setDarkMode = (dispatch, value) => dispatch({type: "DARK_MODE", value});
const setOpenConfigurator = (dispatch, value) => dispatch({ type: "OPEN_CONFIGURATOR", value });
const setOpenSidenav = (dispatch, value) => dispatch({type: "OPEN_SIDENAV", value});
const setMiniSidenav = (dispatch, value) => dispatch({type: "OPEN_SIDENAV", value});
const setOpenDialog = (dispatch, value) => dispatch({type: "OPEN_DIALOG", value});

export {
    ControllerProvider,
    useController,
    setOpenSidenav,
    setMiniSidenav,
    setDarkMode,
    setOpenDialog,
    setOpenConfigurator,
};
