import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import logo from "../assets/logo.svg";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      toast.success("If an account exists, we have sent recovery instructions.");
      setLoading(false);
    }, 700);
  };

  return (
    <div className="auth-page forgot-password-page">
      <div className="auth-page__backdrop" />
      <div className="auth-page__gradient" />

      <header className="auth-header">
        <h1 className="auth-header__logo">
          <img src={logo} alt="MyDrama logo" />
        </h1>
        <button
          type="button"
          className="auth-header__signup-btn"
          onClick={() => navigate("/auth")}
        >
          Sign In
        </button>
      </header>

      <main className="auth-main">
        <div className="auth-card forgot-password-card">
          <h2 className="auth-card__title">Reset Password</h2>
          <p className="forgot-password-card__subtitle">
            Enter your email and we'll send you instructions to recover your account.
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
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
              {loading ? "Please wait..." : "Send Reset Link"}
            </button>
          </form>

          <p className="auth-card__footer">
            Remembered your password?{' '}
            <button
              type="button"
              onClick={() => navigate("/auth")}
              className="auth-card__footer-link"
            >
              Back to sign in.
            </button>
          </p>
        </div>
      </main>
    </div>
  );
};

export default ForgotPassword;