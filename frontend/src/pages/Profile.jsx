import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const [tab, setTab] = useState('profile');
  const [profile, setProfile] = useState({ name: user?.name || '', avatar: user?.avatar || '' });
  const [passwords, setPasswords] = useState({ currentPassword:'', newPassword:'', confirm:'' });
  const [profileMsg, setProfileMsg] = useState(null);
  const [pwMsg, setPwMsg] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPw, setLoadingPw] = useState(false);

  const handleProfileSave = async e => {
    e.preventDefault(); setProfileMsg(null); setLoadingProfile(true);
    try {
      const r = await api.put('/user/profile', { name: profile.name, avatar: profile.avatar });
      updateUser(r.data.user);
      setProfileMsg({ type:'success', text:'Profile updated successfully.' });
    } catch(err) { setProfileMsg({ type:'error', text: err.response?.data?.error || 'Update failed.' }); }
    finally { setLoadingProfile(false); }
  };

  const handlePasswordSave = async e => {
    e.preventDefault(); setPwMsg(null);
    if (passwords.newPassword !== passwords.confirm) return setPwMsg({ type:'error', text:'Passwords do not match.' });
    setLoadingPw(true);
    try {
      await api.put('/user/password', { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      setPwMsg({ type:'success', text:'Password changed. Please log in again.' });
      setPasswords({ currentPassword:'', newPassword:'', confirm:'' });
      setTimeout(() => logout(), 2500);
    } catch(err) { setPwMsg({ type:'error', text: err.response?.data?.error || 'Password change failed.' }); }
    finally { setLoadingPw(false); }
  };

  const initials = user?.name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) || 'U';
  const iStyle = { width:'100%', padding:'11px 14px', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text)', outline:'none', fontSize:13, transition:'border-color 0.15s' };
  const lStyle = { display:'block', fontSize:11, color:'var(--text2)', marginBottom:6, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em' };
  const tabStyle = (active) => ({ padding:'8px 18px', borderRadius:8, border:'none', fontFamily:'var(--font-mono)', fontSize:13, fontWeight:700, cursor:'pointer', transition:'all 0.15s', background: active ? 'var(--accent)' : 'var(--bg3)', color: active ? 'white' : 'var(--text3)' });

  return (
    <div style={{ padding:'32px 36px', maxWidth:640 }}>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:28, fontFamily:'var(--font-heading)', fontWeight:800, letterSpacing:-1 }}>Profile</h1>
        <p style={{ color:'var(--text3)', fontSize:13, marginTop:4 }}>Manage your account settings</p>
      </div>

      {/* Avatar card */}
      <div className="fade-in" style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:24, marginBottom:20, display:'flex', alignItems:'center', gap:20 }}>
        <div style={{ width:64, height:64, borderRadius:'50%', background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:800, color:'white', flexShrink:0, boxShadow:'0 0 24px rgba(59,130,246,0.3)' }}>
          {user?.avatar ? <img src={user.avatar} alt="avatar" style={{ width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover' }} /> : initials}
        </div>
        <div>
          <div style={{ fontFamily:'var(--font-heading)', fontWeight:800, fontSize:20 }}>{user?.name}</div>
          <div style={{ color:'var(--text3)', fontSize:13, marginTop:2 }}>{user?.email}</div>
          <div style={{ display:'flex', gap:8, marginTop:8 }}>
            <span style={{ fontSize:11, padding:'3px 8px', borderRadius:6, background:'var(--accent-glow)', border:'1px solid rgba(59,130,246,0.3)', color:'var(--accent2)', fontWeight:700, textTransform:'uppercase' }}>{user?.role}</span>
            <span style={{ fontSize:11, padding:'3px 8px', borderRadius:6, background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', color:'var(--green)', fontWeight:700 }}>Active</span>
          </div>
        </div>
        <div style={{ marginLeft:'auto', textAlign:'right' }}>
          <div style={{ fontSize:11, color:'var(--text3)' }}>Member since</div>
          <div style={{ fontSize:13, color:'var(--text2)', fontWeight:700, marginTop:2 }}>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US',{month:'short',year:'numeric'}) : '—'}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:20 }}>
        <button style={tabStyle(tab==='profile')} onClick={()=>setTab('profile')}>Edit Profile</button>
        <button style={tabStyle(tab==='password')} onClick={()=>setTab('password')}>Change Password</button>
      </div>

      {/* Profile form */}
      {tab === 'profile' && (
        <div className="fade-in" style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:28 }}>
          {profileMsg && (
            <div style={{ padding:'10px 14px', borderRadius:8, marginBottom:18, fontSize:13, background: profileMsg.type==='success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border:`1px solid ${profileMsg.type==='success'?'rgba(16,185,129,0.3)':'rgba(239,68,68,0.3)'}`, color: profileMsg.type==='success'?'var(--green)':'var(--red)' }}>
              {profileMsg.text}
            </div>
          )}
          <form onSubmit={handleProfileSave} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div>
              <label style={lStyle}>Full Name</label>
              <input style={iStyle} value={profile.name} onChange={e=>setProfile(p=>({...p,name:e.target.value}))} required onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border)'} />
            </div>
            <div>
              <label style={lStyle}>Email</label>
              <input style={{...iStyle, opacity:0.5, cursor:'not-allowed'}} value={user?.email || ''} disabled />
              <p style={{ fontSize:11, color:'var(--text3)', marginTop:4 }}>Email cannot be changed.</p>
            </div>
            <div>
              <label style={lStyle}>Avatar URL (optional)</label>
              <input style={iStyle} value={profile.avatar} onChange={e=>setProfile(p=>({...p,avatar:e.target.value}))} placeholder="https://..." onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border)'} />
            </div>
            <button type="submit" disabled={loadingProfile} style={{ padding:'11px', background:loadingProfile?'var(--border)':'var(--accent)', color:'white', borderRadius:8, fontWeight:700, fontSize:13, display:'flex', alignItems:'center', justifyContent:'center', gap:8, alignSelf:'flex-start', minWidth:160 }}>
              {loadingProfile?<><div style={{width:14,height:14,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'white',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>Saving...</>:'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Password form */}
      {tab === 'password' && (
        <div className="fade-in" style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:28 }}>
          {pwMsg && (
            <div style={{ padding:'10px 14px', borderRadius:8, marginBottom:18, fontSize:13, background: pwMsg.type==='success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border:`1px solid ${pwMsg.type==='success'?'rgba(16,185,129,0.3)':'rgba(239,68,68,0.3)'}`, color: pwMsg.type==='success'?'var(--green)':'var(--red)' }}>
              {pwMsg.text}
            </div>
          )}
          <form onSubmit={handlePasswordSave} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div><label style={lStyle}>Current Password</label><input type="password" style={iStyle} value={passwords.currentPassword} onChange={e=>setPasswords(p=>({...p,currentPassword:e.target.value}))} required onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/></div>
            <div><label style={lStyle}>New Password</label><input type="password" style={iStyle} value={passwords.newPassword} onChange={e=>setPasswords(p=>({...p,newPassword:e.target.value}))} required minLength={6} onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/></div>
            <div><label style={lStyle}>Confirm New Password</label><input type="password" style={iStyle} value={passwords.confirm} onChange={e=>setPasswords(p=>({...p,confirm:e.target.value}))} required onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/></div>
            <button type="submit" disabled={loadingPw} style={{ padding:'11px', background:loadingPw?'var(--border)':'var(--accent)', color:'white', borderRadius:8, fontWeight:700, fontSize:13, display:'flex', alignItems:'center', justifyContent:'center', gap:8, alignSelf:'flex-start', minWidth:180 }}>
              {loadingPw?<><div style={{width:14,height:14,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'white',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>Changing...</>:'Update Password'}
            </button>
          </form>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
