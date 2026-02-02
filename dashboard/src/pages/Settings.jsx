import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Globe,
  ShieldCheck,
  Mail,
  Database,
  Cpu,
  GitBranch,
  Bell,
  Lock,
  ChevronRight,
  Eye,
  EyeOff,
  Save
} from 'lucide-react';
import { authService } from '../services/authService';
import SuccessMessage from '../components/SuccessMessage';
import ErrorDisplay from '../components/ErrorDisplay';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState(''); // Added error state

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await authService.updatePassword(currentPassword, newPassword, confirmPassword);
      setSuccess('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <SuccessMessage
        isOpen={!!success}
        onClose={() => setSuccess('')}
        title="Security Update"
        message={success}
      />

      <ErrorDisplay
        error={error}
        onClose={() => setError('')}
      />

      <header>
        <h1 className="text-[1.8rem] font-bold text-text-main tracking-tight">System Configuration</h1>
        <p className="text-text-dim text-sm mt-2">Tailor the dashboard environment and store algorithms.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 flex flex-col gap-2">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center justify-between px-5 py-3.5 rounded-xl border font-bold text-sm text-left transition-all ${activeTab === 'general' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-transparent text-text-dim border-transparent hover:bg-white/5'}`}
          >
            <div className="flex items-center gap-3">
              <Globe size={18} />
              General
            </div>
            <ChevronRight size={16} />
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center justify-between px-5 py-3.5 rounded-xl border font-bold text-sm text-left transition-all ${activeTab === 'security' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-transparent text-text-dim border-transparent hover:bg-white/5'}`}
          >
            <div className="flex items-center gap-3">
              <ShieldCheck size={18} />
              Security
            </div>
            <ChevronRight size={16} />
          </button>

          <button className="flex items-center justify-between px-5 py-3.5 rounded-xl text-text-dim border border-transparent hover:bg-white/5 font-semibold text-sm text-left transition-all">
            <div className="flex items-center gap-3">
              <Lock size={18} />
              Privacy
            </div>
            <ChevronRight size={16} />
          </button>
        </aside>

        <main className="lg:col-span-3 flex flex-col gap-8">
          {activeTab === 'general' && (
            <>
              <section className="glass-card flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-3 border-b border-border pb-4">
                  <SettingsIcon size={20} className="text-primary" />
                  <h3 className="font-bold text-text-main">Store Identity</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Luxury Brand Name</label>
                    <input
                      type="text"
                      defaultValue="VELORA"
                      className="bg-dark-hover border border-border px-4 py-3 rounded-lg text-text-main focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Concierge Support Email</label>
                    <input
                      type="email"
                      defaultValue="concierge@velora.com"
                      className="bg-dark-hover border border-border px-4 py-3 rounded-lg text-text-main focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Primary Currency</label>
                    <select className="bg-dark-hover border border-border px-4 py-3 rounded-lg text-text-main focus:outline-none focus:border-primary/50 transition-colors appearance-none cursor-pointer">
                      <option>USD - United States Dollar</option>
                      <option>EUR - Euro</option>
                      <option>GBP - British Pound</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <button className="primary-btn !py-2.5">Save Changes</button>
                </div>
              </section>

              <section className="glass-card flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-3 border-b border-border pb-4">
                  <Cpu size={20} className="text-primary" />
                  <h3 className="font-bold text-text-main">Infrastructure Meta</h3>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center py-2 px-4 bg-white/2 rounded-lg border border-white/5">
                    <div className="flex items-center gap-3">
                      <Database size={16} className="text-text-muted" />
                      <span className="text-sm font-medium text-text-dim">API Gateway</span>
                    </div>
                    <span className="text-sm font-mono text-primary font-bold">https://api.velora.internal</span>
                  </div>

                  <div className="flex justify-between items-center py-2 px-4 bg-white/2 rounded-lg border border-white/5">
                    <div className="flex items-center gap-3">
                      <GitBranch size={16} className="text-text-muted" />
                      <span className="text-sm font-medium text-text-dim">Environment</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">PRODUCTION</span>
                  </div>

                  <div className="flex justify-between items-center py-2 px-4 bg-white/2 rounded-lg border border-white/5">
                    <div className="flex items-center gap-3 text-text-dim">
                      <span className="text-xs font-semibold">Engine Version</span>
                    </div>
                    <span className="text-xs font-mono text-text-muted">v2.4.8-luxury-stable</span>
                  </div>
                </div>
              </section>
            </>
          )}

          {activeTab === 'security' && (
            <section className="glass-card flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <Lock size={20} className="text-primary" />
                <h3 className="font-bold text-text-main">Security Credentials</h3>
              </div>

              <form onSubmit={handlePasswordUpdate} className="flex flex-col gap-6 max-w-xl">
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full bg-dark-hover border border-border px-4 py-3 rounded-xl text-text-main focus:outline-none focus:border-primary/50 transition-colors"
                        placeholder="Enter current password..."
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider">New Password</label>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={8}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-dark-hover border border-border px-4 py-3 rounded-xl text-text-main focus:outline-none focus:border-primary/50 transition-colors"
                        placeholder="Min 8 chars..."
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Confirm Password</label>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={8}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-dark-hover border border-border px-4 py-3 rounded-xl text-text-main focus:outline-none focus:border-primary/50 transition-colors"
                        placeholder="Re-enter to confirm..."
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-start pt-2">
                  <button
                    disabled={loading}
                    type="submit"
                    className="flex items-center gap-2 px-6 py-3 bg-[#7C4DFF] hover:bg-[#6C3DFF] text-white rounded-xl shadow-lg shadow-[#7C4DFF]/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Save size={18} />
                    )}
                    <span className="text-xs font-bold tracking-widest uppercase">Update Password</span>
                  </button>
                </div>
              </form>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default Settings;
