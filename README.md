live view of the stytem
https://project-managment-system-css.onrender.com

# FYP Management System

A comprehensive **Final Year Project (FYP) Management System** designed to streamline the supervision, submission, and review of academic projects. The platform connects **students, supervisors, and administrators** in a unified and role-based workflow.

---

## 📌 Overview

The FYP Management System is a full-stack web application that simplifies how final year projects are managed in tertiary institutions.

* **Students** can submit proposals and chapters, track approvals, and communicate with supervisors.
* **Supervisors** can review submissions, provide feedback, and manage assigned students.
* **Administrators** oversee user management, assignments, and system-wide operations.

---

## 🛠️ Tech Stack

### Frontend

* React 18 (TypeScript)
* Vite
* React Router v6
* TanStack Query
* Shadcn/ui (Radix UI)
* Tailwind CSS
* Axios
* React Hook Form + Zod
* Lucide React Icons

### Backend

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose ODM
* JWT Authentication
* bcryptjs (password hashing)
* Multer (file uploads)
* CORS

---

## ✨ Features

### 👨‍🎓 Students

* Submit and track project proposals
* Upload chapter submissions (PDF)
* View supervisor feedback
* Receive announcements
* Direct messaging with supervisors
* Track proposal and chapter approval status

### 👨‍🏫 Supervisors

* Review and approve/reject proposals
* Review chapter submissions
* Provide detailed feedback
* Manage assigned students
* Send announcements
* Direct messaging with students
* Dashboard overview of pending reviews

### 🛠️ Administrators

* Manage students and supervisors
* Assign students to supervisors
* Monitor supervisor capacity
* System-wide user management
* View all project assignments

---

## 📂 Project Structure

```bash
├── src/                          # Frontend (React)
│   ├── components/               # Reusable components
│   │   ├── ui/                   # Shadcn UI components
│   │   └── layout/               # Layout components
│   ├── pages/
│   │   ├── admin/
│   │   ├── supervisor/
│   │   └── student/
│   ├── lib/                      # Utilities & auth logic
│   ├── services/                 # API services
│   └── hooks/                    # Custom hooks
│
├── server/                       # Backend (Express)
│   ├── controllers/
│   ├── models/
│   │   ├── User.js
│   │   ├── Proposal.js
│   │   ├── Chapter.js
│   │   ├── Message.js
│   │   └── Announcement.js
│   ├── routes/
│   ├── middleware/
│   └── uploads/
```

---

## 🧩 Data Models

### User

* Roles: `student`, `supervisor`, `admin`
* Student: matric number, level, supervisor
* Supervisor: specialization, max student capacity
* Department information

### Proposal

* Title, description
* Student & supervisor references
* Status: `pending`, `approved`, `rejected`
* Feedback and timestamps

### Chapter

* Title, PDF file
* Student & supervisor references
* Status: `draft`, `submitted`, `approved`, `rejected`
* Feedback and approval timestamps

### Message

* Sender & recipient
* Message content
* Read status

### Announcement

* Created by supervisor/admin
* Target audience
* Title & content

---

## 🔐 Authentication & Authorization

* JWT-based authentication
* Role-Based Access Control (RBAC)
* Protected routes per user role
* Password hashing with bcryptjs
* Token stored in `localStorage`

---

## 🔗 API Endpoints

### Authentication

* `POST /api/auth/register`
* `POST /api/auth/login`

### Proposals

* `GET /api/proposals`
* `POST /api/proposals`
* `PUT /api/proposals/:id`

### Chapters

* `GET /api/chapters`
* `POST /api/chapters`
* `PUT /api/chapters/:id`

### Messages

* `GET /api/messages`
* `POST /api/messages`

### Announcements

* `GET /api/announcements`
* `POST /api/announcements`

### Users

* `GET /api/users`
* `PUT /api/users/:id`

---

## ⚙️ Setup & Installation

### Prerequisites

* Node.js (v16+)
* MongoDB Atlas
* npm or yarn

### Environment Variables

**Frontend (.env)**

```env
VITE_API_URL=your_backend_api_url
```

**Backend (server/.env)**

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

### Installation Steps

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
```

### Run the Application

```bash
# Start backend
cd server
npm run dev

# Start frontend
npm run dev
```

---

## 🚀 Deployment

Configured for deployment on **Render.com**.
Refer to `DEPLOYMENT.md` for full deployment steps.

### Build Commands

* Frontend: `npm run build`
* Backend: `npm start`

---

## 📄 File Uploads

* Supports **PDF chapter submissions**
* Stored in: `server/uploads/chapters`
* Timestamp-based naming to prevent conflicts

---

## 🔒 Security Features

* Password hashing
* JWT expiration handling
* Protected API routes
* Role-based authorization
* Secure CORS configuration

---

## 🔮 Future Enhancements

* Real-time notifications
* Email alerts
* Advanced search & filters
* Admin analytics dashboard
* Document version control
* Collaborative editing
* Improved mobile responsiveness

---

## 📜 License

**Private Academic Project**

---

