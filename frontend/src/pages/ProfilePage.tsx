import { useState, FormEvent, useRef, useEffect } from 'react';
import { User, Lock, Bell, Palette } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Avatar } from '../components/Avatar';
import { notificationPrefsApi, NotificationPrefs } from '../api/notificationPreferences';
import { playNotificationSound } from '../utils/notificationSound';

type SettingsTab = 'profile' | 'security' | 'notifications' | 'appearance';

const roleBadgeColor: Record<string, string> = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  ADMIN: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  AGENT: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  CUSTOMER: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
};

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState<SettingsTab>('profile');

  const navItems: { key: SettingsTab; label: string; icon: any }[] = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'security', label: 'Security', icon: Lock },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Kelola profil dan preferensi akun kamu.</p>
      </div>

      {/* Ringkasan profil singkat di atas, selalu terlihat */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5 flex items-center gap-4">
        <Avatar name={user?.name || ''} avatarUrl={user?.avatarUrl} size={56} />
        <div>
          <p className="text-base font-semibold text-slate-800 dark:text-slate-100">{user?.name}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
          {user?.role && (
            <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${roleBadgeColor[user.role]}`}>
              {user.role.replace('_', ' ')}
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar navigasi settings */}
        <nav className="w-48 shrink-0 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = tab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-left transition-colors ${
                  active
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Icon size={16} strokeWidth={1.75} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Konten section aktif */}
        <div className="flex-1 min-w-0 space-y-4">
          {tab === 'profile' && <ProfileSection />}
          {tab === 'security' && <SecuritySection />}
          {tab === 'notifications' && <NotificationsSection />}
          {tab === 'appearance' && <AppearanceSection />}
        </div>
      </div>
    </div>
  );
}

// ---------- Section: Profile (foto + nama/email/HP) ----------
function ProfileSection() {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <>
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
    </>
  );
}

// ---------- Section: Security (ganti password) ----------
function SecuritySection() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

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
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5 max-w-md">
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
  );
}

// ---------- Section: Notifications ----------
function NotificationsSection() {
  const { user } = useAuth();
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
        playNotificationSound();
      }
      setTimeout(() => setPrefsSuccess(''), 1500);
    } finally {
      setSavingPrefs(false);
    }
  }

  if (!prefs) return <p className="text-sm text-slate-400 dark:text-slate-500">Memuat...</p>;

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5 max-w-md">
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
  );
}

// ---------- Section: Appearance (dark mode) ----------
function AppearanceSection() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5 max-w-md">
      <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Tampilan</h2>
      <label className="flex items-center justify-between cursor-pointer">
        <div>
          <p className="text-sm text-slate-700 dark:text-slate-200">Mode Gelap</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">Ganti tema aplikasi jadi lebih nyaman di mata</p>
        </div>
        <input
          type="checkbox"
          checked={theme === 'dark'}
          onChange={toggleTheme}
          className="rounded border-slate-300 dark:border-slate-600"
        />
      </label>
    </div>
  );
}
