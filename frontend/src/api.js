import axios from 'axios';
 
const API = axios.create({ baseURL: '/api' });
 
// ── Appointments ──────────────────────────────────────────────────────────────
export const getAppointments = (params) => API.get('/appointments', { params });
export const bookAppointment = (data) => API.post('/appointments', data);
export const cancelAppointment = (id) => API.put(`/appointments/${id}/cancel`);
 
// ── Doctors ───────────────────────────────────────────────────────────────────
export const getDoctors = () => API.get('/doctors');
export const getDoctorSchedule = (id, date) =>
  API.get(`/doctors/${id}/schedule`, { params: { date } });
 
// ── Patients ──────────────────────────────────────────────────────────────────
export const getPatients = (search) => API.get('/patients', { params: { search } });
export const createPatient = (data) => API.post('/patients', data);
 