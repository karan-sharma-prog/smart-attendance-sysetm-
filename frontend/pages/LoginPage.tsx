
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { auth, misc } from '../src/api';
import { toast } from 'react-hot-toast';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data } = await auth.login(email, password);
      localStorage.setItem('omni_token', data.token); // Store JWT

      // Map backend user to frontend User type if needed, 
      // or ensure backend sends compatible structure.
      const user: User = {
        ...data.user,
        // role might need mapping if enum case differs, but backend uses uppercase too
      };

      onLogin(user);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeed = async () => {
    try {
      await misc.seed();
      toast.success("Database seeded with sample data!");
    } catch (err) {
      toast.error("Failed to seed database");
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side: Branding/Visual */}
      <div className="lg:w-1/2 bg-emerald-600 p-12 flex flex-col justify-between text-white hidden lg:flex">
        <div>
          <h1 className="text-4xl font-bold mb-4">OmniPresence</h1>
          <p className="text-xl text-emerald-100 max-w-md">
            The next generation of attendance tracking powered by AI. Seamless, secure, and smart.
          </p>
        </div>

        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-3 rounded-lg backdrop-blur-md">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">Facial Recognition</h3>
              <p className="text-sm text-emerald-100">Zero-touch biometric attendance marking.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-3 rounded-lg backdrop-blur-md">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">Dynamic QR Codes</h3>
              <p className="text-sm text-emerald-100">Anti-spoofing time-restricted QR tracking.</p>
            </div>
          </div>
        </div>

        <div className="text-sm text-emerald-200">
          © 2024 OmniPresence Systems. All rights reserved.
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="max-w-md w-full">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Sign In</h2>
            <p className="text-slate-500">Enter your credentials to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-4 bg-blue-50 text-blue-800 text-sm rounded-lg mb-4 cursor-pointer" onClick={handleSeed}>
              ℹ️ <strong>Dev Mode:</strong> Click here to seed database with demo accounts (password: password123)
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Account Type</label>
              <div className="grid grid-cols-3 gap-3">
                {Object.values(UserRole).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`
                      py-2 px-3 text-xs font-bold rounded-lg transition-all border
                      ${role === r ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}
                    `}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@institution.edu"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 flex justify-between text-sm text-slate-500">
            <span>Admin: admin@edu.com</span>
            <span>Teacher: teacher@edu.com</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
