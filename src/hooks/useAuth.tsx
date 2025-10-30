import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { auth } from "@/integrations/firebase/client";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  sendPasswordResetEmail,
  confirmPasswordReset as firebaseConfirmPasswordReset,
  sendEmailVerification
} from "firebase/auth";

// Firebase user data
interface FirebaseUserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  emailVerified?: boolean;
}

interface AuthContextType {
  user: FirebaseUserData | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmPasswordReset: (oobCode: string, newPassword: string) => Promise<void>;
  sendEmailVerification: (user?: FirebaseUser) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Firebase authentication implementation
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<FirebaseUserData | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Remove test account if logged in
        if (firebaseUser.email === "jordandave") {
          try {
            await firebaseUser.delete();
            console.log("Test account removed");
            setUser(null);
            setFirebaseUser(null);
          } catch (error) {
            console.error("Error removing test account:", error);
          }
          setLoading(false);
          return;
        }

        const userData: FirebaseUserData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
        };
        setUser(userData);
        setFirebaseUser(firebaseUser);
      } else {
        setUser(null);
        setFirebaseUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
      const errorMessage = error instanceof Error ? error.message : "Google sign-in failed. Please check Firebase Console configuration.";
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Error signing in with email:", error);
      const errorMessage = error instanceof Error ? error.message : "Invalid email or password.";
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Update the user's display name
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: name,
        });
      }

      // Show success message and redirect to login
      console.log("Registration successful! You can now sign in.");
    } catch (error) {
      console.error("Error registering with email:", error);
      const errorMessage = error instanceof Error ? error.message : "Registration failed. Please try again.";
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Error sending password reset email:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to send password reset email.";
      throw new Error(errorMessage);
    }
  };

  const confirmPasswordReset = async (oobCode: string, newPassword: string) => {
    try {
      await firebaseConfirmPasswordReset(auth, oobCode, newPassword);
    } catch (error) {
      console.error("Error confirming password reset:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to reset password.";
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      const errorMessage = error instanceof Error ? error.message : "Sign out failed.";
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const sendEmailVerification = async (user?: FirebaseUser) => {
    try {
      const targetUser = user || firebaseUser;
      if (targetUser) {
        await sendEmailVerification(targetUser);
      } else {
        throw new Error("No user is currently signed in.");
      }
    } catch (error) {
      console.error("Error sending email verification:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to send email verification.";
      throw new Error(errorMessage);
    }
  };

  const value = {
    user,
    firebaseUser,
    loading,
    signInWithGoogle,
    signInWithEmail,
    registerWithEmail,
    resetPassword,
    confirmPasswordReset,
    sendEmailVerification,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
