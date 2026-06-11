import {Box, CircularProgress} from '@mui/material';
import {Suspense} from "react";

const Loader = () => {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                backgroundColor: 'background.default',
            }}
        >
            <CircularProgress/>
        </Box>
    );
};

// Helper function to wrap components with Suspense
const SuspenseWrapper = (Component) => (
    <Suspense fallback={<Loader/>}>
        <Component/>
    </Suspense>
);

export default SuspenseWrapper;
