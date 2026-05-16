import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const inputStyle = { width:'100%', padding:'11px 14px', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text)', outline:'none', transition:'border-color 0.15s' };
  const labelStyle = { display:'block', fontSize:12, color:'var(--text2)', marginBottom:6, fontWeight:700, letterSpacing:'0.05em', textTransform:'uppercase' };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:20, position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)', backgroundSize:'40px 40px', opacity:0.3 }} />
      <div style={{ position:'absolute', top:'15%', right:'15%', width:280, height:280, background:'var(--green)', borderRadius:'50%', filter:'blur(120px)', opacity:0.05 }} />

      <div className="fade-in" style={{ width:'100%', maxWidth:440, position:'relative', zIndex:1 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:52, height:52, background:'var(--accent)', borderRadius:14, marginBottom:16, boxShadow:'0 0 30px rgba(59,130,246,0.3)' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
          </div>
          <h1 style={{ fontSize:28, fontFamily:'var(--font-heading)', fontWeight:800, letterSpacing:-1, marginBottom:6 }}>Create account</h1>
          <p style={{ color:'var(--text3)', fontSize:13 }}>Join Nexus and start managing your work</p>
        </div>

        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:16, padding:32 }}>
          {error && (
            <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:8, padding:'10px 14px', marginBottom:20, color:'var(--red)', fontSize:13 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input name="name" type="text" value={form.name} onChange={handleChange} required placeholder="Aditya Kumar"
                style={inputStyle} onFocus={e => e.target.style.borderColor='var(--accent)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@example.com"
                style={inputStyle} onFocus={e => e.target.style.borderColor='var(--accent)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} required placeholder="Min. 6 characters"
                style={inputStyle} onFocus={e => e.target.style.borderColor='var(--accent)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
            </div>
            <div>
              <label style={labelStyle}>Confirm Password</label>
              <input name="confirm" type="password" value={form.confirm} onChange={handleChange} required placeholder="Repeat password"
                style={inputStyle} onFocus={e => e.target.style.borderColor='var(--accent)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
            </div>
            <button type="submit" disabled={loading} style={{
              marginTop:4, padding:'12px', background: loading ? 'var(--border)' : 'var(--accent)', color:'white',
              borderRadius:8, fontWeight:700, fontSize:14, transition:'all 0.15s',
              boxShadow: loading ? 'none' : '0 0 20px rgba(59,130,246,0.3)',
              display:'flex', alignItems:'center', justifyContent:'center', gap:8
            }}>
              {loading ? (
                <><div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />Creating account...</>
              ) : 'Create Account →'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:20, color:'var(--text3)', fontSize:13 }}>
            Already have an account? <Link to="/login" style={{ color:'var(--accent2)', fontWeight:700 }}>Sign in</Link>
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
