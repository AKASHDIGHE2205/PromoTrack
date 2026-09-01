import { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hook/store";
import { loginUser, clearError } from "../../feature/auth/authSlice";
import logo from "../../assets/Malpanigroup.png";
import toast from "react-hot-toast";

// Simple inline LogoImage component to handle loading state
const LogoImage = ({ src, alt }: { src: string; alt?: string }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      {!loaded && (
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-200 to-purple-200 animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={`w-16 h-16 object-contain ${loaded ? "" : "hidden"}`}
      />
    </>
  );
};

const Login = () => {
  const dispatch = useAppDispatch();
  const { loading, error, token }: any = useAppSelector((s) => s.auth);
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      return toast.error("Please fill all required fields");
    }
    dispatch(loginUser(form));
  };

  if (token) return <Navigate to="/" replace />;

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 py-8 bg-gradient-to-br from-orange-50 via-white to-purple-50">

      {/* Container */}
      <div className="w-full max-w-[450px] relative">

        {/* Decorative Gradient Orbs */}
        <div className="absolute -top-20 -right-16 w-64 h-64 bg-gradient-to-br from-orange-300/30 to-orange-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-gradient-to-tr from-purple-300/30 to-purple-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -left-8 w-32 h-32 bg-gradient-to-br from-rose-200/20 to-orange-200/20 rounded-full blur-2xl pointer-events-none" />

        {/* Card - App-like floating design */}
        <div className="relative bg-white backdrop-blur-xl rounded-3xl shadow-2xl shadow-orange-200/50 border border-white/60 overflow-hidden">
          {/* Content */}
          <div className="relative px-8 py-8 sm:px-10">

            {/* Logo & Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-100 to-purple-100 shadow-lg shadow-orange-200/50 mb-4">
                <LogoImage src={logo} alt="Malpani" />
              </div>

              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-orange-400" />
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                <div className="w-8 h-0.5 bg-gradient-to-l from-transparent to-purple-400" />
              </div>

              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                Malpani Portal
              </h1>

              <p className="text-sm text-slate-500 mt-3 font-medium">
                Welcome back! Please sign in
              </p>
            </div>

            {/* Error Banner - Mobile friendly */}
            {error && (
              <div className="mb-6 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200 p-4 animate-slide-down">
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-rose-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-rose-800">Authentication Error</p>
                  <p className="text-xs text-rose-600 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                  Email/Mobile <span className="text-orange-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-orange-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="text"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter your email/mobile"
                    className="w-full rounded-lg border-2 border-slate-200 bg-white/90 pl-11 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-0 focus:ring-orange-100 transition-all duration-200 disabled:bg-slate-50 disabled:text-slate-400"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                    Password <span className="text-orange-500">*</span>
                  </label>
                  <Link
                    to={"/forgott-password"}
                    className="text-xs font-semibold text-orange-600"
                    title="Forgot password"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-orange-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full rounded-lg border-2 border-slate-200 bg-white/90 pl-11 pr-12 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-0 focus:ring-orange-100 transition-all duration-200 disabled:bg-slate-50 disabled:text-slate-400"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-orange-500 transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button - Gradient with app feel */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 via-rose-500 to-purple-500 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-300/50 hover:shadow-xl hover:shadow-orange-400/50 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-orange-200 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 cursor-pointer relative overflow-hidden group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />

                {loading && (
                  <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                )}
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Register Footer */}
            <p className="mt-8 text-center text-sm text-slate-500 font-medium">
              Don't have an account yet?{" "}
              <Link
                to="/login"
                aria-disabled
                className="text-orange-600 disabled:cursor-not-allowed"
                title="Registration is currently disabled"
              >
                Register
              </Link>
            </p>
          </div>
        </div>

        {/* App-like bottom indicator */}
        <div className="mt-6 flex justify-center">
          <div className="w-32 h-1 bg-orange-300 rounded-full" />
        </div>
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Login;