import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { server_Url } from "../App";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUser } from "../redux/userSlice";
import logo from '../assets/logo.svg';

const AuthPage = () => {
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isLogin = mode === "login";

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password || (!isLogin && !form.username)) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const { data } = await axios.post(`${server_Url}${endpoint}`, form, { withCredentials: true })
      toast.success(data.message);
      navigate('/');
      dispatch(setUser(data.user))
    } catch (err) {
      console.log(err?.response);
      toast.error(err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="auth-page">
      {/* Background image + gradient wash */}
      <div className="auth-page__backdrop" />
      <div className="auth-page__gradient" />

      {/* Top bar */}
      <header className="auth-header">
        <h1 className="auth-header__logo">
          <img src={logo} alt="" />
        </h1>
        {isLogin ? (
          <button
            onClick={() => setMode("register")}
            className="auth-header__signup-btn"
          >
            Sign Up
          </button>
        ) : (
          <span className="auth-header__toggle-text">
            Already have an account?{" "}
            <button
              onClick={() => setMode("login")}
              className="auth-header__toggle-link"
            >
              Sign In
            </button>
          </span>
        )}
      </header>

      {/* Form card */}
      <main className="auth-main">
        <div className="auth-card">
          <h2 className="auth-card__title">
            {isLogin ? "Sign In" : "Create Account"}
          </h2>

          {error && <div className="auth-card__error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="form-field">
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder=" "
                  className="form-field__input"
                />
                <label className="form-field__label">Username</label>
              </div>
            )}

            <div className="form-field">
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder=" "
                className="form-field__input"
              />
              <label className="form-field__label">Email</label>
            </div>

            <div className="form-field">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder=" "
                className="form-field__input form-field__input--password"
              />
              <label className="form-field__label">Password</label>
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="form-field__toggle"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          {isLogin && (
            <div className="auth-extras">
              <label className="auth-extras__remember">
                <input type="checkbox" className="auth-extras__checkbox" />
                Remember me
              </label>
              <button type="button" className="auth-extras__help">
                Need help?
              </button>
            </div>
          )}

          <p className="auth-card__footer">
            {isLogin ? "New here?" : "Already have an account?"}{" "}
            <button
              onClick={() => setMode(isLogin ? "register" : "login")}
              className="auth-card__footer-link"
            >
              {isLogin ? "Create an account now." : "Sign in instead."}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}

export default AuthPage;
