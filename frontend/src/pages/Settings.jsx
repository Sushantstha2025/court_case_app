import React, { useState } from 'react';
import { User, Lock, CheckCircle2, AlertCircle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user, updateProfile, changePassword, logout } = useAuth();

  // Profile state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setProfileLoading(true);

    try {
      await updateProfile(fullName);
      setProfileSuccess('Profile name updated successfully.');
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="h2" style={{ margin: 0 }}>Account Settings</h1>
        <p className="text-muted" style={{ marginTop: '0.25rem' }}>
          Manage your personal details and account credentials.
        </p>
      </div>

      <div style={{ display: 'grid', gap: '2rem' }}>
        {/* Profile Card */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <User size={20} className="text-muted" />
              <h3 className="card-title">Profile Information</h3>
            </div>
          </div>
          <div className="card-body">
            {profileSuccess && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--success-bg)', color: 'var(--success-color)', padding: '0.75rem 1rem', borderRadius: 'var(--border-radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>
                <CheckCircle2 size={18} />
                <span>{profileSuccess}</span>
              </div>
            )}
            {profileError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--danger-bg)', color: 'var(--danger-color)', padding: '0.75rem 1rem', borderRadius: 'var(--border-radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>
                <AlertCircle size={18} />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label className="form-label" htmlFor="settings-email">Email Address</label>
                <input
                  type="email"
                  id="settings-email"
                  className="form-input"
                  value={user?.email || ''}
                  disabled
                  style={{ backgroundColor: 'var(--bg-color)', cursor: 'not-allowed', color: 'var(--text-secondary)' }}
                />
                <span className="text-muted text-small" style={{ marginTop: '0.25rem', display: 'block' }}>
                  Email address is linked to your account access and cannot be changed.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="settings-name">Full Name</label>
                <input
                  type="text"
                  id="settings-name"
                  className="form-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={profileLoading}
                style={{ marginTop: '0.5rem' }}
              >
                {profileLoading ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Lock size={20} className="text-muted" />
              <h3 className="card-title">Security & Password</h3>
            </div>
          </div>
          <div className="card-body">
            {passwordSuccess && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--success-bg)', color: 'var(--success-color)', padding: '0.75rem 1rem', borderRadius: 'var(--border-radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>
                <CheckCircle2 size={18} />
                <span>{passwordSuccess}</span>
              </div>
            )}
            {passwordError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--danger-bg)', color: 'var(--danger-color)', padding: '0.75rem 1rem', borderRadius: 'var(--border-radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>
                <AlertCircle size={18} />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label className="form-label" htmlFor="current-password">Current Password</label>
                <input
                  type="password"
                  id="current-password"
                  className="form-input"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="new-password">New Password</label>
                  <input
                    type="password"
                    id="new-password"
                    className="form-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="confirm-password">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirm-password"
                    className="form-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-secondary"
                disabled={passwordLoading}
                style={{ marginTop: '0.5rem' }}
              >
                {passwordLoading ? 'Updating Password...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>

        {/* Danger zone / Logout */}
        <div className="card" style={{ borderColor: '#fecaca' }}>
          <div className="card-header" style={{ background: '#fff5f5' }}>
            <h3 className="card-title" style={{ color: 'var(--danger-color)' }}>Session & Sign Out</h3>
          </div>
          <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontWeight: 600 }}>End Current Session</div>
              <div className="text-muted text-small">Securely sign out of this browser.</div>
            </div>
            <button className="btn btn-danger" onClick={logout}>
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
