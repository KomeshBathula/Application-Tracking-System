# Application Tracking System

A portal-based Applicant Tracking System (ATS) featuring separate user entry-points, role-guarded routing, and a dark/light theme switcher. 

Built using Spring Boot 3.x (Java 21) on the backend and React (Vite) on the frontend.

## Key Portals

- **Candidate Portal**: Register/login, look at available positions, and track submitted applications.
- **Recruiter Portal**: Post and manage job openings and keep track of candidates.
- **Admin Control Center**: Private entry point (`/admin/login`) for viewing registered users and checking system status.

## Getting Started

### 1. Database (Docker)
The backend requires a MySQL database. You can start it up using the provided compose file:
```bash
docker compose up -d
```

### 2. Backend Server
Navigate to the `backend` directory, install dependencies, and run the Spring Boot application:
```bash
cd backend
mvn spring-boot:run
```
*The server will run on `http://localhost:8080`.*

### 3. Frontend Web App
Navigate to the `frontend` directory, install packages, and start the development server:
```bash
cd frontend
npm install
npm run dev
```
*The UI will run on `http://localhost:5173`.*

### Default Logins for Testing
- **Admin**: `admin@ats.com` / `admin123`
- **Recruiter**: `recruiter@ats.com` / `recruiter123`
- **Candidate**: `candidate@ats.com` / `candidate123`
