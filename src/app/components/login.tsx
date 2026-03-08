import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { Eye as EyeIcon, EyeOff, Mail, Lock, Eye, Chrome } from "lucide-react";
import { useAuth } from "./AuthContext";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  // both roles are determined server-side; selection is for display only
  const [selectedRole, setSelectedRole] = useState<"admin" | "patient">("patient");
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const { login, loginWithGoogle, error, clearError, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already logged in, redirect
    if (user) {
      navigate(user.role === "doctor" ? "/doctor" : "/patient");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLoadingEmail(true);
    try {
      // authentication will determine role from Firestore; selection is informational
      await login(email, password);
    } catch (err) {
      // error message already handled in context
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleGoogleSignIn = async () => {
    clearError();
    setLoadingGoogle(true);
    try {
      // default patient for new google accounts; promotion to doctor must be handled separately
      await loginWithGoogle();
    } catch (err) {
      // Error is already set in context
    } finally {
      setLoadingGoogle(false);
    }
  };

  return (
    <div className="min-h-screen flex font-[Inter,sans-serif]">
      {/* Left - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-[#1E88E5] flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-[22px] font-semibold">RetinaAI</h2>
              <p className="text-[12px] text-muted-foreground">Diabetic Retinopathy Detection</p>
            </div>
          </div>

          <h1 className="text-[28px] mb-2 font-semibold">Welcome back</h1>
          <p className="text-muted-foreground mb-6 text-[14px]">Sign in to your account to continue</p>

          {/* Role selector is for orientation only –
              your account type is determined automatically */}
          <div className="mb-6">
            <p className="text-[13px] font-medium text-muted-foreground mb-2">
              Logging in as {selectedRole === "admin" ? "Doctor/Admin" : "Patient"}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedRole("admin")}
                className={`py-2 px-4 rounded-lg text-[13px] transition-all ${
                  selectedRole === "admin"
                    ? "bg-[#1E88E5] text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Doctor/Admin
              </button>
              <button
                onClick={() => setSelectedRole("patient")}
                className={`py-2 px-4 rounded-lg text-[13px] transition-all ${
                  selectedRole === "patient"
                    ? "bg-[#1E88E5] text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Patient
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
              <p className="text-[13px] text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[13px] mb-2 text-muted-foreground font-medium">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-card focus:ring-2 focus:ring-[#1E88E5]/20 focus:border-[#1E88E5] outline-none transition-all text-[14px]"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] mb-2 text-muted-foreground font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 rounded-xl border border-border bg-card focus:ring-2 focus:ring-[#1E88E5]/20 focus:border-[#1E88E5] outline-none transition-all text-[14px]"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-border accent-[#1E88E5]" />
                <span className="text-[13px] text-muted-foreground">Remember me</span>
              </label>
              <a href="#" className="text-[13px] text-[#1E88E5] hover:underline">Forgot Password?</a>
            </div>

            <button
              type="submit"
              disabled={loadingEmail || loadingGoogle}
              className="w-full py-3.5 bg-[#1E88E5] hover:bg-[#1976D2] text-white rounded-xl transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/30 disabled:opacity-50 flex items-center justify-center gap-2 text-[15px] font-medium"
            >
              {loadingEmail ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[13px] text-muted-foreground">Or continue with</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loadingGoogle || loadingEmail}
            className="w-full py-3 border border-border rounded-xl text-[14px] hover:bg-accent transition-colors flex items-center justify-center gap-2 disabled:opacity-50 font-medium"
          >
            {loadingGoogle ? (
              <div className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
            ) : (
              <Chrome className="w-4 h-4" />
            )}
            Google
          </button>

          <p className="mt-6 text-center text-[14px] text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-[#1E88E5] hover:underline font-medium">Create account</Link>
          </p>
        </div>
      </div>

      {/* Right - Illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#1E88E5] to-[#1565C0] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute w-96 h-96 bg-white/10 rounded-full -top-20 -right-20" />
          <div className="absolute w-64 h-64 bg-white/10 rounded-full bottom-20 -left-10" />
          <div className="absolute w-48 h-48 bg-white/5 rounded-full top-1/3 left-1/4" />
        </div>
        <div className="relative z-10 text-white text-center max-w-lg">
          <div className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Eye className="w-12 h-12" />
          </div>
          <h2 className="text-[32px] mb-4 font-bold">AI-Powered Retinal Analysis</h2>
          <p className="text-white/80 text-[16px] mb-8">
            Detect diabetic retinopathy early with our advanced deep learning system. 
            Trusted by 500+ healthcare providers worldwide.
          </p>
          <div className="flex justify-center gap-8 text-center">
            <div>
              <p className="text-[28px] font-bold">98.5%</p>
              <p className="text-white/60 text-[13px]">Accuracy</p>
            </div>
            <div>
              <p className="text-[28px] font-bold">50K+</p>
              <p className="text-white/60 text-[13px]">Scans Analyzed</p>
            </div>
            <div>
              <p className="text-[28px] font-bold">500+</p>
              <p className="text-white/60 text-[13px]">Hospitals</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
