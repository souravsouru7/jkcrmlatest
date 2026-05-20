# JK Interiors Sales CRM - Complete Project Outline

## 1. Project Goal

Build a simple, professional sales CRM for an interiors company.

The CRM should help the sales team manage the full sales journey:

```txt
Lead Created
  -> Assigned to Sales
  -> First Contact
  -> Qualified
  -> Requirement Collected
  -> Site Visit
  -> Quotation
  -> Negotiation
  -> Booking Confirmed
  -> Won
```

The current focus is only the sales side. Project execution, inventory, vendor management, and installation tracking can be added later.

## 2. Technology Stack

### Frontend

- Next.js
- React
- TypeScript
- CSS modules/global CSS
- LocalStorage for temporary frontend persistence
- REST API integration with backend

### Backend

- Node.js
- Express.js
- JWT authentication
- CORS
- dotenv
- In-memory seeded data for the first version
- MongoDB and Mongoose planned for persistent production data

### Database

Current MVP:

- Seeded in-memory data in Express backend
- Local fallback data in frontend

Production version:

- MongoDB Atlas or local MongoDB
- Mongoose models

### Deployment

Recommended:

- Frontend: Vercel
- Backend: Render, Railway, AWS, DigitalOcean, or VPS
- Database: MongoDB Atlas

## 3. Project Folder Structure

```txt
jk-crmfor sales/
  frontend/
    app/
      globals.css
      layout.tsx
      page.tsx
    package.json
    next.config.mjs
    tsconfig.json
    next-env.d.ts

  backend/
    src/
      server.js
      models.md
    package.json
    .env.example

  README.md
  PROJECT_OUTLINE.md
```

## 4. Login System

This CRM uses only one seeded account.

No registration page is required.

Seeded login:

```txt
Email: admin@jkinteriors.com
Password: Jk@12345
```

### Auth Rules

- User logs in with the seeded account.
- Backend returns a JWT token.
- Frontend stores the token in localStorage.
- Protected API routes require `Authorization: Bearer <token>`.
- If backend is offline, frontend can still run with local seeded data for UI review.

## 5. Current MVP Features

### 5.1 Login Page

Features:

- Professional login screen
- Seeded admin account
- No registration
- Backend login support
- Local fallback login support

### 5.2 Dashboard

Dashboard shows important sales metrics:

- Total leads
- Pipeline value
- Overdue follow-ups
- Site visits today
- Quotation value
- Won revenue
- Conversion rate
- Priority leads
- Next sales actions

### 5.3 Lead Management

Lead fields:

```txt
Client name
Phone
Location
Lead source
Project type
Expected value
Pipeline stage
Priority
Sales owner
Next follow-up date
Last activity
Notes
```

Lead actions:

- View all leads
- Search leads
- Add new lead
- Change lead stage
- Track next follow-up
- Track expected value
- Track priority: Hot, Warm, Cold

### 5.4 Sales Pipeline

Pipeline stages:

```txt
New Lead
Contacted
Qualified
Site Visit
Quotation
Negotiation
Won
Lost
```

Pipeline features:

- Stage-wise lead view
- Lead cards
- Expected value display
- Priority badge
- Next follow-up display
- Move lead between stages

### 5.5 Follow-up Management

Follow-up fields:

```txt
Lead
Follow-up type
Due date
Status
Outcome
```

Follow-up statuses:

```txt
Pending
Completed
Overdue
```

Follow-up features:

- View follow-up queue
- Mark follow-up as completed
- Track overdue follow-ups
- Auto-create first follow-up when a new lead is added

### 5.6 Site Visit Management

Site visit fields:

```txt
Lead
Date
Address
Status
Notes
```

Site visit statuses:

```txt
Scheduled
Completed
Rescheduled
Cancelled
No Show
```

Site visit features:

- View scheduled site visits
- View completed site visits
- Store address and visit notes
- Connect each visit to a lead

### 5.7 Quotation Tracking

Quotation fields:

```txt
Quotation number
Lead
Amount
Status
Valid till date
```

Quotation statuses:

```txt
Draft
Sent
Accepted
Rejected
Expired
```

Quotation features:

- View quotations
- Track quotation value
- Track validity date
- Track quotation status
- Connect quotation to lead

### 5.8 Reports

Current reports:

- Pipeline by stage
- Lead count by stage
- Pipeline value by stage
- Lead source performance
- Total pipeline value
- Total quotation value

## 6. Backend API Routes

### Health

```txt
GET /api/health
```

Purpose:

- Check if backend is running.

### Auth

```txt
POST /api/auth/login
```

Body:

```json
{
  "email": "admin@jkinteriors.com",
  "password": "Jk@12345"
}
```

Returns:

```json
{
  "token": "jwt-token",
  "user": {
    "email": "admin@jkinteriors.com",
    "role": "admin",
    "name": "Sales Admin"
  }
}
```

### CRM Data

```txt
GET /api/crm
```

Purpose:

- Return all CRM data:
  - leads
  - follow-ups
  - site visits
  - quotations

### Dashboard

```txt
GET /api/dashboard
```

Purpose:

- Return dashboard metrics.

### Leads

```txt
POST /api/leads
PATCH /api/leads/:id/stage
```

Purpose:

- Create new sales lead.
- Update pipeline stage.

### Follow-ups

