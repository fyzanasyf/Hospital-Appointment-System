import React, { useState, useEffect, useCallback } from 'react';
import { getAppointments, getDoctors, getPatients, bookAppointment, cancelAppointment, createPatient } from './api';
import './App.css';

// ── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    Scheduled: { bg: '#e0f7fa', color: '#006064', label: '🗓 Scheduled' },
    Completed: { bg: '#e8f5e9', color: '#1b5e20', label: '✅ Completed' },
    Cancelled: { bg: '#fce4ec', color: '#880e4f', label: '✗ Cancelled' },
  };
  const s = map[status] || { bg: '#eee', color: '#333', label: status };
  return (
    <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 700 }}>
      {s.label}
    </span>
  );
};

// ── Modal ─────────────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
    <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: 480, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, color: '#0d47a1' }}>{title}</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#999' }}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

// ── Book Appointment Form ─────────────────────────────────────────────────────
const BookForm = ({ doctors, patients, onSuccess, onClose }) => {
  const [form, setForm] = useState({ patient: '', doctor: '', appointmentDate: '', timeSlot: '', reason: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const timeSlots = ['09:00 - 09:30', '09:30 - 10:00', '10:00 - 10:30', '10:30 - 11:00',
    '11:00 - 11:30', '11:30 - 12:00', '14:00 - 14:30', '14:30 - 15:00',
    '15:00 - 15:30', '15:30 - 16:00', '16:00 - 16:30'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await bookAppointment(form);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #c5cae9', fontSize: 14, marginTop: 4, boxSizing: 'border-box' };
  const labelStyle = { fontSize: 13, fontWeight: 600, color: '#37474f', display: 'block', marginTop: 14 };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div style={{ background: '#fce4ec', color: '#b71c1c', padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 13 }}>{error}</div>}
      <label style={labelStyle}>Patient</label>
      <select style={inputStyle} required value={form.patient} onChange={e => setForm({ ...form, patient: e.target.value })}>
        <option value=''>-- Select patient --</option>
        {patients.map(p => <option key={p._id} value={p._id}>{p.name} ({p.phone})</option>)}
      </select>
      <label style={labelStyle}>Doctor</label>
      <select style={inputStyle} required value={form.doctor} onChange={e => setForm({ ...form, doctor: e.target.value })}>
        <option value=''>-- Select doctor --</option>
        {doctors.map(d => <option key={d._id} value={d._id}>{d.name} — {d.specialization}</option>)}
      </select>
      <label style={labelStyle}>Date</label>
      <input type='date' style={inputStyle} required value={form.appointmentDate} min={new Date().toISOString().split('T')[0]} onChange={e => setForm({ ...form, appointmentDate: e.target.value })} />
      <label style={labelStyle}>Time Slot</label>
      <select style={inputStyle} required value={form.timeSlot} onChange={e => setForm({ ...form, timeSlot: e.target.value })}>
        <option value=''>-- Select time slot --</option>
        {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
      <label style={labelStyle}>Reason (optional)</label>
      <textarea style={{ ...inputStyle, height: 80, resize: 'vertical' }} value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder='Describe the reason for visit...' />
      <button type='submit' disabled={loading} style={{ marginTop: 20, width: '100%', padding: '12px', background: loading ? '#90caf9' : '#1565c0', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: loading ? 'default' : 'pointer' }}>
        {loading ? 'Booking...' : '📅 Book Appointment'}
      </button>
    </form>
  );
};

// ── Add Patient Form ──────────────────────────────────────────────────────────
const AddPatientForm = ({ onSuccess, onClose }) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', gender: '', address: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createPatient(form);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add patient');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #c5cae9', fontSize: 14, marginTop: 4, boxSizing: 'border-box' };
  const labelStyle = { fontSize: 13, fontWeight: 600, color: '#37474f', display: 'block', marginTop: 14 };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div style={{ background: '#fce4ec', color: '#b71c1c', padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 13 }}>{error}</div>}
      <label style={labelStyle}>Full Name</label>
      <input style={inputStyle} required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder='e.g. Ahmed Raza' />
      <label style={labelStyle}>Email</label>
      <input type='email' style={inputStyle} required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
      <label style={labelStyle}>Phone</label>
      <input style={inputStyle} required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder='03xx-xxxxxxx' />
      <label style={labelStyle}>Gender</label>
      <select style={inputStyle} value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
        <option value=''>-- Select --</option>
        <option>Male</option><option>Female</option><option>Other</option>
      </select>
      <label style={labelStyle}>Address</label>
      <input style={inputStyle} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
      <button type='submit' disabled={loading} style={{ marginTop: 20, width: '100%', padding: 12, background: loading ? '#a5d6a7' : '#2e7d32', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
        {loading ? 'Saving...' : '➕ Add Patient'}
      </button>
    </form>
  );
};

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modal, setModal] = useState(null); // 'book' | 'addPatient'
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchName) params.patientName = searchName;
      if (searchDate) params.date = searchDate;
      if (filterStatus) params.status = filterStatus;

      const [appRes, docRes, patRes] = await Promise.all([
        getAppointments(params),
        getDoctors(),
        getPatients(),
      ]);
      setAppointments(appRes.data.data);
      setDoctors(docRes.data.data);
      setPatients(patRes.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [searchName, searchDate, filterStatus]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await cancelAppointment(id);
      showToast('✅ Appointment cancelled');
      fetchAll();
    } catch (e) {
      showToast('❌ ' + (e.response?.data?.message || 'Error'));
    }
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = {
    total: appointments.length,
    scheduled: appointments.filter(a => a.status === 'Scheduled').length,
    completed: appointments.filter(a => a.status === 'Completed').length,
    cancelled: appointments.filter(a => a.status === 'Cancelled').length,
  };

  const tabStyle = (t) => ({
    padding: '10px 24px', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer',
    border: 'none', background: tab === t ? '#1565c0' : '#e8eaf6', color: tab === t ? '#fff' : '#3949ab',
    transition: 'all .2s',
  });

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: '#f0f4ff', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ background: 'linear-gradient(135deg,#0d47a1,#1976d2)', color: '#fff', padding: '18px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 20px rgba(0,0,0,0.18)' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: -0.5 }}>🏥 MedBook</h1>
          <p style={{ margin: 0, fontSize: 13, opacity: 0.8 }}>Hospital Appointment Management</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setModal('addPatient')} style={{ background: 'rgba(255,255,255,0.18)', border: '1.5px solid rgba(255,255,255,0.4)', color: '#fff', padding: '9px 18px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>+ New Patient</button>
          <button onClick={() => setModal('book')} style={{ background: '#fff', border: 'none', color: '#0d47a1', padding: '9px 18px', borderRadius: 8, fontWeight: 800, cursor: 'pointer', fontSize: 13 }}>📅 Book Appointment</button>
        </div>
      </header>

      <main style={{ padding: '28px 32px', maxWidth: 1100, margin: '0 auto' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Total', value: stats.total, color: '#1565c0', bg: '#e3f2fd', icon: '📋' },
            { label: 'Scheduled', value: stats.scheduled, color: '#00695c', bg: '#e0f2f1', icon: '🗓' },
            { label: 'Completed', value: stats.completed, color: '#2e7d32', bg: '#e8f5e9', icon: '✅' },
            { label: 'Cancelled', value: stats.cancelled, color: '#c62828', bg: '#fce4ec', icon: '✗' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, borderRadius: 14, padding: '20px 22px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 26 }}>{s.icon}</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: s.color, lineHeight: 1.1 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: s.color, fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
          <button style={tabStyle('appointments')} onClick={() => setTab('appointments')}>📋 Appointments</button>
          <button style={tabStyle('doctors')} onClick={() => setTab('doctors')}>👨‍⚕️ Doctors ({doctors.length})</button>
          <button style={tabStyle('patients')} onClick={() => setTab('patients')}>🧑‍🤝‍🧑 Patients ({patients.length})</button>
        </div>

        {/* Appointments Tab */}
        {tab === 'appointments' && (
          <div>
            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
              <input value={searchName} onChange={e => setSearchName(e.target.value)} placeholder='🔍 Search by patient name…' style={{ flex: 1, minWidth: 200, padding: '10px 14px', borderRadius: 8, border: '1.5px solid #c5cae9', fontSize: 14 }} />
              <input type='date' value={searchDate} onChange={e => setSearchDate(e.target.value)} style={{ padding: '10px 14px', borderRadius: 8, border: '1.5px solid #c5cae9', fontSize: 14 }} />
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '10px 14px', borderRadius: 8, border: '1.5px solid #c5cae9', fontSize: 14 }}>
                <option value=''>All statuses</option>
                <option>Scheduled</option><option>Completed</option><option>Cancelled</option>
              </select>
              <button onClick={() => { setSearchName(''); setSearchDate(''); setFilterStatus(''); }} style={{ padding: '10px 16px', borderRadius: 8, border: '1.5px solid #c5cae9', background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#555' }}>Clear</button>
            </div>

            {loading ? <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>Loading…</div> : (
              <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#e8eaf6' }}>
                      {['Patient', 'Doctor', 'Date', 'Time', 'Reason', 'Status', 'Action'].map(h => (
                        <th key={h} style={{ padding: '13px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#3949ab', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.length === 0 ? (
                      <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>No appointments found</td></tr>
                    ) : appointments.map((a, i) => (
                      <tr key={a._id} style={{ borderTop: '1px solid #f0f0f0', background: i % 2 === 0 ? '#fff' : '#fafbff' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: 14 }}>{a.patient?.name || '—'}<br /><span style={{ fontSize: 11, color: '#999', fontWeight: 400 }}>{a.patient?.phone}</span></td>
                        <td style={{ padding: '12px 16px', fontSize: 14 }}>{a.doctor?.name || '—'}<br /><span style={{ fontSize: 11, color: '#999' }}>{a.doctor?.specialization}</span></td>
                        <td style={{ padding: '12px 16px', fontSize: 13 }}>{a.appointmentDate ? new Date(a.appointmentDate).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13, whiteSpace: 'nowrap' }}>{a.timeSlot}</td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#666', maxWidth: 140 }}>{a.reason || <span style={{ color: '#ccc' }}>—</span>}</td>
                        <td style={{ padding: '12px 16px' }}><StatusBadge status={a.status} /></td>
                        <td style={{ padding: '12px 16px' }}>
                          {a.status === 'Scheduled' && (
                            <button onClick={() => handleCancel(a._id)} style={{ background: '#fce4ec', color: '#c62828', border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Cancel</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Doctors Tab */}
        {tab === 'doctors' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {doctors.map(d => (
              <div key={d._id} style={{ background: '#fff', borderRadius: 14, padding: 22, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', borderTop: '4px solid #1565c0' }}>
                <div style={{ fontWeight: 800, fontSize: 17, color: '#0d47a1' }}>👨‍⚕️ {d.name}</div>
                <div style={{ fontSize: 13, color: '#1976d2', fontWeight: 600, marginTop: 4 }}>{d.specialization}</div>
                <div style={{ marginTop: 12, fontSize: 13, color: '#555', lineHeight: 1.8 }}>
                  <div>📧 {d.email}</div>
                  <div>📞 {d.phone}</div>
                  <div>🕘 {d.availableHours?.start} – {d.availableHours?.end}</div>
                  <div style={{ marginTop: 6 }}>{d.availableDays?.map(day => <span key={day} style={{ display: 'inline-block', background: '#e8eaf6', color: '#3949ab', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600, marginRight: 4, marginTop: 2 }}>{day.slice(0, 3)}</span>)}</div>
                </div>
              </div>
            ))}
            {doctors.length === 0 && <div style={{ color: '#aaa', padding: 40 }}>No doctors found</div>}
          </div>
        )}

        {/* Patients Tab */}
        {tab === 'patients' && (
          <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#e8f5e9' }}>
                  {['Name', 'Email', 'Phone', 'Gender', 'Address'].map(h => (
                    <th key={h} style={{ padding: '13px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#2e7d32', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {patients.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>No patients registered</td></tr>
                ) : patients.map((p, i) => (
                  <tr key={p._id} style={{ borderTop: '1px solid #f0f0f0', background: i % 2 === 0 ? '#fff' : '#f9fff9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700 }}>{p.name}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13 }}>{p.email}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13 }}>{p.phone}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13 }}>{p.gender || '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#666' }}>{p.address || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modals */}
      {modal === 'book' && (
        <Modal title='📅 Book New Appointment' onClose={() => setModal(null)}>
          <BookForm doctors={doctors} patients={patients} onSuccess={() => { fetchAll(); showToast('✅ Appointment booked!'); }} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal === 'addPatient' && (
        <Modal title='➕ Register New Patient' onClose={() => setModal(null)}>
          <AddPatientForm onSuccess={() => { fetchAll(); showToast('✅ Patient added!'); }} onClose={() => setModal(null)} />
        </Modal>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 28, right: 28, background: '#212121', color: '#fff', padding: '12px 22px', borderRadius: 10, fontWeight: 600, fontSize: 14, boxShadow: '0 8px 24px rgba(0,0,0,0.25)', zIndex: 2000, animation: 'fadeIn .3s' }}>{toast}</div>
      )}
    </div>
  );
}