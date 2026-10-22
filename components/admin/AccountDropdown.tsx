'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_LABELS } from '@/lib/roles';

export default function AccountDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    currentPassword: '',
  });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout, updateProfile } = useAuth();
  // Only admins sign in by email; managers sign in by phone.
  const canEditEmail = user?.role === 'admin';

  // Close dropdown when clicking outside of the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowUpdateForm(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      if (!(canEditEmail && formData.email) && !formData.password) {
        setUpdateError(canEditEmail ? 'Please provide either a new email or password' : 'Please enter a new password');
        setIsUpdating(false);
        return;
      }

      if (!formData.currentPassword) {
        setUpdateError('Current password is required');
        setIsUpdating(false);
        return;
      }

      await updateProfile({
        email: canEditEmail ? formData.email || undefined : undefined,
        password: formData.password || undefined,
        currentPassword: formData.currentPassword,
      });

      setUpdateSuccess(true);
      setFormData({ email: '', password: '', currentPassword: '' });
      setTimeout(() => {
        setShowUpdateForm(false);
        setUpdateSuccess(false);
      }, 2000);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to update profile";
      setUpdateError(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Account Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg text-white/60 hover:bg-surface-dark-lighter hover:text-white transition-colors"
      >
        <span className="material-symbols-outlined text-xl">account_circle</span>
      </button>

      {/* Dropdown Modal */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-surface-dark rounded-xl border border-surface-dark-lighter shadow-lg z-50">
          <div className="p-4 border-b border-surface-dark-lighter">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">
                  person
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {user?.name || 'Admin'}
                </p>
                <p className="text-white/40 text-xs truncate">
                  {user?.email || user?.phone || ''}
                </p>
              </div>
            </div>
          </div>

          <div className="p-2">
            <div className="px-3 py-2 text-white/60 text-xs">
              <p className="font-medium mb-1">Role</p>
              <p className="text-white/40">{user ? ROLE_LABELS[user.role] : 'Administrator'}</p>
            </div>
          </div>

          {!showUpdateForm ? (
            <>
              <div className="p-2 border-t border-surface-dark-lighter">
                <button
                  onClick={() => {
                    setShowUpdateForm(true);
                    setFormData({ email: user?.email || '', password: '', currentPassword: '' });
                    setUpdateError(null);
                    setUpdateSuccess(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-surface-dark-lighter transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">edit</span>
                  <span className="font-medium">Update Profile</span>
                </button>
              </div>
              <div className="p-2 border-t border-surface-dark-lighter">
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-surface-dark-lighter text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">logout</span>
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </>
          ) : (
            <div className="p-4 border-t border-surface-dark-lighter">
              <form onSubmit={handleUpdateProfile} className="space-y-3">
                {canEditEmail && (
                <div>
                  <label className="block text-white/60 text-xs mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={user?.email || 'Email'}
                    className="w-full h-9 px-3 bg-surface-dark-lighter border border-surface-dark-lighter rounded-lg text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                )}
                <div>
                  <label className="block text-white/60 text-xs mb-1">New Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Leave empty to keep current"
                    className="w-full h-9 px-3 bg-surface-dark-lighter border border-surface-dark-lighter rounded-lg text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-xs mb-1">Current Password</label>
                  <input
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    placeholder="Required for changes"
                    required
                    className="w-full h-9 px-3 bg-surface-dark-lighter border border-surface-dark-lighter rounded-lg text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                {updateError && (
                  <p className="text-red-400 text-xs">{updateError}</p>
                )}
                {updateSuccess && (
                  <p className="text-emerald-400 text-xs">Profile updated successfully!</p>
                )}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="flex-1 h-9 px-4 bg-primary text-black font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    {isUpdating ? 'Updating...' : 'Update'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUpdateForm(false);
                      setFormData({ email: '', password: '', currentPassword: '' });
                      setUpdateError(null);
                      setUpdateSuccess(false);
                    }}
                    className="h-9 px-4 bg-surface-dark-lighter text-white/60 rounded-lg hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

