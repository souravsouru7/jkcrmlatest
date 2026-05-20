# MongoDB Model Plan

The backend is currently seeded in memory so the CRM is easy to run while the UI is being finalized.
When you connect MongoDB, use these collections first:

- `users`: one seeded admin account
- `leads`: sales lead, stage, priority, source, value, follow-up date
- `followups`: call, WhatsApp, email, quotation, visit, payment reminders
- `sitevisits`: scheduled/completed visit records
- `quotations`: quotation amount, status, validity, lead link
- `activitylogs`: stage changes and sales notes

Keep registration disabled. Create users only through an admin seed script.
