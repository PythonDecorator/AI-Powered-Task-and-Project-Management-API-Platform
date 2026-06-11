import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import 'react-perfect-scrollbar/dist/css/styles.css';
import App from './App.jsx'
import {ControllerProvider} from "./store/context/index.jsx";
import {SnackbarProvider} from "./components/CustomSnackBar/index.jsx"

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ControllerProvider>
                <SnackbarProvider>
                    <App/>
                </SnackbarProvider>
        </ControllerProvider>
    </StrictMode>,
)
