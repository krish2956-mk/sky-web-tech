import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, Mail, Lock, User, ArrowLeft,
  AlertCircle, Loader2, Wifi, CheckCircle2, XCircle
} from "lucide-react";
import { API_URL } from "../config.js";

const FETCH_TIMEOUT_MS = 90000;

async function fetchWithTimeout(url, options = {}, timeoutMs = FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSlowNetwork, setIsSlowNetwork] = useState(false);
  const [serverStatus, setServerStatus] = useState("checking");
  const navigate = useNavigate();
  const slowTimerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const warmUp = async () => {
      const wakeTimer = setTimeout(() => {
        if (!cancelled) setServerStatus("waking");
      }, 3000);
      try {
        const res = await fetchWithTimeout(`${API_URL}/api/health`, {}, 90000);
        clearTimeout(wakeTimer);
        if (!cancelled) setServerStatus(res.ok ? "online" : "offline");
      } catch {
        clearTimeout(wakeTimer);
        if (!cancelled) setServerStatus("offline");
      }
    };
    warmUp();
    return () => {
      cancelled = true;
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    setIsSlowNetwork(false);
    if (serverStatus !== "online") {
      setIsSlowNetwork(true);
    } else {
      slowTimerRef.current = setTimeout(() => setIsSlowNetwork(true), 5000);
    }
    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : { name: `${formData.firstName} ${formData.lastName}`.trim(), email: formData.email, password: formData.password };
      let res;
      try {
        res = await fetchWithTimeout(`${API_URL}${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (fetchErr) {
        if (fetchErr.name === "AbortError") {
          throw new Error("Request timed out. The server is still starting up — please try again.");
        }
        throw new Error("Cannot reach the server. It may be starting up (takes ~30 seconds on first use). Please wait and try again.");
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong. Please try again.");
      localStorage.setItem("token", data.token);
      localStorage.setItem("userRole", data.user.role);
      localStorage.setItem("userName", data.user.name);
      localStorage.setItem("userId", data.user.id);
      setServerStatus("online");
      if (data.user.role === "Admin") navigate("/admin");
      else navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
      setIsLoading(false);
      setIsSlowNetwork(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setFormData({ firstName: "", lastName: "", email: "", password: "" });
  };

  const statusBadge = {
    checking: { icon: <Loader2 className="w-3 h-3 animate-spin" />, label: "Connecting to server...", color: "text-white/50" },
    waking:   { icon: <Wifi className="w-3 h-3 animate-pulse" />,   label: "Waking up server (~30s)...", color: "text-orange-300" },
    online:   { icon: <CheckCircle2 className="w-3 h-3" />,         label: "Server online",      color: "text-green-400" },
    offline:  { icon: <XCircle className="w-3 h-3" />,              label: "Server unreachable — refresh page", color: "text-red-400" },
  }[serverStatus];

  const isFormDisabled = isLoading || serverStatus === "offline";

  return (
    <div
      className="relative w-full min-h-screen flex items-center justify-center font-sans selection:bg-orange-500 selection:text-white overflow-hidden"
      style={{ background: "radial-gradient(circle at 15% 20%, #ffffff 0%, #ea580c 45%, #121217 85%)" }}
    >
      <div className="absolute inset-0 z-0" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(24px)" }} />
      <button
        id="back-to-home-btn"
        onClick={() => navigate("/")}
        className="absolute top-8 left-8 z-20 flex items-center gap-2 text-white/70 hover:text-white transition-colors group"
      >
        <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </div>
        <span className="font-medium text-sm">Back to Home</span>
      </button>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-10 shadow-2xl">
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white font-bold text-xl mb-4 shadow-lg border border-white/10">S</div>
            <h2 className="text-2xl font-bold text-white tracking-tight drop-shadow-sm text-center">
              {isLogin ? "Welcome Back" : "Create an Account"}
            </h2>
            <p className="text-white/60 text-sm mt-1 text-center">
              {isLogin ? "Enter your credentials to access the client portal." : "Join us to start building something amazing."}
            </p>
            <div className={`flex items-center gap-1.5 mt-3 text-[11px] font-medium ${statusBadge.color}`}>
              {statusBadge.icon}
              <span>{statusBadge.label}</span>
            </div>
          </div>
          <AnimatePresence>
            {serverStatus === "waking" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="bg-orange-500/15 border border-orange-400/40 text-orange-200 text-sm p-3 rounded-xl mb-4 flex items-start gap-2">
                <Wifi className="w-4 h-4 mt-0.5 flex-shrink-0 animate-pulse" />
                <span>The server is starting up. This takes ~30 seconds on first visit. You can fill the form while you wait.</span>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {isSlowNetwork && serverStatus !== "offline" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="bg-orange-500/15 border border-orange-400/40 text-orange-200 text-sm p-3 rounded-xl mb-4 flex items-start gap-2">
                <Wifi className="w-4 h-4 mt-0.5 flex-shrink-0 animate-pulse" />
                <span>Waiting for server to respond. Please hold on...</span>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/20 border border-red-500/50 text-red-200 text-sm p-3 rounded-xl mb-4 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.form
              key={isLogin ? "login" : "signup"}
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
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-4 w-4 text-white/40" /></div>
                      <input id="signup-first-name" type="text" required autoComplete="given-name" disabled={isFormDisabled}
                        value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-orange-400 focus:bg-black/50 transition-all shadow-inner disabled:opacity-50"
                        placeholder="John" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-white/70 uppercase tracking-wider pl-1">Last Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-4 w-4 text-white/40" /></div>
                      <input id="signup-last-name" type="text" required autoComplete="family-name" disabled={isFormDisabled}
                        value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-orange-400 focus:bg-black/50 transition-all shadow-inner disabled:opacity-50"
                        placeholder="Doe" />
                    </div>
                  </div>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-white/70 uppercase tracking-wider pl-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-4 w-4 text-white/40" /></div>
                  <input id={isLogin ? "login-email" : "signup-email"} type="email" required autoComplete="email" disabled={isFormDisabled}
                    value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-orange-400 focus:bg-black/50 transition-all shadow-inner disabled:opacity-50"
                    placeholder="john@company.com" />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between pl-1">
                  <label className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Password</label>
                  {isLogin && <a href="#" className="text-[10px] font-bold text-orange-400 hover:text-orange-300 transition-colors">Forgot?</a>}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-4 w-4 text-white/40" /></div>
                  <input id={isLogin ? "login-password" : "signup-password"} type="password" required minLength={6}
                    autoComplete={isLogin ? "current-password" : "new-password"} disabled={isFormDisabled}
                    value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-orange-400 focus:bg-black/50 transition-all shadow-inner disabled:opacity-50"
                    placeholder="••••••••" />
                </div>
              </div>
              <button
                id={isLogin ? "login-submit-btn" : "signup-submit-btn"}
                type="submit"
                disabled={isFormDisabled}
                className="w-full text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-all shadow-lg mt-6 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #ea580c, #f97316)" }}
                onMouseEnter={e => !isFormDisabled && (e.currentTarget.style.boxShadow = "0 8px 25px rgba(234,88,12,0.5)")}
                onMouseLeave={e => !isFormDisabled && (e.currentTarget.style.boxShadow = "0 4px 15px rgba(234,88,12,0.3)")}
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />{isSlowNetwork ? "Waking up server..." : "Processing..."}</>
                ) : (
                  <>{isLogin ? "Sign In" : "Create Account"}<ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </motion.form>
          </AnimatePresence>
          <div className="mt-8 text-center">
            <p className="text-white/60 text-sm">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button id="toggle-auth-mode-btn" onClick={switchMode} disabled={isLoading}
                className="text-orange-400 font-bold hover:text-orange-300 transition-colors disabled:opacity-50">
                {isLogin ? "Sign up here" : "Log in here"}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
