import {createContext, useReducer} from 'react';

export const QueryContext = createContext(
    {
        queryParams: {searchTerm: "", page: 1},
        queryParamsDispatch: () => {},
    }
)

function QueryReducer(state, action) {
    switch (action.type) {
        case 'searchTerm':
            return { ...state, searchTerm: action.payload.searchTerm };
        case 'page':
            return { ...state, page: action.payload.page };
        default:
            return state;
    }
}


const QueryContextProvider = ({children}) => {
    const [queryParams, queryParamsDispatch] = useReducer(QueryReducer, {searchTerm: "", page: 1})

    const context = {
        queryParams,
        queryParamsDispatch,
    }

    return (
        <QueryContext.Provider value={context}>
            {children}
        </QueryContext.Provider>
    )
}

export default QueryContextProvider;