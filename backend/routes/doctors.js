const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

// ─── GET /api/doctors ─ List all active doctors ──────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const doctors = await Doctor.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, count: doctors.length, data: doctors });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/doctors/:id ─ Get single doctor ────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, data: doctor });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/doctors/:id/schedule ─ View doctor's appointment schedule ──────
router.get('/:id/schedule', async (req, res, next) => {
  try {
    const { date } = req.query;   // optional ?date=2024-06-01

    const filter = {
      doctor: req.params.id,
      status: { $ne: 'Cancelled' },
    };

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.appointmentDate = { $gte: start, $lte: end };
    }

    const appointments = await Appointment.find(filter)
      .populate('patient', 'name phone email')
      .sort({ appointmentDate: 1, timeSlot: 1 });

    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/doctors ─ Create a doctor ─────────────────────────────────────
router.post('/', async (req, res, next) => {
  try {
    const doctor = await Doctor.create(req.body);
    res.status(201).json({ success: true, data: doctor });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/doctors/:id ─ Update a doctor ──────────────────────────────────
router.put('/:id', async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, data: doctor });
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /api/doctors/:id ─ Soft-delete (deactivate) a doctor ─────────────
router.delete('/:id', async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, message: 'Doctor deactivated', data: doctor });
  } catch (err) {
    next(err);
  }
});

module.exports = router;