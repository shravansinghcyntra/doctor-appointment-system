# TODO

## Bugfix: edit/delete uses patientName (not unique)
- [x] Backend: change PUT /update/:id and DELETE /delete/:id to use Mongo `_id` (or `appointmentId`) instead of `patientName`.

- [ ] Frontend: change `editingId` to store `appt._id`, and pass `appt._id` to delete.
- [ ] Frontend: update submit/update endpoint accordingly.

- [ ] Verify: create two appointments with same patientName, ensure only the intended one edits/deletes.




## Follow-up (if still needed)
- [ ] Fix timezone-safe date handling between frontend and backend for slot availability.

