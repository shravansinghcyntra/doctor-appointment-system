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

  const API_BASE = '/api/appointments';

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await axios.get(`${API_BASE}/list`);
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, date });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_BASE}/update/${editingId}`, formData);
        setEditingId(null);
      } else {
        await axios.post(`${API_BASE}/create`, formData);
      }
      setFormData({ patientName: '', doctorName: '', date: new Date(), time: '', notes: '' });
      fetchAppointments();
    } catch (err) {
      console.error(err);
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
          showTimeSelect
          dateFormat="Pp"
          required
        />
        <input
          name="time"
          placeholder="Time (e.g., 10:00 AM)"
          value={formData.time}
          onChange={handleInputChange}
          required
        />

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
