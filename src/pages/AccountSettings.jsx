import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';

export default function AccountSettings() {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  // Fetch current user
  useState(() => {
    base44.auth.me().then(setUser).catch(() => {});
  });

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setError('');
    try {
      // Delete user account via Base44 SDK
      await base44.auth.deleteAccount();
      // Redirect to login after successful deletion
      navigate('/');
    } catch (e) {
      setError(e.message || 'Failed to delete account');
      setDeleting(false);
    }
  };

  const handleLogout = async () => {
    await base44.auth.logout('/');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#040709',
      color: '#c8e8f0',
      fontFamily: "'JetBrains Mono', monospace",
      padding: '20px 16px',
      paddingBottom: 'calc(20px + env(safe-area-inset-bottom))',
    }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            color: '#00d4ff',
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          ← Back
        </button>
      </div>

      {/* Title */}
      <h1 style={{
        fontFamily: "'Orbitron', sans-serif",
        fontSize: 20,
        fontWeight: 700,
        background: 'linear-gradient(90deg,#00d4ff,#39ff7a)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: 8,
      }}>
        Account Settings
      </h1>

      {user && (
        <div style={{
          marginBottom: 24,
          padding: '12px 16px',
          background: '#07101c',
          border: '1px solid #00d4ff22',
          borderRadius: 10,
        }}>
          <div style={{ fontSize: 12, color: '#5a8a9a', marginBottom: 4 }}>Logged in as</div>
          <div style={{ fontSize: 14, color: '#e8f4f8', fontWeight: 600 }}>{user.email}</div>
          {user.full_name && (
            <div style={{ fontSize: 12, color: '#9ab8c8', marginTop: 4 }}>{user.full_name}</div>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button
          onClick={handleLogout}
          style={{
            padding: '14px 20px',
            borderRadius: 10,
            border: '1px solid #00d4ff44',
            background: '#00d4ff18',
            color: '#00d4ff',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Log Out
        </button>

        <button
          onClick={() => setShowDeleteConfirm(true)}
          style={{
            padding: '14px 20px',
            borderRadius: 10,
            border: '1px solid #ff444444',
            background: '#ff444418',
            color: '#ff4444',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Delete Account
        </button>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#07101c',
            border: '1px solid #ff444444',
            borderRadius: 14,
            padding: 24,
            maxWidth: 340,
            width: '100%',
          }}>
            <h2 style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 16,
              color: '#ff4444',
              marginBottom: 12,
            }}>
              Delete Account?
            </h2>
            <p style={{
              fontSize: 12,
              color: '#9ab8c8',
              lineHeight: 1.6,
              marginBottom: 20,
            }}>
              This will permanently delete your account and all saved circuits. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 8,
                  border: '1px solid #5a8a9a44',
                  background: 'transparent',
                  color: '#9ab8c8',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: deleting ? 'default' : 'pointer',
                  opacity: deleting ? 0.5 : 1,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 8,
                  border: 'none',
                  background: deleting ? '#ff444466' : '#ff4444',
                  color: '#fff',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: deleting ? 'default' : 'pointer',
                }}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
            {error && (
              <div style={{
                marginTop: 16,
                fontSize: 11,
                color: '#ff4444',
                background: '#ff000011',
                border: '1px solid #ff444433',
                borderRadius: 6,
                padding: '8px 12px',
              }}>
                {error}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info */}
      <div style={{
        marginTop: 32,
        fontSize: 10,
        color: '#3a6a7a',
        textAlign: 'center',
        lineHeight: 1.8,
      }}>
        Your account data is stored securely by Base44.
        <br />
        Deleting your account will remove all access and saved data.
      </div>
    </div>
  );
}