import React, { useState } from 'react';
import { Calendar, LogOut, User, ClipboardList, Stethoscope, BarChart3, ArrowLeft, Activity } from 'lucide-react';
import { PriorityQueue } from './utils/PriorityQueue';
import { 
  RoleSelectionScreen, LoginScreen, PatientIntakeForm, 
  TriageNurseView, DoctorView, ManagerView 
} from './components/SchedulerViews';
import './App.css';

function App() {
  const [viewMode, setViewMode] = useState('landing'); // landing, login, patient-intake
  const [selectedRole, setSelectedRole] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // DATA STATE
  const [patients, setPatients] = useState([]);
  const [processedPatients, setProcessedPatients] = useState([]);
  const [formData, setFormData] = useState({ 
    fullname: '', dob: '', gender: '', address: '', phone: '', email: '', condition: '', urgency: 'medium' 
  });

  const handleRoleSelection = (role) => {
    setSelectedRole(role);
    setViewMode(role === 'patient' ? 'patient-intake' : 'login');
  };

  const handleLogin = (credentials) => {
    // Simulated auth logic
    const user = { fullName: 'Staff Member', role: selectedRole };
    setCurrentUser(user);
    setIsLoggedIn(true);
  };

  const addPatient = () => {
    if (!formData.fullname || !formData.condition) return alert("Fill Name and Condition");
    const newPatient = { ...formData, id: Date.now(), arrivalTime: Date.now() };
    setPatients([...patients, newPatient]);
    setFormData({ fullname: '', dob: '', gender: '', address: '', phone: '', email: '', condition: '', urgency: 'medium' });
    alert("You have been added to the Priority Queue!");
    setViewMode('landing');
  };

  const getSortedPatients = () => {
    const pq = new PriorityQueue();
    patients.forEach(p => pq.insert(p));
    const sorted = [];
    while (pq.size() > 0) sorted.push(pq.extractMin());
    return sorted;
  };

  // Views mapping
  if (viewMode === 'landing') return <RoleSelectionScreen onSelect={handleRoleSelection} />;
  
  if (viewMode === 'patient-intake') return (
    <div className="p-8"><button onClick={() => setViewMode('landing')} className="text-blue-400 mb-4 flex items-center gap-2"><ArrowLeft size={18}/> Back</button>
    <PatientIntakeForm formData={formData} setFormData={setFormData} addPatient={addPatient} /></div>
  );

  if (viewMode === 'login' && !isLoggedIn) return (
    <LoginScreen role={selectedRole} onLogin={handleLogin} onBack={() => setViewMode('landing')} />
  );

  return (
    <div className="min-h-screen">
      <header className="glass-nav p-4 px-8 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Activity className="text-blue-500" />
          <h1 className="font-bold text-xl">HealthFlow <span className="text-blue-500 text-sm">{currentUser.role.toUpperCase()}</span></h1>
        </div>
        <button onClick={() => {setIsLoggedIn(false); setViewMode('landing');}} className="text-gray-400 hover:text-white flex items-center gap-2"><LogOut size={18}/> Logout</button>
      </header>
      <main className="p-8 max-w-7xl mx-auto">
        {currentUser.role === 'triage' && <TriageNurseView patients={patients} getSortedPatients={getSortedPatients} />}
        {currentUser.role === 'doctor' && <DoctorView getSortedPatients={getSortedPatients} />}
        {currentUser.role === 'manager' && <ManagerView patients={patients} />}
      </main>
    </div>
  );
}

export default App;