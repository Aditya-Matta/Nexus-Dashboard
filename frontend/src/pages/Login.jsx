import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:20, position:'relative', overflow:'hidden' }}>
      {/* Background grid */}
      <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)', backgroundSize:'40px 40px', opacity:0.3 }} />
      <div style={{ position:'absolute', top:'20%', left:'10%', width:300, height:300, background:'var(--accent)', borderRadius:'50%', filter:'blur(120px)', opacity:0.06 }} />
      <div style={{ position:'absolute', bottom:'20%', right:'10%', width:250, height:250, background:'var(--purple)', borderRadius:'50%', filter:'blur(100px)', opacity:0.06 }} />

      <div className="fade-in" style={{ width:'100%', maxWidth:420, position:'relative', zIndex:1 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:52, height:52, background:'var(--accent)', borderRadius:14, marginBottom:16, boxShadow:'0 0 30px rgba(59,130,246,0.3)' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
          </div>
          <h1 style={{ fontSize:28, fontFamily:'var(--font-heading)', fontWeight:800, letterSpacing:-1, color:'var(--text)', marginBottom:6 }}>Welcome back</h1>
          <p style={{ color:'var(--text3)', fontSize:13 }}>Sign in to your Nexus dashboard</p>
        </div>

        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:16, padding:32 }}>
          {error && (
            <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:8, padding:'10px 14px', marginBottom:20, color:'var(--red)', fontSize:13 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <div>
              <label style={{ display:'block', fontSize:12, color:'var(--text2)', marginBottom:6, fontWeight:700, letterSpacing:'0.05em', textTransform:'uppercase' }}>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required
                placeholder="you@example.com"
                style={{ width:'100%', padding:'11px 14px', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text)', outline:'none', transition:'border-color 0.15s' }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
            <div>
              <label style={{ display:'block', fontSize:12, color:'var(--text2)', marginBottom:6, fontWeight:700, letterSpacing:'0.05em', textTransform:'uppercase' }}>Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} required
                placeholder="••••••••"
                style={{ width:'100%', padding:'11px 14px', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text)', outline:'none', transition:'border-color 0.15s' }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
            <button type="submit" disabled={loading} style={{
              padding:'12px', background: loading ? 'var(--border)' : 'var(--accent)', color:'white',
              borderRadius:8, fontWeight:700, fontSize:14, transition:'all 0.15s',
              boxShadow: loading ? 'none' : '0 0 20px rgba(59,130,246,0.3)',
              display:'flex', alignItems:'center', justifyContent:'center', gap:8
            }}>
              {loading ? (
                <><div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} /> Signing in...</>
              ) : 'Sign In →'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:20, color:'var(--text3)', fontSize:13 }}>
            No account? <Link to="/register" style={{ color:'var(--accent2)', fontWeight:700 }}>Create one</Link>
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
