import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export type AuthModalTab = 'signin' | 'signup';

interface AuthModalContextType {
    isOpen: boolean;
    activeTab: AuthModalTab;
    openModal: (tab?: AuthModalTab) => void;
    closeModal: () => void;
    switchTab: (tab: AuthModalTab) => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<AuthModalTab>('signin');

    const openModal = useCallback((tab: AuthModalTab = 'signin') => {
        setActiveTab(tab);
        setIsOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsOpen(false);
    }, []);

    const switchTab = useCallback((tab: AuthModalTab) => {
        setActiveTab(tab);
    }, []);

    return (
        <AuthModalContext.Provider value={{ isOpen, activeTab, openModal, closeModal, switchTab }}>
            {children}
        </AuthModalContext.Provider>
    );
}

export function useAuthModal() {
    const ctx = useContext(AuthModalContext);
    if (!ctx) throw new Error('useAuthModal must be used within AuthModalProvider');
    return ctx;
}
