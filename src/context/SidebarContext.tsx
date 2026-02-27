"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SidebarContextType {
    isOpen: boolean; // For mobile
    isCollapsed: boolean; // For desktop
    toggleSidebar: () => void;
    toggleCollapse: () => void;
    setIsOpen: (open: boolean) => void;
    isAppFullscreen: boolean;
    setIsAppFullscreen: (val: boolean) => void;
    toggleFullscreen: () => void;
    currency: string;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

const getCurrencySymbol = (code: string) => {
    switch (code?.toUpperCase() || 'INR') {
        case 'INR': return '₹';
        case 'USD': return '$';
        case 'EUR': return '€';
        case 'GBP': return '£';
        default: return code;
    }
}

export function SidebarProvider({ children, currency = 'INR' }: { children: React.ReactNode, currency?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isAppFullscreen, setIsAppFullscreen] = useState(false);

    // Persist collapsed state
    useEffect(() => {
        const saved = localStorage.getItem("sidebar_collapsed");
        if (saved) {
            setIsCollapsed(JSON.parse(saved));
        }
    }, []);

    useEffect(() => {
        const handleFsChange = () => {
            setIsAppFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handleFsChange);
        return () => document.removeEventListener("fullscreenchange", handleFsChange);
    }, []);

    const toggleSidebar = () => setIsOpen(!isOpen);

    const toggleCollapse = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem("sidebar_collapsed", JSON.stringify(newState));
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.error(`Fullscreen failed: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
        }
    };

    return (
        <SidebarContext.Provider value={{ isOpen, isCollapsed, toggleSidebar, toggleCollapse, setIsOpen, isAppFullscreen, setIsAppFullscreen, toggleFullscreen, currency: getCurrencySymbol(currency) }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
}
