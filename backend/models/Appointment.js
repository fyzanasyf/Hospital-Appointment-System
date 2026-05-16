const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient reference is required'],
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor reference is required'],
    },
    appointmentDate: {
      type: Date,
      required: [true, 'Appointment date is required'],
    },
    timeSlot: {
      type: String,       // e.g., "10:00 - 10:30"
      required: [true, 'Time slot is required'],
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled'],
      default: 'Scheduled',
    },
    reason: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// ─── Indexes for optimized search performance ───────────────────────────────
// Compound unique index: prevents double-booking the same doctor/date/slot
appointmentSchema.index(
  { doctor: 1, appointmentDate: 1, timeSlot: 1 },
  { unique: true, partialFilterExpression: { status: 'Scheduled' } }
);

// Fast lookup by patient and date
appointmentSchema.index({ patient: 1, appointmentDate: 1 });
appointmentSchema.index({ appointmentDate: 1 });   // range queries by date
appointmentSchema.index({ status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);