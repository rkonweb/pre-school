"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type ModalType = "CONFIRMATION" | "INPUT" | null;

interface ModalContextType {
    isOpen: boolean;
    modalType: ModalType;
    modalProps: any;
    openModal: (type: ModalType, props: any) => void;
    closeModal: () => void;
    openInputModal: (props: any) => void;
    openConfirmationModal: (props: any) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [modalType, setModalType] = useState<ModalType>(null);
    const [modalProps, setModalProps] = useState<any>({});

    const openModal = (type: ModalType, props: any) => {
        setModalType(type);
        setModalProps(props);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setTimeout(() => {
            setModalType(null);
            setModalProps({});
        }, 300); // Wait for exit animation
    };

    const openInputModal = (props: any) => openModal("INPUT", props);
    const openConfirmationModal = (props: any) => openModal("CONFIRMATION", props);

    return (
        <ModalContext.Provider value={{ isOpen, modalType, modalProps, openModal, closeModal, openInputModal, openConfirmationModal }}>
            {children}
        </ModalContext.Provider>
    );
}

export function useModal() {
    const context = useContext(ModalContext);
    if (context === undefined) {
        throw new Error("useModal must be used within a ModalProvider");
    }
    return context;
}
