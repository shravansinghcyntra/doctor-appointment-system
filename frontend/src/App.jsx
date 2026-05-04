import { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './App.css';

function App() {
  const [appointments, setAppointments] = useState([]);
  const [formData, setFormData] = useState({
    patientName: '',
    doctorName: '',
    date: new Date(),
    time: '',
    notes: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState('');

  const API_BASE = '/api/appointments';

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Load slots when doctor or date changes
  useEffect(() => {
    const timer = setTimeout(() => {
      loadAvailableSlots();
    }, 300);
    return () => clearTimeout(timer);
  }, [formData.doctorName, formData.date]);

  const fetchAppointments = async () => {
    try {
      const res = await axios.get(`${API_BASE}/list`);
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadAvailableSlots = async () => {
    if (!formData.doctorName || !formData.date) {
      setAvailableSlots([]);
      return;
    }

    setLoadingSlots(true);
    setSlotError('');
    try {
      const res = await axios.get(`${API_BASE}/available-slots`, {
        params: {
          doctorName: formData.doctorName,
          date: formData.date.toISOString().split('T')[0]
        }
      });
      setAvailableSlots(res.data);
      if (formData.time && !res.data.includes(formData.time)) {
        setSlotError('Selected time slot is no longer available');
      } else {
        setSlotError('');
      }
    } catch (err) {
      console.error(err);
      setAvailableSlots([]);
      setSlotError('Error loading available slots');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleInputChange = (e) => {
    const newFormData = { ...formData, [e.target.name]: e.target.value };
    setFormData(newFormData);
    // Trigger slot reload on doctor or date change (but delay to avoid too many calls)
    if (e.target.name === 'doctorName' || e.target.name === 'date') {
      setTimeout(loadAvailableSlots, 300);
    }
  };

  const handleDateChange = (date) => {
    const newFormData = { ...formData, date };
    setFormData(newFormData);
    setTimeout(loadAvailableSlots, 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingId && availableSlots.length > 0 && !availableSlots.includes(formData.time)) {
      setSlotError('Please select an available time slot');
      return;
    }
    try {
      if (editingId) {
        await axios.put(`${API_BASE}/update/${editingId}`, formData);
        setEditingId(null);
      } else {
        await axios.post(`${API_BASE}/create`, formData);
      }
      setFormData({ patientName: '', doctorName: '', date: new Date(), time: '', notes: '' });
      setAvailableSlots([]);
      fetchAppointments();
    } catch (err) {
      console.error(err.response?.data?.message || err.message);
      if (err.response?.status === 409) {
        setSlotError(err.response.data.message);
      }
    }
  };

  const handleEdit = (appointment) => {
    setFormData({
      patientName: appointment.patientName,
      doctorName: appointment.doctorName,
      date: new Date(appointment.date),
      time: appointment.time,
      notes: appointment.notes
    });
    setEditingId(appointment._id);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/delete/${id}`);
      fetchAppointments();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="app">
      <h1>Doctor Appointment System</h1>
      
      <form onSubmit={handleSubmit} className="form">
        <input
          name="patientName"
          placeholder="Patient Name"
          value={formData.patientName}
          onChange={handleInputChange}
          required
        />
        <input
          name="doctorName"
          placeholder="Doctor Name"
          value={formData.doctorName}
          onChange={handleInputChange}
          required
        />
        <DatePicker
          selected={formData.date}
          onChange={handleDateChange}
          dateFormat="MMMM d, yyyy"
          required
        />
        <select
          name="time"
          value={formData.time}
          onChange={handleInputChange}
          required
          disabled={loadingSlots || availableSlots.length === 0}
        >
          <option value="">Select available time</option>
          {availableSlots.map(slot => (
            <option key={slot} value={slot}>{slot}</option>
          ))}
        </select>
        {loadingSlots && <p>Loading available slots...</p>}
        {slotError && <p className="error">{slotError}</p>}

        <textarea
          name="notes"
          placeholder="Notes"
          value={formData.notes}
          onChange={handleInputChange}
        />
        <button type="submit">{editingId ? 'Update' : 'Create'} Appointment</button>
      </form>

      <div className="appointments">
        <h2>Scheduled Appointments</h2>
        {appointments.map((appt) => (
          <div key={appt._id} className="appointment-card">
            <h3>{appt.patientName} - {appt.doctorName}</h3>
            <p>Date: {new Date(appt.date).toLocaleString()}</p>
            <p>Time: {appt.time}</p>

            {appt.notes && <p>Notes: {appt.notes}</p>}
            <div className="actions">
              <button onClick={() => handleEdit(appt)}>Edit</button>
              <button onClick={() => handleDelete(appt._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
