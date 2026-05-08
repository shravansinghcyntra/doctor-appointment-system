const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  speciality: { type: String, required: true }
});

module.exports = mongoose.model('Doctor', doctorSchema);

