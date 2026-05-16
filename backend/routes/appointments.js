const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

// ─── Helper: check for double booking ────────────────────────────────────────
const checkDoubleBooking = async (doctorId, appointmentDate, timeSlot, excludeId = null) => {
  const start = new Date(appointmentDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(appointmentDate);
  end.setHours(23, 59, 59, 999);

  const filter = {
    doctor: doctorId,
    appointmentDate: { $gte: start, $lte: end },
    timeSlot,
    status: 'Scheduled',
  };

  if (excludeId) filter._id = { $ne: excludeId };

  const existing = await Appointment.findOne(filter);
  return existing; // null = no conflict
};

// ─── GET /api/appointments ─ List / search appointments ──────────────────────
// Query params: patientName, date, doctorId, status
router.get('/', async (req, res, next) => {
  try {
    const { patientName, date, doctorId, status } = req.query;
    let filter = {};

    // Filter by status
    if (status) filter.status = status;

    // Filter by doctor
    if (doctorId) filter.doctor = doctorId;

    // Filter by date
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.appointmentDate = { $gte: start, $lte: end };
    }

    let appointments = await Appointment.find(filter)
      .populate('patient', 'name phone email')
      .populate('doctor', 'name specialization')
      .sort({ appointmentDate: 1, timeSlot: 1 });

    // Search by patient name (post-populate filter, leverages populated data)
    if (patientName) {
      const lower = patientName.toLowerCase();
      appointments = appointments.filter((a) =>
        a.patient?.name?.toLowerCase().includes(lower)
      );
    }

    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/appointments/:id ─ Get single appointment ──────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name phone email dateOfBirth')
      .populate('doctor', 'name specialization phone');

    if (!appointment)
      return res.status(404).json({ success: false, message: 'Appointment not found' });

    res.json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/appointments ─ Book an appointment ────────────────────────────
router.post('/', async (req, res, next) => {
  try {
    const { patient, doctor, appointmentDate, timeSlot, reason } = req.body;

    // 1. Validate that doctor and patient exist
    const [patientDoc, doctorDoc] = await Promise.all([
      Patient.findById(patient),
      Doctor.findById(doctor),
    ]);

    if (!patientDoc)
      return res.status(404).json({ success: false, message: 'Patient not found' });
    if (!doctorDoc || !doctorDoc.isActive)
      return res.status(404).json({ success: false, message: 'Doctor not found or inactive' });

    // 2. ── Backend validation: prevent double booking ──────────────────────
    const conflict = await checkDoubleBooking(doctor, appointmentDate, timeSlot);
    if (conflict) {
      return res.status(409).json({
        success: false,
        message: `Double booking detected! Doctor ${doctorDoc.name} already has an appointment on ${new Date(appointmentDate).toDateString()} at ${timeSlot}.`,
      });
    }

    // 3. Create appointment
    const appointment = await Appointment.create({
      patient,
      doctor,
      appointmentDate,
      timeSlot,
      reason,
    });

    const populated = await appointment.populate([
      { path: 'patient', select: 'name phone email' },
      { path: 'doctor', select: 'name specialization' },
    ]);

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/appointments/:id/cancel ─ Cancel an appointment ────────────────
router.put('/:id/cancel', async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment)
      return res.status(404).json({ success: false, message: 'Appointment not found' });

    if (appointment.status === 'Cancelled')
      return res.status(400).json({ success: false, message: 'Appointment is already cancelled' });

    if (appointment.status === 'Completed')
      return res.status(400).json({ success: false, message: 'Cannot cancel a completed appointment' });

    appointment.status = 'Cancelled';
    await appointment.save();

    res.json({ success: true, message: 'Appointment cancelled', data: appointment });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/appointments/:id ─ Update appointment details ──────────────────
router.put('/:id', async (req, res, next) => {
  try {
    const { doctor, appointmentDate, timeSlot } = req.body;

    // If rescheduling, re-validate double booking
    if (doctor && appointmentDate && timeSlot) {
      const conflict = await checkDoubleBooking(doctor, appointmentDate, timeSlot, req.params.id);
      if (conflict) {
        return res.status(409).json({
          success: false,
          message: `Double booking detected! That time slot is already taken.`,
        });
      }
    }

    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('patient', 'name phone')
      .populate('doctor', 'name specialization');

    if (!appointment)
      return res.status(404).json({ success: false, message: 'Appointment not found' });

    res.json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
});

module.exports = router;