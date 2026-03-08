import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { auth, googleProvider, db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc, Timestamp } from "firebase/firestore";

export type UserRole = "doctor" | "patient";

interface User {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  loginWithGoogle: (role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  error: null,
  login: async () => { },
  register: async () => { },
  loginWithGoogle: async () => { },
  logout: async () => { },
  clearError: () => { },
  refreshUser: async () => { },
});

async function loadUserFromFirestore(firebaseUser: FirebaseUser): Promise<User | null> {
  try {
    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        uid: firebaseUser.uid,
        name: data.name || firebaseUser.displayName || "User",
        email: firebaseUser.email || "",
        role: (data.role as UserRole) || "patient",
        avatar_url: firebaseUser.photoURL || data.avatar_url || "",
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const loaded = await loadUserFromFirestore(firebaseUser);
        if (loaded) {
          setUser(loaded);
        } else {
          // No Firestore doc found — keep existing user state if already set (e.g. just registered)
          // otherwise fall back with a placeholder (they'll need to log in again)
          setUser((prev) =>
            prev?.uid === firebaseUser.uid
              ? prev
              : {
                uid: firebaseUser.uid,
                name: firebaseUser.displayName || "User",
                email: firebaseUser.email || "",
                role: "patient",
                avatar_url: firebaseUser.photoURL || "",
              }
          );
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const refreshUser = async () => {
    if (!auth.currentUser) return;
    const loaded = await loadUserFromFirestore(auth.currentUser);
    if (loaded) setUser(loaded);
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const loaded = await loadUserFromFirestore(credential.user);
      if (loaded) {
        setUser(loaded);
      } else {
        setError("User profile not found. Please contact support.");
        await signOut(auth);
        throw new Error("User profile not found");
      }
    } catch (err: any) {
      if (!error) {
        const msg =
          err.code === "auth/user-not-found" ? "No account found with this email" :
            err.code === "auth/wrong-password" ? "Incorrect password" :
              err.code === "auth/invalid-credential" ? "Invalid email or password" :
                err.code === "auth/invalid-email" ? "Invalid email address" :
                  err.message || "Login failed";
        setError(msg);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    setLoading(true);
    setError(null);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);

      // Build the user document — omit doctor-only fields for patients
      // (Firestore rejects `undefined` values, so we must not include them at all)
      const userDocData: Record<string, any> = {
        name,
        email,
        role,
        createdAt: Timestamp.now(),
        avatar_url: "",
        phone: "",
        location: "",
      };
      if (role === "doctor") {
        userDocData.hospital = "";
        userDocData.specialty = "";
      }

      await setDoc(doc(db, "users", result.user.uid), userDocData);

      // Set user immediately with correct role — don't wait for onAuthStateChanged
      setUser({ uid: result.user.uid, name, email, role, avatar_url: "" });
    } catch (err: any) {
      const msg =
        err.code === "auth/email-already-in-use" ? "Email already in use" :
          err.code === "auth/weak-password" ? "Password should be at least 6 characters" :
            err.code === "auth/invalid-email" ? "Invalid email address" :
              err.message || "Registration failed";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (role: UserRole = "patient") => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const uid = result.user.uid;

      const userDoc = await getDoc(doc(db, "users", uid));
      if (!userDoc.exists()) {
        const newData: any = {
          name: result.user.displayName || "User",
          email: result.user.email,
          role,
          createdAt: Timestamp.now(),
          avatar_url: result.user.photoURL || "",
          phone: "",
          location: "",
        };
        if (role === "doctor") { newData.hospital = ""; newData.specialty = ""; }
        await setDoc(doc(db, "users", uid), newData);
        setUser({ uid, name: newData.name, email: newData.email, role: newData.role, avatar_url: newData.avatar_url });
      } else {
        const data = userDoc.data();
        if (data.role !== role) {
          setError(`This Google account is registered as a ${data.role}. Please select the correct role.`);
          await signOut(auth);
          throw new Error("Role mismatch");
        }
        setUser({
          uid,
          name: data.name || result.user.displayName || "User",
          email: data.email || result.user.email || "",
          role: data.role,
          avatar_url: data.avatar_url || result.user.photoURL || "",
        });
      }
    } catch (err: any) {
      if (!error) {
        setError(err.code === "auth/popup-closed-by-user" ? "Sign-in cancelled" : err.message || "Google sign-in failed");
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
    } catch (err: any) {
      setError(err.message || "Logout failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, loginWithGoogle, logout, clearError, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
