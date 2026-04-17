// App.jsx — with queue ticket, waiting room display, session timeout, mobile responsive
import React, { useState, useEffect, useCallback } from 'react';
import { LogOut, ArrowLeft, Activity, ClipboardList, Stethoscope, BarChart3, User, Clock, Menu, X } from 'lucide-react';
import { supabase } from './lib/supabase';
import { PriorityQueue } from './utils/PriorityQueue';
import { RoleSelectionScreen, PatientIntakeForm, TriageNurseView, DoctorView, ManagerView } from './components/SchedulerViews';
import { LoginScreen } from './components/LoginScreen';
import { QueueTicket } from './components/QueueTicket';
import { WaitingRoomDisplay } from './components/WaitingRoomDisplay';
import { useAuth } from './hooks/useAuth';
import './App.css';

function App() {
  const [viewMode,       setViewMode]       = useState('landing');
  const [selectedRole,   setSelectedRole]   = useState(null);
  const [patients,       setPatients]       = useState([]);
  const [registeredPat,  setRegisteredPat]  = useState(null); // patient just registered
  const [formData,       setFormData]       = useState({ fullname:'', dob:'', gender:'', phone:'', condition:'', urgency:'medium' });

  const { currentUser, isLoggedIn, authError, authLoading, login, logout, showTimeout, timeoutSeconds, stayLoggedIn } = useAuth();

  // ── MOBILE SIDEBAR ────────────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── WAITING ROOM DISPLAY — special route ─────────────────────────────────
  // Open http://localhost:5173?display=waiting on the TV
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
    if (!formData.fullname || !formData.condition) return alert('Fill Name and Condition');
    const { data, error } = await supabase.from('patients').insert({
      fullname:     formData.fullname,
      dob:          formData.dob    || null,
      gender:       formData.gender || null,
      phone:        formData.phone  || null,
      condition:    formData.condition,
      urgency:      'medium',
      arrival_time: new Date().toISOString(),
    }).select().single();

    if (error) { alert('Failed to add patient.'); return; }

    setFormData({ fullname:'', dob:'', gender:'', phone:'', condition:'', urgency:'medium' });
    setRegisteredPat(data); // show ticket
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
      <button onClick={() => setViewMode('landing')} style={{ background:'none', border:'none', color:'#16a34a', cursor:'pointer', display:'flex', alignItems:'center', gap:8, fontWeight:700, fontSize:'11px', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:'1.5rem', padding:0 }}>
        <ArrowLeft size={16}/> Back
      </button>
      <PatientIntakeForm formData={formData} setFormData={setFormData} addPatient={addPatient}/>
    </div>
  );

  // Queue ticket shown after registration
  if (viewMode === 'ticket' && registeredPat) return (
    <QueueTicket patient={registeredPat} onBack={() => { setRegisteredPat(null); setViewMode('landing'); }}/>
  );

  if (viewMode === 'login' && !isLoggedIn) return (
    <LoginScreen role={selectedRole} onLogin={handleLogin} onBack={() => setViewMode('landing')} authError={authError} authLoading={authLoading}/>
  );

  // Dashboard
  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#f0faf4', fontFamily:'Poppins, sans-serif' }}>

      {/* TIMEOUT WARNING MODAL */}
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

      {/* MOBILE OVERLAY — closes sidebar when tapping outside */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:200 }}
          className="mobile-overlay"
        />
      )}

      {/* SIDEBAR */}
      <aside style={{
        width:'260px',
        background:'#ffffff',
        borderRight:'1px solid rgba(34,197,94,0.15)',
        display:'flex',
        flexDirection:'column',
        padding:'1.5rem',
        position:'fixed',
        top:0,
        left:0,
        height:'100vh',
        boxShadow:'2px 0 12px rgba(0,80,30,0.06)',
        zIndex:300,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-260px)',
        transition:'transform 0.25s ease',
      }} className="sidebar">
        {/* Close button — mobile only */}
        <button
          onClick={() => setSidebarOpen(false)}
          style={{ position:'absolute', top:'1rem', right:'1rem', background:'none', border:'none', cursor:'pointer', color:'#9ca3af', padding:4 }}
          className="sidebar-close"
        >
          <X size={20}/>
        </button>

        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'3rem', paddingLeft:'0.5rem' }}>
          <Activity color={getAccentColor()} size={26}/>
          <div>
            <h1 style={{ fontWeight:900, fontSize:'1.1rem', fontStyle:'italic', letterSpacing:'-1px', color:'#1a3a2a', margin:0, lineHeight:1 }}>HEALTHFLOW</h1>
            <p style={{ fontSize:'9px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.2em', color:getAccentColor(), margin:'4px 0 0' }}>{currentUser?.role}</p>
          </div>
        </div>

        <nav style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'1rem', padding:'0.75rem 1rem', borderRadius:'0.75rem', background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.2)', color:getAccentColor(), marginBottom:'0.5rem' }}>
            {getRoleIcon()}
            <span style={{ fontWeight:700, fontSize:'12px', textTransform:'uppercase', letterSpacing:'0.1em' }}>Dashboard</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'1rem', padding:'0.75rem 1rem', borderRadius:'0.75rem', color:'#4b5563', cursor:'not-allowed' }}>
            <User size={20}/>
            <span style={{ fontWeight:700, fontSize:'12px', textTransform:'uppercase', letterSpacing:'0.1em' }}>Profile</span>
          </div>
        </nav>

        <div style={{ background:'rgba(34,197,94,0.06)', borderRadius:'0.75rem', padding:'0.75rem', marginBottom:'1rem', display:'flex', alignItems:'center', gap:8, border:'1px solid rgba(34,197,94,0.12)' }}>
          <Clock size={12} color="#16a34a"/>
          <span style={{ fontSize:'10px', color:'#4b7a5a', fontWeight:600 }}>Auto-logout: 15 min idle</span>
        </div>

        <div style={{ borderTop:'1px solid rgba(34,197,94,0.15)', paddingTop:'1.5rem' }}>
          <div style={{ marginBottom:'1rem', paddingLeft:'0.5rem' }}>
            <p style={{ color:'#6b7280', fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.15em', margin:'0 0 4px' }}>Active User</p>
            <p style={{ color:'#1a3a2a', fontWeight:700, fontSize:'13px', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{currentUser?.fullName}</p>
          </div>
          <button onClick={handleLogout} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.75rem', padding:'0.75rem', borderRadius:'0.75rem', background:'rgba(239,68,68,0.1)', color:'#f87171', border:'1px solid rgba(239,68,68,0.2)', cursor:'pointer', fontWeight:700, fontSize:'11px', textTransform:'uppercase', letterSpacing:'0.1em' }}>
            <LogOut size={16}/> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minHeight:'100vh', width:'100%' }}>

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
          <button onClick={() => setSidebarOpen(true)} style={{ background:'none', border:'none', cursor:'pointer', color:'#16a34a', padding:4 }}>
            <Menu size={24}/>
          </button>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <Activity color={getAccentColor()} size={20}/>
            <span style={{ fontWeight:900, fontSize:'1rem', fontStyle:'italic', letterSpacing:'-1px', color:'#1a3a2a' }}>HEALTH<span style={{ color:'#16a34a' }}>FLOW</span></span>
          </div>
          <button onClick={handleLogout} style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', color:'#ef4444', borderRadius:'0.5rem', padding:'6px 12px', cursor:'pointer', fontWeight:700, fontSize:'11px', display:'flex', alignItems:'center', gap:4 }}>
            <LogOut size={14}/>
          </button>
        </header>

        {/* DESKTOP SPACER — pushes content right of sidebar */}
        <div style={{ marginLeft:'260px' }} className="desktop-spacer">
          <main style={{ flex:1, overflowY:'auto', padding:'0' }}>
            <div style={{ maxWidth:'1100px', margin:'0 auto' }}>
              {currentUser?.role === 'triage'  && <TriageNurseView patients={patients} getSortedPatients={getSortedPatients}/>}
              {currentUser?.role === 'doctor'  && <DoctorView getSortedPatients={getSortedPatients}/>}
              {currentUser?.role === 'manager' && <ManagerView patients={patients}/>}
            </div>
          </main>
        </div>

      </div>

      {/* ── RESPONSIVE STYLES ── */}
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
          .sidebar.open { transform: translateX(0) !important; }
          .mobile-header { display: flex !important; }
          .mobile-overlay { display: block !important; }
          .desktop-spacer { margin-left: 0 !important; }
        }
      `}</style>

    </div>
  );
}

export default App;