import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertCircle, ArrowRight, Lock, Mail, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StatusBanner from '../components/StatusBanner';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await register(name.trim(), email.trim(), password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50/60 text-stone-900">
      <StatusBanner />

      <div className="flex-1 flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-emerald-800 text-white shadow-xs mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900">
            Create Account
          </h1>
        </div>

        <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-6 sm:px-8 border border-stone-200 rounded-lg shadow-xs">
            {error && (
              <div className="mb-5 flex items-start gap-2.5 p-3 text-xs bg-rose-50 text-rose-800 border border-rose-200 rounded-md">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-md bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-md bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-md bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-md bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-transparent rounded-md text-xs font-medium text-white bg-emerald-800 hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-700 shadow-xs transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                  {!loading && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </form>

            <div className="mt-6 pt-5 border-t border-stone-100 text-center">
              <p className="text-xs text-stone-600">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-emerald-800 hover:text-emerald-900 underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
