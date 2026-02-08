FYP Management System
A comprehensive Final Year Project (FYP) management system designed to streamline the supervision, submission, and review process for academic projects. The platform connects students, supervisors, and administrators in a unified workflow.

Overview
This web application facilitates the management of final year projects by providing role-based dashboards and features for students, supervisors, and administrators. Students can submit proposals and chapters, supervisors can review and provide feedback, and administrators can manage user assignments and system-wide announcements.

Tech Stack
Frontend
React 18 with TypeScript
Vite for build tooling
React Router v6 for navigation
TanStack Query for data fetching and caching
Shadcn/ui components built on Radix UI
Tailwind CSS for styling
Axios for API communication
React Hook Form with Zod validation
Lucide React for icons
Backend
Node.js with Express
MongoDB Atlas with Mongoose ODM
JWT authentication with bcryptjs
Multer for file uploads
CORS enabled for cross-origin requests
Features
For Students
Submit and track project proposals
Upload chapter submissions (PDF files)
View feedback from supervisors
Receive announcements
Message supervisors directly
Track proposal and chapter approval status
For Supervisors
Review student proposals with approve/reject actions
Review chapter submissions
Provide detailed feedback on submissions
Manage assigned students
Send announcements to students
Direct messaging with students
Dashboard with overview of pending reviews
For Administrators
Manage supervisors and students
Assign students to supervisors
Monitor supervisor capacity (max students per supervisor)
System-wide user management
View all assignments and relationships
Project Structure
├── src/                          # Frontend React application
│   ├── components/               # Reusable UI components
│   │   ├── ui/                   # Shadcn UI components
│   │   └── layout/               # Layout components
│   ├── pages/                    # Route pages
│   │   ├── admin/                # Admin dashboard pages
│   │   ├── supervisor/           # Supervisor dashboard pages
│   │   └── student/              # Student dashboard pages
│   ├── lib/                      # Utilities and auth logic
│   ├── services/                 # API service layer
│   └── hooks/                    # Custom React hooks
│
├── server/                       # Backend Express application
│   ├── controllers/              # Request handlers
│   ├── models/                   # Mongoose schemas
│   │   ├── User.js               # User model (students, supervisors, admins)
│   │   ├── Proposal.js           # Project proposal model
│   │   ├── Chapter.js            # Chapter submission model
│   │   ├── Message.js            # Messaging model
│   │   └── Announcement.js       # Announcement model
│   ├── routes/                   # API route definitions
│   ├── middleware/               # Auth and validation middleware
│   └── uploads/                  # File upload storage
Data Models
User
Roles: student, supervisor, admin
Student fields: matricNumber, level, supervisor reference
Supervisor fields: specialization, maxStudents capacity
Department information for all users
Proposal
Title and description
Student and supervisor references
Status: pending, approved, rejected
Feedback from supervisor
Submission timestamp
Chapter
Title and content
File upload (PDF)
Student and supervisor references
Status: draft, submitted, approved, rejected
Feedback and approval timestamps
Message
Sender and recipient references
Message content
Read status tracking
Announcement
Created by supervisor or admin
Target audience (students)
Title and content
Authentication & Authorization
JWT-based authentication
Role-based access control (RBAC)
Protected routes for each user role
Secure password hashing with bcryptjs
Token stored in localStorage
API Endpoints
Authentication
POST /api/auth/register - User registration
POST /api/auth/login - User login
Proposals
GET /api/proposals - List proposals
POST /api/proposals - Submit proposal
PUT /api/proposals/:id - Update proposal status
Chapters
GET /api/chapters - List chapters
POST /api/chapters - Submit chapter with file upload
PUT /api/chapters/:id - Update chapter status
Messages
GET /api/messages - Get messages
POST /api/messages - Send message
Announcements
GET /api/announcements - List announcements
POST /api/announcements - Create announcement
Users
GET /api/users - List users (filtered by role)
PUT /api/users/:id - Update user details
Setup & Installation
Prerequisites
Node.js (v16 or higher)
MongoDB Atlas account
npm or yarn package manager
Environment Variables
Frontend (.env):

VITE_API_URL=your_backend_api_url
Backend (server/.env):

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
Installation Steps
Install frontend dependencies:
npm install
Install backend dependencies:
cd server
npm install
Configure environment variables in both root and server directories

Start the backend server:

cd server
npm run dev
Start the frontend development server:
npm run dev
Deployment
The application is configured for deployment on Render.com. See DEPLOYMENT.md for detailed deployment instructions.

Build Commands
Frontend: npm run build
Backend: npm start
File Upload
Chapter submissions support PDF file uploads stored in the server/uploads/chapters directory. Files are named with timestamps to prevent conflicts.

Security Features
Password hashing before storage
JWT token expiration
Protected API routes with authentication middleware
Role-based route protection
CORS configuration for secure cross-origin requests
Future Enhancements
Real-time notifications
Email notifications for submissions and feedback
Advanced search and filtering
Analytics dashboard for administrators
Document version control
Collaborative editing features
Mobile responsive improvements
License
Private academic project
