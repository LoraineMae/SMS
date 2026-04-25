import React from 'react';
import { User, ClipboardList, Stethoscope, BarChart3, ShieldCheck, Activity, ArrowLeft,
         UserPlus, Users, Trash2, AlertCircle, Loader2, Search, Edit2,
         Clock, CheckCircle, Download, TrendingUp } from 'lucide-react';
import { supabase as _supabase } from '../lib/supabase';
import bcrypt from 'bcryptjs';

// ─── SUPABASE ─────────────────────────────────────────────────────────────────
// Use singleton to avoid GoTrueClient multiple-instance warnings
const getSupabase = async () => _supabase;

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

// ─── PATIENT DETAIL MODAL ─────────────────────────────────────────────────────
const PatientDetailModal = ({ patient, onClose }) => {
  if (!patient) return null;
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-PH', { year:'numeric', month:'long', day:'numeric' }) : '—';

  const topFields = [
    { label:'Queue #',       val: patient.ticket_number ? `#${patient.ticket_number}` : '—' },
    { label:'Gender',        val: patient.gender || '—' },
    { label:'Date of Birth', val: formatDate(patient.dob) },
    { label:'Phone',         val: patient.phone || '—' },
    { label:'Arrived',       val: new Date(patient.arrival_time).toLocaleString('en-PH') },
    { label:'Status',        val: patient.status === 'done' ? 'Consulted ✓' : 'Waiting' },
  ];

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem', overflowY:'auto' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'#ffffff', borderRadius:'1.5rem', border:'1px solid rgba(34,197,94,0.2)', padding:'1.75rem', maxWidth:'460px', width:'100%', boxShadow:'0 20px 60px rgba(0,80,30,0.15)', maxHeight:'92vh', overflowY:'auto' }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'flex-end', alignItems:'flex-start', marginBottom:'1.25rem' }}>
          <button onClick={onClose} style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', color:'#ef4444', borderRadius:'0.5rem', padding:'6px 10px', cursor:'pointer', fontWeight:700, fontSize:'11px' }}>✕</button>
        </div>

        {/* Urgency + Name hero row */}
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', background:'#f0faf4', borderRadius:'0.75rem', padding:'0.85rem 1rem', marginBottom:'1rem' }}>
          <UrgencyBadge urgency={patient.urgency}/>
          <span style={{ color:'#1a3a2a', fontWeight:700, fontSize:'13px' }}>{patient.fullname}</span>
        </div>

        {/* Grid of detail boxes */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem', marginBottom:'0.75rem' }}>
          {topFields.map(row => (
            <div key={row.label} style={{ background:'#f8fffe', border:'1px solid rgba(34,197,94,0.15)', borderRadius:'0.75rem', padding:'0.65rem 0.85rem' }}>
              <p style={{ color:'#9ca3af', fontSize:'9px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', margin:'0 0 3px' }}>{row.label}</p>
              <p style={{ color:'#1a3a2a', fontSize:'12px', fontWeight:700, margin:0, wordBreak:'break-word' }}>{row.val}</p>
            </div>
          ))}
        </div>

        {/* Condition — full width box */}
        <div style={{ background:'#f8fffe', border:'1px solid rgba(34,197,94,0.15)', borderRadius:'0.75rem', padding:'0.75rem 0.85rem', marginBottom:'0.5rem' }}>
          <p style={{ color:'#9ca3af', fontSize:'9px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', margin:'0 0 4px' }}>Condition</p>
          <p style={{ color:'#1a3a2a', fontSize:'12px', fontWeight:600, margin:0, lineHeight:1.6 }}>{patient.condition}</p>
        </div>

        {/* Doctor Notes — full width box if present */}
        {patient.doctor_notes && (
          <div style={{ background:'#fffbf0', border:'1px solid rgba(245,158,11,0.2)', borderRadius:'0.75rem', padding:'0.75rem 0.85rem', marginBottom:'0.5rem' }}>
            <p style={{ color:'#d97706', fontSize:'9px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', margin:'0 0 4px' }}>Doctor Notes</p>
            <p style={{ color:'#1a3a2a', fontSize:'12px', fontWeight:600, margin:0, lineHeight:1.6 }}>{patient.doctor_notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── ROLE SELECTION ───────────────────────────────────────────────────────────
export const RoleSelectionScreen = ({ onSelect }) => {
  const [activeNav,  setActiveNav]  = React.useState(null); // 'login' | 'about' | 'contact'

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background:'#f0faf4', fontFamily:'Poppins, sans-serif', overflow:'hidden' }}>

      {/* ══════════════════════════════════════
          NAVBAR — matches reference style
      ══════════════════════════════════════ */}
      <nav style={{
        background:'linear-gradient(135deg, #14532d, #166534)',
        padding:'0 2.5rem',
        height:'68px',
        display:'flex',
        alignItems:'center',
        justifyContent:'space-between',
        boxShadow:'0 2px 12px rgba(0,0,0,0.3)',
        position:'sticky',
        top:0,
        zIndex:100,
      }}>
        {/* Left — Logo + Name */}
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <div style={{ width:44, height:44, borderRadius:'50%', background:'rgba(255,255,255,0.15)', border:'2px solid rgba(255,255,255,0.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Activity color="white" size={22}/>
          </div>
          <div>
            <div style={{ fontWeight:900, fontSize:'1.1rem', fontStyle:'italic', letterSpacing:'-1px', color:'white', lineHeight:1 }}>
              HEALTH<span style={{ color:'#86efac' }}>FLOW</span>
            </div>
            <div style={{ fontSize:'9px', fontWeight:600, color:'rgba(255,255,255,0.55)', textTransform:'uppercase', letterSpacing:'0.2em', marginTop:2 }}>
              Priority Triage System
            </div>
          </div>
        </div>

        {/* Right — Nav Links */}
        <div style={{ display:'flex', alignItems:'center', gap:'0.25rem' }}>
          {[
            { key:'about',   label:'ABOUT'   },
            { key:'contact', label:'CONTACT' },
            { key:'login',   label:'STAFF LOGIN' },
          ].map(item => (
            <button
              key={item.key}
              onClick={() => setActiveNav(activeNav === item.key ? null : item.key)}
              style={{
                background: activeNav === item.key ? 'rgba(255,255,255,0.18)' : 'transparent',
                border:'none',
                color:'white',
                padding:'0.6rem 1.25rem',
                borderRadius:'0.5rem',
                fontWeight:700,
                fontSize:'12px',
                letterSpacing:'0.12em',
                cursor:'pointer',
                textTransform:'uppercase',
                transition:'background 0.15s',
                display:'flex',
                alignItems:'center',
                gap:'5px',
              }}
              onMouseOver={e => { if(activeNav !== item.key) e.currentTarget.style.background='rgba(255,255,255,0.1)'; }}
              onMouseOut={e => { if(activeNav !== item.key) e.currentTarget.style.background='transparent'; }}
            >
              {item.label}
              {item.key === 'login' && <span style={{ fontSize:'10px', opacity:0.7 }}>▾</span>}
            </button>
          ))}
        </div>
      </nav>

      {/* ══════════════════════════════════════
          DROPDOWN PANELS
      ══════════════════════════════════════ */}

      {/* About dropdown */}
      {activeNav === 'about' && (
        <div style={{ background:'white', borderBottom:'2px solid rgba(22,101,52,0.15)', boxShadow:'0 8px 24px rgba(0,0,0,0.08)', padding:'2rem 3rem', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'2rem', maxWidth:'860px', margin:'0 auto', width:'100%' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'0.75rem' }}>
              <Activity color="#16a34a" size={18}/>
              <span style={{ fontWeight:900, fontSize:'1rem', fontStyle:'italic', color:'#1a3a2a' }}>HEALTH<span style={{ color:'#16a34a' }}>FLOW</span></span>
            </div>
            <p style={{ color:'#4b7a5a', fontSize:'12.5px', lineHeight:1.75, margin:'0 0 0.75rem' }}>
              A Priority-Based Patient Scheduling System designed to automate triage and manage patient queues in real time.
            </p>
            <p style={{ color:'#9ca3af', fontSize:'11.5px', lineHeight:1.75, margin:0 }}>
              Patients are sorted by urgency level — Critical, High, Medium, and Low — ensuring the most critical cases are always attended to first.
            </p>
          </div>
          <div>
            <p style={{ color:'#9ca3af', fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.15em', margin:'0 0 10px' }}>Built With</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'1rem' }}>
              {['React','Vite','Supabase','bcrypt','EmailJS'].map(t => (
                <span key={t} style={{ background:'#f0faf4', border:'1px solid rgba(34,197,94,0.2)', color:'#16a34a', fontSize:'10px', fontWeight:700, padding:'4px 12px', borderRadius:'20px' }}>{t}</span>
              ))}
            </div>
            <p style={{ color:'#9ca3af', fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.15em', margin:'0 0 6px' }}>Developer</p>
            <p style={{ color:'#1a3a2a', fontSize:'12px', fontWeight:600, margin:0 }}>Department of Computer Science</p>
            <p style={{ color:'#4b7a5a', fontSize:'11px', margin:'2px 0 0' }}>Mariano Marcos State University — CCIS</p>
          </div>
        </div>
      )}

      {/* Contact dropdown */}
      {activeNav === 'contact' && (
        <div style={{ background:'white', borderBottom:'2px solid rgba(22,101,52,0.15)', boxShadow:'0 8px 24px rgba(0,0,0,0.08)', padding:'2rem 3rem', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'2rem', maxWidth:'860px', margin:'0 auto', width:'100%' }}>
          <div>
            <p style={{ color:'#9ca3af', fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.15em', margin:'0 0 6px' }}>Institution</p>
            <p style={{ color:'#1a3a2a', fontSize:'12.5px', fontWeight:700, margin:'0 0 4px' }}>Mariano Marcos State University</p>
            <p style={{ color:'#4b7a5a', fontSize:'11.5px', margin:0 }}>College of Computing and Information Sciences</p>
          </div>
          <div>
            <p style={{ color:'#9ca3af', fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.15em', margin:'0 0 6px' }}>Department</p>
            <p style={{ color:'#1a3a2a', fontSize:'12.5px', fontWeight:700, margin:'0 0 12px' }}>Department of Computer Science</p>
            <p style={{ color:'#9ca3af', fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.15em', margin:'0 0 6px' }}>Email</p>
            <p style={{ color:'#16a34a', fontSize:'12px', fontWeight:600, margin:0 }}>lorainemaemaramba@gmail.com</p>
          </div>
          <div>
            <p style={{ color:'#9ca3af', fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.15em', margin:'0 0 6px' }}>Support</p>
            <p style={{ color:'#4b7a5a', fontSize:'11.5px', lineHeight:1.65, margin:0 }}>For system issues, please approach any clinic staff or the system administrator for assistance.</p>
          </div>
        </div>
      )}

      {/* Staff Login dropdown */}
      {activeNav === 'login' && (
        <div style={{ background:'white', borderBottom:'2px solid rgba(22,101,52,0.15)', boxShadow:'0 8px 24px rgba(0,0,0,0.08)', padding:'1.5rem 3rem', display:'flex', gap:'1rem', justifyContent:'flex-end', maxWidth:'100%' }}>
          {[
            { id:'triage',  label:'Nurse Login',   icon:<Activity size={16}/>,    color:'#16a34a', bg:'rgba(22,163,74,0.08)',  border:'rgba(22,163,74,0.2)'  },
            { id:'doctor',  label:'Doctor Login',  icon:<Stethoscope size={16}/>, color:'#0d9488', bg:'rgba(13,148,136,0.08)', border:'rgba(13,148,136,0.2)' },
            { id:'manager', label:'Manager Login', icon:<BarChart3 size={16}/>,   color:'#d97706', bg:'rgba(217,119,6,0.08)',  border:'rgba(217,119,6,0.2)'  },
          ].map(role => (
            <button
              key={role.id}
              onClick={() => onSelect(role.id)}
              style={{ display:'flex', alignItems:'center', gap:'8px', padding:'0.75rem 1.5rem', borderRadius:'0.75rem', background:role.bg, border:`1px solid ${role.border}`, color:role.color, cursor:'pointer', fontWeight:700, fontSize:'12px', textTransform:'uppercase', letterSpacing:'0.1em', transition:'all 0.15s' }}
              onMouseOver={e => e.currentTarget.style.opacity='0.8'}
              onMouseOut={e => e.currentTarget.style.opacity='1'}
            >
              {role.icon}
              {role.label}
            </button>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════
          HERO — Patient Registration
      ══════════════════════════════════════ */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'clamp(2rem,5vw,4rem) 1.25rem' }}>
        <div style={{ textAlign:'center', marginBottom:'3rem', maxWidth:'520px', width:'100%' }}>
          <h1 style={{ fontWeight:900, fontSize:'clamp(2.2rem,8vw,3.2rem)', fontStyle:'italic', letterSpacing:'-2px', color:'#1a3a2a', margin:'0 0 1rem', lineHeight:1 }}>
            HEALTH<span style={{ color:'#16a34a' }}>FLOW</span>
          </h1>
          <p style={{ color:'#4b7a5a', fontSize:'clamp(0.875rem,3vw,1rem)', fontWeight:500, margin:'0 0 0.5rem', lineHeight:1.6 }}>
            Priority-Based Patient Scheduling System
          </p>
          <p style={{ color:'#9ca3af', fontSize:'13px', margin:0 }}>
            Walk in, register, and we'll take care of the rest.
          </p>
        </div>

        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'1.5rem', width:'100%', maxWidth:'380px', padding:'0 1rem' }}>
          <button
            onClick={() => onSelect('patient')}
            style={{ width:'100%', background:'#16a34a', color:'white', border:'none', padding:'1.1rem 1.5rem', borderRadius:'1rem', fontWeight:800, fontSize:'clamp(0.85rem,3vw,1rem)', textTransform:'uppercase', letterSpacing:'0.12em', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10, boxShadow:'0 4px 20px rgba(22,163,74,0.3)', transition:'all 0.2s', whiteSpace:'nowrap' }}
            onMouseOver={e => e.currentTarget.style.background='#15803d'}
            onMouseOut={e => e.currentTarget.style.background='#16a34a'}
          >
            <User size={20}/>
            Register as Patient
          </button>
          <p style={{ color:'#9ca3af', fontSize:'11px', textAlign:'center', lineHeight:1.6, margin:0 }}>
            Click to register and join the queue.<br/>A nurse will assess your condition shortly.
          </p>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ textAlign:'center', padding:'1.5rem', color:'rgba(107,114,128,0.5)', fontSize:'10px', fontWeight:600, letterSpacing:'0.15em', textTransform:'uppercase', borderTop:'1px solid rgba(34,197,94,0.1)' }}>
        HealthFlow Priority Triage System · Mariano Marcos State University
      </footer>

    </div>
  );
};

// ─── QUEUE TICKET INLINE ──────────────────────────────────────────────────────
const QueueTicketInline = ({ patient, onBack }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-[#f0faf4] p-8">
    <div className="text-center mb-8">
      <h2 className="text-3xl font-black text-[var(--text-primary,#1a3a2a)] italic tracking-tighter">HEALTH<span className="text-green-600">FLOW</span></h2>
      <p className="text-green-600/60 uppercase text-[10px] tracking-[0.3em] mt-2 font-bold">Registration Confirmed</p>
    </div>
    <div className="dashboard-card w-full max-w-sm overflow-hidden p-0">
      <div className="bg-green-500 py-2 text-center">
        <span className="text-white font-black text-[11px] uppercase tracking-widest">You are now in the queue</span>
      </div>
      <div className="p-8 text-[var(--text-primary,#1a3a2a)]">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-green-100 border-2 border-green-400/40 flex items-center justify-center">
            <CheckCircle className="text-green-600" size={32} />
          </div>
        </div>
        <div className="text-center mb-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-1">Registered Patient</p>
          <h2 className="text-3xl font-black text-[var(--text-primary,#1a3a2a)]">{patient.fullname}</h2>
        </div>
        <div className="text-center border-2 border-dashed border-green-400/40 rounded-2xl p-6 mb-4 bg-green-50">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 mb-2">Your Ticket Number</p>
          <div className="text-6xl font-black text-green-600 leading-none">#{patient.ticket_number || '—'}</div>
          <p className="text-gray-500 text-[11px] mt-2">Remember this number</p>
        </div>
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-3">
          <Clock size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-600 text-xs font-bold uppercase mb-1">Awaiting Assessment</p>
            <p className="text-amber-700/70 text-[11px] leading-relaxed">A nurse will assess your condition and assign your priority. Please remain in the waiting area.</p>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <p className="text-green-600 text-xs font-bold uppercase mb-1">Queue Monitor</p>
          <p className="text-green-700/60 text-[11px] leading-relaxed">Watch the waiting room display screen to track your queue position.</p>
        </div>
        <button onClick={onBack}
          className="w-full flex items-center justify-center gap-2 border border-green-200 text-green-600 hover:bg-green-50 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors">
          <ArrowLeft size={14} /> Back to Home
        </button>
      </div>
    </div>
  </div>
);

// ─── PATIENT INTAKE FORM ──────────────────────────────────────────────────────
export const PatientIntakeForm = ({ formData, setFormData, addPatient: addPatientProp, formError: externalError }) => {
  const [localForm, setLocalForm] = React.useState(formData || { fullname:'', dob:'', gender:'', phone:'', condition:'' });
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted,  setSubmitted]  = React.useState(false);
  const [ticket,     setTicket]     = React.useState(null);
  const [errors,     setErrors]     = React.useState({});
  const [submitError, setSubmitError] = React.useState('');

  const form    = formData || localForm;
  const setForm = setFormData || setLocalForm;

  const validate = () => {
    const newErrors = {};
    if (!form.fullname.trim())          newErrors.fullname  = 'Full name is required.';
    if (!form.dob)                      newErrors.dob       = 'Date of birth is required.';
    else if (form.dob === 'Invalid date' || new Date(form.dob).toString() === 'Invalid Date') newErrors.dob = 'Invalid date.';
    else if (new Date(form.dob) > new Date()) newErrors.dob = 'Invalid Date.';
    if (!form.gender)                   newErrors.gender    = 'Gender is required.';
    if (!form.phone.trim())             newErrors.phone     = 'Phone number is required.';
    else if (!/^09\d{9}$/.test(form.phone.trim())) newErrors.phone = 'Phone number must start with 09 and be 11 digits.';
    if (!form.condition.trim())         newErrors.condition = 'Condition / symptoms is required.';
    return newErrors;
  };

  const handleSubmit = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setErrors({});
    setSubmitError('');
    setSubmitting(true);
    try {
      const sb = await getSupabase();
      const { data, error } = await sb.from('patients').insert({
        fullname:     form.fullname.trim(),
        dob:          form.dob,
        gender:       form.gender,
        phone:        form.phone.trim(),
        condition:    form.condition.trim(),
        urgency:      'medium',
        arrival_time: new Date().toISOString(),
      }).select().single();
      if (error) throw error;
      setTicket(data);
      setSubmitted(true);
      // NOTE: We do NOT call addPatientProp() here — the insert already happened above.
      // Calling it would cause a duplicate patient record.
    } catch(e) {
      console.error(e);
      setSubmitError('Registration failed. Please check your connection and try again.');
    } finally { setSubmitting(false); }
  };

  // Only allow digits, force 09 prefix
  const handlePhoneChange = (e) => {
    let val = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
    if (val.length === 1 && val !== '0') val = '0';
    if (val.length >= 2 && !val.startsWith('09')) val = '09' + val.slice(2);
    setForm({...form, phone: val});
    if (errors.phone) setErrors({...errors, phone: ''});
  };

  if (submitted && ticket) return (
    <QueueTicketInline patient={ticket} onBack={() => {
      setSubmitted(false); setTicket(null);
      setForm({ fullname:'', dob:'', gender:'', phone:'', condition:'' });
    }}/>
  );

  const FieldError = ({ field }) => errors[field]
    ? <p className="text-red-500 text-[11px] mt-1 ml-2 font-semibold">⚠ {errors[field]}</p>
    : null;

  return (
    <div className="max-w-2xl mx-auto dashboard-card p-10 text-[var(--text-primary,#1a3a2a)]">
      <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 border-b border-green-100 pb-4 text-[var(--text-primary,#1a3a2a)]">
        <ClipboardList className="text-green-600"/> Patient Registration
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <div className="md:col-span-2">
          <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block ml-2">Full Name <span className="text-red-500">*</span></label>
          <input
            className={`form-input ${errors.fullname ? 'border-red-400' : ''}`}
            placeholder="Full name"
            value={form.fullname}
            onChange={e => { setForm({...form, fullname: e.target.value}); if(errors.fullname) setErrors({...errors, fullname:''}); }}
          />
          <FieldError field="fullname"/>
        </div>
        <div>
          <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block ml-2">Date of Birth <span className="text-red-500">*</span></label>
          <input
            type="date"
            max={new Date().toISOString().split('T')[0]}
            className={`form-input ${errors.dob ? 'border-red-400' : ''}`}
            value={form.dob}
            onChange={e => { setForm({...form, dob: e.target.value}); if(errors.dob) setErrors({...errors, dob:''}); }}
          />
          <FieldError field="dob"/>
        </div>
        <div>
          <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block ml-2">Gender <span className="text-red-500">*</span></label>
          <select
            className={`form-input ${errors.gender ? 'border-red-400' : ''}`}
            value={form.gender}
            onChange={e => { setForm({...form, gender: e.target.value}); if(errors.gender) setErrors({...errors, gender:''}); }}
          >
            <option value="">Select</option>
            <option>Male</option>
            <option>Female</option>
          </select>
          <FieldError field="gender"/>
        </div>
      </div>
      <div className="space-y-5">
        <div>
          <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block ml-2">Phone Number <span className="text-red-500">*</span></label>
          <input
            className={`form-input ${errors.phone ? 'border-red-400' : ''}`}
            placeholder="09XXXXXXXXX (11 digits)"
            value={form.phone}
            onChange={handlePhoneChange}
            maxLength={11}
            inputMode="numeric"
          />
          <div className="flex justify-between items-center mt-1 ml-2">
            <FieldError field="phone"/>
            <span className={`text-[11px] font-semibold ml-auto ${form.phone.length === 11 ? 'text-green-500' : 'text-gray-400'}`}>
              {form.phone.length}/11
            </span>
          </div>
        </div>
        <div>
          <label className="text-[10px] uppercase font-bold text-green-600 mb-1 block ml-2">Condition / Symptoms <span className="text-red-500">*</span></label>
          <textarea
            className={`form-input h-32 ${errors.condition ? 'border-red-400' : ''}`}
            placeholder="Describe your condition..."
            value={form.condition}
            onChange={e => { setForm({...form, condition: e.target.value}); if(errors.condition) setErrors({...errors, condition:''}); }}
          />
          <FieldError field="condition"/>
        </div>
        {(submitError || externalError) && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm font-semibold">
            <span>⚠ {submitError || externalError}</span>
          </div>
        )}
        <button onClick={handleSubmit} disabled={submitting}
          className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-60 p-4 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 text-white">
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
    triage:  { color: 'text-green-600',  Icon: Activity    },
    doctor:  { color: 'text-emerald-600',Icon: Stethoscope },
    manager: { color: 'text-teal-600',   Icon: BarChart3   },
  }[role] || { color: 'text-green-600', Icon: Activity };

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
    <div className="min-h-screen flex items-center justify-center" style={{background:"var(--bg-page)"}}>
      <div className="dashboard-card w-full max-w-md p-10" style={{color:"var(--text-primary)"}}>
        <button onClick={onBack} className="text-gray-400 mb-6 flex items-center gap-1 text-xs uppercase font-bold hover:text-green-700">
          <ArrowLeft size={14}/> BACK
        </button>
        <div className="text-center mb-8">
          <div className={`inline-block p-4 rounded-2xl mb-4 ${THEME.color}`} style={{background:"var(--bg-nav-active)"}}>
            <THEME.Icon size={32}/>
          </div>
          <h2 className="text-xl font-bold uppercase tracking-widest" style={{color:"var(--text-primary)"}}>{roleLabel} Authentication</h2>
          <p className="text-gray-400 text-[10px] uppercase tracking-[0.2em] mt-1">Secure Access</p>
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
            <input className="form-input" type="password" placeholder="Enter your password"
              value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key==='Enter' && handleSubmit()} disabled={isLoading}/>
          </div>
          <button onClick={handleSubmit} disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white p-4 rounded-xl font-bold transition-all uppercase flex items-center justify-center gap-2">
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
  const [search,          setSearch]          = React.useState('');
  const [filter,          setFilter]          = React.useState('all');
  const [updating,        setUpdating]        = React.useState(null);
  const [ownPats,         setOwnPats]         = React.useState([]);
  const [selectedPatient, setSelectedPatient] = React.useState(null);

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

  const [shift,        setShift]        = React.useState('today');
  const [statusFilter, setStatusFilter] = React.useState('all'); // 'all' | 'waiting' | 'done'
  const shiftFilter = (p) => {
    const t = new Date(p.arrival_time), now = new Date();
    if (shift === 'today') return t.toDateString() === now.toDateString();
    if (shift === 'week')  return t >= new Date(now - 7 * 24 * 60 * 60 * 1000);
    return true;
  };

  const counts = { critical:0, high:0, medium:0, low:0 };
  patients.filter(p => p.status !== 'done').filter(shiftFilter).forEach(p => { if (counts[p.urgency] !== undefined) counts[p.urgency]++; });

  const sorted = getSortedPatients()
    .filter(p => statusFilter === 'waiting' ? p.status !== 'done' : statusFilter === 'done' ? p.status === 'done' : statusFilter === 'waiting_done' ? p.status === 'done' || p.status !== 'done' : true)
    .filter(shiftFilter)
    .filter(p => (filter==='all' || p.urgency===filter) &&
      (p.fullname.toLowerCase().includes(search.toLowerCase()) || p.condition.toLowerCase().includes(search.toLowerCase())));

  const doneCount    = getSortedPatients().filter(shiftFilter).filter(p => p.status === 'done').length;
  const waitingCount = getSortedPatients().filter(shiftFilter).filter(p => p.status !== 'done').length;

  return (
    <div className="p-4 sm:p-8 text-[var(--text-primary,#1a3a2a)]">
      <PatientDetailModal patient={selectedPatient} onClose={() => setSelectedPatient(null)}/>
      <div className="mb-6">
        <h2 style={{color:"#0f172a",fontWeight:900,fontSize:"1.65rem",margin:0,lineHeight:1.1}}>Triage Dashboard</h2>
        <p className="text-green-600/60 text-[10px] uppercase tracking-[0.3em] font-bold mt-2">Manage Patient Urgency Levels</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
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
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={13} style={{position:"absolute",left:"12px",top:"50%",transform:"translateY(-50%)",opacity:0.45,color:"var(--text-muted)",pointerEvents:"none"}}/>
          <input className="form-input" style={{paddingLeft:"36px"}} placeholder="Search patients..." value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <div className="grid grid-cols-3 sm:flex gap-3">
          <select className="form-input" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">All Levels</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select className="form-input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Patients</option>
            <option value="waiting">Waiting Only</option>
            <option value="done">Finished Only</option>
          </select>

          <select className="form-input" value={shift} onChange={e => setShift(e.target.value)}>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Queue */}
      <div className="dashboard-card p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-[var(--text-primary,#1a3a2a)] font-black text-xs uppercase tracking-widest">Live Priority Queue</h3>
            <p className="text-gray-400 text-[11px] mt-1">
              <span className="text-blue-400 font-bold">{waitingCount} waiting</span>
              <span className="mx-2 text-gray-300">·</span>
              <span className="text-green-500 font-bold">{doneCount} consulted</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="animate-pulse flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"/>
              <span className="text-[10px] font-bold text-gray-400 tracking-widest">LIVE</span>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {sorted.length === 0
            ? <div className="text-center py-20 text-gray-600 font-bold uppercase tracking-widest text-sm">
                {search || filter !== 'all' ? 'No patients match your filter' : 'No Active Patients'}
              </div>
            : sorted.map((p, i) => (
              <div key={p.id} style={{background: p.status==='done' ? 'var(--bg-input)' : 'var(--bg-nav-active)', border: `1px solid ${p.status==='done' ? 'var(--border)' : 'var(--border-input)'}`, opacity: p.status==='done' ? 0.75 : 1}} className="p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`text-2xl font-black shrink-0 w-8 text-center ${p.status === 'done' ? 'text-green-400 text-lg' : 'text-green-200'}`}>
                    {p.status === 'done' ? '✓' : (i+1).toString().padStart(2,'0')}
                  </div>
                  <div className="min-w-0 cursor-pointer flex-1" onClick={() => setSelectedPatient(p)}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-[var(--text-primary,#1a3a2a)] text-base sm:text-lg truncate hover:text-green-600 transition-colors">{p.fullname}</p>
                      {p.status === 'done' && <span className="px-2 py-0.5 bg-green-500/20 text-green-600 rounded text-[9px] font-black uppercase shrink-0">Consulted</span>}
                    </div>
                    <p className="text-sm text-gray-400 italic truncate hover:text-green-500 transition-colors">"{p.condition}"</p>
                    <p className="text-gray-400 text-[11px] mt-1 flex items-center gap-1">
                      <Clock size={10}/> {timeAgo(p.arrival_time)}
                      <span className="ml-2 text-green-400 text-[10px] font-bold">· tap for details</span>
                    </p>
                  </div>
                </div>
                <div className="shrink-0 self-end sm:self-auto">
                  {p.status === 'done'
                    ? <span className="text-green-500 text-[11px] font-black uppercase">✓ Done</span>
                    : updating === p.id
                      ? <Loader2 size={16} className="text-green-400 animate-spin"/>
                      : <select value={p.urgency} onChange={e => updateUrgency(p.id, e.target.value)}
                          className="bg-white border border-green-200 text-[var(--text-primary,#1a3a2a)] px-3 py-2 rounded-lg font-bold text-[11px] uppercase cursor-pointer w-full sm:w-auto">
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

  const [completing,      setCompleting]      = React.useState(false);
  const [history,         setHistory]         = React.useState([]);
  const [tab,             setTab]             = React.useState('queue');
  const [notes,           setNotes]           = React.useState('');
  const [shiftDoc,        setShiftDoc]        = React.useState('today');
  const [selectedPatient, setSelectedPatient] = React.useState(null);

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
    <div className="p-4 sm:p-8 text-[var(--text-primary,#1a3a2a)]">
      <PatientDetailModal patient={selectedPatient} onClose={() => setSelectedPatient(null)}/>
      <div className="mb-6">
        <h2 style={{color:"#0f172a",fontWeight:900,fontSize:"1.65rem",margin:0,lineHeight:1.1}}>Doctor Dashboard</h2>
        <p className="text-green-600/60 text-[10px] uppercase tracking-[0.3em] font-bold mt-2">Patient Consultation Queue</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[{ id:'queue', label:'Queue' }, { id:'history', label:'History' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-5 py-2 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${
              tab === t.id ? 'bg-emerald-500 text-white' : 'bg-green-50 text-gray-400 hover:text-green-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'queue' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Current patient */}
          <div className="dashboard-card p-10 text-center">
            <div className="p-6 bg-emerald-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <Stethoscope className="text-emerald-600" size={40}/>
            </div>
            <h3 className="text-gray-400 uppercase text-xs font-black tracking-widest mb-2">Now Consulting</h3>
            {current ? (
              <>
                <h2 className="text-4xl font-bold text-[var(--text-primary,#1a3a2a)] mb-3 cursor-pointer hover:text-green-600 transition-colors" onClick={() => setSelectedPatient(current)}>{current.fullname}</h2>
                <UrgencyBadge urgency={current.urgency}/>
                <div className="p-4 bg-green-50 border border-green-100 rounded-xl text-gray-500 text-sm my-4 italic">"{current.condition}"</div>
                <p className="text-gray-400 text-xs mb-5 flex items-center justify-center gap-1">
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
            ) : (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <div className="w-16 h-16 rounded-full bg-green-50 border border-green-100 flex items-center justify-center">
                  <CheckCircle size={32} className="text-green-400"/>
                </div>
                <p className="text-green-600 font-black text-sm uppercase tracking-widest">All Clear!</p>
                <p className="text-gray-400 text-xs text-center">No patients in queue.<br/>New patients will appear here automatically.</p>
              </div>
            )}
          </div>

          {/* Queue list */}
          <div className="dashboard-card p-8">
            <h3 className="text-[var(--text-primary,#1a3a2a)] font-black text-xs uppercase tracking-widest mb-4">Up Next ({queue.length})</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {queue.map((p, i) => (
                <div key={p.id} className="p-4 bg-green-50 rounded-2xl border border-green-100 flex items-center justify-between gap-3 cursor-pointer hover:border-green-300 transition-colors" onClick={() => setSelectedPatient(p)}>
                  <div className="text-xl font-black text-green-200 shrink-0">{(i+2).toString().padStart(2,'0')}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[var(--text-primary,#1a3a2a)] font-bold text-sm truncate hover:text-green-600">{p.fullname}</p>
                    <p className="text-gray-400 text-xs italic truncate">"{p.condition}"</p>
                  </div>
                  <UrgencyBadge urgency={p.urgency}/>
                </div>
              ))}
              {queue.length === 0 && (
                <p className="text-gray-400 text-xs font-bold uppercase text-center py-6 tracking-widest">No patients waiting</p>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="dashboard-card p-8">
          <div className="flex justify-between items-center mb-4 border-b border-green-100 pb-4">
            <h3 className="text-[var(--text-primary,#1a3a2a)] font-black text-xs uppercase tracking-widest">Consultation History</h3>
            <select className="form-input w-36 text-xs" value={shiftDoc} onChange={e => setShiftDoc(e.target.value)}>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="all">All Time</option>
            </select>
          </div>
          <div className="space-y-3">
            {history.filter(shiftFilterDoc).map(p => (
              <div key={p.id} className="p-4 bg-green-50 rounded-2xl border border-green-100 cursor-pointer hover:border-green-300 transition-colors" onClick={() => setSelectedPatient(p)}>
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="text-[var(--text-primary,#1a3a2a)] font-bold truncate">{p.fullname}</p>
                    <p className="text-gray-400 text-xs italic truncate">"{p.condition}"</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <UrgencyBadge urgency={p.urgency}/>
                    {p.completed_at && <p className="text-gray-400 text-[11px] mt-1">{timeAgo(p.completed_at)}</p>}
                  </div>
                </div>
                {p.doctor_notes && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 mt-3">
                    <p className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest mb-1">Doctor Notes</p>
                    <p className="text-emerald-700 text-xs">{p.doctor_notes}</p>
                  </div>
                )}
              </div>
            ))}
            {history.length === 0 && (
              <p className="text-center text-gray-400 text-xs font-bold uppercase py-8 tracking-widest">No history yet</p>
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
  const [tab,             setTab]             = React.useState('overview');
  const [shiftMgr,        setShiftMgr]        = React.useState('today');
  const [form,            setForm]            = React.useState({ fullName:'', username:'', password:'', role:'triage', email:'' });
  const [staffList,       setStaffList]       = React.useState([]);
  const [loading,         setLoading]         = React.useState(false);
  const [created,         setCreated]         = React.useState(null);
  const [error,           setError]           = React.useState('');
  const [showPw,          setShowPw]          = React.useState(false);
  const [search,          setSearch]          = React.useState('');
  const [selectedPatient, setSelectedPatient] = React.useState(null);
  const [editStaff,       setEditStaff]       = React.useState(null); // { id, full_name, username, role, email }
  const [editForm,        setEditForm]        = React.useState({ fullName:'', username:'', password:'', email:'' });
  const [editLoading,     setEditLoading]     = React.useState(false);
  const [editError,       setEditError]       = React.useState('');
  const [editSuccess,     setEditSuccess]     = React.useState('');
  const [mgrStatusFilter, setMgrStatusFilter] = React.useState('all'); // 'all' | 'waiting' | 'done'

  const handleEditOpen = (s) => {
    setEditStaff(s);
    setEditForm({ fullName: s.full_name, username: s.username, password: '', email: s.email || '' });
    setEditError(''); setEditSuccess('');
  };

  const handleEditSave = async () => {
    setEditError(''); setEditSuccess('');
    if (!editForm.fullName.trim()) return setEditError('Full name is required.');
    if (!editForm.username.trim()) return setEditError('Username is required.');
    setEditLoading(true);
    try {
      const sb     = await getSupabase();
      const bcrypt = await import('bcryptjs');
      // Check username conflict (exclude self)
      const { data: ex } = await sb.from('users').select('id').eq('username', editForm.username.trim()).neq('id', editStaff.id).limit(1);
      if (ex?.length > 0) { setEditError('Username already taken.'); setEditLoading(false); return; }
      const updates = { full_name: editForm.fullName.trim(), username: editForm.username.trim() };
      if (editForm.password.length >= 6) {
        updates.password = await bcrypt.hash(editForm.password, 12);
      } else if (editForm.password.length > 0 && editForm.password.length < 6) {
        setEditError('New password must be at least 6 characters.'); setEditLoading(false); return;
      }
      const { error: ue } = await sb.from('users').update(updates).eq('id', editStaff.id);
      if (ue) throw ue;
      // Send updated credentials by email if email provided
      if (editForm.email.includes('@')) {
        const emailjs = await import('@emailjs/browser');
        await emailjs.send('service_7uic23n','template_dq3c8lx',{
          to_email: editForm.email.trim(),
          to_name:  editForm.fullName.trim(),
          role:     { triage:'Nurse', doctor:'Doctor', manager:'Manager' }[editStaff.role] || editStaff.role,
          username: editForm.username.trim(),
          password: editForm.password || '(unchanged)',
        },'J3wTv46GcVJ6LLie3');
        setEditSuccess('Account updated and credentials sent to ' + editForm.email.trim());
      } else {
        setEditSuccess('Account updated successfully.');
      }
      loadStaff();
      setTimeout(() => setEditStaff(null), 1800);
    } catch(err) { setEditError('Failed to update. Try again.'); console.error(err);
    } finally { setEditLoading(false); }
  };

  const shiftFilterMgr = (p) => {
    const t = new Date(p.arrival_time), now = new Date();
    if (shiftMgr === 'today') return t.toDateString() === now.toDateString();
    if (shiftMgr === 'week')  return t >= new Date(now - 7 * 24 * 60 * 60 * 1000);
    return true;
  };

  const loadStaff = React.useCallback(async () => {
    const sb = await getSupabase();
    const { data } = await sb.from('users').select('id,username,role,full_name,created_at').order('created_at',{ascending:false});
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
      const hash = await bcrypt.hash(form.password, 12); /* Security: Hash the password */
      const { error: ie } = await sb.from('users').insert({ username:form.username.trim(), password:hash, role:form.role, full_name:form.fullName.trim() });
      if (ie) throw ie;
      const emailjs = await import('@emailjs/browser');
      await emailjs.send('service_7uic23n','template_dq3c8lx',{
        to_email:form.email.trim(), to_name:form.fullName.trim(),
        role:{triage:'Nurse',doctor:'Doctor',manager:'Manager'}[form.role],
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

  const handleUpdate = async () => {
    setEditError(''); setEditSuccess('');
    if (!editForm.fullName.trim())  return setEditError('Full name is required.');
    if (!editForm.username.trim())  return setEditError('Username is required.');
    if (!editForm.email.includes('@')) return setEditError('Valid email required.');
    setEditLoading(true);
    try {
      const sb = await getSupabase();
      // Check username not taken by someone else
      const { data: ex } = await sb.from('users').select('id').eq('username', editForm.username.trim()).neq('id', editStaff.id).limit(1);
      if (ex?.length > 0) { setEditError('Username already taken.'); setEditLoading(false); return; }
      const updateData = { full_name: editForm.fullName.trim(), username: editForm.username.trim() };
      if (editForm.password && editForm.password.length >= 6) {
        updateData.password = await bcrypt.hash(editForm.password, 12);
      }
      const { error: ue } = await sb.from('users').update(updateData).eq('id', editStaff.id);
      if (ue) throw ue;
      // Resend credentials via email if email provided
      if (editForm.email) {
        const emailjs = await import('@emailjs/browser');
        await emailjs.send('service_7uic23n','template_dq3c8lx',{
          to_email: editForm.email.trim(),
          to_name:  editForm.fullName.trim(),
          role:     {triage:'Nurse', doctor:'Doctor', manager:'Manager'}[editStaff.role],
          username: editForm.username.trim(),
          password: editForm.password || '(unchanged)',
        },'J3wTv46GcVJ6LLie3');
      }
      setEditSuccess('Account updated!' + (editForm.email ? ' Credentials re-sent to email.' : ''));
      loadStaff();
      setTimeout(() => { setEditStaff(null); setEditSuccess(''); }, 2000);
    } catch(err) { setEditError('Failed to update. Try again.'); console.error(err);
    } finally { setEditLoading(false); }
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

  const ROLE_COLOR = { triage:'text-green-600', doctor:'text-emerald-600', manager:'text-amber-600' };
  const ROLE_LABEL = { triage:'Nurse', doctor:'Doctor', manager:'Manager' };

  const filtStaff    = staffList.filter(s=>s.full_name.toLowerCase().includes(search.toLowerCase())||s.username.toLowerCase().includes(search.toLowerCase()));
  const filtPatients = patients
    .filter(p => mgrStatusFilter === 'waiting' ? p.status !== 'done' : mgrStatusFilter === 'done' ? p.status === 'done' : true)
    .filter(p=>p.fullname.toLowerCase().includes(search.toLowerCase())||p.condition.toLowerCase().includes(search.toLowerCase()));

  const TABS = ['overview','analytics','patients','create','staff'];
  const TAB_LABELS = { overview:'Overview', analytics:'Analytics', patients:'Patient Records', create:'+ Create Account', staff:'Staff List' };

  return (
    <div className="p-4 sm:p-8 text-[var(--text-primary,#1a3a2a)]">
      <PatientDetailModal patient={selectedPatient} onClose={() => setSelectedPatient(null)}/>
      <div className="mb-6">
        <h2 style={{color:"#0f172a",fontWeight:900,fontSize:"1.65rem",margin:0,lineHeight:1.1}}>Manager Dashboard</h2>
        <p className="text-green-600/60 text-[10px] uppercase tracking-[0.3em] font-bold mt-2">Staff, Analytics & Patient Overview</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map(t => (
          <button key={t} onClick={() => { setTab(t); setCreated(null); setError(''); setSearch(''); }}
            className={`px-4 py-2 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${
              tab === t ? 'bg-green-600 text-white' : 'bg-green-50 text-gray-400 hover:text-green-700'
            }`}>
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">Showing:</span>
            {['today','week','all'].map(s => (
              <button key={s} onClick={() => setShiftMgr(s)}
                className={`px-4 py-2 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all ${
                  shiftMgr === s ? 'bg-green-600 text-white' : 'bg-green-50 text-gray-400 hover:text-green-700'
                }`}>
                {s==='today'?'Today':s==='week'?'This Week':'All Time'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="dashboard-card p-6 sm:p-8 flex flex-col items-center justify-center text-center">
              <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.3em] mb-2">Total Patients</p>
              <div className="text-6xl font-black text-green-600">{filteredByShift.length}</div>
              <div className="flex gap-2 mt-3 flex-wrap justify-center">
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-[10px] font-black uppercase">{filteredByShift.filter(p=>p.status==='done').length} Done</span>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-[10px] font-black uppercase">{filteredByShift.filter(p=>p.status!=='done').length} Waiting</span>
              </div>
            </div>
            <div className="dashboard-card p-6 sm:p-8 flex flex-col items-center justify-center text-center">
              <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.3em] mb-2">Total Staff</p>
              <div className="text-6xl font-black text-emerald-600">{staffList.length}</div>
              <div className="flex gap-2 mt-3 flex-wrap justify-center">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-[10px] font-black uppercase">{staffList.filter(s=>s.role==='triage').length} Nurses</span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-lg text-[10px] font-black uppercase">{staffList.filter(s=>s.role==='doctor').length} Doctors</span>
              </div>
            </div>
          </div>

          <div className="dashboard-card p-6 sm:p-8">
            <div className="flex flex-wrap justify-between items-center mb-4 border-b border-green-100 pb-4 gap-3">
              <h3 className="text-[var(--text-primary,#1a3a2a)] font-black text-xs uppercase tracking-widest">Recent Activity</h3>
              <button onClick={exportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 border border-green-200 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-green-100 transition-all">
                <Download size={13}/> Export CSV
              </button>
            </div>
            {filteredByShift.slice(-5).reverse().map(p => (
              <div key={p.id} className="border-l-2 border-green-500 pl-4 mb-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 cursor-pointer hover:bg-green-50 rounded-r-lg pr-2 transition-colors" onClick={() => setSelectedPatient(p)}>
                <div className="min-w-0">
                  <span className="text-[var(--text-primary,#1a3a2a)] font-bold text-sm">{p.fullname}</span>
                  <span className="text-gray-400 text-xs"> — {p.condition}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <UrgencyBadge urgency={p.urgency}/>
                  <span className="text-gray-400 text-[11px]">{timeAgo(p.arrival_time)}</span>
                </div>
              </div>
            ))}
            {filteredByShift.length === 0 && <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">No patients yet</p>}
          </div>
        </div>
      )}

      {/* ANALYTICS */}
      {tab === 'analytics' && (
        <div className="flex flex-col gap-6">
          {/* Time filter */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">Showing:</span>
            {['today','week','all'].map(s => (
              <button key={s} onClick={() => setShiftMgr(s)}
                className={`px-4 py-2 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all ${
                  shiftMgr === s ? 'bg-green-600 text-white' : 'bg-green-50 text-gray-400 hover:text-green-700'
                }`}>
                {s==='today'?'Today':s==='week'?'This Week':'All Time'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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

          <div className="dashboard-card p-6 sm:p-8">
            <h3 className="text-[var(--text-primary,#1a3a2a)] font-black text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
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
                <div key={s.key} className="flex items-center gap-3 mb-4">
                  <div className="w-14 text-right text-[11px] font-bold uppercase text-gray-500">{s.label}</div>
                  <div className="flex-1 bg-green-100 rounded-full h-6 overflow-hidden">
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

          <div className="grid grid-cols-3 gap-3">
            {[
              { label:'Total Patients', val:filteredByShift.length,                              text:'text-green-600' },
              { label:'Consulted',      val:filteredByShift.filter(p=>p.status==='done').length, text:'text-green-400' },
              { label:'Waiting',        val:filteredByShift.filter(p=>p.status!=='done').length, text:'text-blue-400'  },
            ].map(s => (
              <div key={s.label} className="dashboard-card p-4 sm:p-8 text-center">
                <div className={`text-3xl sm:text-4xl font-black ${s.text}`}>{s.val}</div>
                <div className="text-[10px] font-bold uppercase text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PATIENT RECORDS */}
      {tab === 'patients' && (
        <div className="dashboard-card p-6 sm:p-8">
          <div className="flex flex-wrap justify-between items-center mb-4 border-b border-green-100 pb-4 gap-3">
            <h3 className="text-[var(--text-primary,#1a3a2a)] font-black text-xs uppercase tracking-widest">All Patient Records</h3>
            <div className="flex items-center gap-2">
              <select className="form-input text-xs" value={mgrStatusFilter} onChange={e => setMgrStatusFilter(e.target.value)}>
                <option value="all">All Patients</option>
                <option value="waiting">Waiting Only</option>
                <option value="done">Finished Only</option>
              </select>
              <button onClick={exportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 border border-green-200 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-green-100 transition-all">
                <Download size={13}/> Export CSV
              </button>
            </div>
          </div>
          <div className="relative mb-4">
            <Search size={13} style={{position:"absolute",left:"12px",top:"50%",transform:"translateY(-50%)",opacity:0.45,color:"var(--text-muted)",pointerEvents:"none"}}/>
            <input className="form-input" style={{paddingLeft:"36px"}} placeholder="Search patients..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {filtPatients.map(p => (
              <div key={p.id} className="p-4 sm:p-5 bg-green-50 rounded-2xl border border-green-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 cursor-pointer hover:border-green-300 transition-colors" onClick={() => setSelectedPatient(p)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[var(--text-primary,#1a3a2a)] font-bold truncate">{p.fullname}</p>
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
            {filtPatients.length === 0 && <p className="text-center text-gray-400 text-xs font-bold uppercase py-8 tracking-widest">No records found</p>}
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
                  <h3 className="text-[var(--text-primary,#1a3a2a)] font-black text-lg">Account Created!</h3>
                  <p className="text-green-400 text-xs mt-1">Credentials sent to {created.email}</p>
                </div>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-2xl p-6 space-y-3 mb-4">
                {[
                  { label:'Role',     val:ROLE_LABEL[created.role], cls:'text-green-600'            },
                  { label:'Name',     val:created.fullName,         cls:'text-[var(--text-primary,#1a3a2a)]'            },
                  { label:'Email',    val:created.email,            cls:'text-[var(--text-primary,#1a3a2a)]'            },
                  { label:'Username', val:created.username,         cls:'text-[var(--text-primary,#1a3a2a)] font-mono' },
                  { label:'Password', val:created.password,         cls:'text-[var(--text-primary,#1a3a2a)] font-mono' },
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-center">
                    <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{row.label}</span>
                    <span className={`font-bold text-sm ${row.cls}`}>{row.val}</span>
                  </div>
                ))}
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                <p className="text-amber-600 text-xs">⚠️ Email sent. Keep a copy of these credentials just in case.</p>
              </div>
              <button onClick={() => setCreated(null)}
                className="w-full bg-green-600 hover:bg-green-500 text-white p-4 rounded-xl font-black uppercase tracking-widest transition-all">
                Create Another Account
              </button>
            </div>
          ) : (
            <div className="dashboard-card p-8">
              <h3 className="text-[var(--text-primary,#1a3a2a)] font-black text-lg mb-6 flex items-center gap-2">
                <UserPlus className="text-green-600" size={22}/> New Staff Account
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
                    <option value="manager">Manager</option>
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
                    <input className="form-input" type="password" placeholder="Min. 6 characters"
                      value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
                  </div>
                </div>
                <button onClick={handleCreate} disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white p-4 rounded-xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
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
          <div className="flex justify-between items-center mb-4 border-b border-green-100 pb-4">
            <h3 className="text-[var(--text-primary,#1a3a2a)] font-black text-xs uppercase tracking-widest flex items-center gap-2">
              <Users size={15} className="text-green-600"/> All Staff
            </h3>
          </div>
          <div className="relative mb-4">
            <Search size={13} style={{position:"absolute",left:"12px",top:"50%",transform:"translateY(-50%)",opacity:0.45,color:"var(--text-muted)",pointerEvents:"none"}}/>
            <input className="form-input" style={{paddingLeft:"36px"}} placeholder="Search staff..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <div className="space-y-3">
            {filtStaff.map(s => (
              <div key={s.id} className="p-5 bg-green-50 rounded-2xl border border-green-100">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[var(--text-primary,#1a3a2a)] font-bold">{s.full_name}</p>
                    <p className="text-gray-500 text-xs font-mono">{s.username}</p>
                    <span className={`mt-1 inline-block px-2 py-0.5 bg-white border border-green-100 rounded text-[9px] font-black uppercase tracking-widest ${ROLE_COLOR[s.role]||'text-green-600'}`}>
                      {ROLE_LABEL[s.role]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEditOpen(s)}
                      className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/20 transition-all" title="Edit account">
                      <Edit2 size={14}/>
                    </button>
                    <button onClick={() => handleDelete(s.id, s.username)}
                      className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500/20 transition-all" title="Delete account">
                      <Trash2 size={14}/>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filtStaff.length === 0 && <p className="text-center text-gray-400 text-xs font-bold uppercase py-8 tracking-widest">No staff found</p>}
          </div>
        </div>
      )}

      {/* EDIT STAFF MODAL */}
      {editStaff && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:9998, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
          <div className="dashboard-card" style={{ width:'100%', maxWidth:'440px', padding:'2rem', position:'relative' }}>
            <button onClick={() => setEditStaff(null)} style={{ position:'absolute', top:'1rem', right:'1rem', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:'18px' }}>✕</button>
            <h3 className="text-[var(--text-primary,#1a3a2a)] font-black text-lg mb-1 flex items-center gap-2">
              <Edit2 className="text-blue-500" size={20}/> Edit Account
            </h3>
            <p className="text-gray-500 text-xs mb-5">Role: <span className="font-bold uppercase">{ROLE_LABEL[editStaff.role]}</span></p>

            {editError && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-4">
                <AlertCircle size={14} className="text-red-400 shrink-0"/>
                <p className="text-red-400 text-xs font-bold">{editError}</p>
              </div>
            )}
            {editSuccess && (
              <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 mb-4">
                <ShieldCheck size={14} className="text-green-500 shrink-0"/>
                <p className="text-green-500 text-xs font-bold">{editSuccess}</p>
              </div>
            )}

            <div className="space-y-4">
              {[
                { label:'Full Name',   field:'fullName',  ph:'Full name',       type:'text'  },
                { label:'Username',    field:'username',  ph:'Username',         type:'text'  },
                { label:'Email (for resending credentials)', field:'email', ph:'staff@email.com', type:'email' },
                { label:'New Password (leave blank to keep)', field:'password', ph:'Min. 6 characters', type:'password' },
              ].map(f => (
                <div key={f.field}>
                  <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block ml-2">{f.label}</label>
                  <input className="form-input" type={f.type} placeholder={f.ph}
                    value={editForm[f.field]} onChange={e => setEditForm({...editForm, [f.field]: e.target.value})}/>
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditStaff(null)}
                  className="flex-1 border border-gray-200 text-gray-400 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-50 transition-all">
                  Cancel
                </button>
                <button onClick={handleEditSave} disabled={editLoading}
                  className="flex-2 w-full bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                  {editLoading ? <><Loader2 size={14} className="animate-spin"/> Saving...</> : <><ShieldCheck size={14}/> Save & Resend</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};