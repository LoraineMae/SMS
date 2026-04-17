// src/components/WaitingRoomDisplay.jsx
// Public TV screen for the waiting room
// Fixes: pending bug, redundant row, position numbering, est. wait, dark/light mode

import React, { useEffect, useState, useCallback } from 'react';
import { Activity, Clock, Users, Tv, Sun, Moon } from 'lucide-react';
import { supabase } from '../lib/supabase';

const URGENCY_ORDER    = { critical:1, high:2, medium:3, low:4 };
const AVG_CONSULT_MINS = 8;

const URGENCY_STYLE = {
  critical: { color:'#ef4444', bg:'rgba(239,68,68,0.15)',  border:'rgba(239,68,68,0.4)',  label:'CRITICAL' },
  high:     { color:'#f59e0b', bg:'rgba(245,158,11,0.15)', border:'rgba(245,158,11,0.4)', label:'HIGH'     },
  medium:   { color:'#3b82f6', bg:'rgba(59,130,246,0.15)', border:'rgba(59,130,246,0.4)', label:'MEDIUM'   },
  low:      { color:'#22c55e', bg:'rgba(34,197,94,0.15)',  border:'rgba(34,197,94,0.4)',  label:'LOW'      },
};

const DARK = {
  page:          '#0f1117',
  header:        { background:'linear-gradient(135deg,#1a1d23,#0f1117)', borderBottom:'2px solid rgba(34,197,94,0.3)' },
  titleColor:    'white',
  subtitleColor: '#6b7280',
  clockColor:    'white',
  dateColor:     '#6b7280',
  nowBanner:     { background:'linear-gradient(135deg,rgba(34,197,94,0.2),rgba(34,197,94,0.05))', borderBottom:'1px solid rgba(34,197,94,0.3)' },
  nowNameColor:  'white',
  nowTicketColor:'#6b7280',
  colHeaderColor:'#4b5563',
  rowBg:         'rgba(255,255,255,0.03)',
  rowBorder:     '1px solid rgba(255,255,255,0.06)',
  numColor:      'rgba(255,255,255,0.25)',
  ticketColor:   'white',
  nameColor:     'white',
  metaColor:     '#9ca3af',
  emptyColor:    '#374151',
  footer:        { borderTop:'1px solid rgba(255,255,255,0.06)', background:'transparent' },
  footerTextColor:'#6b7280',
  pendingBg:     'rgba(245,158,11,0.04)',
  pendingBorder: '1px dashed rgba(245,158,11,0.15)',
  sectionDivider:'1px dashed rgba(255,255,255,0.08)',
  toggleBg:      'rgba(255,255,255,0.08)',
  toggleBorder:  'rgba(255,255,255,0.2)',
  toggleColor:   '#9ca3af',
  loadColor:     '#6b7280',
};

const LIGHT = {
  page:          '#f0faf4',
  header:        { background:'linear-gradient(135deg,#14532d,#166534)', borderBottom:'2px solid rgba(34,197,94,0.4)' },
  titleColor:    'white',
  subtitleColor: 'rgba(255,255,255,0.65)',
  clockColor:    'white',
  dateColor:     'rgba(255,255,255,0.65)',
  nowBanner:     { background:'#dcfce7', borderBottom:'2px solid #86efac' },
  nowNameColor:  '#14532d',
  nowTicketColor:'#4b7a5a',
  colHeaderColor:'#9ca3af',
  rowBg:         'white',
  rowBorder:     '1px solid #d4edda',
  numColor:      '#d1d5db',
  ticketColor:   '#1a3a2a',
  nameColor:     '#1a3a2a',
  metaColor:     '#6b7280',
  emptyColor:    '#9ca3af',
  footer:        { borderTop:'1px solid #d4edda', background:'white' },
  footerTextColor:'#6b7280',
  pendingBg:     '#fffbeb',
  pendingBorder: '1px dashed #fcd34d',
  sectionDivider:'1px dashed #d4edda',
  toggleBg:      'rgba(0,0,0,0.08)',
  toggleBorder:  'rgba(0,0,0,0.12)',
  toggleColor:   '#4b5563',
  loadColor:     '#9ca3af',
};

