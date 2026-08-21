import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import logo from "../assets/logo.svg";
import { server_Url } from "../App";

const ForgotPassword = () => {
  const [step, setStep] = useState("email"); // "email" | "otp" | "password" | "done"
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`${server_Url}/api/auth/send-otp`, { email }, { withCredentials: true });
      if (data.success !== false) {
        toast.success(data.message || "OTP sent to your email.");
        setStep("otp");
      } else {
        toast.error(data.message || "Something went wrong.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      toast.error("Please enter the OTP.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.put(`${server_Url}/api/auth/verify-otp`, { email, otp }, { withCredentials: true });
      if (data.success !== false) {
        toast.success(data.message || "OTP verified.");
        setStep("password");
      } else {
        toast.error(data.message || "Invalid OTP.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!password.trim() || !confirmPassword.trim()) {
      toast.error("Please fill both password fields.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(
        `${server_Url}/api/auth/reset-password`,
        { email, newpassword: password },
        { withCredentials: true }
      );
      if (data.success !== false) {
        toast.success(data.message || "Password changed successfully.");
        setStep("done");
        setTimeout(() => navigate("/auth"), 1200);
      } else {
        toast.error(data.message || "Failed to reset password.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page forgot-password-page">
      <div className="auth-page__backdrop" />
      <div className="auth-page__gradient" />

      <header className="auth-header">
        <h1 className="auth-header__logo">
          <img src={logo} alt="MyDrama logo" />
        </h1>
        <button type="button" className="auth-header__signup-btn" onClick={() => navigate("/auth")}>
          Sign In
        </button>
      </header>

      <main className="auth-main">
        <div className="auth-card forgot-password-card">
          <h2 className="auth-card__title">Reset Password</h2>

          {step === "email" && (
            <>
              <p className="forgot-password-card__subtitle">
                Enter your email and we'll send you an OTP to recover your account.
              </p>
              <form onSubmit={handleSendOtp} className="auth-form">
                <div className="form-field">
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder=" "
                    className="form-field__input"
                  />
                  <label className="form-field__label">Email</label>
                </div>
                <button type="submit" disabled={loading} className="submit-btn">
                  {loading ? "Please wait..." : "Send OTP"}
                </button>
              </form>
            </>
          )}

          {step === "otp" && (
            <>
              <p className="forgot-password-card__subtitle">
                Enter the OTP sent to <b>{email}</b>.
              </p>
              <form onSubmit={handleVerifyOtp} className="auth-form">
                <div className="form-field">
                  <input
                    type="text"
                    name="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder=" "
                    className="form-field__input"
                  />
                  <label className="form-field__label">OTP</label>
                </div>
                <button type="submit" disabled={loading} className="submit-btn">
                  {loading ? "Please wait..." : "Verify OTP"}
                </button>
              </form>
              <p className="auth-card__footer">
                Didn't get the code?{" "}
                <button type="button" className="auth-card__footer-link" onClick={handleSendOtp}>
                  Resend OTP
                </button>
              </p>
            </>
          )}

          {step === "password" && (
            <>
              <p className="forgot-password-card__subtitle">Enter your new password.</p>
              <form onSubmit={handleResetPassword} className="auth-form">
                <div className="form-field">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder=" "
                    className="form-field__input form-field__input--password"
                  />
                  <label className="form-field__label">New Password</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword((isVisible) => !isVisible)}
                    className="form-field__toggle"
                    aria-label={showPassword ? "Hide new password" : "Show new password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="form-field">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder=" "
                    className="form-field__input form-field__input--password"
                  />
                  <label className="form-field__label">Confirm Password</label>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((isVisible) => !isVisible)}
                    className="form-field__toggle"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <button type="submit" disabled={loading} className="submit-btn">
                  {loading ? "Please wait..." : "Change Password"}
                </button>
              </form>
            </>
          )}

          {step === "done" && (
            <p className="forgot-password-card__subtitle">
              Password changed! Redirecting to sign in...
            </p>
          )}

          <p className="auth-card__footer">
            Remembered your password?{" "}
            <button type="button" onClick={() => navigate("/auth")} className="auth-card__footer-link">
              Back to sign in.
            </button>
          </p>
        </div>
      </main>
    </div>
  );
};

export default ForgotPassword;