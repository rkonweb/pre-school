'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuraContextType {
    isAuraOpen: boolean;
    toggleAura: () => void;
    openAura: () => void;
    closeAura: () => void;
}

const AuraContext = createContext<AuraContextType | null>(null);

export function AuraProvider({ children }: { children: ReactNode }) {
    const [isAuraOpen, setIsAuraOpen] = useState(false);

    const toggleAura = () => setIsAuraOpen(prev => !prev);
    const openAura = () => setIsAuraOpen(true);
    const closeAura = () => setIsAuraOpen(false);

    return (
        <AuraContext.Provider value={{ isAuraOpen, toggleAura, openAura, closeAura }}>
            {children}
        </AuraContext.Provider>
    );
}

export function useAura() {
    const context = useContext(AuraContext);
    if (!context) throw new Error("useAura must be used within AuraProvider");
    return context;
}
