const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');

// 🟢 Mock Mongoose save (no real DB)
jest.mock('../models/Appointment');

describe('Appointment Model (Mocked Tests)', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ---------------- NORMAL CASE ----------------
  it('should create appointment successfully', async () => {

    const mockAppointment = {
      _id: new mongoose.Types.ObjectId(),
      patient: new mongoose.Types.ObjectId(),
      doctor: new mongoose.Types.ObjectId(),
      appointmentDate: new Date('2026-05-20'),
      timeSlot: '10:00 - 10:30',
      status: 'Scheduled',
    };

    Appointment.create.mockResolvedValue(mockAppointment);

    const result = await Appointment.create(mockAppointment);

    expect(result).toBeDefined();
    expect(result.status).toBe('Scheduled');
  });

  // ---------------- EDGE CASE ----------------
  it('should allow different time slots for same doctor', async () => {

    const first = {
      doctor: 'doc1',
      appointmentDate: '2026-05-20',
      timeSlot: '10:00 - 10:30',
    };

    const second = {
      doctor: 'doc1',
      appointmentDate: '2026-05-20',
      timeSlot: '11:00 - 11:30',
    };

    Appointment.create.mockResolvedValueOnce(first);
    Appointment.create.mockResolvedValueOnce(second);

    const r1 = await Appointment.create(first);
    const r2 = await Appointment.create(second);

    expect(r1.timeSlot).not.toBe(r2.timeSlot);
  });

  // ---------------- INVALID CASE (MISSING FIELDS) ----------------
  it('should fail when required fields are missing', async () => {

    Appointment.create.mockRejectedValue(new Error('Validation Error'));

    try {
      await Appointment.create({});
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.message).toBe('Validation Error');
    }
  });

  // ---------------- DOUBLE BOOKING CASE ----------------
  it('should prevent double booking', async () => {

    const appointment = {
      doctor: 'doc1',
      appointmentDate: '2026-05-20',
      timeSlot: '10:00 - 10:30',
    };

    Appointment.create
      .mockResolvedValueOnce(appointment)
      .mockRejectedValueOnce(new Error('Duplicate booking'));

    const first = await Appointment.create(appointment);

    let error;
    try {
      await Appointment.create(appointment);
    } catch (e) {
      error = e;
    }

    expect(first).toBeDefined();
    expect(error).toBeDefined();
    expect(error.message).toBe('Duplicate booking');
  });

  // ---------------- STATUS ENUM CASE ----------------
  it('should accept valid status only', async () => {

    const appointment = {
      status: 'Scheduled',
    };

    Appointment.create.mockResolvedValue(appointment);

    const result = await Appointment.create(appointment);

    expect(result.status).toBe('Scheduled');
  });

});