export const WaitingRoomDisplay = () => {
  const [queue,   setQueue]   = useState([]);
  const [pending, setPending] = useState([]);
  const [time,    setTime]    = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [isDark,  setIsDark]  = useState(true);

  const T = isDark ? DARK : LIGHT;

  const loadQueue = useCallback(async () => {
    const { data } = await supabase
      .from('patients')
      .select('id, fullname, urgency, arrival_time, ticket_number, status, nurse_assessed')
      .neq('status', 'done')
      .order('arrival_time', { ascending: true });

    if (data) {
      // FIX: A patient is assessed if nurse_assessed=true OR urgency was explicitly set
      // This handles the bug where nurse sets urgency but nurse_assessed flag wasn't updated
      const isAssessed = (p) =>
        p.nurse_assessed === true ||
        (p.urgency && p.urgency !== null);

      const assessed   = data.filter(p => isAssessed(p));
      const unassessed = data.filter(p => !isAssessed(p));

      // Sort assessed: by urgency priority first, then arrival time
      const sorted = [...assessed].sort((a, b) => {
        const ud = (URGENCY_ORDER[a.urgency] || 3) - (URGENCY_ORDER[b.urgency] || 3);
        return ud !== 0 ? ud : new Date(a.arrival_time) - new Date(b.arrival_time);
      });

      setQueue(sorted);
      setPending(unassessed);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 15000);
    const channel  = supabase.channel('wr-display')
      .on('postgres_changes', { event:'*', schema:'public', table:'patients' }, loadQueue)
      .subscribe();
    return () => { clearInterval(interval); supabase.removeChannel(channel); };
  }, [loadQueue]);

  const formatTime = (d) => d.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
  const formatDate = (d) => d.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  // Position 1 = Now serving, position 2 = ~8 min, etc.
  const estWait = (pos) => pos <= 1 ? 'Now' : `~${(pos - 1) * AVG_CONSULT_MINS} min`;

  // #1 = now serving (shown in banner only)
  const nowServing  = queue[0] || null;
  // Waiting list = everyone else (positions 2, 3, 4...)
  const waitingList = queue.slice(1);

  const COLS = '70px 100px 1fr 160px 150px';

  return (
    <div style={{ minHeight:'100vh', background:T.page, fontFamily:'Poppins, sans-serif', display:'flex', flexDirection:'column', transition:'background 0.4s' }}>

      {/* ── HEADER ── */}
      <div style={{ ...T.header, padding:'1.25rem 3rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <Activity color="#22c55e" size={32}/>
          <div>
            <h1 style={{ color:T.titleColor, fontWeight:900, fontSize:'1.9rem', fontStyle:'italic', letterSpacing:'-2px', margin:0, lineHeight:1 }}>
              HEALTH<span style={{ color:'#22c55e' }}>FLOW</span>
            </h1>
            <p style={{ color:T.subtitleColor, fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.3em', margin:'3px 0 0' }}>Patient Queue Display</p>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'2rem' }}>
          <div style={{ textAlign:'right' }}>
            <div style={{ color:T.clockColor, fontWeight:900, fontSize:'2rem', letterSpacing:'0.05em' }}>{formatTime(time)}</div>
            <div style={{ color:T.dateColor, fontSize:'12px', marginTop:3 }}>{formatDate(time)}</div>
          </div>
          <button onClick={() => setIsDark(v => !v)} style={{ background:T.toggleBg, border:`1px solid ${T.toggleBorder}`, color:T.toggleColor, borderRadius:'0.75rem', padding:'10px 18px', cursor:'pointer', display:'flex', alignItems:'center', gap:8, fontSize:'12px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', flexShrink:0 }}>
            {isDark ? <><Sun size={16}/> Light Mode</> : <><Moon size={16}/> Night Mode</>}
          </button>
        </div>
      </div>

      {/* ── NOW SERVING BANNER ── */}
      {nowServing ? (
        <div style={{ ...T.nowBanner, padding:'1.25rem 3rem', display:'flex', alignItems:'center', gap:'2rem' }}>
          <div style={{ background:'#22c55e', borderRadius:'0.75rem', padding:'8px 20px', flexShrink:0 }}>
            <span style={{ color:'black', fontWeight:900, fontSize:'13px', textTransform:'uppercase', letterSpacing:'0.2em' }}>🔔 NOW SERVING</span>
          </div>
          <span style={{ color:T.nowNameColor, fontWeight:900, fontSize:'1.8rem' }}>{nowServing.fullname}</span>
          <span style={{ color:T.nowTicketColor, fontSize:'14px' }}>Ticket #{nowServing.ticket_number}</span>
          <div style={{ marginLeft:'auto', background: URGENCY_STYLE[nowServing.urgency]?.bg, border:`1.5px solid ${URGENCY_STYLE[nowServing.urgency]?.border}`, borderRadius:'8px', padding:'8px 20px' }}>
            <span style={{ color: URGENCY_STYLE[nowServing.urgency]?.color, fontWeight:900, fontSize:'13px', textTransform:'uppercase', letterSpacing:'0.15em' }}>
              {URGENCY_STYLE[nowServing.urgency]?.label}
            </span>
          </div>
        </div>
      ) : !loading && queue.length === 0 && pending.length === 0 ? (
        <div style={{ background: isDark ? 'rgba(34,197,94,0.05)' : '#f0fdf4', borderBottom: isDark ? '1px solid rgba(34,197,94,0.15)' : '1px solid #bbf7d0', padding:'1.25rem 3rem', textAlign:'center' }}>
          <span style={{ color:'#22c55e', fontWeight:700, fontSize:'1rem', textTransform:'uppercase', letterSpacing:'0.2em' }}>✅ All patients have been attended to</span>
        </div>
      ) : null}

      {/* ── QUEUE TABLE ── */}
      <div style={{ flex:1, padding:'1.5rem 3rem', overflowY:'auto' }}>
        {loading ? (
          <div style={{ textAlign:'center', color:T.loadColor, padding:'4rem', fontSize:'1.2rem' }}>Loading queue...</div>
        ) : queue.length === 0 && pending.length === 0 ? (
          <div style={{ textAlign:'center', padding:'5rem', color:T.emptyColor }}>
            <Users size={64} style={{ marginBottom:'1rem', opacity:0.25, display:'block', margin:'0 auto 1rem' }}/>
            <p style={{ fontWeight:900, fontSize:'1.5rem', textTransform:'uppercase', letterSpacing:'0.2em' }}>No patients in queue</p>
          </div>
        ) : (
          <>
            {/* Column headers */}
            <div style={{ display:'grid', gridTemplateColumns:COLS, gap:'1rem', padding:'0.6rem 1.5rem', marginBottom:'0.5rem' }}>
              {['Queue #', 'Ticket', 'Patient Name', 'Priority', 'Est. Wait'].map(h => (
                <div key={h} style={{ color:T.colHeaderColor, fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.15em' }}>{h}</div>
              ))}
            </div>

            {/* Waiting list (positions 2, 3, 4... — #1 is in NOW SERVING banner) */}
            {waitingList.length === 0 && pending.length === 0 ? (
              <div style={{ textAlign:'center', padding:'2rem', color:T.loadColor, fontSize:'13px', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.1em' }}>
                No other patients waiting
              </div>
            ) : (
              <>
                {waitingList.map((p, i) => {
                  const pos = i + 2; // position 2 onward
                  const ust = URGENCY_STYLE[p.urgency] || URGENCY_STYLE.medium;
                  return (
                    <div key={p.id} style={{ display:'grid', gridTemplateColumns:COLS, gap:'1rem', padding:'1.1rem 1.5rem', borderRadius:'0.9rem', marginBottom:'0.6rem', background:T.rowBg, border:T.rowBorder, transition:'all 0.3s' }}>
                      <div style={{ color:T.numColor, fontWeight:900, fontSize:'1.6rem', lineHeight:1, display:'flex', alignItems:'center' }}>
                        {pos.toString().padStart(2, '0')}
                      </div>
                      <div style={{ color:T.ticketColor, fontWeight:700, fontSize:'1rem', display:'flex', alignItems:'center' }}>
                        #{p.ticket_number}
                      </div>
                      <div style={{ display:'flex', alignItems:'center' }}>
                        <span style={{ color:T.nameColor, fontWeight:600, fontSize:'1.05rem' }}>{p.fullname}</span>
                      </div>
                      <div style={{ display:'flex', alignItems:'center' }}>
                        <span style={{ background:ust.bg, border:`1px solid ${ust.border}`, color:ust.color, padding:'4px 14px', borderRadius:'6px', fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em' }}>
                          {ust.label}
                        </span>
                      </div>
                      <div style={{ color:T.metaColor, fontWeight:700, fontSize:'1rem', display:'flex', alignItems:'center', gap:6 }}>
                        <Clock size={14}/> {estWait(pos)}
                      </div>
                    </div>
                  );
                })}

                {/* Pending section — nurse hasn't assessed yet */}
                {pending.length > 0 && (
                  <>
                    <div style={{ color:T.colHeaderColor, fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.15em', padding:'1rem 1.5rem 0.5rem', marginTop:'0.5rem', borderTop:T.sectionDivider }}>
                      Awaiting Nurse Assessment ({pending.length})
                    </div>
                    {pending.map(p => (
                      <div key={p.id} style={{ display:'grid', gridTemplateColumns:COLS, gap:'1rem', padding:'0.9rem 1.5rem', borderRadius:'0.9rem', marginBottom:'0.5rem', background:T.pendingBg, border:T.pendingBorder, opacity:0.6 }}>
                        <div style={{ color: isDark ? 'rgba(255,255,255,0.15)' : '#d1d5db', fontWeight:900, fontSize:'1.6rem', lineHeight:1, display:'flex', alignItems:'center' }}>—</div>
                        <div style={{ color:T.ticketColor, fontWeight:700, fontSize:'1rem', display:'flex', alignItems:'center' }}>#{p.ticket_number}</div>
                        <div style={{ display:'flex', alignItems:'center' }}>
                          <span style={{ color:T.nameColor, fontWeight:600, fontSize:'1rem' }}>{p.fullname}</span>
                        </div>
                        <div style={{ display:'flex', alignItems:'center' }}>
                          <span style={{ background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.25)', color:'#f59e0b', padding:'4px 12px', borderRadius:'6px', fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em' }}>Awaiting</span>
                        </div>
                        <div style={{ color:'#6b7280', fontWeight:600, fontSize:'13px', display:'flex', alignItems:'center' }}>—</div>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div style={{ ...T.footer, padding:'0.9rem 3rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', gap:'2rem' }}>
          {Object.entries(URGENCY_STYLE).map(([key, val]) => (
            <div key={key} style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ width:9, height:9, borderRadius:'50%', background:val.color }}/>
              <span style={{ color:T.footerTextColor, fontSize:'11px', fontWeight:700, textTransform:'uppercase' }}>{val.label}</span>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, color:T.footerTextColor }}>
          <Tv size={13}/>
          <span style={{ fontSize:'11px', fontWeight:700 }}>Auto-updates every 15 seconds</span>
        </div>
      </div>

    </div>
  );
};