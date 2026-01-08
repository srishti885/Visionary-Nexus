import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaWhatsapp, FaTwitter, FaDownload, FaMagic, 
  FaRegCopy, FaSearch, FaUser, FaEnvelope, 
  FaLock, FaSignOutAlt, FaPlus, FaGlobe, FaLock as FaPrivate
} from 'react-icons/fa';

// --- AUTH COMPONENT ---
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
        setUser(data.user);
      } else {
        alert("Account Created! Please Sign In.");
        setIsLogin(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Auth Failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] px-4 font-sans">
      <div className="w-full max-w-md bg-[#0f172a] border border-white/5 p-10 rounded-[2.5rem] shadow-2xl">
        <h2 className="text-4xl font-black text-center text-white mb-2 uppercase tracking-tighter italic">
          {isLogin ? 'Nexus Login' : 'Create Account'}
        </h2>
        <p className="text-slate-500 text-center text-sm mb-10 font-medium">Neural Imaging Access Control</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="relative">
              <FaUser className="absolute left-4 top-4 text-slate-500" />
              <input type="text" placeholder="Full Name" required className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-blue-500 transition-all text-sm" onChange={(e) => setFormData({...formData, name: e.target.value})}/>
            </div>
          )}
          <div className="relative">
            <FaEnvelope className="absolute left-4 top-4 text-slate-500" />
            <input type="email" placeholder="Email" required className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-blue-500 transition-all text-sm" onChange={(e) => setFormData({...formData, email: e.target.value})}/>
          </div>
          <div className="relative">
            <FaLock className="absolute left-4 top-4 text-slate-500" />
            <input type="password" placeholder="Password" required className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-blue-500 transition-all text-sm" onChange={(e) => setFormData({...formData, password: e.target.value})}/>
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase transition-all shadow-xl shadow-blue-500/20">
            {isLogin ? 'Authorize Access' : 'Register User'}
          </button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-6 text-slate-500 text-xs font-bold hover:text-blue-400 transition-colors uppercase tracking-widest">
          {isLogin ? "New User? Create Account" : "Back to Login"}
        </button>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
