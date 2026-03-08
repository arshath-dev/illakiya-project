import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { Eye, Mail, Lock, User, Chrome } from "lucide-react";
import { useAuth, type UserRole } from "./AuthContext";

export function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("patient");
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [localError, setLocalError] = useState("");
  const { register, loginWithGoogle, error, clearError, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already logged in, redirect
    if (user) {
      navigate(user.role === "doctor" ? "/doctor" : "/patient");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }
    if (!name.trim()) {
      setLocalError("Please enter your full name");
      return;
    }
    setLocalError("");
    clearError();
    setLoading(true);
    try {
      await register(name, email, password, role);
      navigate(role === "doctor" ? "/doctor" : "/patient");
    } catch (err) {
      // Error is already set in context
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    clearError();
    setLoadingGoogle(true);
    try {
      await loginWithGoogle(role);
      navigate(role === "doctor" ? "/doctor" : "/patient");
    } catch (err) {
      // handled by context
    } finally {
      setLoadingGoogle(false);
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex font-[Inter,sans-serif]">
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

          <h1 className="text-[28px] mb-2 font-semibold">Create Account</h1>
          <p className="text-muted-foreground mb-6 text-[14px]">Join our medical AI platform</p>

          {/* Role Selection - Top Priority */}
          <div className="mb-8">
            <p className="text-[13px] font-medium text-muted-foreground mb-3">I am a:</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setRole("doctor")}
                className={`py-3 px-4 rounded-xl border-2 transition-all font-medium text-[14px] ${role === "doctor"
                    ? "border-[#1E88E5] bg-[#1E88E5]/10 text-[#1E88E5]"
                    : "border-border bg-card text-muted-foreground hover:border-[#1E88E5]/50"
                  }`}
              >
                Doctor/Admin
              </button>
              <button
                onClick={() => setRole("patient")}
                className={`py-3 px-4 rounded-xl border-2 transition-all font-medium text-[14px] ${role === "patient"
                    ? "border-[#1E88E5] bg-[#1E88E5]/10 text-[#1E88E5]"
                    : "border-border bg-card text-muted-foreground hover:border-[#1E88E5]/50"
                  }`}
              >
                Patient
              </button>
            </div>
          </div>

          {displayError && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
              <p className="text-[13px] text-destructive">{displayError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] mb-2 text-muted-foreground">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-card focus:ring-2 focus:ring-[#1E88E5]/20 focus:border-[#1E88E5] outline-none transition-all text-[14px]"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] mb-2 text-muted-foreground">Email Address</label>
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
              <label className="block text-[13px] mb-2 text-muted-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-card focus:ring-2 focus:ring-[#1E88E5]/20 focus:border-[#1E88E5] outline-none transition-all text-[14px]"
                  placeholder="Create a password"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] mb-2 text-muted-foreground">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-card focus:ring-2 focus:ring-[#1E88E5]/20 focus:border-[#1E88E5] outline-none transition-all text-[14px]"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || loadingGoogle}
              className="w-full py-3.5 bg-[#1E88E5] hover:bg-[#1976D2] text-white rounded-xl transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/30 disabled:opacity-50 flex items-center justify-center gap-2 text-[15px] font-medium"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Create Account"
              )}
            </button>

            {/* or google signup */}
            <div className="my-4 flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[13px] text-muted-foreground">Or sign up with</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <button
              type="button"
              onClick={handleGoogle}
              disabled={loadingGoogle || loading}
              className="w-full py-3 border border-border rounded-xl text-[14px] hover:bg-accent transition-colors flex items-center justify-center gap-2 disabled:opacity-50 font-medium"
            >
              {loadingGoogle ? (
                <div className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
              ) : (
                <Chrome className="w-4 h-4" />
              )}
              Google
            </button>
          </form>

          <p className="mt-6 text-center text-[14px] text-muted-foreground">
            Already have an account?{" "}
            <Link to="/" className="text-[#1E88E5] hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>

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
          <h2 className="text-[32px] mb-4 font-bold">Join Our Medical Team</h2>
          <p className="text-white/80 text-[16px] mb-8">
            Get started with AI-powered retinal analysis. Register as a doctor to manage patients or as a patient to get scanned.
          </p>
        </div>
      </div>
    </div>
  );
}
