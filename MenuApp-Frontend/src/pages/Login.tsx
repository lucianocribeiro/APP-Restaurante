import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Utensils, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import api from '../api/axios';
import { useAuthStore } from '../context/authStore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user: userData, token } = response.data;
      login(userData, token);
      navigate(userData.rol === 'mozo' ? '/mozo/dashboard' : '/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Credenciales inválidas. Por favor, reintentá.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080B10] dot-grid flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="animate-hero-glow absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full opacity-60"></div>
        <div className="animate-hero-glow absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full opacity-40" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-up">
        <div className="text-center mb-12">
          <div className="inline-flex p-5 bg-gradient-to-br from-primary/20 to-accent/10 rounded-[2.5rem] mb-8 border border-primary/20 shadow-2xl shadow-primary/10 animate-float relative">
            <Utensils className="text-primary" size={44} strokeWidth={1.5} />
            <Sparkles className="absolute -top-1 -right-1 text-amber-400" size={16} />
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none mb-3">
            Menu<span className="gradient-text">App</span>
          </h1>
          <div className="flex items-center justify-center gap-2 text-gray-500 font-bold text-[10px] uppercase tracking-[0.25em]">
            <ShieldCheck size={14} className="text-blue-500" /> Panel de Administración Premium
          </div>
        </div>

        <div className="glass-dark border border-white/8 p-10 sm:p-12 rounded-[3.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.6)] relative overflow-hidden group">
          {/* Subtle line at top */}
          <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-5 rounded-[1.8rem] text-xs font-bold text-center animate-in shake-in duration-500">
                {error}
              </div>
            )}
            
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Email de Acceso</label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-500 group-focus-within/input:text-primary transition-colors">
                  <Mail size={20} strokeWidth={1.5} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-16 pr-6 py-6 bg-white/5 border border-white/5 rounded-[1.8rem] text-white placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 focus:bg-white/10 transition-all font-semibold text-base"
                  placeholder="admin@menuapp.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Contraseña</label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-500 group-focus-within/input:text-primary transition-colors">
                  <Lock size={20} strokeWidth={1.5} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-16 pr-6 py-6 bg-white/5 border border-white/5 rounded-[1.8rem] text-white placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 focus:bg-white/10 transition-all font-semibold text-base"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full shimmer-btn relative overflow-hidden bg-primary hover:bg-primary-dark text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.25em] shadow-2xl shadow-primary/30 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-4 group/btn mt-4"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>INICIAR SESIÓN <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-12 animate-fade-up" style={{ animationDelay: '400ms' }}>
          <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">
            ¿No podés entrar? <a href="#" className="text-primary hover:text-orange-400 transition-colors font-black">Contactá a Soporte</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
