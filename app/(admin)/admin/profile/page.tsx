'use client';

import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authManager, makeAuthenticatedRequest } from '@/lib/utils/clientAuth';
import toast from 'react-hot-toast';
import { Building2, Camera, Mail, Save, Shield, User2 } from 'lucide-react';

type AdminUser = {
  name: string;
  email: string;
  role: string;
  _id?: string;
};

type VaultData = {
  extraFields?: {
    avatarUrl?: string;
  };
};

export default function AdminProfilePage() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [vault, setVault] = useState<VaultData | null>(null);
  const [name, setName] = useState('');
  const [initialName, setInitialName] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const currentUser = authManager.getCurrentUserData();
        setUser(currentUser);
        setName(currentUser?.name || '');
        setInitialName(currentUser?.name || '');
      } catch {
        setUser(null);
      }

      try {
        const res = await makeAuthenticatedRequest('/api/students/me', { cache: 'no-store' });
        const payload = await res.json();
        if (payload?.success) {
          setVault(payload.data?.vault || null);
        }
      } catch {
        // ignore: profile can still render without vault
      }
    };
    load();
  }, []);

  const roleLabel = useMemo(() => {
    switch (user?.role) {
      case 'admin':
        return 'System Administrator';
      case 'placement-officer':
        return 'Placement Officer';
      default:
        return user?.role || 'User';
    }
  }, [user?.role]);

  const RoleIcon = useMemo(() => {
    switch (user?.role) {
      case 'admin':
        return Shield;
      case 'placement-officer':
        return Building2;
      default:
        return User2;
    }
  }, [user?.role]);

  const initials = useMemo(() => {
    const name = user?.name?.trim() || 'U';
    return name
      .split(/\s+/)
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [user?.name]);

  const handleAvatarPick = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setAvatarFile(f);
  };

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      if (name.trim().length < 2) {
        toast.error('Name must be at least 2 characters');
        return;
      }

      // 1) Upload avatar (optional)
      if (avatarFile) {
        const fd = new FormData();
        fd.append('file', avatarFile);
        fd.append('type', 'avatar');
        const upRes = await makeAuthenticatedRequest('/api/vault/extra-fields', {
          method: 'POST',
          body: fd,
        });
        const upPayload = await upRes.json();
        if (!upPayload?.success) throw new Error(upPayload?.message || 'Avatar upload failed');

        setVault((prev) => ({
          ...(prev || {}),
          extraFields: {
            ...(prev?.extraFields || {}),
            avatarUrl: upPayload.data?.url,
          },
        }));
        setAvatarFile(null);
      }

      // 2) Update name in DB (and sync Firebase displayName best-effort)
      if (name.trim() !== initialName.trim()) {
        const res = await makeAuthenticatedRequest('/api/users/me', {
          method: 'PATCH',
          body: JSON.stringify({ name: name.trim() }),
        });
        const payload = await res.json();
        if (!payload?.success) throw new Error(payload?.message || 'Failed to update profile');

        const updatedUser = { ...(user as any), ...(payload.data?.user || {}) };
        setUser(updatedUser);
        setInitialName(updatedUser.name || name.trim());
        setName(updatedUser.name || name.trim());
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      toast.success('Profile updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await makeAuthenticatedRequest('/api/users/me/password', {
        method: 'PUT',
        body: JSON.stringify({ newPassword }),
      });
      const payload = await res.json();
      if (!payload?.success) throw new Error(payload?.message || 'Failed to update password');
      toast.success('Password updated');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setChangingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Profile</h1>
          <p className="text-slate-600">View your account details.</p>
        </div>

        <div className="space-y-6">
          <Card className="border border-slate-200 bg-white p-6">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                {vault?.extraFields?.avatarUrl ? (
                  <img
                    src={vault.extraFields.avatarUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl text-blue-700 font-semibold">{initials}</span>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <RoleIcon className="h-4 w-4 text-blue-600" />
                  <p className="text-sm text-slate-600">{roleLabel}</p>
                </div>
                <h2 className="text-xl font-semibold text-slate-900">{user.name}</h2>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">Email</span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-slate-900 break-all">{user.email}</p>
                  </div>

                  <div className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-center gap-2 text-slate-600">
                      <User2 className="h-4 w-4" />
                      <span className="text-sm">Role</span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-slate-900">{user.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border border-slate-200 bg-white p-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Edit Profile</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="admin-name">Name</Label>
                <Input id="admin-name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-avatar">Avatar</Label>
                <div className="flex items-center gap-3">
                  <Input id="admin-avatar" type="file" accept="image/*" onChange={handleAvatarPick} />
                  <Button type="button" variant="outline" onClick={saveProfile} disabled={saving}>
                    <Camera className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
                <p className="text-xs text-slate-500">JPG/PNG/WebP up to 5MB.</p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setName(initialName);
                  setAvatarFile(null);
                }}
                disabled={saving}
              >
                Reset
              </Button>
              <Button type="button" onClick={saveProfile} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </Card>

          <Card className="border border-slate-200 bg-white p-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Change Password</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="button" onClick={changePassword} disabled={changingPassword}>
                {changingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

