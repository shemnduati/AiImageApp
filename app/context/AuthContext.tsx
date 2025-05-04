import {
    useContext,
    createContext,
    type PropsWithChildren,
    useEffect
} from 'react';
import { useStorageState } from '@/hooks/useStorageState';
import { router } from 'expo-router';
import axiosInstance from '@/config/axiosConfig';

interface User {
    id: number,
    name: string;
    email: string;
    email_verified_at: string | null;
    credits: number | null;
}

interface AuthContextType {
    signIn: (token: string, user: User) => void;
    signOut: () => void;
    session?: string | null;
    user?: User | null;
    isaLoading: boolean;
    updateUser: (userData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    signIn: () => null,
    signOut: () => null,
    session: null,
    user: null,
    isaLoading: false,
    updateUser: async () => {},
});

export function useSession() {
    const value = useContext(AuthContext);
    if(process.env.NODE_ENV !== 'production'){
        if(!value){
            throw new Error('useSession Must be wrapped in a <SessionProvider />');
        }
        return value;
    }
}

export function SessionProvider({ children }: PropsWithChildren){
    const [[isLoading, session], setSession] = useStorageState('session');
    const [[,user], setUser] = useStorageState('user');

    // Add this function to update user data
    const updateUser = async (userData: any) => {

    };

    const handleSignout = async () =>{

    };

    const loadUserInfo = async (token: string) => {

    };

    // Parse user data from storage if available
    const parsedUser = user ? (() => {})() : null;
    
    return (
        
    );
}