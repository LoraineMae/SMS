// src/components/QueueTicket.jsx
// Simple confirmation shown to patient after registration
// No position or wait time shown — nurse assigns urgency first

import React from 'react';
import { Activity, CheckCircle, Clock, ArrowLeft } from 'lucide-react';

export const QueueTicket = ({ patient, onBack }) => {
  return (
    <div style={{ minHeight:'100vh', background:'#f0faf4', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'2rem', fontFamily:'Poppins, sans-serif' }}>

      {/* Header */}
      <div style={{ textAlign:'center', marginBottom:'2rem' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:8 }}>
          <Activity color="#16a34a" size={24}/>
          <h1 style={{ color:'#1a3a2a', fontWeight:900, fontSize:'1.4rem', fontStyle:'italic', letterSpacing:'-1px', margin:0 }}>
            HEALTH<span style={{ color:'#16a34a' }}>FLOW</span>
          </h1>
        </div>
        <p style={{ color:'#6b7280', fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.3em', margin:0 }}>Registration Confirmed</p>
      </div>

      {/* Ticket Card */}
      <div style={{ width:'100%', maxWidth:'400px', background:'linear-gradient(145deg,#ffffff,#f0faf4)', borderRadius:'2rem', border:'1px solid rgba(34,197,94,0.18)', boxShadow:'6px 6px 20px rgba(0,80,30,0.1)', overflow:'hidden' }}>

        {/* Green confirmed bar */}
        <div style={{ background:'#22c55e', padding:'8px', textAlign:'center' }}>
          <span style={{ color:'white', fontWeight:900, fontSize:'11px', textTransform:'uppercase', letterSpacing:'0.2em' }}>
            ✅ You are now in the queue
          </span>
        </div>

        <div style={{ padding:'2rem' }}>

          {/* Check icon */}
          <div style={{ textAlign:'center', marginBottom:'1.5rem' }}>
            <div style={{ width:72, height:72, borderRadius:'50%', background:'rgba(34,197,94,0.15)', border:'2px solid rgba(34,197,94,0.3)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto' }}>
              <CheckCircle color="#22c55e" size={36}/>
            </div>
          </div>

          {/* Patient name */}
          <div style={{ textAlign:'center', marginBottom:'1.5rem' }}>
            <p style={{ color:'#6b7280', fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.2em', margin:'0 0 6px' }}>Registered Patient</p>
            <h2 style={{ color:'#1a3a2a', fontWeight:900, fontSize:'1.6rem', margin:0 }}>{patient.fullname}</h2>
          </div>

          {/* Queue number */}
          <div style={{ textAlign:'center', background:'rgba(34,197,94,0.06)', border:'2px dashed rgba(34,197,94,0.3)', borderRadius:'1rem', padding:'1.5rem', marginBottom:'1.5rem' }}>
            <p style={{ color:'#6b7280', fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.3em', margin:'0 0 8px' }}>Your Ticket Number</p>
            <div style={{ fontSize:'4rem', fontWeight:900, color:'#16a34a', lineHeight:1 }}>
              #{patient.ticket_number || '—'}
            </div>
            <p style={{ color:'#4b5563', fontSize:'11px', margin:'8px 0 0' }}>Remember this number</p>
          </div>

          {/* Pending notice */}
          <div style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:'0.75rem', padding:'1rem', marginBottom:'1.5rem', display:'flex', gap:10, alignItems:'flex-start' }}>
            <Clock size={16} color="#f59e0b" style={{ flexShrink:0, marginTop:2 }}/>
            <div>
              <p style={{ color:'#fbbf24', fontSize:'12px', fontWeight:700, margin:'0 0 4px', textTransform:'uppercase', letterSpacing:'0.05em' }}>Awaiting Assessment</p>
              <p style={{ color:'#92400e', fontSize:'11px', margin:0, lineHeight:1.5 }}>
                A nurse will assess your condition shortly and assign your priority level. Please remain in the waiting area.
              </p>
            </div>
          </div>

          {/* Monitor tip */}
          <div style={{ background:'rgba(34,197,94,0.06)', border:'1px solid rgba(34,197,94,0.2)', borderRadius:'0.75rem', padding:'1rem', marginBottom:'1.5rem' }}>
            <p style={{ color:'#16a34a', fontSize:'12px', fontWeight:700, margin:'0 0 4px', textTransform:'uppercase', letterSpacing:'0.05em' }}>📺 Queue Monitor</p>
            <p style={{ color:'#166534', fontSize:'11px', margin:0, lineHeight:1.5 }}>
              Watch the waiting room display screen to track your queue position once your priority is assigned.
            </p>
          </div>

          <button onClick={onBack} style={{ width:'100%', background:'transparent', border:'1px solid rgba(34,197,94,0.2)', color:'#16a34a', padding:'0.9rem', borderRadius:'0.75rem', fontWeight:700, fontSize:'12px', textTransform:'uppercase', letterSpacing:'0.1em', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            <ArrowLeft size={14}/> Back to Home
          </button>
        </div>

        {/* Bottom note */}
        <div style={{ borderTop:'1px dashed rgba(34,197,94,0.15)', padding:'1rem', textAlign:'center' }}>
          <p style={{ color:'#6b7280', fontSize:'11px', margin:0 }}>Please stay in the waiting area and listen for your name to be called.</p>
        </div>
      </div>
    </div>
  );
};