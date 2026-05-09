const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

// GET all appointments (list)
router.get('/list', async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ date: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create appointment - check if slot available
router.post('/create', async (req, res) => {
    const { patientName, patientEmail, patientMobile, doctorName, doctorSpeciality, date, time, notes } = req.body;
  
  try {
    const appointmentDate = new Date(date);
    
    // Normalize date to start of day for query (ignore time in date field)
    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);
    
// Validate speciality for doctor
    const doctor = await Doctor.findOne({ name: doctorName });

    // If DB has no doctors seeded yet, fallback to the legacy hardcoded mapping
    const fallback = {
      'Dr Smith': 'Cardiologist',
      'Dr Johnson': 'Dermatologist',
      'Dr Brown': 'Orthopedic'
    };

    const expectedSpeciality = doctor ? doctor.speciality : fallback[doctorName];

    if (!expectedSpeciality) {
      return res.status(400).json({ message: `Doctor '${doctorName}' not found` });
    }

    if (!doctorSpeciality || doctorSpeciality !== expectedSpeciality) {
      return res.status(400).json({
        message: `doctorSpeciality must be '${expectedSpeciality}' for ${doctorName}`
      });
    }

    // Check if slot already booked for this doctor/date/time
    const existingSlot = await Appointment.findOne({
      doctorName,
      date: { $gte: startOfDay, $lte: endOfDay },
      time
    });
    
    if (existingSlot) {
      return res.status(409).json({ 
        message: `Slot ${time} on ${appointmentDate.toLocaleDateString()} already booked for Dr. ${doctorName}` 
      });
    }
    
    const appointment = new Appointment({
      patientName,
      patientEmail,
      patientMobile,
      doctorName,
      doctorSpeciality,
      date: appointmentDate,
      time,
      notes
    });
    
    const newAppointment = await appointment.save();

    const appointmentId = `APPT-${newAppointment._id.toString().slice(-6).toUpperCase()}`;

    // Persist the friendly id so GET /list can show it as well
    newAppointment.appointmentId = appointmentId;
    await newAppointment.save();

    return res.status(201).json({
      appointmentId,
      appointment: newAppointment
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update appointment by friendly appointmentId
router.put('/update/:appointmentId', async (req, res) => {
  try {
const appointment = await Appointment.findOne({ appointmentId: req.params.appointmentId });
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.patientName = req.body.patientName ?? appointment.patientName;
    appointment.patientEmail = req.body.patientEmail ?? appointment.patientEmail;
    appointment.patientMobile = req.body.patientMobile ?? appointment.patientMobile;
    appointment.doctorName = req.body.doctorName ?? appointment.doctorName;

    if (req.body.date) {
      const d = new Date(req.body.date);
      if (Number.isNaN(d.getTime())) {
        return res.status(400).json({ message: 'Invalid date format' });
      }
      appointment.date = d;
    }

    appointment.time = req.body.time ?? appointment.time;
    appointment.doctorSpeciality = req.body.doctorSpeciality ?? appointment.doctorSpeciality;
    appointment.notes = req.body.notes ?? appointment.notes;

    const updatedAppointment = await appointment.save();
    res.json(updatedAppointment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET available slots for doctor/date
router.get('/available-slots', async (req, res) => {
  
  // Accept both ISO date (yyyy-mm-dd) and full ISO datetime


  try {
    const { doctorName, date } = req.query;
    if (!doctorName || !date) {
      return res.status(400).json({ message: 'doctorName and date required' });
    }

    // IMPORTANT: `new Date('YYYY-MM-DD')` is parsed as UTC by JS.
    // Frontend sends `dateStr = formData.date.toISOString().split('T')[0]` (YYYY-MM-DD),
    // so parse as *local time* to keep weekday (Mon–Fri) correct.
    const parseQueryDate = (value) => {
      const isoDayMatch = /^\d{4}-\d{2}-\d{2}$/.test(value);
      if (isoDayMatch) {
        const [y, m, d] = value.split('-').map(Number);
        return new Date(y, m - 1, d); // local midnight
      }
      return new Date(value);
    };

    const appointmentDate = parseQueryDate(date);
    if (Number.isNaN(appointmentDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    
    // Skip weekends
    const dayOfWeek = appointmentDate.getDay();

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return res.json([]); // No slots on weekends
    }

    // Generate all possible 30min slots 9AM-5PM
    const slots = [];
    for (let hour = 9; hour <= 16; hour++) {
      slots.push(`${hour}:00AM`.replace('AM', ' AM'));
      slots.push(`${hour}:30AM`.replace('AM', ' AM'));
    }
    slots.push('17:00PM'.replace('PM', ' PM')); // 5PM

    // Normalize date to day range
    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get booked times
    const bookedAppointments = await Appointment.find({
      doctorName,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    const bookedTimes = bookedAppointments.map(appt => appt.time);

    // Available slots
    const availableSlots = slots.filter(slot => !bookedTimes.includes(slot));

    res.json(availableSlots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET appointment by friendly appointmentId
router.get('/:appointmentId', async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const appointment = await Appointment.findOne({ appointmentId });
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    return res.json(appointment);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// DELETE appointment by friendly appointmentId
router.delete('/delete/:appointmentId', async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const appointment = await Appointment.findOne({ appointmentId });
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    await Appointment.deleteOne({ appointmentId });
    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET doctors by speciality + optionally filter by name
router.get('/doctors', async (req, res) => {
  try {
    const { speciality } = req.query;
    const filter = {};
    if (speciality) filter.speciality = speciality;

    const doctors = await Doctor.find(filter).sort({ name: 1 });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET distinct doctor specialities
router.get('/specialities', async (req, res) => {
  try {
    const specialities = await Doctor.distinct('speciality');
    res.json(specialities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