const App = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [view, setView] = useState('editor'); 
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [galleryItems, setGalleryItems] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [toast, setToast] = useState({ show: false, message: '' });
  const [activeFilter, setActiveFilter] = useState('none');

  const showSuccessToast = (msg) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
  };

  const generateImage = async () => {
    if (!prompt) return;
    setLoading(true);
    setImage(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8080/api/v1/dalle', { prompt }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setImage(response.data.photo);
      showSuccessToast("Asset Synchronized");
    } catch (err) { alert("Session Expired"); handleLogout(); }
    setLoading(false);
  };

  const fetchGlobal = async () => {
    setView('global');
    setLoading(true);
    try {
      const { data } = await axios.get('http://localhost:8080/api/v1/dalle/gallery');
      setGalleryItems(data.data);
    } catch (err) { console.log(err); }
    setLoading(false);
  };

  const fetchPrivate = async () => {
    setView('private');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:8080/api/v1/dalle/my-creations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGalleryItems(data.data);
    } catch (err) { console.log(err); }
    setLoading(false);
  };

  const deleteAsset = async (id) => {
    if (!window.confirm("Purge this neural asset permanently?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/v1/dalle/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGalleryItems(prev => prev.filter(item => item._id !== id));
      showSuccessToast("Asset Deleted");
    } catch (err) { alert("Delete Failed"); }
  };

  const downloadImage = (photoUrl) => {
    const link = document.createElement('a');
    link.href = photoUrl.replace('/upload/', '/upload/fl_attachment/');
    link.setAttribute('download', 'nexus-asset.jpg');
    link.click();
  };

  if (!user) return <AuthPage setUser={setUser} />;

  const filteredResults = galleryItems.filter(i => i.prompt.toLowerCase().includes(searchText.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30">
      {toast.show && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-[10px] tracking-widest uppercase shadow-2xl animate-bounce">
          {toast.message}
        </div>
      )}

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl px-10 py-5 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-black tracking-tighter text-blue-500 uppercase">Visionary Nexus</h1>
          <div className="hidden md:flex gap-6">
            <button onClick={() => setView('editor')} className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${view === 'editor' ? 'text-blue-500' : 'text-slate-500 hover:text-white'}`}>
              <FaPlus /> Synthesis Engine
            </button>
            <button onClick={fetchGlobal} className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${view === 'global' ? 'text-blue-500' : 'text-slate-500 hover:text-white'}`}>
              <FaGlobe /> Public Hub
            </button>
            <button onClick={fetchPrivate} className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${view === 'private' ? 'text-blue-500' : 'text-slate-500 hover:text-white'}`}>
              <FaPrivate /> My Archive
            </button>
          </div>
        </div>
        <button onClick={handleLogout} className="text-slate-500 hover:text-red-500 transition-colors p-2"><FaSignOutAlt /></button>
      </nav>

      <main className="pt-32 pb-20 max-w-7xl mx-auto px-8 relative z-10">
        {view === 'editor' ? (
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10">
              <h2 className="text-6xl font-black leading-none tracking-tighter text-white uppercase italic">Neural <br /> Synthesis <br /> Platform.</h2>
              <div className="bg-[#0f172a] border border-white/5 rounded-3xl p-6 relative">
                <textarea className="w-full bg-transparent outline-none text-sm min-h-[150px] resize-none" placeholder="Input neural prompt..." value={prompt} onChange={(e) => setPrompt(e.target.value)}/>
                <button onClick={() => setPrompt(p => p + ", high definition, cinematic")} className="absolute bottom-5 right-5 text-blue-400 text-[10px] font-black uppercase border border-blue-500/20 px-3 py-1 rounded-lg hover:bg-blue-500 hover:text-white transition-all"><FaMagic /></button>
              </div>
              <button onClick={generateImage} disabled={loading} className="w-full py-5 bg-blue-600 rounded-2xl font-black text-[10px] tracking-widest uppercase shadow-xl shadow-blue-500/20">
                {loading ? "Synthesizing Asset..." : "Generate Neural Asset"}
              </button>
            </div>
            <div className="relative aspect-square bg-[#0f172a] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl flex items-center justify-center">
              {image ? <img src={image} className="w-full h-full object-cover" style={{ filter: activeFilter }} alt="Synthesized Result" /> : <div className="text-[100px] font-black opacity-[0.03]">NEXUS</div>}
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
               <div>
                  <h2 className="text-5xl font-black text-white uppercase tracking-tighter">{view === 'global' ? 'Global Hub' : 'Personal Archive'}</h2>
                  <p className="text-slate-500 text-sm mt-2">{view === 'global' ? 'Collective synthesized imagery' : 'Your private neural repository'}</p>
               </div>
               <div className="bg-[#0f172a] border border-white/5 px-6 py-3 rounded-2xl flex items-center gap-4 w-full md:w-96">
                  <FaSearch className="text-slate-500" />
                  <input type="text" placeholder="Search archive..." className="bg-transparent outline-none text-sm w-full" value={searchText} onChange={(e) => setSearchText(e.target.value)}/>
               </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredResults.map((item) => (
                <div key={item._id} className="group relative rounded-3xl overflow-hidden bg-[#0f172a] border border-white/5 shadow-lg aspect-square">
                  <img src={item.photo} alt={item.prompt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity p-8 flex flex-col justify-end gap-4">
                    <p className="text-xs text-slate-400 italic mb-2">"{item.prompt}"</p>
                    <div className="grid grid-cols-2 gap-2">
                       <button onClick={() => downloadImage(item.photo)} className="py-2.5 bg-white text-black font-black text-[9px] uppercase rounded-xl flex items-center justify-center gap-2"><FaDownload /> Save</button>
                       {view === 'private' ? (
                         <button onClick={() => deleteAsset(item._id)} className="py-2.5 bg-red-600 text-white font-black text-[9px] uppercase rounded-xl flex items-center justify-center gap-2 italic">Delete</button>
                       ) : (
                         <button onClick={() => { navigator.clipboard.writeText(item.prompt); showSuccessToast("Copied"); }} className="py-2.5 bg-white/10 text-white font-black text-[9px] uppercase rounded-xl flex items-center justify-center gap-2 border border-white/10">Copy</button>
                       )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* FOOTER SECTION */}
      <footer className="relative z-10 border-t border-white/5 bg-[#020617]/80 backdrop-blur-xl py-12 mt-20">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <h3 className="text-lg font-black tracking-tighter text-blue-500 uppercase italic">
              Visionary Nexus
            </h3>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">
              Neural Asset Management System
            </p>
          </div>

          <div className="text-center">
            <p className="text-slate-400 text-xs font-medium">
              Designed & Developed by 
              <span className="text-white font-black italic ml-1 text-sm tracking-wide"> Srishti Goenka </span>
            </p>
            <p className="text-slate-600 text-[9px] mt-1 uppercase tracking-widest font-bold">
              © 2026 All Rights Reserved
            </p>
          </div>

          <div className="flex gap-4 items-center">
            <div className="h-8 w-[1px] bg-white/10 hidden md:block"></div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
              Built with MERN Infrastructure
            </p>
          </div>
        </div>
      </footer>
    </div> 
  );
};

export default App;