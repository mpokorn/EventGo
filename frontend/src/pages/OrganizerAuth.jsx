import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

export default function OrganizerAuth() {
  const [searchParams] = useSearchParams();
  const modeParam = searchParams.get('mode');
  
  const [isLogin, setIsLogin] = useState(modeParam !== 'register');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { organizerLogin, organizerRegister } = useAuth();

  useEffect(() => {
    if (modeParam) {
      setIsLogin(modeParam === 'login');
    }
  }, [modeParam]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isLogin) {
      // Registration validation
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        await organizerLogin(formData.email, formData.password);
      } else {
        await organizerRegister({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          password: formData.password,
        });
      }
      
      const returnTo = location.state?.returnTo || '/';
      navigate(returnTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page organizer-theme">
      <div className="auth-card">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-extrabold text-white">
            {isLogin ? 'Organizer Sign In' : 'Become an Organizer'}
          </h2>
          <p className="mt-2 text-sm text-gray-300">
            {isLogin
              ? 'Sign in to your organizer account'
              : 'Create an account to start hosting events'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {!isLogin && (
              <>
                <div>
                  <label htmlFor="firstName">First Name</label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                
                  />
                </div>

                <div>
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                   
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                
              />
            </div>

            <div>
              <label htmlFor="password">Password</label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  
                />
              </div>
            )}
          </div>

          {error && (
            <div className="auth-error">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="auth-actions">
            <button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading
                ? isLogin
                  ? 'Signing in...'
                  : 'Creating account...'
                : isLogin
                ? 'Sign In as Organizer'
                : 'Create Organizer Account'}
            </button>
          </div>
        </form>

        <div className="auth-footer">
          <p className="text-sm text-gray-300">
            {isLogin ? "Don't have an organizer account?" : 'Already have an account?'}{' '}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFormData({
                  firstName: '',
                  lastName: '',
                  email: '',
                  password: '',
                  confirmPassword: '',
                });
              }}
              className="auth-link-button"
            >
              {isLogin ? 'Register here' : 'Sign in'}
            </button>
          </p>
          <p className="text-sm text-gray-300 mt-2">
            Regular user?{' '}
            <Link to="/login" className="auth-link">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
