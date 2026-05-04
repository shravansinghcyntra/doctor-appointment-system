# Doctor Appointment System

## Endpoints (http://localhost:5000/api/appointments)

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| GET | `/list` | List all appointments | - |
| **GET** | **`/available-slots`** | **Get available time slots for doctor/date** | `?doctorName=Dr%20Smith&date=2024-10-07` (Mon-Fri 9AM-5PM, excludes booked) |
| POST | `/create` | Create appointment (validates slot availability) | `{"patientName":"John","doctorName":"Dr Smith","date":"2024-10-07T10:00:00Z","time":"10:00 AM"}` |
| PUT | `/update/:id` | Update by ID | - |
| DELETE | `/delete/:id` | Delete by ID | - |

## Features
- **Available Slots**: Auto-populates dropdown in UI (Mon-Fri 9AM-5PM, 30min slots)
- **Conflict Prevention**: Blocks double-booking same doctor/date/time
- **Frontend**: React form with date picker + dynamic slots
- **Full CRUD** for appointments

## Quick Test (curl)
```
# List appointments
curl http://localhost:5000/api/appointments/list

# Get available slots
curl "http://localhost:5000/api/appointments/available-slots?doctorName=Dr%20Smith&date=2024-10-07"

# Create (will fail if slot taken)
curl -X POST http://localhost:5000/api/appointments/create -H 'Content-Type: application/json' -d '{"patientName":"John","doctorName":"Dr Smith","date":"2024-10-07T10:00:00.000Z","time":"10:00 AM","notes":"Test"}'
```

## Run
1. MongoDB: `brew services start mongodb/brew/mongodb-community`
2. Backend: `cd backend && npm run dev`
3. Frontend: `cd frontend && npm run dev` (http://localhost:5173)

**Live Demo**: http://localhost:5173 - Try booking slots for same doctor/date!

