import React from 'react';
import { User, ClipboardList, Stethoscope, BarChart3, ShieldCheck, Activity, ArrowLeft } from 'lucide-react';

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

      <div className="flex flex-col gap-6 items-start">
        {[
          {id: 'patient', label: 'Patient', icon: <User />, color: 'text-green-400'},
          {id: 'triage', label: 'Nurse', icon: <Activity />, color: 'text-blue-400'},
          {id: 'doctor', label: 'Doctor', icon: <Stethoscope />, color: 'text-purple-400'},
          {id: 'manager', label: 'Manager', icon: <BarChart3 />, color: 'text-amber-400'}
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

     <div className="flex flex-col justify-start flex-1">
  <div className="dashboard-card p-10 w-full text-white h-[600px] flex flex-col">
    <center>
    <h1 className="text-4xl font-bold mb-4">WELCOME!</h1>
    <p className="text-white-400 text-sm">
      hjgfcnffuydtfvhsr
    </p>
    </center>
  </div>
</div>

    </div>
  </div>
);
export const PatientIntakeForm = ({ formData, setFormData, addPatient }) => (
  <div className="max-w-2xl mx-auto dashboard-card p-10 text-white">
    <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 border-b border-white/5 pb-4"><ClipboardList className="text-blue-500"/> Patient Registration</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
      <div className="md:col-span-2">
        <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block ml-2">Full Name</label>
        <input className="form-input" placeholder="Name" value={formData.fullname} onChange={e => setFormData({...formData, fullname: e.target.value})} />
      </div>
      <div>
        <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block ml-2">Date of Birth</label>
        <input type="date" className="form-input" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
      </div>
      <div>
        <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block ml-2">Gender</label>
        <select className="form-input" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
          <option value="">Select</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
      </div>
    </div>
    <div className="space-y-5">
      <input className="form-input" placeholder="Phone Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
      <div>
        <label className="text-[10px] uppercase font-bold text-blue-500 mb-1 block ml-2">Condition / Symptoms</label>
        <textarea className="form-input h-32" placeholder="How can we help you today?" value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})} />
      </div>
      <div>
        <label className="text-[10px] uppercase font-bold text-red-500 mb-1 block ml-2">Urgency Level</label>
        <select className="form-input" value={formData.urgency} onChange={e => setFormData({...formData, urgency: e.target.value})}>
          <option value="low">🟢 Stable / Minor (Low)</option>
          <option value="medium">🔵 Moderate Pain (Medium)</option>
          <option value="high">🟠 Urgent Care (High)</option>
          <option value="critical">🔴 Emergency (Critical)</option>
        </select>
      </div>
      <button onClick={addPatient} className="w-full bg-blue-600 hover:bg-blue-500 p-4 rounded-xl font-bold transition-all shadow-lg mt-4">SUBMIT & JOIN QUEUE</button>
    </div>
  </div>
);

export const LoginScreen = ({ role, onLogin, onBack }) => (
  <div className="min-h-screen flex items-center justify-center bg-[#2c3038]">
    <div className="dashboard-card w-full max-w-md p-10 text-white">
      <button onClick={onBack} className="text-gray-500 mb-6 flex items-center gap-1 text-xs uppercase font-bold hover:text-white"><ArrowLeft size={14}/> BACK</button>
      <div className="text-center mb-8">
        <div className="inline-block p-4 bg-blue-500/20 text-blue-500 rounded-2xl mb-4 text-3xl font-bold uppercase">{role[0]}</div>
        <h2 className="text-xl font-bold uppercase tracking-widest">{role} Authentication</h2>
      </div>
      <div className="space-y-4">
        <input className="form-input" placeholder="Username" />
        <input className="form-input" type="password" placeholder="Password" />
        <button onClick={() => onLogin()} className="w-full bg-blue-500 p-4 rounded-xl font-bold hover:bg-blue-600 transition-all uppercase">Enter Portal</button>
      </div>
    </div>
  </div>
);

export const TriageNurseView = ({ getSortedPatients }) => (
  <div className="dashboard-card p-8">
    <div className="flex justify-between items-center mb-8">
      <h2 className="text-xl font-bold text-white tracking-wide">LIVE PRIORITY QUEUE</h2>
      <div className="animate-pulse flex items-center gap-2">
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        <span className="text-xs font-bold text-gray-400 tracking-widest">LIVE MONITOR</span>
      </div>
    </div>
    <div className="space-y-4">
      {getSortedPatients().map((p, i) => (
        <div key={p.id} className="p-5 bg-black/20 rounded-2xl border border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-5">
            <div className="text-2xl font-black text-white/20">{(i + 1).toString().padStart(2, '0')}</div>
            <div>
              <p className="font-bold text-white text-lg">{p.fullname}</p>
              <p className="text-sm text-gray-500 italic">"{p.condition}"</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest urgency-${p.urgency}`}>
            {p.urgency}
          </div>
        </div>
      ))}
      {getSortedPatients().length === 0 && <div className="text-center py-20 text-gray-600 font-bold uppercase tracking-widest">No Active Patients</div>}
    </div>
  </div>
);

export const DoctorView = ({ getSortedPatients }) => {
  const current = getSortedPatients()[0];
  return (
    <div className="max-w-xl mx-auto dashboard-card p-10 text-center">
      <div className="p-6 bg-blue-500/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
        <Stethoscope className="text-blue-500" size={40} />
      </div>
      <h3 className="text-gray-500 uppercase text-xs font-black tracking-widest mb-2">Next Patient for Consultation</h3>
      {current ? (
        <>
          <h2 className="text-4xl font-bold text-white mb-4">{current.fullname}</h2>
          <div className={`inline-block px-4 py-1 rounded-full text-[10px] font-black uppercase mb-6 urgency-${current.urgency}`}>{current.urgency}</div>
          <div className="p-4 bg-black/30 rounded-xl text-gray-400 text-sm mb-8 italic">"{current.condition}"</div>
          <button className="w-full bg-green-600 p-4 rounded-xl font-black text-white hover:bg-green-500 transition-all">START CONSULTATION</button>
        </>
      ) : <p className="text-gray-600 py-10 font-bold uppercase">All Patients Cleared</p>}
    </div>
  );
};

export const ManagerView = ({ patients }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    <div className="dashboard-card p-8 flex flex-col justify-center items-center">
        <span className="text-gray-500 font-bold text-xs uppercase tracking-[0.3em]">Total Intake</span>
        <div className="text-6xl font-black text-blue-500 mt-2">{patients.length}</div>
    </div>
    <div className="dashboard-card p-8">
        <h3 className="font-bold mb-4 text-gray-400 text-xs uppercase tracking-widest">Recent Activity</h3>
        <div className="space-y-3">
            {patients.slice(-3).map(p => (
                <div key={p.id} className="text-sm border-l-2 border-blue-500 pl-4 py-1">
                    <span className="text-white font-bold">{p.fullname}</span> registered as <span className="text-blue-400 font-bold uppercase">{p.urgency}</span>
                </div>
            ))}
        </div>
    </div>
  </div>
);
