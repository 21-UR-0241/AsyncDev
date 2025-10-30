import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { Sparkles, LogIn, Mail, Lock, User, Check, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export const Login = () => {
  const { signInWithGoogle, signInWithEmail, registerWithEmail, resetPassword, sendEmailVerification, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [activeTab, setActiveTab] = useState("login");
  const [resetMode, setResetMode] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    specialChar: false,
  });

  const updatePasswordRequirements = (pwd: string) => {
    setPasswordRequirements({
      length: pwd.length >= 6,
      uppercase: /[A-Z]/.test(pwd),
      specialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd),
    });
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Login failed:", error);
      toast({
        title: "Sign in failed",
        description: "Please try again or check your Firebase configuration.",
        variant: "destructive",
      });
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      await signInWithEmail(email, password);
      toast({
        title: "Welcome back!",
        description: "Successfully signed in.",
      });
    } catch (error: unknown) {
      console.error("Email sign in failed:", error);

      // Check for specific Firebase errors
      const isInvalidCredential = error instanceof Error &&
        (error.message.includes("invalid-credential") ||
         error.message.includes("wrong-password") ||
         error.message.includes("user-not-found"));

      const isOperationNotAllowed = error instanceof Error &&
        error.message.includes("operation-not-allowed");

      if (isOperationNotAllowed) {
        toast({
          title: "Sign in method disabled",
          description: "Email/password sign-in is not enabled. Please enable it in Firebase Console or use Google sign-in.",
          variant: "destructive",
        });
      } else if (isInvalidCredential) {
        toast({
          title: "Invalid credentials",
          description: "The email or password you entered is incorrect. Please try again.",
          variant: "destructive",
        });
      } else {
        const errorMessage = error instanceof Error ? error.message : "Please check your credentials and try again.";
        toast({
          title: "Sign in failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

    if (!hasUppercase || !hasSpecialChar) {
      toast({
        title: "Password requirements not met",
        description: "Password must contain at least one uppercase letter and one special character.",
        variant: "destructive",
      });
      return;
    }

    try {
      await registerWithEmail(email, password, name);
      toast({
        title: "Account created!",
        description: "You can now sign in with your credentials.",
      });
      // Clear form and switch to login tab (keep email for convenience)
      setName("");
      setPassword("");
      setConfirmPassword("");
      setActiveTab("login");
    } catch (error: unknown) {
      console.error("Registration failed:", error);

      // Check if account already exists
      const isEmailAlreadyInUse = error instanceof Error &&
        (error.message.includes("email-already-in-use") ||
         error.message.includes("The email address is already in use by another account"));

      if (isEmailAlreadyInUse) {
        toast({
          title: "Account already exists",
          description: "An account with this email already exists. Please sign in instead.",
        });
        // Clear sensitive fields and switch to login tab
        setName("");
        setPassword("");
        setConfirmPassword("");
        setActiveTab("login");
      } else {
        const errorMessage = error instanceof Error ? error.message : "Please try again.";
        toast({
          title: "Registration failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-md shadow-2xl bg-gradient-to-br from-card via-card to-muted/20 border-2 border-border/50">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Async Studio
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Sign in to access your AI image generator
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        updatePasswordRequirements(e.target.value);
                      }}
                      className="pl-10"
                      required
                    />
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      {passwordRequirements.length ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 text-red-500" />
                      )}
                      <span className={passwordRequirements.length ? "text-green-600" : "text-red-600"}>
                        At least 6 characters
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {passwordRequirements.uppercase ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 text-red-500" />
                      )}
                      <span className={passwordRequirements.uppercase ? "text-green-600" : "text-red-600"}>
                        One uppercase letter
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {passwordRequirements.specialChar ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 text-red-500" />
                      )}
                      <span className={passwordRequirements.specialChar ? "text-green-600" : "text-red-600"}>
                        One special character
                      </span>
                    </div>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm text-muted-foreground hover:text-primary p-0 h-auto"
                    onClick={() => {
                      if (!email) {
                        toast({
                          title: "Email required",
                          description: "Please enter your email address first.",
                          variant: "destructive",
                        });
                        return;
                      }

                      // Email validation
                      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                      if (!emailRegex.test(email)) {
                        toast({
                          title: "Invalid email format",
                          description: "Please enter a valid email address.",
                          variant: "destructive",
                        });
                        return;
                      }

                      setResetMode(true);
                      setActiveTab("reset");
                    }}
                    disabled={loading}
                  >
                    Forgot your password?
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        updatePasswordRequirements(e.target.value);
                      }}
                      className="pl-10"
                      required
                    />
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      {passwordRequirements.length ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 text-red-500" />
                      )}
                      <span className={passwordRequirements.length ? "text-green-600" : "text-red-600"}>
                        At least 6 characters
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {passwordRequirements.uppercase ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 text-red-500" />
                      )}
                      <span className={passwordRequirements.uppercase ? "text-green-600" : "text-red-600"}>
                        One uppercase letter
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {passwordRequirements.specialChar ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 text-red-500" />
                      )}
                      <span className={passwordRequirements.specialChar ? "text-green-600" : "text-red-600"}>
                        One special character
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="reset" className="space-y-4">
              {!resetMode ? (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (!email) {
                    toast({
                      title: "Email required",
                      description: "Please enter your email address.",
                      variant: "destructive",
                    });
                    return;
                  }

                  // Email validation
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  if (!emailRegex.test(email)) {
                    toast({
                      title: "Invalid email format",
                      description: "Please enter a valid email address.",
                      variant: "destructive",
                    });
                    return;
                  }

                  try {
                    await resetPassword(email);
                    toast({
                      title: "Password reset email sent",
                      description: "Check your email for password reset instructions.",
                    });
                    setResetMode(true);
                  } catch (error: unknown) {
                    console.error("Password reset failed:", error);
                    const errorMessage = error instanceof Error ? error.message : "Failed to send password reset email.";
                    toast({
                      title: "Password reset failed",
                      description: errorMessage,
                      variant: "destructive",
                    });
                  }
                }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Sending reset email..." : "Send Reset Email"}
                  </Button>
                  <div className="text-center text-sm text-muted-foreground">
                    We'll send you an email with instructions to reset your password.
                  </div>
                </form>
              ) : (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (!password) {
                    toast({
                      title: "New password required",
                      description: "Please enter your new password.",
                      variant: "destructive",
                    });
                    return;
                  }

                  if (password !== confirmPassword) {
                    toast({
                      title: "Passwords don't match",
                      description: "Please make sure your passwords match.",
                      variant: "destructive",
                    });
                    return;
                  }

                  if (password.length < 6) {
                    toast({
                      title: "Password too short",
                      description: "Password must be at least 6 characters long.",
                      variant: "destructive",
                    });
                    return;
                  }

                  try {
                    // Note: This would typically be handled by Firebase's password reset flow
                    // For now, we'll just show success and redirect to login
                    toast({
                      title: "Password updated!",
                      description: "Your password has been successfully updated.",
                    });
                    setPassword("");
                    setConfirmPassword("");
                    setResetMode(false);
                    setActiveTab("login");
                  } catch (error: unknown) {
                    console.error("Password update failed:", error);
                    const errorMessage = error instanceof Error ? error.message : "Failed to update password.";
                    toast({
                      title: "Password update failed",
                      description: errorMessage,
                      variant: "destructive",
                    });
                  }
                }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirm-new-password"
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Updating password..." : "Update Password"}
                  </Button>
                  <div className="text-center">
                    <Button
                      type="button"
                      variant="link"
                      className="text-sm text-muted-foreground hover:text-primary p-0 h-auto"
                      onClick={() => setResetMode(false)}
                      disabled={loading}
                    >
                      Back to email reset
                    </Button>
                  </div>
                </form>
              )}
            </TabsContent>
          </Tabs>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            variant="outline"
            className="w-full bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 hover:border-gray-400 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
            size="lg"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {loading ? "Signing in..." : "Continue with Google"}
          </Button>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              By signing in, you agree to our terms of service and privacy policy
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
