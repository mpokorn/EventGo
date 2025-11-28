import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/Modal";
import api from "../../api/api";

export default function ProfileAccount({ profileData, handleChange, handleSave, saving, error, success }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, type: "alert", title: "", message: "", onConfirm: null });
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    if (!user) return;

    setDeleting(true);
    try {
      await api.delete(`/users/${user.id}`);
      logout();
      navigate("/login");
    } catch (err) {
      console.error("Error deleting account:", err);
      setModal({
        isOpen: true,
        type: "alert",
        title: "Error",
        message: err.response?.data?.message || "Failed to delete account. You may have active tickets or events.",
        onConfirm: null
      });
      setDeleting(false);
    }
  };

  return (
    <section className="profile-card profile-info">
      <h2>Your Account</h2>
      <h4>You can edit your account details here</h4>

      <form onSubmit={handleSave} className="profile-form">
        
        <div className="form-row">
          <label>First Name</label>
          <input name="first_name" value={profileData.first_name} onChange={handleChange} />
        </div>

        <div className="form-row">
          <label>Last Name</label>
          <input name="last_name" value={profileData.last_name} onChange={handleChange} />
        </div>

        <div className="form-row">
          <label>Email</label>
          <input name="email" type="email" value={profileData.email} onChange={handleChange} />
        </div>

        <div className="form-row">
          <label>Current Password (required to change password)</label>
          <input 
            name="oldPassword" 
            type="password" 
            value={profileData.oldPassword || ''} 
            onChange={handleChange}
            placeholder="Enter current password to change it"
          />
        </div>

        <div className="form-row">
          <label>New Password (optional)</label>
          <input 
            name="password" 
            type="password" 
            value={profileData.password} 
            onChange={handleChange}
            placeholder="Leave blank to keep current password"
          />
        </div>

        {error && <div className="profile-error">{error}</div>}
        {success && <div className="profile-success">{success}</div>}

        <button type="submit" className="profile-save" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>

      <div className="danger-zone">
        <div className="danger-zone-content">
          <h3>Delete Account</h3>
          <p>Are you sure you want to delete your account? Please be certain.</p>
        </div>
        
        {!showDeleteConfirm ? (
          <button 
            type="button" 
            className="btn-danger" 
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Account
          </button>
        ) : (
          <div className="delete-confirm">
            <p className="delete-warning">⚠️ Are you sure? This action cannot be undone!</p>
            <div className="delete-actions">
              <button 
                type="button" 
                className="btn-danger-confirm" 
                onClick={handleDeleteAccount}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Yes, Delete My Account"}
              </button>
              <button 
                type="button" 
                className="btn-danger-cancel" 
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </section>
  );
}
