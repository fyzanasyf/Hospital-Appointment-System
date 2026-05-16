const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');

// ─── GET /api/patients ─ List all patients (with optional name search) ────────
router.get('/', async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      // Uses the text index on the Patient model
      query = { $text: { $search: search } };
    }

    const patients = await Patient.find(query).sort({ name: 1 });
    res.json({ success: true, count: patients.length, data: patients });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/patients/:id ─ Get single patient ───────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
    res.json({ success: true, data: patient });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/patients ─ Register a new patient ──────────────────────────────
router.post('/', async (req, res, next) => {
  try {
    const patient = await Patient.create(req.body);
    res.status(201).json({ success: true, data: patient });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/patients/:id ─ Update patient info ──────────────────────────────
router.put('/:id', async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
    res.json({ success: true, data: patient });
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /api/patients/:id ─ Remove patient ────────────────────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
    res.json({ success: true, message: 'Patient removed' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;