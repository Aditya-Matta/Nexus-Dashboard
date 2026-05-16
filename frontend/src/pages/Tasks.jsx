import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const PRIORITIES = ['low','medium','high'];
const STATUSES = ['todo','in-progress','completed'];
const PRIORITY_COLORS = { low:'var(--green)', medium:'var(--yellow)', high:'var(--red)' };
const STATUS_COLORS = { 'todo':'var(--text3)', 'in-progress':'var(--yellow)', 'completed':'var(--green)' };

function TaskModal({ task, onClose, onSave }) {
  const [form, setForm] = useState(task || { title:'', description:'', status:'todo', priority:'medium', dueDate:'', tags:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const payload = { ...form, tags: form.tags ? form.tags.split(',').map(t=>t.trim()).filter(Boolean) : [] };
      if (task) { const r = await api.put(`/tasks/${task._id}`, payload); onSave(r.data.task, false); }
      else { const r = await api.post('/tasks', payload); onSave(r.data.task, true); }
      onClose();
    } catch(err) { setError(err.response?.data?.error || 'Failed to save task.'); }
    finally { setLoading(false); }
  };

  const iStyle = { width:'100%', padding:'10px 12px', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text)', outline:'none', fontSize:13 };
  const lStyle = { display:'block', fontSize:11, color:'var(--text2)', marginBottom:5, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em' };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }} onClick={onClose}>
      <div className="fade-in" style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:16, padding:28, width:'100%', maxWidth:500 }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
          <h2 style={{ fontFamily:'var(--font-heading)', fontSize:20, fontWeight:800 }}>{task ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, width:32, height:32, color:'var(--text3)', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
        </div>
        {error && <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:8, padding:'8px 12px', marginBottom:16, color:'var(--red)', fontSize:12 }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div><label style={lStyle}>Title *</label><input style={iStyle} value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} required maxLength={100} placeholder="Task title..." onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/></div>
          <div><label style={lStyle}>Description</label><textarea style={{...iStyle,height:80,resize:'vertical'}} value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} placeholder="Optional description..." maxLength={500} onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div><label style={lStyle}>Status</label>
              <select style={iStyle} value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))}>
                {STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
              </select></div>
            <div><label style={lStyle}>Priority</label>
              <select style={iStyle} value={form.priority} onChange={e=>setForm(p=>({...p,priority:e.target.value}))}>
                {PRIORITIES.map(p=><option key={p} value={p}>{p}</option>)}
              </select></div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div><label style={lStyle}>Due Date</label><input type="date" style={iStyle} value={form.dueDate?.slice?.(0,10)||''} onChange={e=>setForm(p=>({...p,dueDate:e.target.value}))} onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/></div>
            <div><label style={lStyle}>Tags (comma-sep)</label><input style={iStyle} value={typeof form.tags==='string'?form.tags:(form.tags||[]).join(', ')} onChange={e=>setForm(p=>({...p,tags:e.target.value}))} placeholder="work, urgent" onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/></div>
          </div>
          <div style={{ display:'flex', gap:10, marginTop:4 }}>
            <button type="button" onClick={onClose} style={{ flex:1, padding:'10px', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text2)', fontSize:13 }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ flex:2, padding:'10px', background:loading?'var(--border)':'var(--accent)', color:'white', borderRadius:8, fontSize:13, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              {loading?<><div style={{width:14,height:14,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'white',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>Saving...</>:(task?'Save Changes':'Create Task')}
            </button>
          </div>
        </form>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'new' | task object
  const [filter, setFilter] = useState({ status:'', priority:'' });
  const [deleting, setDeleting] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.priority) params.append('priority', filter.priority);
      const r = await api.get(`/tasks?${params}&limit=50&sort=-createdAt`);
      setTasks(r.data.tasks);
    } catch(e){ console.error(e); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleSave = (task, isNew) => {
    if (isNew) setTasks(p => [task, ...p]);
    else setTasks(p => p.map(t => t._id === task._id ? task : t));
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(p => p.filter(t => t._id !== id));
    } catch(e){ alert('Failed to delete task.'); }
    finally { setDeleting(null); }
  };

  const handleStatusToggle = async (task) => {
    const next = task.status === 'completed' ? 'todo' : task.status === 'todo' ? 'in-progress' : 'completed';
    try {
      const r = await api.put(`/tasks/${task._id}`, { status: next });
      setTasks(p => p.map(t => t._id === task._id ? r.data.task : t));
    } catch(e){ console.error(e); }
  };

  const grouped = STATUSES.reduce((acc, s) => {
    acc[s] = tasks.filter(t => t.status === s);
    return acc;
  }, {});

  const colLabels = { 'todo':'To Do', 'in-progress':'In Progress', 'completed':'Done' };

  return (
    <div style={{ padding:'32px 36px' }}>
      {modal && <TaskModal task={modal === 'new' ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />}

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:28, flexWrap:'wrap', gap:16 }}>
        <div>
          <h1 style={{ fontSize:28, fontFamily:'var(--font-heading)', fontWeight:800, letterSpacing:-1 }}>Tasks</h1>
          <p style={{ color:'var(--text3)', fontSize:13, marginTop:4 }}>{tasks.length} task{tasks.length !== 1 ? 's' : ''} total</p>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
          <select value={filter.status} onChange={e=>setFilter(p=>({...p,status:e.target.value}))}
            style={{ padding:'8px 12px', background:'var(--card)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text2)', fontSize:12, outline:'none' }}>
            <option value="">All Status</option>
            {STATUSES.map(s=><option key={s} value={s}>{colLabels[s]}</option>)}
          </select>
          <select value={filter.priority} onChange={e=>setFilter(p=>({...p,priority:e.target.value}))}
            style={{ padding:'8px 12px', background:'var(--card)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text2)', fontSize:12, outline:'none' }}>
            <option value="">All Priority</option>
            {PRIORITIES.map(p=><option key={p} value={p}>{p}</option>)}
          </select>
          <button onClick={() => setModal('new')} style={{ padding:'9px 18px', background:'var(--accent)', color:'white', borderRadius:8, fontWeight:700, fontSize:13, display:'flex', alignItems:'center', gap:6, boxShadow:'0 0 16px rgba(59,130,246,0.3)' }}>
            <span style={{ fontSize:18, lineHeight:1 }}>+</span> New Task
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display:'flex', alignItems:'center', gap:12, color:'var(--text3)', padding:20 }}>
          <div style={{ width:18, height:18, border:'2px solid var(--border)', borderTopColor:'var(--accent)', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
          Loading tasks...
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : (
        /* Kanban columns */
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16, alignItems:'start' }}>
          {STATUSES.map(status => (
            <div key={status} style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
              {/* Column header */}
              <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:STATUS_COLORS[status] }} />
                  <span style={{ fontFamily:'var(--font-heading)', fontWeight:700, fontSize:14, color:'var(--text2)' }}>{colLabels[status]}</span>
                </div>
                <span style={{ fontSize:11, background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:6, padding:'2px 8px', color:'var(--text3)', fontWeight:700 }}>{grouped[status].length}</span>
              </div>
              {/* Cards */}
              <div style={{ padding:'10px', display:'flex', flexDirection:'column', gap:8, minHeight:80 }}>
                {grouped[status].length === 0 && (
                  <div style={{ textAlign:'center', padding:'24px 12px', color:'var(--text3)', fontSize:12 }}>No tasks here</div>
                )}
                {grouped[status].map(task => (
                  <div key={task._id} className="slide-in" style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:10, padding:'14px', transition:'border-color 0.15s', position:'relative' }}
                    onMouseEnter={e=>e.currentTarget.style.borderColor='var(--border2)'}
                    onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8, marginBottom:8 }}>
                      <span style={{ fontSize:13, fontWeight:600, color:'var(--text)', lineHeight:1.4, flex:1 }}>{task.title}</span>
                      <span style={{ fontSize:10, padding:'2px 7px', borderRadius:4, background:`${PRIORITY_COLORS[task.priority]}20`, color:PRIORITY_COLORS[task.priority], fontWeight:700, textTransform:'uppercase', flexShrink:0 }}>{task.priority}</span>
                    </div>
                    {task.description && <p style={{ fontSize:12, color:'var(--text3)', marginBottom:10, lineHeight:1.5 }}>{task.description.slice(0,80)}{task.description.length>80?'…':''}</p>}
                    {task.tags?.length > 0 && (
                      <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:10 }}>
                        {task.tags.slice(0,3).map(tag=><span key={tag} style={{ fontSize:10, padding:'1px 6px', borderRadius:4, background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--text3)' }}>#{tag}</span>)}
                      </div>
                    )}
                    {task.dueDate && (
                      <div style={{ fontSize:11, color: new Date(task.dueDate) < new Date() && task.status !== 'completed' ? 'var(--red)' : 'var(--text3)', marginBottom:10, display:'flex', alignItems:'center', gap:4 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                        {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                    <div style={{ display:'flex', gap:6, borderTop:'1px solid var(--border)', paddingTop:10 }}>
                      <button onClick={()=>handleStatusToggle(task)} title="Cycle status" style={{ flex:1, padding:'5px', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:6, color:'var(--text3)', fontSize:11, cursor:'pointer', transition:'all 0.15s' }}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.color='var(--accent)'}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text3)'}}>
                        ↻ status
                      </button>
                      <button onClick={()=>setModal(task)} style={{ flex:1, padding:'5px', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:6, color:'var(--text3)', fontSize:11, cursor:'pointer', transition:'all 0.15s' }}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--yellow)';e.currentTarget.style.color='var(--yellow)'}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text3)'}}>
                        ✎ edit
                      </button>
                      <button onClick={()=>handleDelete(task._id)} disabled={deleting===task._id} style={{ padding:'5px 10px', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:6, color:'var(--text3)', fontSize:11, cursor:'pointer', transition:'all 0.15s' }}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--red)';e.currentTarget.style.color='var(--red)'}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text3)'}}>
                        {deleting===task._id?'…':'✕'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
