const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
    },
    address: {
      type: String,
      trim: true,
    },
    medicalHistory: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Indexes for optimized search performance
patientSchema.index({ name: 'text', email: 1 });
patientSchema.index({ name: 1 });   // Fast lookup by name

module.exports = mongoose.model('Patient', patientSchema);