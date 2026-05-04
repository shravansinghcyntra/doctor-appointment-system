const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');

// GET all appointments (list)
router.get('/list', async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ date: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create appointment - check if slot already booked
router.post('/create', async (req, res) => {
  const { patientName, doctorName, date, time, notes } = req.body;
  
  try {
    // Check if slot already booked for this doctor/date/time (user input only)
    const existingSlot = await Appointment.findOne({
      doctorName,
      date,
      time
    });
    
    if (existingSlot) {
      return res.status(409).json({ 
        message: `Slot ${time} on ${new Date(date).toLocaleDateString()} already booked for Dr. ${doctorName}` 
      });
    }
    
    const appointment = new Appointment({
      patientName,
      doctorName,
      date: new Date(date),
      time,
      notes
    });
    
    const newAppointment = await appointment.save();
    res.status(201).json(newAppointment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update appointment
router.put('/update/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.patientName = req.body.patientName || appointment.patientName;
    appointment.doctorName = req.body.doctorName || appointment.doctorName;
    appointment.date = req.body.date || appointment.date;
    appointment.time = req.body.time || appointment.time;
    appointment.notes = req.body.notes || appointment.notes;

    const updatedAppointment = await appointment.save();
    res.json(updatedAppointment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE appointment
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    await Appointment.findByIdAndDelete(id);
    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
