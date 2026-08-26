import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { ADMIN_EMAIL } from "../config/admin";

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  }, []);

  const signOutAdmin = useCallback(() => signOut(auth), []);

  const isAdmin = !!user && user.email === ADMIN_EMAIL;

  const value = { user, loading, isAdmin, signInWithGoogle, signOutAdmin };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
};
