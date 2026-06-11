import {createContext, useState} from 'react';

export const CustomTabsContext = createContext(
    {
        tabValue: 0,
        setTabValue: () => {},
        underlinedTabValue: 0,
        setUnderlinedTabValue: () => {}

    }
)

const CustomTabsContextProvider = ({children}) => {
    const [tabValue, setTabValue] = useState(0);
    const [underlinedTabValue, setUnderlinedTabValue] = useState(0);

    const context = {
        tabValue,
        setTabValue,
        underlinedTabValue,
        setUnderlinedTabValue,
    }

    return (
        <CustomTabsContext.Provider value={context}>
            {children}
        </CustomTabsContext.Provider>
    )

}

export default CustomTabsContextProvider;