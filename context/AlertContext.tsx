import CustomAlert, { AlertType } from '@/components/CustomAlert';
import React, { createContext, useCallback, useContext, useState } from 'react';

interface AlertOptions {
    title: string;
    message: string;
    type?: AlertType;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
}

interface AlertContextType {
    showAlert: (options: AlertOptions) => void;
    hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType>({
    showAlert: () => { },
    hideAlert: () => { },
});

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
    const [visible, setVisible] = useState(false);
    const [config, setConfig] = useState<AlertOptions>({ title: '', message: '' });

    const showAlert = useCallback((options: AlertOptions) => {
        setConfig(options);
        setVisible(true);
    }, []);

    const hideAlert = useCallback(() => {
        setVisible(false);
    }, []);

    return (
        <AlertContext.Provider value={{ showAlert, hideAlert }}>
            {children}
            <CustomAlert
                visible={visible}
                title={config.title}
                message={config.message}
                type={config.type}
                confirmText={config.confirmText}
                cancelText={config.cancelText}
                onConfirm={config.onConfirm}
                onClose={hideAlert}
            />
        </AlertContext.Provider>
    );
};

export const useAlert = () => useContext(AlertContext);
