import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ label, value, sub, color, icon }) => (
  <div className="fade-in" style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:'20px 22px', position:'relative', overflow:'hidden' }}>
    <div style={{ position:'absolute', top:-20, right:-20, width:80, height:80, background:color, borderRadius:'50%', opacity:0.08 }} />
    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12 }}>
      <div style={{ width:36, height:36, background:`${color}20`, borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', color }}>
        {icon}
      </div>
    </div>
    <div style={{ fontSize:28, fontFamily:'var(--font-heading)', fontWeight:800, color:'var(--text)', lineHeight:1 }}>{value}</div>
    <div style={{ fontSize:12, color:'var(--text3)', marginTop:4 }}>{label}</div>
    {sub && <div style={{ fontSize:11, color, marginTop:6, fontWeight:700 }}>{sub}</div>}
  </div>
);

const PriorityBadge = ({ p }) => {
  const colors = { high:'var(--red)', medium:'var(--yellow)', low:'var(--green)' };
  return <span style={{ fontSize:10, padding:'2px 7px', borderRadius:4, background:`${colors[p]}20`, color:colors[p], fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em' }}>{p}</span>;
};

const StatusBadge = ({ s }) => {
  const map = { 'todo':['var(--text3)','#334155'], 'in-progress':['var(--yellow)','rgba(245,158,11,0.15)'], 'completed':['var(--green)','rgba(16,185,129,0.15)'] };
  const [color, bg] = map[s] || map['todo'];
  return <span style={{ fontSize:10, padding:'2px 8px', borderRadius:4, background:bg, color, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em' }}>{s}</span>;
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stats/overview')
      .then(r => setStats(r.data.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] || 'there';

  if (loading) return (
    <div style={{ padding:40, display:'flex', alignItems:'center', gap:12, color:'var(--text3)' }}>
      <div style={{ width:20, height:20, border:'2px solid var(--border)', borderTopColor:'var(--accent)', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      Loading dashboard...
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const total = stats?.totalTasks || 0;
  const completed = stats?.completedTasks || 0;
  const rate = stats?.completionRate || 0;

  return (
    <div style={{ padding:'32px 36px', maxWidth:1100 }}>
      {/* Header */}
      <div style={{ marginBottom:36 }}>
        <div style={{ fontSize:12, color:'var(--text3)', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6 }}>
          {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}
        </div>
        <h1 style={{ fontSize:32, fontFamily:'var(--font-heading)', fontWeight:800, letterSpacing:-1, color:'var(--text)' }}>
          {greeting}, {firstName} 👋
        </h1>
        <p style={{ color:'var(--text3)', marginTop:6, fontSize:14 }}>
          {total === 0 ? "You're all clear — no tasks yet." : `You have ${stats?.inProgressTasks || 0} task${stats?.inProgressTasks !== 1 ? 's' : ''} in progress.`}
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:16, marginBottom:32 }}>
        <StatCard label="Total Tasks" value={total} color="var(--accent)"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/></svg>} />
        <StatCard label="Completed" value={completed} color="var(--green)" sub={`${rate}% completion rate`}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>} />
        <StatCard label="In Progress" value={stats?.inProgressTasks || 0} color="var(--yellow)"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>} />
        <StatCard label="High Priority" value={stats?.highPriorityTasks || 0} color="var(--red)" sub={stats?.highPriorityTasks > 0 ? 'Needs attention' : 'All clear!'}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"/></svg>} />
      </div>

      {/* Progress + Recent Tasks */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.6fr', gap:20 }}>
        {/* Progress ring */}
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:24 }}>
          <h3 style={{ fontFamily:'var(--font-heading)', fontSize:15, marginBottom:20, color:'var(--text2)' }}>Completion Rate</h3>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="58" fill="none" stroke="var(--border2)" strokeWidth="10"/>
              <circle cx="70" cy="70" r="58" fill="none" stroke="var(--accent)" strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 58}`}
                strokeDashoffset={`${2 * Math.PI * 58 * (1 - rate / 100)}`}
                strokeLinecap="round" transform="rotate(-90 70 70)"
                style={{ transition:'stroke-dashoffset 1s ease' }} />
              <text x="70" y="68" textAnchor="middle" fill="var(--text)" fontSize="26" fontWeight="800" fontFamily="Syne,sans-serif">{rate}%</text>
              <text x="70" y="86" textAnchor="middle" fill="var(--text3)" fontSize="11" fontFamily="Space Mono,monospace">complete</text>
            </svg>
            <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:8 }}>
              {[['Todo', stats?.todoTasks||0, 'var(--text3)'], ['In Progress', stats?.inProgressTasks||0, 'var(--yellow)'], ['Done', completed, 'var(--green)']].map(([label, val, color]) => (
                <div key={label} style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:color, flexShrink:0 }} />
                  <span style={{ fontSize:12, color:'var(--text3)', flex:1 }}>{label}</span>
                  <span style={{ fontSize:13, fontWeight:700, color }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Tasks */}
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:24 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <h3 style={{ fontFamily:'var(--font-heading)', fontSize:15, color:'var(--text2)' }}>Recent Tasks</h3>
            <Link to="/tasks" style={{ fontSize:12, color:'var(--accent2)', fontWeight:700, textDecoration:'none' }}>View all →</Link>
          </div>
          {stats?.recentTasks?.length === 0 ? (
            <div style={{ textAlign:'center', padding:'32px 0', color:'var(--text3)' }}>
              <div style={{ fontSize:32, marginBottom:8 }}>📋</div>
              <p style={{ fontSize:13 }}>No tasks yet.</p>
              <Link to="/tasks" style={{ fontSize:13, color:'var(--accent2)', fontWeight:700 }}>Create your first task →</Link>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {(stats?.recentTasks || []).map(task => (
                <div key={task._id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', borderRadius:8, background:'var(--bg3)', border:'1px solid var(--border)' }}>
                  <div style={{ flex:1, overflow:'hidden' }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'var(--text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{task.title}</div>
                    <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>{new Date(task.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                    <PriorityBadge p={task.priority} />
                    <StatusBadge s={task.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
