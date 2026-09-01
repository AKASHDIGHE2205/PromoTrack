import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Mobile, 2: OTP, 3: New Password
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer for OTP resend
  useEffect(() => {
    if (step === 2 && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setCanResend(true);
    }
  }, [step, timer]);

  // Auto-focus first OTP input when entering step 2
  useEffect(() => {
    if (step === 2) {
      otpRefs.current[0]?.focus();
    }
  }, [step]);

  const handleSendOTP = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (mobile.length !== 10) {
      return toast.error("Please enter a valid 10-digit mobile number");
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setStep(2);
      setTimer(30);
      setCanResend(false);
      toast.success("OTP sent successfully!");
    }, 1500);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace to go to previous input
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (pastedData) {
      const newOtp = [...otp];
      pastedData.split("").forEach((char, index) => {
        if (index < 6) newOtp[index] = char;
      });
      setOtp(newOtp);
      otpRefs.current[Math.min(pastedData.length, 5)]?.focus();
    }
  };

  const handleVerifyOTP = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      return toast.error("Please enter the complete 6-digit OTP");
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setStep(3);
      toast.success("OTP verified successfully!");
    }, 1500);
  };

  const handleResetPassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password.length < 8) {
      return toast.error("Password must be at least 8 characters");
    }
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success("Password reset successfully!");
      navigate("/login");
    }, 1500);
  };

  const handleResendOTP = () => {
    if (!canResend) return;

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setTimer(30);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
      toast.success("OTP resent successfully!");
    }, 1000);
  };

  const formatMobile = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 10);
    setMobile(cleaned);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 py-8 bg-gradient-to-br from-orange-50 via-white to-purple-50">

      {/* Container */}
      <div className="w-full max-w-[450px] relative">

        {/* Decorative Gradient Orbs */}
        <div className="absolute -top-20 -right-16 w-64 h-64 bg-gradient-to-br from-orange-300/30 to-orange-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-gradient-to-tr from-purple-300/30 to-purple-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -left-8 w-32 h-32 bg-gradient-to-br from-rose-200/20 to-orange-200/20 rounded-full blur-2xl pointer-events-none" />

        {/* Card - App-like floating design */}
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-orange-200/50 border border-white/60 overflow-hidden">

          {/* Content */}
          <div className="relative px-8 py-8">

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

              <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                {step === 1 ? "Forgot Password" : step === 2 ? "Enter OTP" : "Reset Password"}
              </h1>

              <p className="text-sm text-slate-600 mt-2">
                {step === 1
                  ? "Enter your mobile number to reset password"
                  : step === 2
                    ? `Enter the 6-digit code sent to +91 ${mobile}`
                    : "Create a new password for your account"}
              </p>
            </div>

            {/* Progress Steps */}
            <div className="px-8">
              <div className="flex items-center justify-between mb-8">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center flex-1">
                    <div className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${step >= s
                            ? "bg-gradient-to-r from-orange-500 to-purple-500 text-white shadow-lg shadow-orange-300/50"
                            : "bg-slate-200 text-slate-500"
                          }`}
                      >
                        {step > s ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          s
                        )}
                      </div>
                      <span className={`ml-2 text-xs font-semibold hidden sm:block ${step >= s ? "text-slate-700" : "text-slate-400"
                        }`}>
                        {s === 1 ? "Mobile" : s === 2 ? "OTP" : "Reset"}
                      </span>
                    </div>
                    {s < 3 && (
                      <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all duration-300 ${step > s ? "bg-gradient-to-r from-orange-400 to-purple-400" : "bg-slate-200"
                        }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 1: Mobile Number */}
            {step === 1 && (
              <form onSubmit={handleSendOTP} className="space-y-5">
                <div>
                  <label htmlFor="mobile" className="block text-sm font-semibold text-slate-700 mb-2">
                    Mobile Number <span className="text-orange-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-sm font-semibold text-slate-500 group-focus-within:text-orange-500 transition-colors">
                        +91
                      </span>
                      <div className="w-px h-5 bg-slate-300 ml-2 mr-3" />
                    </div>
                    <input
                      id="mobile"
                      name="mobile"
                      type="tel"
                      required
                      value={mobile}
                      onChange={(e) => formatMobile(e.target.value)}
                      placeholder="Enter 10-digit mobile number"
                      maxLength={10}
                      className="w-full rounded-lg border-2 border-slate-200 bg-white/90 pl-20 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-0 focus:ring-orange-100 transition-all duration-200 disabled:bg-slate-50 disabled:text-slate-400"
                      disabled={loading}
                    />
                  </div>
                </div>

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
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>

                <div className="text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-orange-600 transition-colors duration-150"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Login
                  </Link>
                </div>
              </form>
            )}

            {/* Step 2: OTP Verification */}
            {step === 2 && (
              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3 text-center">
                    Enter 6-digit OTP
                  </label>
                  <div className="flex gap-2 justify-center">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          otpRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={handleOtpPaste}
                        className="w-12 h-14 text-center text-xl font-bold rounded-lg border-2 border-slate-200 bg-white/90 text-slate-900 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all duration-200 disabled:bg-slate-50"
                        disabled={loading}
                      />
                    ))}
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-slate-600">
                    Didn't receive the code?{" "}
                    {canResend ? (
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-purple-600 font-semibold hover:opacity-75 transition-opacity"
                      >
                        Resend OTP
                      </button>
                    ) : (
                      <span className="text-slate-400 font-semibold">
                        Resend in {timer}s
                      </span>
                    )}
                  </p>
                </div>

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
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-orange-600 transition-colors duration-150"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Change Mobile Number
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: New Password */}
            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label htmlFor="new-password" className="block text-sm font-semibold text-slate-700 mb-2">
                    New Password <span className="text-orange-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-orange-500 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="new-password"
                      name="new-password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      minLength={8}
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

                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-semibold text-slate-700 mb-2">
                    Confirm Password <span className="text-orange-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-orange-500 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="confirm-password"
                      name="confirm-password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      minLength={8}
                      className="w-full rounded-lg border-2 border-slate-200 bg-white/90 pl-11 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-0 focus:ring-orange-100 transition-all duration-200 disabled:bg-slate-50 disabled:text-slate-400"
                      disabled={loading}
                    />
                  </div>
                </div>

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
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* App-like bottom indicator */}
        <div className="mt-6 flex justify-center">
          <div className="w-32 h-1 bg-orange-300 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;