export default function ProfileAccount({ profileData, handleChange, handleSave, saving, error, success }) {
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
          <label>New Password (optional)</label>
          <input name="password" type="password" value={profileData.password} onChange={handleChange} />
        </div>

        {error && <div className="profile-error">{error}</div>}
        {success && <div className="profile-success">{success}</div>}

        <button type="submit" className="profile-save" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </section>
  );
}
