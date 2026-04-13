// src/components/WaitingRoomDisplay.jsx
// Public TV screen for the waiting room — shows full queue with positions, urgency, and wait times
// Open this on a browser in fullscreen on a TV/monitor in the waiting room

import React, { useEffect, useState, useCallback } from 'react';
import { Activity, Clock, Users, Tv, Sun, Moon } from 'lucide-react';
import { supabase } from '../lib/supabase';

const URGENCY_ORDER    = { critical:1, high:2, medium:3, low:4 };
const AVG_CONSULT_MINS = 8;

// Urgency styles work for both modes
const URGENCY_STYLE = {
  critical: { color:'#ef4444', bg:'rgba(239,68,68,0.15)',  border:'rgba(239,68,68,0.4)',  label:'CRITICAL' },
  high:     { color:'#f59e0b', bg:'rgba(245,158,11,0.15)', border:'rgba(245,158,11,0.4)', label:'HIGH'     },
  medium:   { color:'#3b82f6', bg:'rgba(59,130,246,0.15)', border:'rgba(59,130,246,0.4)', label:'STANDARD' },
  low:      { color:'#22c55e', bg:'rgba(34,197,94,0.15)',  border:'rgba(34,197,94,0.4)',  label:'LOW'      },
};

// ── THEMES ────────────────────────────────────────────────────────────────────
const DARK = {
  page:           { background:'#0f1117' },
  header:         { background:'linear-gradient(135deg,#1a1d23,#0f1117)', borderBottom:'2px solid rgba(34,197,94,0.3)' },
  title:          { color:'white' },
  subtitle:       { color:'#6b7280' },
  clock:          { color:'white' },
  date:           { color:'#6b7280' },
  nowBanner:      { background:'linear-gradient(135deg,rgba(34,197,94,0.2),rgba(34,197,94,0.05))', borderBottom:'1px solid rgba(34,197,94,0.3)' },
  nowName:        { color:'white' },
  nowTicket:      { color:'#6b7280' },
  colHeader:      { color:'#4b5563' },
  rowBg:          (isNow, assessed) => isNow ? 'rgba(34,197,94,0.08)' : assessed ? 'rgba(255,255,255,0.03)' : 'rgba(245,158,11,0.03)',
  rowBorder:      (isNow, assessed) => isNow ? '1px solid rgba(34,197,94,0.3)' : assessed ? '1px solid rgba(255,255,255,0.05)' : '1px dashed rgba(245,158,11,0.15)',
  rowNum:         (isNow) => isNow ? '#22c55e' : 'rgba(255,255,255,0.2)',
  rowTicket:      { color:'white' },
  rowName:        { color:'white' },
  rowMeta:        (isNow) => isNow ? '#22c55e' : '#9ca3af',
  emptyText:      { color:'#374151' },
  footer:         { borderTop:'1px solid rgba(255,255,255,0.05)' },
  footerText:     { color:'#6b7280' },
  footerIcon:     { color:'#4b5563' },
  toggleBg:       'rgba(255,255,255,0.08)',
  toggleBorder:   'rgba(255,255,255,0.15)',
  toggleColor:    '#9ca3af',
  loadingText:    { color:'#6b7280' },
};

const LIGHT = {
  page:           { background:'#f0faf4' },
  header:         { background:'linear-gradient(135deg,#14532d,#166534)', borderBottom:'2px solid rgba(34,197,94,0.4)' },
  title:          { color:'white' },
  subtitle:       { color:'rgba(255,255,255,0.6)' },
  clock:          { color:'white' },
  date:           { color:'rgba(255,255,255,0.6)' },
  nowBanner:      { background:'#dcfce7', borderBottom:'1px solid #86efac' },
  nowName:        { color:'#14532d' },
  nowTicket:      { color:'#4b7a5a' },
  colHeader:      { color:'#9ca3af' },
  rowBg:          (isNow, assessed) => isNow ? '#dcfce7' : assessed ? 'white' : '#fffbeb',
  rowBorder:      (isNow, assessed) => isNow ? '1px solid #86efac' : assessed ? '1px solid #d4edda' : '1px dashed #fcd34d',
  rowNum:         (isNow) => isNow ? '#16a34a' : '#d1d5db',
  rowTicket:      { color:'#1a3a2a' },
  rowName:        { color:'#1a3a2a' },
  rowMeta:        (isNow) => isNow ? '#16a34a' : '#6b7280',
  emptyText:      { color:'#9ca3af' },
  footer:         { borderTop:'1px solid #d4edda', background:'white' },
  footerText:     { color:'#6b7280' },
  footerIcon:     { color:'#9ca3af' },
  toggleBg:       'rgba(0,0,0,0.06)',
  toggleBorder:   'rgba(0,0,0,0.1)',
  toggleColor:    '#4b5563',
  loadingText:    { color:'#9ca3af' },
};

