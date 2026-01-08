import React, { useState } from 'react';
import axios from 'axios';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';

const AuthPage = ({ setUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? 'login' : 'signup';
    try {
      const { data } = await axios.post(`http://localhost:8080/api/v1/auth/${endpoint}`, formData);
      
      if (isLogin) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user); // App.jsx ko update karne ke liye
        window.location.reload(); // Simple refresh to apply auth
      } else {
        alert("Account Created! Now please login.");
        setIsLogin(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] px-4">
      <div className="w-full max-w-md bg-[#0f172a] border border-white/5 p-10 rounded-[2.5rem] shadow-2xl">
        <h2 className="text-4xl font-black text-center text-white mb-2 uppercase tracking-tighter">
          {isLogin ? 'Welcome Back' : 'Join Visionary'}
        </h2>
        <p className="text-slate-500 text-center text-sm mb-10 font-medium">
          {isLogin ? 'Enter your credentials to access the AI engine' : 'Create an account to start generating magic'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="relative">
              <FaUser className="absolute left-4 top-4 text-slate-500" />
              <input 
                type="text" placeholder="Full Name" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-blue-500 transition-all"
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          )}
          <div className="relative">
            <FaEnvelope className="absolute left-4 top-4 text-slate-500" />
            <input 
              type="email" placeholder="Email Address" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-blue-500 transition-all"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div className="relative">
            <FaLock className="absolute left-4 top-4 text-slate-500" />
            <input 
              type="password" placeholder="Password" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-blue-500 transition-all"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase transition-all shadow-xl shadow-blue-500/20">
            {isLogin ? 'Authorize Access' : 'Create Account'}
          </button>
        </form>

        <p className="mt-8 text-center text-slate-400 text-sm">
          {isLogin ? "New to the future?" : "Already a member?"}
          <button onClick={() => setIsLogin(!isLogin)} className="ml-2 text-blue-500 font-bold hover:underline">
            {isLogin ? 'Create Account' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;