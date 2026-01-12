import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff } from 'lucide-react';
import '../styles/auth.css';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      //  Recommended version: Only email + password
      await login(email, password);
      //console.log("AFTER LOGIN USER:", JSON.parse(localStorage.getItem("user")));


      const returnTo = location.state?.returnTo || "/";
      navigate(returnTo, { replace: true });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to sign in. Please check your credentials.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-extrabold text-white">Log in</h2>
          <p className="mt-2 text-sm text-gray-300">
            Enter your credentials to continue
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    color: 'var(--color-text-secondary)',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="auth-error mt-5">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="auth-actions">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? "Logging in..." : "Log in"}
            </button>
          </div>
        </form>

        <div className="auth-footer">
          Don’t have an account?
          <Link to="/register">Register</Link>
        </div>
      </div>
    </div>
  );
}
