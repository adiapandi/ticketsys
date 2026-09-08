import { useState, FormEvent, useRef, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/Avatar';
import { notificationPrefsApi, NotificationPrefs } from '../api/notificationPreferences';
import { playNotificationSound } from '../utils/notificationSound';

export function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefsSuccess, setPrefsSuccess] = useState('');

  useEffect(() => {
    notificationPrefsApi.get().then((res) => setPrefs(res.data));
  }, []);

  async function handlePrefChange(key: keyof NotificationPrefs, value: boolean) {
    if (!prefs) return;
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    setSavingPrefs(true);
    setPrefsSuccess('');
    try {
      await notificationPrefsApi.update({ [key]: value });
      setPrefsSuccess('Tersimpan');
      if (key === 'soundEnabled' && value) {
        playNotificationSound(); // preview supaya user tau bunyinya kayak apa
      }
      setTimeout(() => setPrefsSuccess(''), 1500);
    } finally {
      setSavingPrefs(false);
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError('');
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const { data } = await api.post('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser(data);
    } catch (err: any) {
      setAvatarError(err.response?.data?.message || 'Gagal upload foto');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setSavingProfile(true);
    try {
      const { data } = await api.post('/auth/profile', { name, email, phone });
      updateUser(data);
      setProfileSuccess('Profil berhasil diperbarui');
    } catch (err: any) {
      setProfileError(err.response?.data?.message || 'Gagal memperbarui profil');
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi password baru tidak cocok');
      return;
    }

    setSavingPassword(true);
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      setPasswordSuccess('Password berhasil diubah');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Gagal mengubah password');
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Profil Saya</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Kelola informasi akun kamu.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Foto Profil</h2>
        <div className="flex items-center gap-4">
          <Avatar name={user?.name || ''} avatarUrl={user?.avatarUrl} size={64} />
          <div>
            <label className="text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
              {uploadingAvatar ? 'Mengunggah...' : 'Ganti Foto'}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={uploadingAvatar}
              />
            </label>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">PNG/JPEG/GIF/WEBP, maks 3MB.</p>
            {avatarError && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{avatarError}</p>}
          </div>
        </div>
      </div>

        {prefs && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Pengaturan Notifikasi</h2>
            {prefsSuccess && <span className="text-xs text-green-600 dark:text-green-400">{prefsSuccess}</span>}
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm text-slate-700 dark:text-slate-200">Notifikasi Email</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Matikan untuk berhenti terima email dari sistem</p>
              </div>
              <input
                type="checkbox"
                checked={prefs.emailEnabled}
                onChange={(e) => handlePrefChange('emailEnabled', e.target.checked)}
                disabled={savingPrefs}
                className="rounded border-slate-300 dark:border-slate-600"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm text-slate-700 dark:text-slate-200">Nada Dering</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Bunyikan suara saat ada notifikasi baru</p>
              </div>
              <input
                type="checkbox"
                checked={prefs.soundEnabled}
                onChange={(e) => handlePrefChange('soundEnabled', e.target.checked)}
                disabled={savingPrefs}
                className="rounded border-slate-300 dark:border-slate-600"
              />
            </label>

            <div className="border-t border-slate-100 dark:border-slate-700 pt-3 space-y-2">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Jenis notifikasi yang diterima:</p>

              {user?.role === 'CUSTOMER' ? (
                <>
                  <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prefs.notifyStatusChanged}
                      onChange={(e) => handlePrefChange('notifyStatusChanged', e.target.checked)}
                      disabled={savingPrefs}
                      className="rounded border-slate-300 dark:border-slate-600"
                    />
                    Status ticket saya berubah
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prefs.notifyNewComment}
                      onChange={(e) => handlePrefChange('notifyNewComment', e.target.checked)}
                      disabled={savingPrefs}
                      className="rounded border-slate-300 dark:border-slate-600"
                    />
                    Ada balasan baru di ticket saya
                  </label>
                </>
              ) : (
                <>
                  <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prefs.notifyTicketCreated}
                      onChange={(e) => handlePrefChange('notifyTicketCreated', e.target.checked)}
                      disabled={savingPrefs}
                      className="rounded border-slate-300 dark:border-slate-600"
                    />
                    Ada ticket baru di department saya
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prefs.notifyTicketAssigned}
                      onChange={(e) => handlePrefChange('notifyTicketAssigned', e.target.checked)}
                      disabled={savingPrefs}
                      className="rounded border-slate-300 dark:border-slate-600"
                    />
                    Saya di-assign ke ticket
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prefs.notifyNewComment}
                      onChange={(e) => handlePrefChange('notifyNewComment', e.target.checked)}
                      disabled={savingPrefs}
                      className="rounded border-slate-300 dark:border-slate-600"
                    />
                    Ada balasan baru di ticket yang saya tangani
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prefs.notifySlaBreached}
                      onChange={(e) => handlePrefChange('notifySlaBreached', e.target.checked)}
                      disabled={savingPrefs}
                      className="rounded border-slate-300 dark:border-slate-600"
                    />
                    Ticket melewati batas SLA
                  </label>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Informasi Akun</h2>
        <form onSubmit={handleProfileSubmit} className="space-y-3">
          <div>
            <label className="text-sm text-slate-600 dark:text-slate-300">Nama</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="text-sm text-slate-600 dark:text-slate-300">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="text-sm text-slate-600 dark:text-slate-300">No. HP</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08xxxxxxxxxx"
              className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
            />
          </div>

          {profileError && <p className="text-sm text-red-600 dark:text-red-400">{profileError}</p>}
          {profileSuccess && <p className="text-sm text-green-600 dark:text-green-400">{profileSuccess}</p>}

          <button
            type="submit"
            disabled={savingProfile}
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {savingProfile ? 'Menyimpan...' : 'Simpan Profil'}
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Ganti Password</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-3">
          <div>
            <label className="text-sm text-slate-600 dark:text-slate-300">Password Saat Ini</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="text-sm text-slate-600 dark:text-slate-300">Password Baru (min. 6 karakter)</label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="text-sm text-slate-600 dark:text-slate-300">Konfirmasi Password Baru</label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
            />
          </div>

          {passwordError && <p className="text-sm text-red-600 dark:text-red-400">{passwordError}</p>}
          {passwordSuccess && <p className="text-sm text-green-600 dark:text-green-400">{passwordSuccess}</p>}

          <button
            type="submit"
            disabled={savingPassword}
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {savingPassword ? 'Menyimpan...' : 'Ganti Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