export const WaitingRoomDisplay = () => {
  const [patients, setPatients] = useState([]);
  const [time,     setTime]     = useState(new Date());
  const [loading,  setLoading]  = useState(true);
  const [isDark,   setIsDark]   = useState(true);

  const T = isDark ? DARK : LIGHT;

  const loadQueue = useCallback(async () => {
    const { data } = await supabase
      .from('patients')
      .select('id, fullname, urgency, arrival_time, ticket_number, status, nurse_assessed')
      .neq('status', 'done')
      .order('arrival_time', { ascending: true });

    if (data) {
      const assessed = data.filter(p => p.nurse_assessed);
      const pending  = data.filter(p => !p.nurse_assessed);
      const sortAssessed = [...assessed].sort((a, b) => {
        const ud = (URGENCY_ORDER[a.urgency]||3) - (URGENCY_ORDER[b.urgency]||3);
        return ud !== 0 ? ud : new Date(a.arrival_time) - new Date(b.arrival_time);
      });
      const sortPending = [...pending].sort((a, b) => new Date(a.arrival_time) - new Date(b.arrival_time));
      setPatients([...sortAssessed, ...sortPending]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 15000);
    const channel  = supabase.channel('waiting-room')
      .on('postgres_changes', { event:'*', schema:'public', table:'patients' }, loadQueue)
      .subscribe();
    return () => { clearInterval(interval); supabase.removeChannel(channel); };
  }, [loadQueue]);

  const formatTime = (d) => d.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
  const formatDate = (d) => d.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  const estWait    = (pos) => pos <= 1 ? 'Now' : `~${(pos-1) * AVG_CONSULT_MINS} min`;

  return (
    <div style={{ minHeight:'100vh', ...T.page, fontFamily:'Poppins, sans-serif', display:'flex', flexDirection:'column', transition:'background 0.3s' }}>

      {/* ── HEADER ── */}
      <div style={{ ...T.header, padding:'1.5rem 3rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <Activity color="#22c55e" size={36}/>
          <div>
            <h1 style={{ ...T.title, fontWeight:900, fontSize:'2rem', fontStyle:'italic', letterSpacing:'-2px', margin:0, lineHeight:1 }}>
              HEALTH<span style={{ color:'#22c55e' }}>FLOW</span>
            </h1>
            <p style={{ ...T.subtitle, fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.3em', margin:'4px 0 0' }}>Patient Queue Display</p>
          </div>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:'2rem' }}>
          {/* Clock */}
          <div style={{ textAlign:'right' }}>
            <div style={{ ...T.clock, fontWeight:900, fontSize:'2rem', letterSpacing:'0.05em' }}>{formatTime(time)}</div>
            <div style={{ ...T.date, fontSize:'12px', marginTop:4 }}>{formatDate(time)}</div>
          </div>

          {/* Dark / Light toggle */}
          <button
            onClick={() => setIsDark(v => !v)}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Night Mode'}
            style={{
              background: T.toggleBg,
              border: `1px solid ${T.toggleBorder}`,
              color: T.toggleColor,
              borderRadius:'0.75rem',
              padding:'10px 16px',
              cursor:'pointer',
              display:'flex',
              alignItems:'center',
              gap:8,
              fontSize:'12px',
              fontWeight:700,
              textTransform:'uppercase',
              letterSpacing:'0.1em',
              transition:'all 0.2s',
              flexShrink:0,
            }}
          >
            {isDark
              ? <><Sun size={16}/> Light Mode</>
              : <><Moon size={16}/> Night Mode</>
            }
          </button>
        </div>
      </div>

      {/* ── NOW SERVING BANNER ── */}
      {patients[0] && patients[0].nurse_assessed && (
        <div style={{ ...T.nowBanner, padding:'1.5rem 3rem', display:'flex', alignItems:'center', gap:'2rem' }}>
          <div style={{ background:'#22c55e', borderRadius:'0.75rem', padding:'8px 20px', flexShrink:0 }}>
            <span style={{ color:'black', fontWeight:900, fontSize:'13px', textTransform:'uppercase', letterSpacing:'0.2em' }}>🔔 NOW SERVING</span>
          </div>
          <div>
            <span style={{ ...T.nowName, fontWeight:900, fontSize:'1.8rem' }}>{patients[0].fullname}</span>
            <span style={{ ...T.nowTicket, fontSize:'14px', marginLeft:16 }}>Ticket #{patients[0].ticket_number}</span>
          </div>
          <div style={{ marginLeft:'auto', background: URGENCY_STYLE[patients[0].urgency]?.bg, border:`1px solid ${URGENCY_STYLE[patients[0].urgency]?.border}`, borderRadius:'8px', padding:'6px 16px' }}>
            <span style={{ color: URGENCY_STYLE[patients[0].urgency]?.color, fontWeight:900, fontSize:'12px', textTransform:'uppercase' }}>
              {URGENCY_STYLE[patients[0].urgency]?.label}
            </span>
          </div>
        </div>
      )}

      {/* ── QUEUE TABLE ── */}
      <div style={{ flex:1, padding:'2rem 3rem', overflowY:'auto' }}>
        {loading ? (
          <div style={{ textAlign:'center', ...T.loadingText, padding:'4rem', fontSize:'1.2rem' }}>Loading queue...</div>
        ) : patients.length === 0 ? (
          <div style={{ textAlign:'center', padding:'6rem', ...T.emptyText }}>
            <Users size={64} style={{ marginBottom:'1rem', opacity:0.3 }}/>
            <p style={{ fontWeight:900, fontSize:'1.5rem', textTransform:'uppercase', letterSpacing:'0.2em' }}>No patients in queue</p>
          </div>
        ) : (
          <>
            {/* Column headers */}
            <div style={{ display:'grid', gridTemplateColumns:'80px 80px 1fr 160px 160px 140px', gap:'1rem', padding:'0.75rem 1.5rem', marginBottom:'0.5rem' }}>
              {['#','Ticket','Patient Name','Priority','Position','Est. Wait'].map(h => (
                <div key={h} style={{ ...T.colHeader, fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.15em' }}>{h}</div>
              ))}
            </div>

            {/* Patient rows */}
            {patients.map((p, i) => {
              const assessed = p.nurse_assessed;
              const ust      = assessed ? (URGENCY_STYLE[p.urgency] || URGENCY_STYLE.medium) : null;
              const isNow    = i === 0 && assessed;
              const queuePos = patients.filter(x => x.nurse_assessed).findIndex(x => x.id === p.id) + 1;

              return (
                <div key={p.id} style={{
                  display:'grid', gridTemplateColumns:'80px 80px 1fr 160px 160px 140px',
                  gap:'1rem', padding:'1.25rem 1.5rem', borderRadius:'1rem', marginBottom:'0.75rem',
                  background: T.rowBg(isNow, assessed),
                  border:     T.rowBorder(isNow, assessed),
                  opacity: assessed ? 1 : 0.7,
                  transition:'all 0.3s',
                }}>
                  <div style={{ color: T.rowNum(isNow), fontWeight:900, fontSize:'1.8rem', lineHeight:1, display:'flex', alignItems:'center' }}>
                    {isNow ? '▶' : assessed ? queuePos.toString().padStart(2,'0') : '—'}
                  </div>
                  <div style={{ ...T.rowTicket, fontWeight:700, fontSize:'1.1rem', display:'flex', alignItems:'center' }}>
                    #{p.ticket_number}
                  </div>
                  <div style={{ display:'flex', alignItems:'center' }}>
                    <span style={{ ...T.rowName, fontWeight: isNow ? 900 : 600, fontSize: isNow ? '1.3rem' : '1.1rem' }}>{p.fullname}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center' }}>
                    {assessed
                      ? <span style={{ background:ust.bg, border:`1px solid ${ust.border}`, color:ust.color, padding:'4px 12px', borderRadius:'6px', fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em' }}>{ust.label}</span>
                      : <span style={{ background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.2)', color:'#f59e0b', padding:'4px 12px', borderRadius:'6px', fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em' }}>Pending</span>
                    }
                  </div>
                  <div style={{ color: T.rowMeta(isNow), fontWeight:700, fontSize:'1rem', display:'flex', alignItems:'center' }}>
                    {!assessed ? '⏳ Awaiting nurse' : isNow ? '🟢 Now' : `#${queuePos} in line`}
                  </div>
                  <div style={{ color: T.rowMeta(isNow), fontWeight:700, fontSize:'1rem', display:'flex', alignItems:'center', gap:6 }}>
                    {assessed ? <><Clock size={14}/> {estWait(queuePos)}</> : '—'}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div style={{ ...T.footer, padding:'1rem 3rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', gap:'2rem' }}>
          {Object.entries(URGENCY_STYLE).map(([key, val]) => (
            <div key={key} style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ width:10, height:10, borderRadius:'50%', background:val.color }}></div>
              <span style={{ ...T.footerText, fontSize:'11px', fontWeight:700, textTransform:'uppercase' }}>{val.label}</span>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, ...T.footerIcon }}>
          <Tv size={14}/>
          <span style={{ fontSize:'11px', fontWeight:700 }}>Updates every 15 seconds</span>
        </div>
      </div>

    </div>
  );
};