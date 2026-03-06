import React from 'react';
import { User, ClipboardList, Stethoscope, BarChart3, ShieldCheck, Activity, ArrowLeft,
         UserPlus, Users, Trash2, Eye, EyeOff, AlertCircle, Loader2, Search,
         Clock, CheckCircle, Download, TrendingUp } from 'lucide-react';

// ─── SUPABASE ─────────────────────────────────────────────────────────────────
const getSupabase = async () => {
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(
    'https://xstfijkxvloflbdsyslf.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzdGZpamt4dmxvZmxiZHN5c2xmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3ODIzNTYsImV4cCI6MjA4NzM1ODM1Nn0.U2QnstkXz7roRqb2-hzj48_-WSgld7HjmcHcg9w0YsA'
  );
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const timeAgo = (ts) => {
  const diff = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  return `${Math.floor(diff/3600)}h ago`;
};

// ─── URGENCY BADGE (doc1 className style) ────────────────────────────────────
const UrgencyBadge = ({ urgency }) => {
  const cls = {
    critical: 'urgency-critical',
    high:     'urgency-high',
    medium:   'urgency-medium',
    low:      'urgency-low',
  }[urgency] || 'urgency-low';
  return (
    <span className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest ${cls}`}>
      {urgency}
    </span>
  );
};

// ─── ROLE SELECTION ───────────────────────────────────────────────────────────
export const RoleSelectionScreen = ({ onSelect }) => (
  <div className="min-h-screen flex flex-col justify-center bg-[#8395ac]">
    <div className="text-center mb-12 w-full">
      <h2 className="text-5xl font-black text-white italic tracking-tighter">
        HEALTH<span className="text-blue-500">FLOW</span>
      </h2>
      <p className="text-gray-500 uppercase text-[10px] tracking-[0.5em] mt-4 font-bold">
        Priority Triage System
      </p>
    </div>
    <div className="flex gap-10 px-10">
      {/* Left — role buttons */}
      <div className="flex flex-col gap-6 items-start">
        {[
          { id: 'patient', label: 'Patient', icon: <User />,        color: 'text-green-400'  },
          { id: 'triage',  label: 'Nurse',   icon: <Activity />,    color: 'text-blue-400'   },
          { id: 'doctor',  label: 'Doctor',  icon: <Stethoscope />, color: 'text-purple-400' },
          { id: 'manager', label: 'Manager', icon: <BarChart3 />,   color: 'text-amber-400'  },
        ].map(role => (
          <button
            key={role.id}
            onClick={() => onSelect(role.id)}
            className="dashboard-card w-75 h-33 flex flex-col items-center justify-center gap-5 hover:border-blue-500 transition-all text-white group"
          >
            <div className={`p-5 bg-white rounded-3xl transition-colors group-hover:bg-blue-500 group-hover:text-black ${role.color}`}>
              {role.icon}
            </div>
            <span className="font-bold tracking-widest text-xs uppercase">{role.label} PORTAL</span>
          </button>
        ))}
      </div>

      {/* Right — welcome panel */}
      <div className="flex flex-col justify-start flex-1">
        <div className="dashboard-card p-10 w-full text-white h-[600px] flex flex-col">
          <center>
            <h1 className="text-4xl font-bold mb-4">WELCOME!</h1>
            <p className="text-white-400 text-sm">
              Users
            </p>
          </center>
        </div>
      </div>
    </div>
  </div>
);

// ─── QUEUE TICKET INLINE ──────────────────────────────────────────────────────
const QueueTicketInline = ({ patient, onBack }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-[#2c3038] p-8">
    <div className="text-center mb-8">
      <h2 className="text-3xl font-black text-white italic tracking-tighter">HEALTH<span className="text-blue-500">FLOW</span></h2>
      <p className="text-gray-500 uppercase text-[10px] tracking-[0.3em] mt-2 font-bold">Registration Confirmed</p>
    </div>
    <div className="dashboard-card w-full max-w-sm overflow-hidden p-0">
      <div className="bg-green-500 py-2 text-center">
        <span className="text-white font-black text-[11px] uppercase tracking-widest">You are now in the queue</span>
      </div>
      <div className="p-8 text-white">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center">
            <CheckCircle className="text-green-400" size={32} />
          </div>
        </div>
        <div className="text-center mb-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-1">Registered Patient</p>
          <h2 className="text-3xl font-black">{patient.fullname}</h2>
        </div>
        <div className="text-center border-2 border-dashed border-blue-500/25 rounded-2xl p-6 mb-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 mb-2">Your Queue Number</p>
          <div className="text-6xl font-black text-blue-500 leading-none">#{patient.ticket_number || '—'}</div>
          <p className="text-gray-600 text-[11px] mt-2">Remember this number</p>
        </div>
        <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-3">
          <Clock size={16} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-400 text-xs font-bold uppercase mb-1">Awaiting Assessment</p>
            <p className="text-gray-500 text-[11px] leading-relaxed">A nurse will assess your condition and assign your priority. Please remain in the waiting area.</p>
          </div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/15 rounded-xl p-4 mb-6">
          <p className="text-blue-400 text-xs font-bold uppercase mb-1">Queue Monitor</p>
          <p className="text-gray-500 text-[11px] leading-relaxed">Watch the waiting room display screen to track your queue position.</p>
        </div>
        <button onClick={onBack}
          className="w-full flex items-center justify-center gap-2 border border-white/10 text-gray-500 hover:text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors">
          <ArrowLeft size={14} /> Back to Home
        </button>
      </div>
    </div>
  </div>
);

// ─── PATIENT INTAKE FORM ──────────────────────────────────────────────────────
export const PatientIntakeForm = ({ formData, setFormData, addPatient: addPatientProp }) => {
  const [localForm, setLocalForm] = React.useState(formData || { fullname:'', dob:'', gender:'', phone:'', condition:'' });
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted,  setSubmitted]  = React.useState(false);
  const [ticket,     setTicket]     = React.useState(null);

  const form    = formData || localForm;
  const setForm = setFormData || setLocalForm;

  const handleSubmit = async () => {
    if (!form.fullname || !form.condition) return alert('Please fill in Name and Condition.');
    setSubmitting(true);
    try {
      const sb = await getSupabase();
      const { data, error } = await sb.from('patients').insert({
        fullname:     form.fullname,
        dob:          form.dob     || null,
        gender:       form.gender  || null,
        phone:        form.phone   || null,
        condition:    form.condition,
        urgency:      'medium',
        arrival_time: new Date().toISOString(),
      }).select().single();
      if (error) throw error;
      setTicket(data);
      setSubmitted(true);
      if (addPatientProp) addPatientProp();
    } catch(e) {
      console.error(e);
      alert('Failed to register. Please try again.');
    } finally { setSubmitting(false); }
  };

  if (submitted && ticket) return (
    <QueueTicketInline patient={ticket} onBack={() => {
      setSubmitted(false); setTicket(null);
      setForm({ fullname:'', dob:'', gender:'', phone:'', condition:'' });
    }}/>
  );

  return (
    <div className="max-w-2xl mx-auto dashboard-card p-10 text-white">
      <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 border-b border-white/5 pb-4">
        <ClipboardList className="text-blue-500"/> Patient Registration
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <div className="md:col-span-2">
          <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block ml-2">Full Name *</label>
          <input className="form-input" placeholder="Full name" value={form.fullname} onChange={e => setForm({...form, fullname: e.target.value})}/>
        </div>
        <div>
          <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block ml-2">Date of Birth</label>
          <input type="date" className="form-input" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})}/>
        </div>
        <div>
          <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block ml-2">Gender</label>
          <select className="form-input" value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
            <option value="">Select</option>
            <option>Male</option>
            <option>Female</option>
          </select>
        </div>
      </div>
      <div className="space-y-5">
        <input className="form-input" placeholder="Phone Number" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}/>
        <div>
          <label className="text-[10px] uppercase font-bold text-blue-500 mb-1 block ml-2">Condition / Symptoms *</label>
          <textarea className="form-input h-32" placeholder="Describe your condition..." value={form.condition} onChange={e => setForm({...form, condition: e.target.value})}/>
        </div>
        <button onClick={handleSubmit} disabled={submitting}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 p-4 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2">
          {submitting ? <><Loader2 size={16} className="animate-spin"/> Submitting...</> : 'SUBMIT & JOIN QUEUE'}
        </button>
      </div>
    </div>
  );
};

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────
export const LoginScreen = ({ role, onLogin, onBack, authError, authLoading }) => {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPw,   setShowPw]   = React.useState(false);
  const [localErr, setLocalErr] = React.useState('');
  const [loading,  setLoading]  = React.useState(false);
  const error = localErr || authError;

  const THEME = {
    triage:  { color: 'text-blue-400',   Icon: Activity    },
    doctor:  { color: 'text-purple-400', Icon: Stethoscope },
    manager: { color: 'text-amber-400',  Icon: BarChart3   },
  }[role] || { color: 'text-blue-400', Icon: Activity };

  const roleLabel = { triage: 'Nurse', doctor: 'Doctor', manager: 'Manager' }[role];

  const handleSubmit = async () => {
    setLocalErr('');
    if (!username.trim()) return setLocalErr('Username is required.');
    if (!password)        return setLocalErr('Password is required.');
    setLoading(true);
    try {
      const bcrypt     = await import('bcryptjs');
      const sb         = await getSupabase();
      const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const { count }  = await sb.from('login_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('username', username.trim()).eq('success', false).gte('attempted_at', tenMinsAgo);
      if (count >= 5) { setLocalErr('Account locked. Too many failed attempts. Try again in 10 minutes.'); setLoading(false); return; }

      const { data: users } = await sb.from('users')
        .select('id, username, password, role, full_name')
        .eq('username', username.trim()).limit(1);
      const user          = users?.[0];
      const dummyHash     = '$2a$12$invalidhashfortimingprotectiononly000000000000000000000';
      const passwordMatch = await bcrypt.compare(password, user?.password ?? dummyHash);

      if (!user || !passwordMatch || user.role !== role) {
        await sb.from('login_attempts').insert({ username: username.trim(), success: false });
        setLocalErr('Invalid credentials.');
        setLoading(false);
        return;
      }

      await sb.from('login_attempts').insert({ username: username.trim(), success: true });
      const userData = { id: user.id, fullName: user.full_name, role: user.role, username: user.username };
      sessionStorage.setItem('hf_user', JSON.stringify(userData));

      if (onLogin.length <= 1) {
        onLogin({ username: user.username, fullName: user.full_name, role: user.role });
      } else {
        onLogin(username.trim(), password, role);
      }
    } catch(err) {
      console.error(err);
      setLocalErr('Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  const isLoading = loading || authLoading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#2c3038]">
      <div className="dashboard-card w-full max-w-md p-10 text-white">
        <button onClick={onBack} className="text-gray-500 mb-6 flex items-center gap-1 text-xs uppercase font-bold hover:text-white">
          <ArrowLeft size={14}/> BACK
        </button>
        <div className="text-center mb-8">
          <div className={`inline-block p-4 bg-white/5 rounded-2xl mb-4 ${THEME.color}`}>
            <THEME.Icon size={32}/>
          </div>
          <h2 className="text-xl font-bold uppercase tracking-widest">{roleLabel} Authentication</h2>
          <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] mt-1">Secure Access</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-4">
            <AlertCircle size={14} className="text-red-400 shrink-0"/>
            <p className="text-red-400 text-xs font-bold">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block ml-2">Username</label>
            <input className="form-input" placeholder="Enter your username" value={username}
              onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key==='Enter' && handleSubmit()} disabled={isLoading}/>
          </div>
          <div className="relative">
            <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block ml-2">Password</label>
            <input className="form-input pr-12" type={showPw ? 'text' : 'password'} placeholder="Enter your password"
              value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key==='Enter' && handleSubmit()} disabled={isLoading}/>
            <button type="button" onClick={() => setShowPw(v=>!v)}
              className="absolute right-3 bottom-3 text-gray-500 hover:text-white">
              {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
            </button>
          </div>
          <button onClick={handleSubmit} disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-60 p-4 rounded-xl font-bold transition-all uppercase flex items-center justify-center gap-2">
            {isLoading
              ? <><Loader2 size={16} className="animate-spin"/> Verifying...</>
              : <><ShieldCheck size={16}/> Enter Portal</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── TRIAGE NURSE VIEW ────────────────────────────────────────────────────────
export const TriageNurseView = ({ patients: patientsProp, getSortedPatients: getSortedProp }) => {
  const [search,   setSearch]   = React.useState('');
  const [filter,   setFilter]   = React.useState('all');
  const [updating, setUpdating] = React.useState(null);
  const [ownPats,  setOwnPats]  = React.useState([]);

  React.useEffect(() => {
    let channel;
    const load = async () => {
      const sb = await getSupabase();
      const { data } = await sb.from('patients').select('*').order('arrival_time', { ascending: true });
      if (data) setOwnPats(data);
    };
    load();
    (async () => {
      const sb = await getSupabase();
      channel = sb.channel('nurse-patients')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'patients' }, load)
        .subscribe();
    })();
    return () => { if (channel) channel.unsubscribe(); };
  }, []);

  const patients = (patientsProp && patientsProp.length > 0) ? patientsProp : ownPats;
  const getSortedPatients = getSortedProp || (() => {
    const URGENCY_ORDER = { critical:1, high:2, medium:3, low:4 };
    return [...patients].sort((a,b) => {
      const ud = (URGENCY_ORDER[a.urgency]||3) - (URGENCY_ORDER[b.urgency]||3);
      return ud !== 0 ? ud : new Date(a.arrival_time) - new Date(b.arrival_time);
    });
  });

  const updateUrgency = async (id, urgency) => {
    setUpdating(id);
    const sb = await getSupabase();
    await sb.from('patients').update({ urgency, nurse_assessed: true }).eq('id', id);
    setUpdating(null);
  };

  const [shift, setShift] = React.useState('today');
  const shiftFilter = (p) => {
    const t = new Date(p.arrival_time), now = new Date();
    if (shift === 'today') return t.toDateString() === now.toDateString();
    if (shift === 'week')  return t >= new Date(now - 7 * 24 * 60 * 60 * 1000);
    return true;
  };

  const counts = { critical:0, high:0, medium:0, low:0 };
  patients.filter(p => p.status !== 'done').filter(shiftFilter).forEach(p => { if (counts[p.urgency] !== undefined) counts[p.urgency]++; });

  const sorted = getSortedPatients()
    .filter(p => p.status !== 'done')
    .filter(shiftFilter)
    .filter(p => (filter==='all' || p.urgency===filter) &&
      (p.fullname.toLowerCase().includes(search.toLowerCase()) || p.condition.toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="p-8 text-white">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-white">Triage Dashboard</h2>
        <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] font-bold mt-1">Manage Patient Urgency Levels</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label:'Critical', key:'critical', accent:'border-t-red-500',   text:'text-red-400'   },
          { label:'High',     key:'high',     accent:'border-t-amber-500', text:'text-amber-400' },
          { label:'Medium',   key:'medium',   accent:'border-t-blue-500',  text:'text-blue-400'  },
          { label:'Low',      key:'low',      accent:'border-t-green-500', text:'text-green-400' },
        ].map(s => (
          <div key={s.key} className={`dashboard-card text-center p-5 border-t-2 ${s.accent}`}>
            <div className={`text-4xl font-black ${s.text}`}>{counts[s.key]}</div>
            <div className="text-[10px] font-bold uppercase text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search & filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-44">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
          <input className="form-input pl-9" placeholder="Search patients..." value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <select className="form-input w-36" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Levels</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select className="form-input w-36" value={shift} onChange={e => setShift(e.target.value)}>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Queue */}
      <div className="dashboard-card p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white font-black text-xs uppercase tracking-widest">Live Priority Queue</h3>
          <div className="animate-pulse flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"/>
            <span className="text-[10px] font-bold text-gray-400 tracking-widest">LIVE MONITOR</span>
          </div>
        </div>
        <div className="space-y-3">
          {sorted.length === 0
            ? <div className="text-center py-20 text-gray-600 font-bold uppercase tracking-widest text-sm">
                {search || filter !== 'all' ? 'No patients match your filter' : 'No Active Patients'}
              </div>
            : sorted.map((p, i) => (
              <div key={p.id} className="p-5 bg-black/20 rounded-2xl border border-white/5 flex justify-between items-center gap-4">
                <div className="flex items-center gap-5 flex-1 min-w-0">
                  <div className="text-2xl font-black text-white/20 shrink-0">{(i+1).toString().padStart(2,'0')}</div>
                  <div className="min-w-0">
                    <p className="font-bold text-white text-lg truncate">{p.fullname}</p>
                    <p className="text-sm text-gray-500 italic truncate">"{p.condition}"</p>
                    <p className="text-gray-600 text-[11px] mt-1 flex items-center gap-1">
                      <Clock size={10}/> {timeAgo(p.arrival_time)}
                    </p>
                  </div>
                </div>
                <div className="shrink-0">
                  {updating === p.id
                    ? <Loader2 size={16} className="text-gray-500 animate-spin"/>
                    : <select value={p.urgency} onChange={e => updateUrgency(p.id, e.target.value)}
                        className="bg-black/30 border border-white/10 text-white px-3 py-2 rounded-lg font-bold text-[11px] uppercase cursor-pointer">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                  }
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
};

// ─── DOCTOR VIEW ──────────────────────────────────────────────────────────────
export const DoctorView = ({ getSortedPatients: getSortedProp }) => {
  const [ownPats, setOwnPats] = React.useState([]);
  React.useEffect(() => {
    let channel;
    const load = async () => {
      const sb = await getSupabase();
      const { data } = await sb.from('patients').select('*').neq('status','done').order('arrival_time', { ascending: true });
      if (data) setOwnPats(data);
    };
    load();
    (async () => {
      const sb = await getSupabase();
      channel = sb.channel('doctor-patients')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'patients' }, load)
        .subscribe();
    })();
    return () => { if (channel) channel.unsubscribe(); };
  }, []);

  const getSortedPatients = getSortedProp || (() => {
    const URGENCY_ORDER = { critical:1, high:2, medium:3, low:4 };
    return [...ownPats].sort((a,b) => {
      const ud = (URGENCY_ORDER[a.urgency]||3) - (URGENCY_ORDER[b.urgency]||3);
      return ud !== 0 ? ud : new Date(a.arrival_time) - new Date(b.arrival_time);
    });
  });

  const [completing, setCompleting] = React.useState(false);
  const [history,    setHistory]    = React.useState([]);
  const [tab,        setTab]        = React.useState('queue');
  const [notes,      setNotes]      = React.useState('');
  const [shiftDoc,   setShiftDoc]   = React.useState('today');

  const sorted  = getSortedPatients().filter(p => p.status !== 'done');
  const current = sorted[0];
  const queue   = sorted.slice(1);

  const shiftFilterDoc = (p) => {
    const t = new Date(p.completed_at || p.arrival_time), now = new Date();
    if (shiftDoc === 'today') return t.toDateString() === now.toDateString();
    if (shiftDoc === 'week')  return t >= new Date(now - 7 * 24 * 60 * 60 * 1000);
    return true;
  };

  const loadHistory = React.useCallback(async () => {
    const sb = await getSupabase();
    const { data } = await sb.from('patients').select('*').eq('status','done').order('completed_at',{ascending:false}).limit(50);
    if (data) setHistory(data);
  }, []);

  React.useEffect(() => { if (tab==='history') loadHistory(); }, [tab, loadHistory]);

  const markDone = async () => {
    if (!current) return;
    setCompleting(true);
    const sb = await getSupabase();
    await sb.from('patients').update({
      status: 'done',
      completed_at: new Date().toISOString(),
      doctor_notes: notes.trim() || null,
    }).eq('id', current.id);
    setNotes('');
    setCompleting(false);
  };

  return (
    <div className="p-8 text-white">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-white">Doctor Dashboard</h2>
        <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] font-bold mt-1">Patient Consultation Queue</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[{ id:'queue', label:'Queue' }, { id:'history', label:'History' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-5 py-2 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${
              tab === t.id ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'queue' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Current patient */}
          <div className="dashboard-card p-10 text-center">
            <div className="p-6 bg-purple-500/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <Stethoscope className="text-purple-500" size={40}/>
            </div>
            <h3 className="text-gray-500 uppercase text-xs font-black tracking-widest mb-2">Now Consulting</h3>
            {current ? (
              <>
                <h2 className="text-4xl font-bold text-white mb-3">{current.fullname}</h2>
                <UrgencyBadge urgency={current.urgency}/>
                <div className="p-4 bg-black/30 rounded-xl text-gray-400 text-sm my-4 italic">"{current.condition}"</div>
                <p className="text-gray-600 text-xs mb-5 flex items-center justify-center gap-1">
                  <Clock size={12}/> Waiting {timeAgo(current.arrival_time)}
                </p>
                <div className="text-left mb-4">
                  <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block ml-2">Consultation Notes</label>
                  <textarea className="form-input" rows={3}
                    placeholder="Add diagnosis, prescription, or notes..."
                    value={notes} onChange={e => setNotes(e.target.value)}/>
                </div>
                <button onClick={markDone} disabled={completing}
                  className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-60 p-4 rounded-xl font-black text-white transition-all flex items-center justify-center gap-2">
                  {completing
                    ? <><Loader2 size={16} className="animate-spin"/> Processing...</>
                    : <><CheckCircle size={16}/> Mark as Done</>}
                </button>
              </>
            ) : <p className="text-gray-600 py-10 font-bold uppercase tracking-widest">All Patients Cleared</p>}
          </div>

          {/* Queue list */}
          <div className="dashboard-card p-8">
            <h3 className="text-white font-black text-xs uppercase tracking-widest mb-4">Up Next ({queue.length})</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {queue.map((p, i) => (
                <div key={p.id} className="p-4 bg-black/20 rounded-2xl border border-white/5 flex items-center justify-between gap-3">
                  <div className="text-xl font-black text-white/20 shrink-0">{(i+2).toString().padStart(2,'0')}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm truncate">{p.fullname}</p>
                    <p className="text-gray-500 text-xs italic truncate">"{p.condition}"</p>
                  </div>
                  <UrgencyBadge urgency={p.urgency}/>
                </div>
              ))}
              {queue.length === 0 && (
                <p className="text-gray-700 text-xs font-bold uppercase text-center py-6 tracking-widest">No patients waiting</p>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="dashboard-card p-8">
          <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-4">
            <h3 className="text-white font-black text-xs uppercase tracking-widest">Consultation History</h3>
            <select className="form-input w-36 text-xs" value={shiftDoc} onChange={e => setShiftDoc(e.target.value)}>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="all">All Time</option>
            </select>
          </div>
          <div className="space-y-3">
            {history.filter(shiftFilterDoc).map(p => (
              <div key={p.id} className="p-4 bg-black/20 rounded-2xl border border-white/5">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold truncate">{p.fullname}</p>
                    <p className="text-gray-500 text-xs italic truncate">"{p.condition}"</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <UrgencyBadge urgency={p.urgency}/>
                    {p.completed_at && <p className="text-gray-600 text-[11px] mt-1">{timeAgo(p.completed_at)}</p>}
                  </div>
                </div>
                {p.doctor_notes && (
                  <div className="bg-purple-500/10 border border-purple-500/25 rounded-lg px-3 py-2 mt-3">
                    <p className="text-purple-400 text-[10px] font-bold uppercase tracking-widest mb-1">Doctor Notes</p>
                    <p className="text-purple-200 text-xs">{p.doctor_notes}</p>
                  </div>
                )}
              </div>
            ))}
            {history.length === 0 && (
              <p className="text-center text-gray-700 text-xs font-bold uppercase py-8 tracking-widest">No history yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── MANAGER VIEW ─────────────────────────────────────────────────────────────
export const ManagerView = ({ patients: patientsProp }) => {
  const [ownPats, setOwnPats] = React.useState([]);
  React.useEffect(() => {
    let channel;
    const load = async () => {
      const sb = await getSupabase();
      const { data } = await sb.from('patients').select('*').order('arrival_time', { ascending: true });
      if (data) setOwnPats(data);
    };
    load();
    (async () => {
      const sb = await getSupabase();
      channel = sb.channel('manager-patients')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'patients' }, load)
        .subscribe();
    })();
    return () => { if (channel) channel.unsubscribe(); };
  }, []);

  const patients = (patientsProp && patientsProp.length > 0) ? patientsProp : ownPats;
  const [tab,       setTab]       = React.useState('overview');
  const [shiftMgr,  setShiftMgr]  = React.useState('today');
  const [form,      setForm]      = React.useState({ fullName:'', username:'', password:'', role:'triage', email:'' });
  const [staffList, setStaffList] = React.useState([]);
  const [loading,   setLoading]   = React.useState(false);
  const [created,   setCreated]   = React.useState(null);
  const [error,     setError]     = React.useState('');
  const [showPw,    setShowPw]    = React.useState(false);
  const [search,    setSearch]    = React.useState('');

  const shiftFilterMgr = (p) => {
    const t = new Date(p.arrival_time), now = new Date();
    if (shiftMgr === 'today') return t.toDateString() === now.toDateString();
    if (shiftMgr === 'week')  return t >= new Date(now - 7 * 24 * 60 * 60 * 1000);
    return true;
  };

  const loadStaff = React.useCallback(async () => {
    const sb = await getSupabase();
    const { data } = await sb.from('users').select('id,username,role,full_name,created_at').neq('role','manager').order('created_at',{ascending:false});
    if (data) setStaffList(data);
  },[]);

  React.useEffect(() => { loadStaff(); },[loadStaff]);

  const handleCreate = async () => {
    setError('');
    if (!form.fullName.trim())     return setError('Full name is required.');
    if (!form.username.trim())     return setError('Username is required.');
    if (!form.email.includes('@')) return setError('Valid email required.');
    if (form.password.length < 6)  return setError('Password must be at least 6 characters.');
    setLoading(true);
    try {
      const bcrypt = await import('bcryptjs');
      const sb     = await getSupabase();
      const { data: ex } = await sb.from('users').select('id').eq('username',form.username.trim()).limit(1);
      if (ex?.length > 0) { setError('Username already exists.'); setLoading(false); return; }
      const hash = await bcrypt.hash(form.password, 12);
      const { error: ie } = await sb.from('users').insert({ username:form.username.trim(), password:hash, role:form.role, full_name:form.fullName.trim() });
      if (ie) throw ie;
      const emailjs = await import('@emailjs/browser');
      await emailjs.send('service_7uic23n','template_dq3c8lx',{
        to_email:form.email.trim(), to_name:form.fullName.trim(),
        role:{triage:'Nurse',doctor:'Doctor'}[form.role],
        username:form.username.trim(), password:form.password,
      },'J3wTv46GcVJ6LLie3');
      setCreated({ ...form });
      setForm({ fullName:'',username:'',password:'',role:'triage',email:'' });
      loadStaff();
    } catch(err) { setError('Failed to create account. Try again.'); console.error(err);
    } finally { setLoading(false); }
  };

  const handleDelete = async (id, username) => {
    if (!confirm(`Delete account for "${username}"?`)) return;
    const sb = await getSupabase();
    await sb.from('users').delete().eq('id',id);
    loadStaff();
  };

  const exportCSV = () => {
    const csv = [['Name','Condition','Urgency','Gender','Phone','Arrival','Status'],
      ...patients.map(p=>[p.fullname,p.condition,p.urgency,p.gender||'',p.phone||'',new Date(p.arrival_time).toLocaleString(),p.status||'waiting'])
    ].map(r=>r.map(v=>`"${v}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
    a.download=`patients_${Date.now()}.csv`; a.click();
  };

  const filteredByShift = patients.filter(shiftFilterMgr);
  const uc = {critical:0,high:0,medium:0,low:0};
  filteredByShift.forEach(p=>{ if(uc[p.urgency]!==undefined) uc[p.urgency]++; });
  const total = filteredByShift.length || 1;

  const ROLE_COLOR = { triage:'text-blue-400', doctor:'text-purple-400' };
  const ROLE_LABEL = { triage:'Nurse', doctor:'Doctor', manager:'Manager' };

  const filtStaff    = staffList.filter(s=>s.full_name.toLowerCase().includes(search.toLowerCase())||s.username.toLowerCase().includes(search.toLowerCase()));
  const filtPatients = patients.filter(p=>p.fullname.toLowerCase().includes(search.toLowerCase())||p.condition.toLowerCase().includes(search.toLowerCase()));

  const TABS = ['overview','analytics','patients','create','staff'];
  const TAB_LABELS = { overview:'Overview', analytics:'Analytics', patients:'Patient Records', create:'+ Create Account', staff:'Staff List' };

  return (
    <div className="p-8 text-white">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-white">Manager Dashboard</h2>
        <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] font-bold mt-1">Staff, Analytics & Patient Overview</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map(t => (
          <button key={t} onClick={() => { setTab(t); setCreated(null); setError(''); setSearch(''); }}
            className={`px-4 py-2 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${
              tab === t ? 'bg-amber-500 text-black' : 'bg-white/5 text-gray-400 hover:text-white'
            }`}>
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-gray-500 text-[11px] font-bold uppercase tracking-widest">Showing:</span>
            {['today','week','all'].map(s => (
              <button key={s} onClick={() => setShiftMgr(s)}
                className={`px-4 py-2 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all ${
                  shiftMgr === s ? 'bg-amber-500 text-black' : 'bg-white/5 text-gray-400 hover:text-white'
                }`}>
                {s==='today'?'Today':s==='week'?'This Week':'All Time'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="dashboard-card p-8 flex flex-col items-center justify-center text-center">
              <p className="text-gray-500 font-bold text-xs uppercase tracking-[0.3em] mb-2">Total Patients</p>
              <div className="text-6xl font-black text-amber-500">{filteredByShift.length}</div>
              <div className="flex gap-2 mt-3">
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-[10px] font-black uppercase">{filteredByShift.filter(p=>p.status==='done').length} Done</span>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-[10px] font-black uppercase">{filteredByShift.filter(p=>p.status!=='done').length} Waiting</span>
              </div>
            </div>
            <div className="dashboard-card p-8 flex flex-col items-center justify-center text-center">
              <p className="text-gray-500 font-bold text-xs uppercase tracking-[0.3em] mb-2">Total Staff</p>
              <div className="text-6xl font-black text-blue-500">{staffList.length}</div>
              <div className="flex gap-2 mt-3">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-[10px] font-black uppercase">{staffList.filter(s=>s.role==='triage').length} Nurses</span>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-[10px] font-black uppercase">{staffList.filter(s=>s.role==='doctor').length} Doctors</span>
              </div>
            </div>
          </div>

          <div className="dashboard-card p-8">
            <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-4">
              <h3 className="text-white font-black text-xs uppercase tracking-widest">Recent Activity</h3>
              <button onClick={exportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-amber-500/20 transition-all">
                <Download size={13}/> Export CSV
              </button>
            </div>
            {filteredByShift.slice(-5).reverse().map(p => (
              <div key={p.id} className="border-l-2 border-amber-500 pl-4 mb-3 flex justify-between items-center">
                <div>
                  <span className="text-white font-bold text-sm">{p.fullname}</span>
                  <span className="text-gray-500 text-xs"> — {p.condition}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <UrgencyBadge urgency={p.urgency}/>
                  <span className="text-gray-600 text-[11px]">{timeAgo(p.arrival_time)}</span>
                </div>
              </div>
            ))}
            {filteredByShift.length === 0 && <p className="text-gray-700 text-xs font-bold uppercase tracking-widest">No patients yet</p>}
          </div>
        </div>
      )}

      {/* ANALYTICS */}
      {tab === 'analytics' && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-4 gap-4">
            {[
              { label:'Critical', key:'critical', accent:'border-t-red-500',   text:'text-red-400'   },
              { label:'High',     key:'high',     accent:'border-t-amber-500', text:'text-amber-400' },
              { label:'Medium',   key:'medium',   accent:'border-t-blue-500',  text:'text-blue-400'  },
              { label:'Low',      key:'low',      accent:'border-t-green-500', text:'text-green-400' },
            ].map(s => (
              <div key={s.key} className={`dashboard-card text-center p-5 border-t-2 ${s.accent}`}>
                <div className={`text-4xl font-black ${s.text}`}>{uc[s.key]}</div>
                <div className="text-[10px] font-bold uppercase text-gray-500 mt-1">{s.label}</div>
                <div className={`text-xs font-bold mt-1 ${s.text}`}>{Math.round(uc[s.key]/total*100)}%</div>
              </div>
            ))}
          </div>

          <div className="dashboard-card p-8">
            <h3 className="text-white font-black text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
              <TrendingUp size={15} className="text-amber-400"/> Urgency Distribution
            </h3>
            {[
              { label:'Critical', key:'critical', bar:'bg-red-500'   },
              { label:'High',     key:'high',     bar:'bg-amber-500' },
              { label:'Medium',   key:'medium',   bar:'bg-blue-500'  },
              { label:'Low',      key:'low',      bar:'bg-green-500' },
            ].map(s => {
              const pct = Math.round(uc[s.key]/total*100);
              return (
                <div key={s.key} className="flex items-center gap-4 mb-4">
                  <div className="w-16 text-right text-[11px] font-bold uppercase text-gray-500">{s.label}</div>
                  <div className="flex-1 bg-white/5 rounded-full h-6 overflow-hidden">
                    <div className={`${s.bar} h-full rounded-full flex items-center justify-end pr-2 transition-all`}
                      style={{ width:`${Math.max(pct,2)}%` }}>
                      {pct > 10 && <span className="text-white text-[10px] font-black">{uc[s.key]}</span>}
                    </div>
                  </div>
                  <div className="w-9 text-[11px] font-bold text-gray-500">{pct}%</div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label:'Total Patients', val:patients.length,                              text:'text-amber-500' },
              { label:'Consulted',      val:patients.filter(p=>p.status==='done').length, text:'text-green-400' },
              { label:'Waiting',        val:patients.filter(p=>p.status!=='done').length, text:'text-blue-400'  },
            ].map(s => (
              <div key={s.label} className="dashboard-card p-8 text-center">
                <div className={`text-4xl font-black ${s.text}`}>{s.val}</div>
                <div className="text-[10px] font-bold uppercase text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PATIENT RECORDS */}
      {tab === 'patients' && (
        <div className="dashboard-card p-8">
          <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-4">
            <h3 className="text-white font-black text-xs uppercase tracking-widest">All Patient Records</h3>
            <button onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-amber-500/20 transition-all">
              <Download size={13}/> Export CSV
            </button>
          </div>
          <div className="relative mb-4">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
            <input className="form-input pl-9" placeholder="Search patients..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {filtPatients.map(p => (
              <div key={p.id} className="p-5 bg-black/20 rounded-2xl border border-white/5 flex justify-between items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white font-bold truncate">{p.fullname}</p>
                    {p.status==='done' && <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-[9px] font-black uppercase shrink-0">Done</span>}
                  </div>
                  <p className="text-gray-500 text-xs italic truncate">"{p.condition}"</p>
                  <p className="text-gray-600 text-[11px] mt-1 flex items-center gap-1"><Clock size={10}/> {timeAgo(p.arrival_time)}</p>
                </div>
                <div className="text-right shrink-0">
                  <UrgencyBadge urgency={p.urgency}/>
                  {p.gender && <p className="text-gray-500 text-[11px] mt-1">{p.gender}</p>}
                </div>
              </div>
            ))}
            {filtPatients.length === 0 && <p className="text-center text-gray-700 text-xs font-bold uppercase py-8 tracking-widest">No records found</p>}
          </div>
        </div>
      )}

      {/* CREATE ACCOUNT */}
      {tab === 'create' && (
        <div className="max-w-lg">
          {created ? (
            <div className="dashboard-card p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-green-500/10 rounded-xl"><ShieldCheck className="text-green-400" size={24}/></div>
                <div>
                  <h3 className="text-white font-black text-lg">Account Created!</h3>
                  <p className="text-green-400 text-xs mt-1">Credentials sent to {created.email}</p>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3 mb-4">
                {[
                  { label:'Role',     val:ROLE_LABEL[created.role], cls:'text-amber-400'      },
                  { label:'Name',     val:created.fullName,         cls:'text-white'           },
                  { label:'Email',    val:created.email,            cls:'text-white'           },
                  { label:'Username', val:created.username,         cls:'text-white font-mono' },
                  { label:'Password', val:created.password,         cls:'text-white font-mono' },
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-center">
                    <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{row.label}</span>
                    <span className={`font-bold text-sm ${row.cls}`}>{row.val}</span>
                  </div>
                ))}
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-4">
                <p className="text-amber-400 text-xs">⚠️ Email sent. Keep a copy of these credentials just in case.</p>
              </div>
              <button onClick={() => setCreated(null)}
                className="w-full bg-amber-500 hover:bg-amber-400 text-black p-4 rounded-xl font-black uppercase tracking-widest transition-all">
                Create Another Account
              </button>
            </div>
          ) : (
            <div className="dashboard-card p-8">
              <h3 className="text-white font-black text-lg mb-6 flex items-center gap-2">
                <UserPlus className="text-amber-400" size={22}/> New Staff Account
              </h3>
              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-4">
                  <AlertCircle size={14} className="text-red-400 shrink-0"/>
                  <p className="text-red-400 text-xs font-bold">{error}</p>
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block ml-2">Role</label>
                  <select className="form-input" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
                    <option value="triage">Nurse (Triage)</option>
                    <option value="doctor">Doctor</option>
                  </select>
                </div>
                {[
                  { label:'Full Name',   field:'fullName',  ph:'e.g. Nurse Santos'        },
                  { label:'Staff Email', field:'email',     ph:'e.g. nurse@email.com', type:'email', hint:'Credentials will be sent to this email' },
                  { label:'Username',    field:'username',  ph:'e.g. nurse-santos'        },
                ].map(f => (
                  <div key={f.field}>
                    <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block ml-2">{f.label}</label>
                    <input className="form-input" type={f.type||'text'} placeholder={f.ph}
                      value={form[f.field]} onChange={e=>setForm({...form,[f.field]:e.target.value})}/>
                    {f.hint && <p className="text-gray-600 text-[11px] mt-1 ml-2">{f.hint}</p>}
                  </div>
                ))}
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block ml-2">Password</label>
                  <div className="relative">
                    <input className="form-input pr-12" type={showPw?'text':'password'} placeholder="Min. 6 characters"
                      value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
                    <button type="button" onClick={()=>setShowPw(v=>!v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                      {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                  </div>
                </div>
                <button onClick={handleCreate} disabled={loading}
                  className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-black p-4 rounded-xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                  {loading ? <><Loader2 size={16} className="animate-spin"/> Creating...</> : <><UserPlus size={16}/> Create Account</>}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STAFF LIST */}
      {tab === 'staff' && (
        <div className="dashboard-card p-8">
          <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-4">
            <h3 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2">
              <Users size={15} className="text-amber-400"/> All Staff
            </h3>
          </div>
          <div className="relative mb-4">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
            <input className="form-input pl-9" placeholder="Search staff..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <div className="space-y-3">
            {filtStaff.map(s => (
              <div key={s.id} className="p-5 bg-black/20 rounded-2xl border border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className={`p-2 bg-white/5 rounded-xl ${ROLE_COLOR[s.role]||'text-amber-400'}`}>
                    {s.role==='triage' ? <Activity size={16}/> : <Stethoscope size={16}/>}
                  </div>
                  <div>
                    <p className="text-white font-bold">{s.full_name}</p>
                    <p className="text-gray-500 text-xs font-mono">{s.username}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 bg-white/5 rounded-lg text-[10px] font-black uppercase tracking-widest ${ROLE_COLOR[s.role]||'text-amber-400'}`}>
                    {ROLE_LABEL[s.role]}
                  </span>
                  <button onClick={() => handleDelete(s.id, s.username)}
                    className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500/20 transition-all">
                    <Trash2 size={14}/>
                  </button>
                </div>
              </div>
            ))}
            {filtStaff.length === 0 && <p className="text-center text-gray-700 text-xs font-bold uppercase py-8 tracking-widest">No staff found</p>}
          </div>
        </div>
      )}
    </div>
  );
};