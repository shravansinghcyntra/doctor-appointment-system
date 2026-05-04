# Doctor Appointment System

## Endpoints (http://localhost:5000/api/appointments)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/list` | List all appointments |
| POST | `/create` | Create appointment |
| PUT | `/update/:id` | Update by ID |
| DELETE | `/delete/:id` | Delete by ID |

## Quick Test (curl)
```
curl http://localhost:5000/api/appointments/list
curl -X POST http://localhost:5000/api/appointments/create -H 'Content-Type: application/json' -d '{"patientName":"Test","doctorName":"Dr Test","date":"2026-05-05T10:00:00.000Z","time":"10AM","status":"pending"}'
```

## Run
1. MongoDB: `brew services start mongodb/brew/mongodb-community`
2. Backend: `cd backend && npm run dev`
3. Frontend: `cd frontend && npm run dev` (http://localhost:5173)

Full CRUD + scheduling UI working.
