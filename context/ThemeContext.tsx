import React, { createContext, useContext, useState } from 'react';
import { useColorScheme as useNativeColorScheme } from 'react-native';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'dark',
    toggleTheme: () => { },
    isDark: true,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const systemScheme = useNativeColorScheme();
    const [theme, setTheme] = useState<Theme>(systemScheme === 'light' ? 'light' : 'dark');

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
