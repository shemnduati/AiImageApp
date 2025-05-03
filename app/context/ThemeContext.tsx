import React, { createContext, useContext, useEffect, useState} from "react";
import { Appearance, useColorScheme } from "react-native";
import { useStorageState } from "@/hooks/useStorageState";


type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContexType {
    theme: ThemeType;
    currentTheme: 'light' | 'dark';
    setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContexType>({
    theme: 'system',
    currentTheme: 'dark',
    setTheme: () => null,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
    children }) => {
        const systemColorScheme = useColorScheme() as 'light' | 'dark';
        const [[, storedTheme], setStoredTheme] = useStorageState('theme');
        const [theme, setThemeState] = useState<ThemeType>('system');
        const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('dark')

        // initialiize theme from storeage or default to system

        useEffect(() => {
            if(storedTheme) {
                setThemeState(storedTheme as ThemeType);
            }
        }, [storedTheme]);

        // update current theme based on theme choice and system  preference

        useEffect(() => {
            if(theme === 'system'){
                setCurrentTheme(systemColorScheme || 'dark');
            }else {
                setCurrentTheme(theme as 'light' | 'dark');
            }
        }, [theme, systemColorScheme])

        // Listen for System theme changes
        useEffect(() =>{
            const subscription = Appearance.addChangeListener(({ colorScheme }) => {
                if(theme === 'system'){
                    setCurrentTheme((colorScheme as 'light' | 'dark') || 'dark');
                }
            });

            return () => subscription.remove();
        }, [theme]);

        const setTheme = (newTheme: ThemeType) => {
            setThemeState(newTheme);
            setStoredTheme(newTheme);
        };

        return(
            <ThemeContext.Provider value={{ theme, currentTheme, setTheme}}>
                {children}
            </ThemeContext.Provider>
        )
};