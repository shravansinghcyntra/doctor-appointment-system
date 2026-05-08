const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: true
  },
  patientEmail: {
    type: String
  },
  patientMobile: {
    type: String
  },
  doctorName: {
    type: String,
    required: true
  },
  doctorSpeciality: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },

  appointmentId: {
    type: String,
    unique: true,
    index: true
  },

  notes: {
    type: String
  }
}, {
  timestamps: true,
  versionKey: false,
  toJSON: {
    versionKey: false,
    transform: (doc, ret) => {
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    versionKey: false,
    transform: (doc, ret) => {
      delete ret.__v;
      return ret;
    }
  }
});

module.exports = mongoose.model('Appointment', appointmentSchema);

