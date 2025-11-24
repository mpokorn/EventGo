import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { validateEmail, validatePassword, validateInput } from "../utils/validation";
import '../styles/auth.css';

export default function RegisterOrganizer() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate first name
    const firstNameValidation = validateInput(formData.firstName, 50);
    if (!firstNameValidation.valid) {
      setError(firstNameValidation.error);
      return;
    }

    // Validate last name
    const lastNameValidation = validateInput(formData.lastName, 50);
    if (!lastNameValidation.valid) {
      setError(lastNameValidation.error);
      return;
    }

    // Validate email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) {
      setError(emailValidation.error);
      return;
    }

    // Validate password
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.error);
      return;
    }

    // Check password match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const registrationData = {
        first_name: firstNameValidation.value,
        last_name: lastNameValidation.value,
        email: formData.email.trim(),
        password: formData.password,
        role: 'organizer'
      };

      await register(registrationData);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Error during registration. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page organizer-theme">
      <div className="auth-card">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-extrabold text-white">Register as Organizer</h2>
          <p className="mt-2 text-sm text-gray-300">
            Create an organizer account to manage and create events
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div>
              <label htmlFor="firstName">First Name <span style={{ color: '#ef4444' }}>*</span></label>
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
              <label htmlFor="lastName">Last Name <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="email">Email <span style={{ color: '#ef4444' }}>*</span></label>
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
              <label htmlFor="password">Password <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword">Confirm Password <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
              />
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
              {isLoading ? "Registering..." : "Register as Organizer"}
            </button>
          </div>
        </form>

        <div className="auth-footer">
          Already have an account?
          <Link to="/login">Sign in</Link>
        </div>

        <div className="auth-footer" style={{ marginTop: '1rem', paddingTop: '1rem' }}>
          Want to register as a regular user?
          <Link to="/register">Register as User</Link>
        </div>
      </div>
    </div>
  );
}
