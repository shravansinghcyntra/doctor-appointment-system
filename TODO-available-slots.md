# Available Slots Implementation Plan

**Information Gathered:**
- Add slot availability check during booking
- Prevent overlapping bookings for doctor/date/time

**Backend Changes:**
- New endpoint: GET `/available-slots?doctorName=DrX&date=2026-05-05`
  - Returns available times (9AM-5PM, 30min slots, excluding booked)
- Update POST `/create`: Validate slot available before save

**Frontend Changes:**
- Form: Doctor/date selection → auto-load available time dropdown
- Disable submit if slot taken
- Show "Slot unavailable" error

**Doctor Schedule Assumption:** Mon-Fri 9AM-5PM, 30min slots

**Files to Edit:**
- backend/models/Appointment.js (add validation)
- backend/routes/appointments.js (new endpoint + create validation)
- frontend/src/App.jsx (available slots fetch + time dropdown)

**Followup Steps:**
1. Backend changes + test endpoints
2. Frontend UI updates
3. Test booking flow

Ready to implement? (Y/N + doctor schedule details if different)
