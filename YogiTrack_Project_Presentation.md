# YogiTrack Project Presentation
## ACS 5423 - Software Development

Student: Peter Vo  
Date: October 15, 2025  
Project: YogiTrack – Yoga Studio Management System

---

## 0) Executive Summary
YogiTrack is a full‑stack, CRUD‑driven web app for managing yoga studios. It covers instructors, class packages, customers, class schedules, and customer check‑ins (attendance). The system runs locally and in the cloud (Heroku + MongoDB Atlas), follows a clean MVC structure (Express/Mongoose), and uses a simple, consistent UI with a left sidebar and feature‑specific pages.

---

## 1) Implemented Use Cases

### 1.1 Instructors
- Create, search, update, delete instructors
- Directory view via searchable dropdown
- ID scheme: I001, I002, …

### 1.2 Packages
- CRUD for class packages (4‑class, 10‑class, unlimited, etc.)
- Descriptions and prices
- ID scheme: P001, P002, …

### 1.3 Customers
- Registration with contact preferences
- Senior flag (65+) and classBalance tracking
- Full CRUD; ID scheme: Y001, Y002, …

### 1.4 Class Schedule
- CRUD for classes with instructor assignment
- Multi‑slot weekly schedule (day, time, duration)
- Types: General, Special
- Weekly schedule modal view

### 1.5 Check‑ins (Attendance)
- Check in a customer to a class (validates and decrements classBalance)
- Cancel check‑in (restores balance), mark no‑show
- Recent history and basic statistics

Status: All core modules above are complete. Demo/seed tooling was removed from production UI and APIs to keep the app clean.

---

## 2) System Architecture

- Frontend: HTML5, CSS3, vanilla JS (Fetch API)
- Backend: Node.js (Express 5.x)
- Database: MongoDB Atlas (Mongoose ODM)
- Runtime: Local (Node 22.x) and Heroku (heroku‑24)
- Structure:
  - /public (static assets, pages, JS)
  - /models (Mongoose schemas)
  - /controllers (business logic)
  - /routes (Express routers)
  - /config/mongodbconn.cjs (DB connection)
  - yogiserver.cjs (app bootstrap)

---

## 3) Data Model (MongoDB Collections)

### Instructor
```
instructorId: String, firstname, lastname, email, phone, address, preferredContact
```

### Package
```
packageId: String, packageName, description, price:Number
```

### Customer
```
customerId: String, firstName, lastName, email, phone,
senior:Boolean, address, preferredContact, classBalance:Number
```

### Class
```
classId: String, className, instructorId, classType, description,
daytime:[{ day, time, duration:Number }]
```

### Attendance
```
checkinId:Number, customerId, classId, datetime:String, status:"checked-in"|"cancelled"|"no-show"
```

Relationships:
- Instructor 1‑to‑many Class (by instructorId)
- Customer many‑to‑many Class via Attendance
- Attendance references Customer and Class; Class embeds its weekly slots

---

## 4) API Endpoints (Summary)

Base: /api

- /instructor
  - GET /getIds, POST /add, GET /get, PUT /update, DELETE /delete
- /package
  - GET /getIds, POST /add, GET /get, PUT /update, DELETE /delete
- /customer
  - GET /getIds, GET /get, POST /add, PUT /update, DELETE /delete, PUT /updateClassBalance
- /class
  - GET /getIds, GET /get, POST /add, PUT /update, DELETE /delete,
    GET /byInstructor, GET /weekly
- /attendance
  - GET /getAttendanceRecords, GET /getStats,
    POST /checkin, PUT /cancelCheckin, PUT /markNoShow

(Exact request/response shapes align with the page JS in /public/js/*.js.)

---

## 5) UI/UX Design

- Layout: Sticky left sidebar; main content area with page header
- Dashboard: Clean card grid (Instructors, Packages, Classes, Customers, Check‑ins)
- Forms: “Search / Add / Edit” modes with validation and confirmation prompts
- Schedule Builder: Add/remove day/time/duration rows
- Accessibility: Semantic HTML, larger clickable areas, keyboard‑friendly controls
- Styling: Lightweight custom CSS (Flex/Grid), compact typography, reduced sidebar clutter, smaller logo

---

## 6) Tools & Techniques (Beyond ZyBook)

- Cloud database with MongoDB Atlas (secured via environment variables)
- Heroku deployment with Procfile and engines pinning
- Modern JS (async/await, Fetch, modular controllers)
- Express 5 routing patterns
- Mongoose validation and query helpers
- Practical production tweaks: cache headers, static serving, error logging
- Node 22.x; npm overrides to stabilize mongodb driver if needed

---

## 7) Deployment

### Heroku
- Procfile: `web: node yogiserver.cjs`
- Config vars:
  - `MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/yogidb?...`
  - `NODE_ENV=production`
- Git deploy: `git push heroku main` (or master)
- Open: `heroku open`
- Logs: `heroku logs --tail`

### MongoDB Atlas
- Network Access: allow current IP or VPC peering
- Users: app‑only user with least privilege
- Password: URL‑encode special chars (e.g., `!` -> `%21`)

---

## 8) Local Development

```
nvm use 22
npm install
# .env -> MONGO_URI="mongodb+srv://.../yogidb?..."
npm start
# http://localhost:8080/ or /htmls/dashboard.html
```

Troubleshooting:
- If “Server is up and running.” persists, ensure yogiserver.cjs serves public/index.html at “/” and hard‑refresh.
- If `mongodb lib/operations/search_indexes/update.js` errors occur, delete node_modules + lockfile, `npm cache clean --force`, reinstall; if needed, pin driver:
  - package.json → `"overrides": { "mongodb": "6.17.0" }`

---

## 9) Challenges & Learnings

- Node engine mismatches and native builds → standardized on Node 22.x
- Atlas connection management and secret handling via .env/Heroku config vars
- NoSQL relationship modeling (embedded vs referenced) for schedules/attendance
- Balance adjustments as atomic operations with clear error feedback
- UI polish: compact sidebar, consistent card grid, schedule modal usability

---

## 10) Live Demo Script (10–15 min)

1) Welcome → Dashboard  
2) Instructors: add and edit an instructor  
3) Packages: create/update a package  
4) Customers: create customer with balance, toggle senior  
5) Classes: add class with multiple slots; open weekly view  
6) Check‑ins: check in customer; show balance change and history; cancel once  
7) Close with architecture (models/routes) and Heroku deployment note

---

## 11) Next Steps

- Payments: Stripe checkout and package purchase flow
- AuthN/AuthZ: Admin vs staff roles; audit logs
- Messaging: Email/SMS reminders and low‑balance alerts
- Reporting: Revenue, utilization, instructor performance
- Mobile: React Native companion app for customers/staff

---

## 12) Appendix

### Project Structure (high level)
```
yogiserver.cjs
config/
  mongodbconn.cjs
controllers/
models/
routes/
public/
  index.html
  htmls/ (dashboard, instructor, package, class, customer, checkin)
  js/
  css/style.css
  images/Logo.png
```

### Environment Variables
```
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/yogidb?retryWrites=true&w=majority&appName=Cluster0
PORT=8080
NODE_ENV=development|production
```

### Scripts
```
npm start        # run server
npm run dev      # if nodemon is configured
```

This document reflects the current, complete state of the project and can be used for class presentation and handoff.