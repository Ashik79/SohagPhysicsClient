import React, { useContext, useState } from 'react'
import { AuthContext } from '../Provider';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiArrowRight, FiActivity } from 'react-icons/fi';

function Login() {
  const { login, notifyFailed, notifySuccess } = useContext(AuthContext);

  const [nevi, setnevi] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignIn = (e) => {
    setLoading(true);
    e.preventDefault();
    const email = e.target.email.value;
    const pass = e.target.pass.value;

    login(email, pass)
      .then(() => {
        setLoading(false);
        setnevi(true);
        notifySuccess("Authentication Successful!");
      })
      .catch((error) => {
        console.error(error);
        notifyFailed("Access Denied! Invalid Credentials.");
        setLoading(false);
      });
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  }

  if (nevi) {
    return <Navigate to="/" />
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden bg-[#f8fafc]">
      {/* Mesh Background Spheres */}
      <div className="mesh-bg">
        <div className="mesh-sphere w-[600px] h-[600px] bg-indigo-400/30 -top-20 -left-20" style={{ animationDelay: '0s' }}></div>
        <div className="mesh-sphere w-[500px] h-[500px] bg-sky-400/30 top-1/2 -right-20" style={{ animationDelay: '2s' }}></div>
        <div className="mesh-sphere w-[400px] h-[400px] bg-purple-400/30 bottom-10 left-1/3" style={{ animationDelay: '4s' }}></div>
        <div className="mesh-sphere w-[300px] h-[300px] bg-pink-400/20 top-1/4 right-1/4" style={{ animationDelay: '6s' }}></div>
      </div>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        {/* Left Branding Section */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="lg:col-span-7 space-y-8 text-center lg:text-left"
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/60 backdrop-blur-md rounded-full border border-white/50 shadow-sm mb-4">
            <FiActivity className="text-indigo-600 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-600">Secure Physics Portal v4.0</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
            Elevate Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
              Physics Experience
            </span>
          </h1>

          <p className="text-slate-600 text-lg lg:text-xl font-medium max-w-lg leading-relaxed">
            Manage your academic journey with the most advanced physics management system. Precision, performance, and excellence.
          </p>

          <div className="flex flex-wrap gap-6 justify-center lg:justify-start items-center pt-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-slate-200 overflow-hidden shadow-lg transition-transform hover:scale-110 hover:z-20 cursor-pointer">
                  <img src={`https://i.pravatar.cc/100?img=${i + 20}`} alt="Expert" />
                </div>
              ))}
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800">50+ Expert Instructors</p>
              <p className="text-sm font-medium text-slate-400">Trusted by the best in the field</p>
            </div>
          </div>
        </motion.div>

        {/* Right Login Card Section */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="lg:col-span-5"
        >
          <div className="glass-panel p-8 lg:p-12 rounded-[2.5rem] relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem] pointer-events-none"></div>

            <div className="mb-10 text-center">
              <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6 transform group-hover:rotate-6 transition-transform duration-500">
                <img className='w-14' src={`/logo.png`} alt="Logo" />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Staff Login</h2>
              <p className="text-slate-500 font-semibold mt-2">Access your professional workspace</p>
            </div>

            <form onSubmit={handleSignIn} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Official ID / Email</label>
                <div className="relative group">
                  <FiMail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    type="email"
                    name='email'
                    onKeyPress={handleKeyPress}
                    className="input-premium pl-14"
                    placeholder="name@sohagphysics.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Security Key</label>
                <div className="relative group">
                  <FiLock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    type="password"
                    name='pass'
                    onKeyPress={handleKeyPress}
                    className="input-premium pl-14"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded-md border-2 border-slate-200 text-indigo-600 focus:ring-indigo-500 transition-all" />
                  <span className="text-xs font-bold text-slate-500 group-hover:text-slate-700">Remember Me</span>
                </label>
                <a href="#" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">Recover Access?</a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-premium py-5 rounded-2xl flex items-center justify-center gap-3"
              >
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div
                      key="loader"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <span className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span className="font-bold tracking-wide">Syncing...</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="text"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2"
                    >
                      <span className="font-extrabold tracking-wide uppercase text-sm">Unlock Dashboard</span>
                      <FiArrowRight className="text-xl group-hover:translate-x-1 transition-transform" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-slate-200/50 flex flex-col items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">System Version 5.0.0 • Fully Encrypted</span>
              </div>
              <p className="text-[10px] text-slate-300 font-medium italic">Managed by Sohag Physics Tech Team</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Login;
