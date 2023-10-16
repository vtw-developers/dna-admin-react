import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { getUser, logOut, signIn as sendSignInRequest } from '../api/auth';
import type { User, AuthContextType } from '../types';

function AuthProvider(props: React.PropsWithChildren<unknown>) {
  const [user, setUser] = useState<User>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async function() {
      const result = await getUser() as any;
      setUser(result);
      setLoading(false);
    })();
  }, []);

  const signIn = useCallback(async(username: string, password: string, rememberMe: boolean) => {
    const result = await sendSignInRequest(username, password, rememberMe) as any;
    if (result.isOk) {
      setUser(result.data);
    }
    return result;
  }, []);

  const signOut = useCallback(async() => {
    const result = await logOut() as any;
    if (result.isOk) {
      setUser(undefined);
    }
  }, []);

  return <AuthContext.Provider value={{ user, signIn, signOut, loading }} {...props} />;
}

const AuthContext = createContext<AuthContextType>({ loading: false } as AuthContextType);
const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth };
