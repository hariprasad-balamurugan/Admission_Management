# 🎓 Admission Management & CRM

A full-stack web application built with the **MERN stack** for the Edumerge Junior Software Developer assignment.

---



## 📐 Tech Stack
| Layer      | Technology |
|------------|-----------|
| Frontend   | React.js 18, React Router v6, Axios |
| Backend    | Node.js, Express.js |
| Database   | MongoDB + Mongoose ODM |
| Auth       | JWT (JSON Web Tokens) + bcryptjs |
| UI         | Custom CSS (no UI library dependency) |
| Toasts     | react-hot-toast |

---

## 📁 Project Structure

```
admission-crm/
├── backend/
│   ├── config/
│   │   └── seed.js           ← Creates demo users and sample data
│   ├── middleware/
│   │   └── auth.js           ← JWT verify + role-based access control
│   ├── models/
│   │   ├── User.js           ← User schema (bcrypt password hashing)
│   │   ├── Institution.js    ← Institution, Campus, Department schemas
│   │   ├── Program.js        ← Program + quota sub-documents
│   │   └── Applicant.js      ← 15-field applicant form schema
│   ├── routes/
│   │   ├── auth.js           ← Login, register, /me
│   │   ├── masters.js        ← CRUD for hierarchy + programs + users
│   │   ├── applicants.js     ← Create applicants, update docs/fee
│   │   └── admissions.js     ← Seat allocation, confirmation, dashboard
│   ├── .env
│   ├── package.json
│   └── server.js             ← Entry point
│
└── frontend/
    └── src/
        ├── api/
        │   └── axios.js      ← Axios instance + auto token injection
        ├── context/
        │   └── AuthContext.js← Global auth state (login/logout)
        ├── components/
        │   └── Navbar.js     ← Role-aware navigation bar
        ├── pages/
        │   ├── Login.js      ← Auth page with demo quick-fill
        │   ├── Dashboard.js  ← Seat matrix + summary stats
        │   ├── Masters.js    ← Admin setup (5 tabs)
        │   ├── Applicants.js ← Create & manage applicants
        │   └── Admissions.js ← Allocate seats + confirm admissions
        ├── App.js            ← Routes + ProtectedRoute wrapper
        └── index.css         ← Global styles + CSS variables
```

---

## 🚀 Setup Instructions

### Prerequisites
- **Node.js** v18 or higher → https://nodejs.org
- **MongoDB** running locally → https://www.mongodb.com/try/download/community
  - OR use MongoDB Atlas (free cloud) → update `MONGO_URI` in `.env`

### Step 1 — Clone and install

```bash
git clone <your-repo-url>
```

### Step 2 — Backend setup

```bash
cd backend
npm install

Seed the database with demo data:
```bash
npm run seed
```

Start the backend server:
```bash
npm run dev
```
> Backend runs on http://localhost:5000

### Step 3 — Frontend setup

```bash
cd frontend
npm install
npm start
```
> Frontend runs on http://localhost:3000

---

## 🔑 Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@college.com | admin123 |
| Admission Officer | officer@college.com | officer123 |
| Management (View Only) | management@college.com | mgmt123 |

> The Login page also has quick-fill buttons for convenience.

---

## 🗺️ User Journeys

### Journey 1 — Admin: System Setup
1. Log in as Admin
2. Go to **Masters → Institutions** → Create institution (e.g., "ABC Engineering College", code: "ABCEC")
3. Go to **Masters → Campuses** → Create campus, link to institution
4. Go to **Masters → Departments** → Create department, link to campus
5. Go to **Masters → Programs** → Create program with quota distribution
   - Example: 120 intake → KCET: 60, COMEDK: 30, Management: 30
   - ⚠️ System validates: quota total MUST equal intake

### Journey 2 — Officer: Government Admission (KCET/COMEDK)
1. Log in as Admission Officer
2. Go to **Applicants** → Click "+ New Applicant"
3. Fill the 15-field form, select Quota: KCET, Mode: Government
4. Enter allotment number
5. Go to **Applicants table** → Update **Fee Status** to "Paid"
6. Go to **Admissions** → Click **"🪑 Allocate Seat"**
   - If quota is full: button is disabled with error message
7. Click **"🎓 Confirm Admission"** → System generates unique admission number
   - Format: `ABCEC/2026/UG/CSE/KCET/0001`

### Journey 3 — Officer: Management Admission
1. Same as above but select Quota: Management, Mode: Management
2. No allotment number required

### Journey 4 — Management: Monitor Progress
1. Log in as Management
2. View **Dashboard** — shows quota-wise seat fill status
3. Can see pending docs count, pending fees count, program-wise breakdown

---

## 🔒 Key Business Rules Implemented

| Rule | Where enforced |
|------|---------------|
| Quota total must equal program intake | `routes/masters.js` POST /programs |
| Cannot allocate if quota is full | `routes/admissions.js` POST /allocate |
| Admission number generated ONLY ONCE | `routes/admissions.js` POST /confirm |
| Admission confirmed ONLY if fee paid | `routes/admissions.js` POST /confirm |
| Seat counter updates in real-time | `quota.filledSeats++` then `program.save()` |
| Role-based access control | `middleware/auth.js` protect + authorize |

---

## 🌐 API Endpoints

### Auth
| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET  | `/api/auth/me` | Get current user |

### Masters (Admin only for writes)
| Method | URL | Description |
|--------|-----|-------------|
| GET/POST | `/api/masters/institutions` | List / Create |
| GET/POST | `/api/masters/campuses` | List / Create |
| GET/POST | `/api/masters/departments` | List / Create |
| GET/POST | `/api/masters/programs` | List / Create |
| GET/POST | `/api/masters/users` | List / Create |

### Applicants
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/applicants` | List all |
| POST | `/api/applicants` | Create new |
| GET | `/api/applicants/:id` | Get one |
| PATCH | `/api/applicants/:id/documents` | Update doc status |
| PATCH | `/api/applicants/:id/fee` | Update fee status |

### Admissions
| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/admissions/allocate/:id` | Allocate seat |
| POST | `/api/admissions/confirm/:id` | Confirm + generate number |
| GET | `/api/admissions/dashboard` | Dashboard stats |
| GET | `/api/admissions/seat-status/:programId` | Quota availability |

---

## 🚫 Out of Scope (Not Built)
- Payment gateway integration
- SMS/WhatsApp notifications
- AI predictions
- Advanced CRM workflows
- Multi-college management
- Marketing automation

## Demo Link
👉 https://drive.google.com/file/d/183OdP_NZ7m7h0i-y4dc4MEDek5VvXwkd/view?usp=sharing
