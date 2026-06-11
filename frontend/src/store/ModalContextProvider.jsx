import {createContext, useState} from 'react';

export const ModalContext = createContext(
    {
        modalIsOpen: {open: false, action: ""},
        onOpenModal: () => {
        },
        onCloseModal: () => {
        },
    }
)

const ModalContextProvider = ({children}) => {
    const [modalIsOpen, setModalIsOpen] = useState({open: false, action: ""});

    function handleCloseModal() {
        setModalIsOpen({open: false, action: ""})
    }

    function handleOpenModal(action) {
        setModalIsOpen({open: true, action: action})
    }


    const context = {
        modalIsOpen: modalIsOpen,
        onOpenModal: handleOpenModal,
        onCloseModal: handleCloseModal,
    }

    return (
        <ModalContext.Provider value={context}>
            {children}
        </ModalContext.Provider>
    )

}

export default ModalContextProvider;