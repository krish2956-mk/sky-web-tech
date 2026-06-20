import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { API_URL } from '../config.js';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : { name: `${formData.firstName} ${formData.lastName}`.trim(), email: formData.email, password: formData.password };

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      // Save token and role
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.user.role);
      localStorage.setItem('userName', data.user.name);
      localStorage.setItem('userId', data.user.id);

      // Redirect based on role
      if (data.user.role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative w-full min-h-screen flex items-center justify-center font-sans selection:bg-orange-500 selection:text-white overflow-hidden"
      style={{
        background: 'radial-gradient(circle at 15% 20%, #ffffff 0%, #ea580c 45%, #121217 85%)'
      }}
    >
      {/* Dark overlay matching Landing Page internal sections */}
      <div
        className="absolute inset-0 z-0"
        style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(24px)' }}
      />

      {/* Back to Home Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 z-20 flex items-center gap-2 text-white/70 hover:text-white transition-colors group"
      >
        <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </div>
        <span className="font-medium text-sm">Back to Home</span>
      </button>

      {/* Main Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
          
          {/* Logo / Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white font-bold text-xl mb-4 shadow-lg border border-white/10">
              S
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight drop-shadow-sm text-center">
              {isLogin ? 'Welcome Back' : 'Create an Account'}
            </h2>
            <p className="text-white/60 text-sm mt-2 text-center">
              {isLogin 
                ? 'Enter your credentials to access the client portal.' 
                : 'Join us to start building something amazing.'}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-sm p-3 rounded-xl mb-6 text-center">
              {error}
            </div>
          )}

          {/* Forms */}
          <AnimatePresence mode="wait">
            <motion.form
              key={isLogin ? 'login' : 'signup'}
              initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {!isLogin && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-white/70 uppercase tracking-wider pl-1">First Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-white/40" />
                      </div>
                      <input 
                        type="text" 
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-orange-400 focus:bg-black/50 transition-all shadow-inner" 
                        placeholder="John" 
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-white/70 uppercase tracking-wider pl-1">Last Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-white/40" />
                      </div>
                      <input 
                        type="text" 
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-orange-400 focus:bg-black/50 transition-all shadow-inner" 
                        placeholder="Doe" 
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-white/70 uppercase tracking-wider pl-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-white/40" />
                  </div>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-orange-400 focus:bg-black/50 transition-all shadow-inner" 
                    placeholder="john@company.com" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between pl-1">
                  <label className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Password</label>
                  {isLogin && (
                    <a href="#" className="text-[10px] font-bold text-orange-400 hover:text-orange-300 transition-colors">Forgot?</a>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-white/40" />
                  </div>
                  <input 
                    type="password" 
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-orange-400 focus:bg-black/50 transition-all shadow-inner" 
                    placeholder="••••••••" 
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-all shadow-lg mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #ea580c, #f97316)' }}
                onMouseEnter={e => !isLoading && (e.currentTarget.style.boxShadow = '0 8px 25px rgba(234,88,12,0.5)')}
                onMouseLeave={e => !isLoading && (e.currentTarget.style.boxShadow = '0 4px 15px rgba(234,88,12,0.3)')}
              >
                {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')} {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </motion.form>
          </AnimatePresence>

          {/* Toggle Login/Signup */}
          <div className="mt-8 text-center">
            <p className="text-white/60 text-sm">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-orange-400 font-bold hover:text-orange-300 transition-colors"
              >
                {isLogin ? 'Sign up here' : 'Log in here'}
              </button>
            </p>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
