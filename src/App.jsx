// App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { LogOut, ArrowLeft, Activity, ClipboardList, Stethoscope, BarChart3, Clock, Menu, X } from 'lucide-react';
import { supabase } from './lib/supabase';
import { PriorityQueue } from './utils/PriorityQueue';
import { RoleSelectionScreen, PatientIntakeForm, TriageNurseView, DoctorView, ManagerView } from './components/SchedulerViews';
import { LoginScreen } from './components/LoginScreen';
import { QueueTicket } from './components/QueueTicket';
import { WaitingRoomDisplay } from './components/WaitingRoomDisplay';
import { useAuth } from './hooks/useAuth';
import './App.css';

function App() {
  const [viewMode,      setViewMode]      = useState(() => {
    try { const u = JSON.parse(sessionStorage.getItem('hf_user')); return u ? 'dashboard' : 'landing'; } catch { return 'landing'; }
  });
  const [selectedRole,  setSelectedRole]  = useState(() => {
    try { const u = JSON.parse(sessionStorage.getItem('hf_user')); return u?.role || null; } catch { return null; }
  });
  const [patients,      setPatients]      = useState([]);
  const [registeredPat, setRegisteredPat] = useState(null);
  const [formData,      setFormData]      = useState({ fullname:'', dob:'', gender:'', phone:'', condition:'', urgency:'medium' });
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [formError,     setFormError]     = useState('');

  const { currentUser, isLoggedIn, authError, authLoading, login, logout,
          showTimeout, timeoutSeconds, stayLoggedIn } = useAuth();

  // ── WAITING ROOM DISPLAY ──────────────────────────────────────────────────
  if (new URLSearchParams(window.location.search).get('display') === 'waiting') {
    return <WaitingRoomDisplay/>;
  }

  // ── LOAD PATIENTS ─────────────────────────────────────────────────────────
  const loadPatients = useCallback(async () => {
    const { data, error } = await supabase.from('patients').select('*').order('arrival_time', { ascending: true });
    if (!error && data) setPatients(data);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    loadPatients();
    const channel = supabase.channel('patients-changes')
      .on('postgres_changes', { event:'*', schema:'public', table:'patients' }, loadPatients)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [isLoggedIn, loadPatients]);

  // ── ADD PATIENT ───────────────────────────────────────────────────────────
  const addPatient = async () => {
    setFormError('');
    if (!formData.fullname || !formData.condition) { setFormError('Please fill in Full Name and Condition.'); return; }
    const { data: ticketNum } = await supabase.rpc('get_next_ticket_number');
    const { data, error } = await supabase.from('patients').insert({
      fullname:      formData.fullname,
      dob:           formData.dob    || null,
      gender:        formData.gender || null,
      phone:         formData.phone  || null,
      condition:     formData.condition,
      urgency:       'medium',
      arrival_time:  new Date().toISOString(),
      ticket_number: ticketNum,
    }).select().single();
    if (error) { setFormError('Failed to register patient. Please try again.'); return; }
    setFormData({ fullname:'', dob:'', gender:'', phone:'', condition:'', urgency:'medium' });
    setRegisteredPat(data);
    setViewMode('ticket');
  };

  // ── SORTED PATIENTS ───────────────────────────────────────────────────────
  const getSortedPatients = useCallback(() => {
    const pq = new PriorityQueue();
    patients.forEach(p => pq.insert({ ...p, arrivalTime: new Date(p.arrival_time).getTime() }));
    const sorted = [];
    while (pq.heap && pq.heap.length > 0) sorted.push(pq.extractMin());
    return sorted;
  }, [patients]);

  // ── AUTH ──────────────────────────────────────────────────────────────────
  const handleRoleSelection = (role) => { setSelectedRole(role); setViewMode(role === 'patient' ? 'patient-intake' : 'login'); };
  const handleLogin         = async (u, p, r) => { const ok = await login(u, p, r); if (ok) setViewMode('dashboard'); };
  const handleLogout        = async () => { await logout(); setPatients([]); setViewMode('landing'); setSelectedRole(null); };

  const getAccentColor = () => ({ triage:'#3b82f6', doctor:'#a855f7', manager:'#f59e0b' }[currentUser?.role] || '#3b82f6');
  const getRoleIcon    = () => {
    if (currentUser?.role === 'triage')  return <ClipboardList size={20}/>;
    if (currentUser?.role === 'doctor')  return <Stethoscope size={20}/>;
    if (currentUser?.role === 'manager') return <BarChart3 size={20}/>;
  };

  // ── VIEWS ─────────────────────────────────────────────────────────────────
  if (viewMode === 'landing' || (!isLoggedIn && viewMode === 'dashboard'))
    return <RoleSelectionScreen onSelect={handleRoleSelection}/>;

  if (viewMode === 'patient-intake') return (
    <div style={{ minHeight:'100vh', background:'#f0faf4', padding:'2rem', fontFamily:'Poppins, sans-serif' }}>
      <button onClick={() => setViewMode('landing')}
        style={{ background:'none', border:'none', color:'#16a34a', cursor:'pointer', display:'flex', alignItems:'center', gap:8, fontWeight:700, fontSize:'11px', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:'1.5rem', padding:0 }}>
        <ArrowLeft size={16}/> Back
      </button>
      <PatientIntakeForm formData={formData} setFormData={setFormData} addPatient={addPatient} formError={formError}/>
    </div>
  );

  if (viewMode === 'ticket' && registeredPat) return (
    <QueueTicket patient={registeredPat} onBack={() => { setRegisteredPat(null); setViewMode('landing'); }}/>
  );

  if (viewMode === 'login' && !isLoggedIn) return (
    <LoginScreen role={selectedRole} onLogin={handleLogin} onBack={() => setViewMode('landing')}
                 authError={authError} authLoading={authLoading}/>
  );

  // ── DASHBOARD ─────────────────────────────────────────────────────────────
  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#f0faf4', fontFamily:'Poppins, sans-serif', overflowX:'hidden' }}>

      {/* TIMEOUT MODAL */}
      {showTimeout && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
          <div style={{ background:'#ffffff', borderRadius:'1.5rem', border:'1px solid rgba(34,197,94,0.3)', padding:'2rem', maxWidth:'400px', width:'100%', textAlign:'center', boxShadow:'0 20px 60px rgba(0,80,30,0.15)' }}>
            <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(245,158,11,0.15)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.5rem', color:'#f59e0b' }}>
              <Clock size={32}/>
            </div>
            <h3 style={{ color:'#1a3a2a', fontWeight:900, fontSize:'1.2rem', margin:'0 0 8px', textTransform:'uppercase' }}>Session Expiring</h3>
            <p style={{ color:'#6b7280', fontSize:'13px', margin:'0 0 1.5rem' }}>You will be logged out due to inactivity in</p>
            <div style={{ fontSize:'3rem', fontWeight:900, color: timeoutSeconds <= 30 ? '#ef4444' : '#f59e0b', marginBottom:'1.5rem' }}>
              {Math.floor(timeoutSeconds/60)}:{(timeoutSeconds%60).toString().padStart(2,'0')}
            </div>
            <div style={{ display:'flex', gap:'1rem' }}>
              <button onClick={handleLogout} style={{ flex:1, background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)', color:'#ef4444', padding:'0.75rem', borderRadius:'0.75rem', fontWeight:700, fontSize:'12px', textTransform:'uppercase', cursor:'pointer' }}>Logout Now</button>
              <button onClick={stayLoggedIn} style={{ flex:2, background:'#f59e0b', border:'none', color:'black', padding:'0.75rem', borderRadius:'0.75rem', fontWeight:700, fontSize:'12px', textTransform:'uppercase', cursor:'pointer' }}>Stay Logged In</button>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:200 }}
          className="mobile-overlay"/>
      )}

      {/* SIDEBAR */}
      <aside style={{
        width:'280px',
        background:'#f8fcf7',
        display:'flex',
        flexDirection:'column',
        padding:'1.75rem 1.5rem',
        position:'fixed',
        top:0, left:0,
        height:'100vh',
        borderRight:'1px solid rgba(34,197,94,0.12)',
        boxShadow:'2px 0 18px rgba(15, 23, 42, 0.08)',
        zIndex:300,
        transition:'transform 0.25s ease',
        overflowY:'auto',
      }} className={`sidebar${sidebarOpen ? ' open' : ''}`}>

        <button onClick={() => setSidebarOpen(false)}
          style={{ position:'absolute', top:'1rem', right:'1rem', background:'none', border:'none', cursor:'pointer', color:'rgba(15,23,42,0.45)', padding:4 }}
          className="sidebar-close">
          <X size={20}/>
        </button>

        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'2rem' }}>
          <div style={{ width:44, height:44, borderRadius:'50%', background:'rgba(34,197,94,0.12)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Activity color={getAccentColor()} size={22}/>
          </div>
          <div>
            <h1 style={{ fontWeight:900, fontSize:'1.25rem', letterSpacing:'-0.02em', color:'#0f172a', margin:0, lineHeight:1.1 }}>
              HEALTH<span style={{ color:getAccentColor() }}>FLOW</span>
            </h1>
            <p style={{ fontSize:'11px', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.12em', color:getAccentColor(), margin:'3px 0 0', lineHeight:1 }}>
              {currentUser?.role === 'triage' ? 'Nurse' : currentUser?.role === 'doctor' ? 'Doctor' : 'Manager'}
            </p>
          </div>
        </div>

        {/* Nav — Dashboard only, no Profile */}
        <nav style={{ flex:1 }}>
          <button style={{
            width:'100%',
            display:'flex',
            alignItems:'center',
            gap:'0.85rem',
            padding:'1rem 1rem',
            borderRadius:'1rem',
            background:'#ecfdf5',
            border:`1px solid rgba(34,197,94,0.25)`,
            color:'#134e4a',
            fontWeight:700,
            textTransform:'uppercase',
            letterSpacing:'0.1em',
            marginBottom:'0.75rem',
            cursor:'default',
          }}>
            {getRoleIcon()}
            <span>Dashboard</span>
          </button>
        </nav>

        <div style={{ margin:'2rem 0 0', padding:'1rem', borderRadius:'1.25rem', background:'#ecfdf5', border:'1px solid rgba(34,197,94,0.18)', boxShadow:'inset 0 1px 0 rgba(255,255,255,0.75)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.55rem', marginBottom:'0.75rem' }}>
            <Clock size={14} color='#15803d'/>
            <span style={{ fontSize:'10px', fontWeight:700, textTransform:'uppercase', color:'#14532d', letterSpacing:'0.16em' }}>Auto-logout</span>
          </div>
          <p style={{ margin:0, fontSize:'12px', fontWeight:700, color:'#0f172a' }}>15 min idle</p>
        </div>

        <div style={{ marginTop:'auto', paddingTop:'1.75rem', borderTop:'1px solid rgba(15,23,42,0.08)' }}>
          <div style={{ marginBottom:'0.9rem' }}>
            <p style={{ color:'#6b7280', fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.15em', margin:'0 0 0.35rem' }}>Active User</p>
            <p style={{ color:'#111827', fontSize:'1rem', fontWeight:800, margin:0 }}>{currentUser?.fullName}</p>
          </div>
          <button onClick={handleLogout}
            style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.75rem', padding:'0.9rem 1rem', borderRadius:'1rem', background:'rgba(239,68,68,0.12)', color:'#b91c1c', border:'1px solid rgba(239,68,68,0.25)', cursor:'pointer', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase' }}>
            <LogOut size={16}/>
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minHeight:'100vh' }}>

        {/* MOBILE TOP BAR */}
        <header style={{
          display:'none',
          background:'white',
          borderBottom:'1px solid rgba(34,197,94,0.15)',
          padding:'0.75rem 1rem',
          alignItems:'center',
          justifyContent:'space-between',
          boxShadow:'0 1px 8px rgba(0,80,30,0.06)',
          position:'sticky',
          top:0,
          zIndex:100,
        }} className="mobile-header">
          <button onClick={() => setSidebarOpen(true)}
            style={{ background:'none', border:'none', cursor:'pointer', color:'#16a34a', padding:4 }}>
            <Menu size={24}/>
          </button>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <Activity color="#16a34a" size={20}/>
            <span style={{ fontWeight:900, fontSize:'1.25rem', fontStyle:'italic', letterSpacing:'-1px', color:'#1a3a2a' }}>
              HEALTH<span style={{ color:'#16a34a' }}>FLOW</span>
            </span>
          </div>
          <button onClick={handleLogout}
            style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', color:'#ef4444', borderRadius:'0.5rem', padding:'6px 10px', cursor:'pointer', fontWeight:700, fontSize:'11px', display:'flex', alignItems:'center', gap:4 }}>
            <LogOut size={14}/>
          </button>
        </header>

        {/* CONTENT */}
        <div className="desktop-spacer" style={{ marginLeft:'260px', height:'100vh', overflowY:'auto', overflowX:'hidden' }}>
          <main style={{ flex:1, minWidth:0 }}>
            <div style={{ maxWidth:'1100px', margin:'0 auto', minWidth:0 }}>
              {currentUser?.role === 'triage'  && <TriageNurseView patients={patients} getSortedPatients={getSortedPatients}/>}
              {currentUser?.role === 'doctor'  && <DoctorView getSortedPatients={getSortedPatients}/>}
              {currentUser?.role === 'manager' && <ManagerView patients={patients}/>}
            </div>
          </main>
        </div>
      </div>

      <style>{`
        @media (min-width: 769px) {
          .sidebar { transform: translateX(0) !important; }
          .sidebar-close { display: none !important; }
          .mobile-header { display: none !important; }
          .mobile-overlay { display: none !important; }
          .desktop-spacer { margin-left: 260px !important; }
        }
        @media (max-width: 768px) {
          .sidebar { transform: translateX(-260px); }
          .mobile-header { display: flex !important; }
          .desktop-spacer { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  );
}

export default App;