```txt
PATCH /api/followups/:id/complete
```

Purpose:

- Mark a follow-up as completed.

## 7. Planned MongoDB Collections

### users

For seeded admin account.

Fields:

```txt
name
email
passwordHash
role
isActive
createdAt
updatedAt
```

### leads

Main sales entity.

Fields:

```txt
name
phone
email
location
source
project
budget
stage
priority
owner
nextFollowUp
lastActivity
notes
lostReason
createdAt
updatedAt
```

### followups

Sales follow-up tasks.

Fields:

```txt
leadId
type
due
status
outcome
notes
createdBy
completedAt
createdAt
updatedAt
```

### sitevisits

Site visit tracking.

Fields:

```txt
leadId
date
address
assignedTo
status
notes
photos
createdAt
updatedAt
```

### quotations

Quotation tracking.

Fields:

```txt
leadId
number
items
subtotal
discount
tax
amount
status
validTill
terms
createdAt
updatedAt
```

### activitylogs

Lead timeline.

Fields:

```txt
leadId
action
description
createdBy
createdAt
```

## 8. Full Sales Workflow

### Step 1: Lead Capture

Lead enters CRM from:

- Website
- Instagram
- Facebook Ads
- WhatsApp
- Phone call
- Walk-in
- Referral
- Marketplace

Minimum required lead data:

```txt
Client name
Phone
Location
Project type
Lead source
```

### Step 2: Lead Qualification

Sales executive checks:

- Project type
- Property size
- Budget
- Timeline
- Location
- Decision maker
- Site visit possibility
- Seriousness of inquiry

Lead priority:

```txt
Hot
Warm
Cold
```

### Step 3: Requirement Collection

Collect:

- Property type
- BHK or room count
- Rooms needed
- Style preference
- Budget range
- Timeline
- Floor plan
- Reference images
- Special notes

### Step 4: Site Visit

Schedule visit and collect:

- Address
- Date and time
- Measurement notes
- Client discussion notes
- Site photos
- Final scope

### Step 5: Quotation

Prepare quote with:

- Room-wise items
- Materials
- Quantity
- Price
- Discount
- GST
- Final amount
- Validity date
- Payment terms

### Step 6: Negotiation

Track:

- Client expected amount
- Revised quotation
- Discount approval
- Competitor quote
- Final offer
- Next follow-up

### Step 7: Booking

When client confirms:

- Mark booking confirmed
- Record booking amount
- Record payment mode
- Mark lead as won

### Step 8: Won or Lost

Won:

- Deal confirmed
- Can later move to project management

Lost:

- Store lost reason
- Store notes
- Keep for future reporting

## 9. Future Features

### Sales Improvements

- Lead detail page with tabs
- Requirement form
- Call notes timeline
- Follow-up creation modal
- Quotation creation form
- Quotation PDF download
- Quotation versioning
- Discount approval workflow
- Lost lead reason tracking
- Lead source analytics
- Salesperson performance report

### Automation

- Auto-reminder for follow-ups
- Warning for leads without next follow-up
- Quotation expiry alert
- Site visit reminder
- Auto-create quotation follow-up
- Auto-create next action after site visit

### Communication

- WhatsApp templates
- Email quotation sending
- SMS reminders
- Call log integration

### Advanced CRM

- Multiple users
- Sales manager role
- Designer role
- Team assignment
- Lead reassignment
- Permission management
- Audit logs

### Project Module Later

After sales CRM is perfect, add:

- Project handover
- Designer assignment
- Project milestones
- Production tracking
- Installation tracking
- Payment milestones
- Client portal

## 10. Development Roadmap

### Phase 1: Current MVP

Status: Started.

Includes:

- Frontend folder
- Backend folder
- Seeded login
- Dashboard
- Leads
- Pipeline
- Follow-ups
- Site visits
- Quotations
- Reports
- Basic backend API

### Phase 2: Make Data Persistent

Tasks:

- Connect MongoDB
- Add Mongoose models
- Add seed script for admin user
- Move in-memory data to database
- Add validation
- Add better error handling

### Phase 3: Improve Sales Workflow

Tasks:

- Add lead detail page
- Add full requirement form
- Add activity timeline
- Add follow-up modal
- Add lost lead reason
- Add booking confirmation
- Add quotation form

### Phase 4: Professional Reports

Tasks:

- Lead source report
- Stage conversion report
- Monthly booking report
- Quotation conversion report
- Overdue follow-up report
- Lost reason report

### Phase 5: Production Ready

Tasks:

- Environment variables
- Secure JWT secret
- Password hashing
- Rate limiting
- API validation
- Deployment
- Database backup
- Error logging

## 11. How to Run

### Backend

```bash
cd backend
npm install
npm run dev
```

Backend URL:

```txt
http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

```txt
http://localhost:3000
```

Frontend API URL:

```txt
http://localhost:5000/api
```

Optional frontend env:

```txt
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 12. Final Product Vision

The final CRM should be simple enough for daily sales use, but structured enough for serious business reporting.

The most important rule:

```txt
No active lead should exist without a next follow-up date.
```

Main value of the CRM:

- Sales team never loses leads
- Managers can see the pipeline clearly
- Follow-ups are tracked properly
- Quotations are organized
- Lost leads give useful business insights
- Won deals can later move into project execution
